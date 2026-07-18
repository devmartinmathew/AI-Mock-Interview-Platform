// src/services/interviewService.js
// ──────────────────────────────────────────────────────────────────────────
// Complete Firebase Firestore Integration with Local Storage Fallback & Auto-Sync
// ──────────────────────────────────────────────────────────────────────────
import {
  collection, addDoc, getDocs, getDoc, doc,
  query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getQuestionIdByText } from './demoDatabase';

const COLLECTION = 'interview_history';

// Helper to normalize timestamps for client-side sorting
export function getTimestampMs(ts) {
  if (!ts) return 0;
  if (ts.toMillis) return ts.toMillis();
  if (ts.seconds) return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'string') return new Date(ts).getTime();
  if (typeof ts === 'number') return ts;
  return 0;
}

// ── Save a completed interview ────────────────────────────────────────────
export async function saveInterviewHistory({
  userId,
  userEmail,
  role,
  difficulty,
  answerMode,
  finalReport,
  results,
}) {
  const totalQuestions = results?.length ?? 0;

  // Compute overall score
  const overallScore = finalReport?.overallScore
    ?? (totalQuestions > 0
      ? +(results.reduce((a, r) => a + (r.evaluation?.score ?? 0), 0) / totalQuestions).toFixed(1)
      : 0);

  // Compute MCQ correct/wrong count
  const correctAnswers = answerMode === 'mcq'
    ? results?.filter(r => r.evaluation?.isCorrect).length ?? 0
    : 0;
  const wrongAnswers = answerMode === 'mcq' ? (totalQuestions - correctAnswers) : 0;

  // Resolve question IDs
  const questionIds = results?.map(r => getQuestionIdByText(r.question)) ?? [];

  const docData = {
    userId,
    userEmail: userEmail || '',
    questionIds,
    role,
    interviewRole:   role, // fallback
    difficulty,
    answerMode:      answerMode || 'text',
    totalQuestions,
    score:               overallScore,
    totalScore:          overallScore, // fallback
    correctAnswers,
    wrongAnswers,
    recommendation:       finalReport?.hiringRecommendation ?? 'N/A',
    hiringRecommendation: finalReport?.hiringRecommendation ?? 'N/A', // fallback
    aiSummary:         finalReport?.summary            ?? '',
    keyStrengths:      finalReport?.keyStrengths       ?? [],
    areasForImprovement: finalReport?.areasForImprovement ?? [],
    questions:   results?.map(r => r.question)   ?? [],
    answers:     results?.map(r => r.answer)      ?? [],
    evaluations: results?.map(r => r.evaluation)  ?? [],
    finalReport: finalReport ?? null,
  };

  // Generate unique local ID in case we fail and save to local storage
  const localId = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    // 1. Try to save to Firestore
    const firestoreData = { ...docData, completedAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, COLLECTION), firestoreData);
    console.log('[InterviewService] Successfully saved to Firestore:', docRef.id);

    // Try background sync of pending interviews since Firestore is online
    setTimeout(() => syncPendingInterviews(userId), 100);

    return docRef.id;
  } catch (err) {
    console.warn('[InterviewService] Firestore write failed. Falling back to Local Storage:', err.message);

    // Save to Local Storage as cache
    const localData = {
      id: localId,
      ...docData,
      completedAt: new Date().toISOString()
    };

    // Store in all local list
    const locals = JSON.parse(localStorage.getItem('local_interviews') || '[]');
    locals.push(localData);
    localStorage.setItem('local_interviews', JSON.stringify(locals));

    // Store in pending sync list
    const pendings = JSON.parse(localStorage.getItem('pending_sync_interviews') || '[]');
    pendings.push(localData);
    localStorage.setItem('pending_sync_interviews', JSON.stringify(pendings));

    // Propagate error to let UI know rules/network issues occurred, but return localId
    err.localId = localId;
    throw err;
  }
}

// ── Fetch all interviews (Firestore + Local Merge with client-side sort) ────
export async function fetchUserHistory(userId) {
  let firestoreList = [];
  let isFirestoreOffline = false;

  try {
    // Query Firestore (NO ORDERBY to prevent requiring composite index)
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    firestoreList = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Try background sync of pending items
    setTimeout(() => syncPendingInterviews(userId), 100);
  } catch (err) {
    console.warn('[InterviewService] Firestore history fetch failed:', err.message);
    isFirestoreOffline = true;
  }

  // Load from Local Storage
  const locals = JSON.parse(localStorage.getItem('local_interviews') || '[]');
  const userLocals = locals.filter(i => i.userId === userId);

  // Combine lists and deduplicate (by matching completedAt timestamps and roles)
  const combined = [...firestoreList];
  userLocals.forEach(l => {
    // Check if this local item is already uploaded (avoid duplicate rendering)
    const alreadyExists = firestoreList.some(f => 
      f.role === l.role && 
      Math.abs(getTimestampMs(f.completedAt) - getTimestampMs(l.completedAt)) < 5000
    );
    if (!alreadyExists) {
      combined.push(l);
    }
  });

  // Client-side sort by newest first (avoids composite index requirements)
  combined.sort((a, b) => getTimestampMs(b.completedAt) - getTimestampMs(a.completedAt));

  return combined;
}

// ── Fetch single interview by ID ──────────────────────────────────────────
export async function fetchInterviewById(docId) {
  if (docId && docId.startsWith('local-')) {
    const locals = JSON.parse(localStorage.getItem('local_interviews') || '[]');
    const found = locals.find(i => i.id === docId);
    return found || null;
  }

  try {
    const snap = await getDoc(doc(db, COLLECTION, docId));
    if (!snap.exists()) {
      // Check local storage as fallback
      const locals = JSON.parse(localStorage.getItem('local_interviews') || '[]');
      return locals.find(i => i.id === docId) || null;
    }
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.warn('[InterviewService] Firestore single fetch failed, checking local:', err.message);
    const locals = JSON.parse(localStorage.getItem('local_interviews') || '[]');
    return locals.find(i => i.id === docId) || null;
  }
}

// ── Auto-Sync Pending Interviews ──────────────────────────────────────────
export async function syncPendingInterviews(userId) {
  const pendings = JSON.parse(localStorage.getItem('pending_sync_interviews') || '[]');
  if (pendings.length === 0) return;

  console.log(`[InterviewService] Found ${pendings.length} pending interviews to sync…`);
  const remaining = [];

  for (const item of pendings) {
    // Only sync items belonging to current user
    if (item.userId !== userId) {
      remaining.push(item);
      continue;
    }

    try {
      const { id, ...docData } = item;
      const firestoreData = { 
        ...docData, 
        completedAt: serverTimestamp() // update to current upload server time
      };
      
      const docRef = await addDoc(collection(db, COLLECTION), firestoreData);
      console.log(`[InterviewService] Successfully synced pending interview ${id} to Firestore as ${docRef.id}`);
    } catch (err) {
      console.warn(`[InterviewService] Failed to sync pending interview ${item.id}:`, err.message);
      remaining.push(item); // Keep in pending queue
    }
  }

  localStorage.setItem('pending_sync_interviews', JSON.stringify(remaining));
}
