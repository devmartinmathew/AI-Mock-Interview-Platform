// src/services/gemini.js
// ─────────────────────────────────────────────────────────────────────────────
// Offline Demo Mode Service
// Replaces Gemini AI API calls with a local question bank and evaluation.
// ─────────────────────────────────────────────────────────────────────────────
import { auth, db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  selectDemoQuestions,
  evaluateTextAnswerLocal,
  getQuestionIdByText,
  getQuestionById
} from './demoDatabase';

// ── Generate 5 interview questions ────────────────────────────────────────
export async function generateQuestions(role, difficulty) {
  const user = auth.currentUser;
  let attemptedIds = [];
  if (user) {
    try {
      const q = query(collection(db, 'interview_history'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      snap.docs.forEach(doc => {
        const d = doc.data();
        if (d.questionIds) {
          attemptedIds.push(...d.questionIds);
        }
      });
    } catch (e) {
      console.warn('[DemoMode] Failed to fetch history:', e.message);
    }
  }

  const selected = selectDemoQuestions(role, difficulty, attemptedIds);
  console.log(`[DemoMode] Selected 5 questions for ${role} (${difficulty})`);
  return selected.map(q => q.q);
}

// ── Evaluate a single answer ───────────────────────────────────────────────
export async function evaluateAnswer(questionText, answer, role, difficulty) {
  const qId = getQuestionIdByText(questionText);
  const qObj = getQuestionById(qId);
  if (!qObj) {
    return {
      score: 5,
      strengths: ['Answer attempted.'],
      weaknesses: [],
      betterAnswer: 'Ideal answer is not configured for this question.'
    };
  }

  const evalResult = evaluateTextAnswerLocal(qObj, answer);
  console.log('[DemoMode] Evaluated text answer. Score:', evalResult.score);
  return evalResult;
}

// ── Generate final interview report ───────────────────────────────────────
export async function generateFinalReport(role, difficulty, questionsAndAnswers, answerMode = 'text') {
  const isMCQ = answerMode === 'mcq';
  
  // Calculate average score
  const totalScore = questionsAndAnswers.reduce((sum, qa) => sum + (qa.evaluation?.score ?? 5), 0);
  const avg = Math.round(totalScore / questionsAndAnswers.length);

  // Generate scores based on average score with slight variations for realistic feel
  const overallScore = avg;
  const technicalScore = Math.max(1, Math.min(10, avg + (Math.random() > 0.5 ? 1 : -1)));
  const communicationScore = Math.max(1, Math.min(10, avg + (Math.random() > 0.5 ? 1 : -1)));
  const confidenceScore = Math.max(1, Math.min(10, avg + (Math.random() > 0.5 ? 1 : -1)));

  // Recommendation
  let hiringRecommendation = 'Maybe';
  if (overallScore >= 8) hiringRecommendation = 'Strong Yes';
  else if (overallScore >= 7) hiringRecommendation = 'Yes';
  else if (overallScore >= 5) hiringRecommendation = 'Maybe';
  else if (overallScore >= 3) hiringRecommendation = 'No';
  else hiringRecommendation = 'Strong No';

  // Gather key strengths & areas for improvement from question evaluations
  const keyStrengths = [];
  const areasForImprovement = [];
  
  questionsAndAnswers.forEach(qa => {
    if (qa.evaluation?.strengths?.length > 0) {
      keyStrengths.push(...qa.evaluation.strengths);
    }
    if (qa.evaluation?.weaknesses?.length > 0) {
      areasForImprovement.push(...qa.evaluation.weaknesses);
    }
  });

  // Deduplicate and slice
  const uniqueStrengths = [...new Set(keyStrengths)].slice(0, 3);
  const uniqueWeaknesses = [...new Set(areasForImprovement)].slice(0, 3);

  if (uniqueStrengths.length === 0) uniqueStrengths.push("Attempted all parts of the interview.");
  if (uniqueWeaknesses.length === 0) uniqueWeaknesses.push("Review and expand on edge cases.");

  const summary = `Candidate completed the ${role} interview in ${answerMode.toUpperCase()} format. Showed solid handling of ${difficulty} topics and structural concepts.`;

  return {
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    hiringRecommendation,
    summary,
    keyStrengths: uniqueStrengths,
    areasForImprovement: uniqueWeaknesses
  };
}

// Helper to shuffle array in-place using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// ── Generate one MCQ question with 4 options ──────────────────────────────
export async function generateMCQQuestion(role, difficulty, questionIndex, previousQuestions = []) {
  const user = auth.currentUser;
  let attemptedIds = [];
  if (user) {
    try {
      const q = query(collection(db, 'interview_history'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      snap.docs.forEach(doc => {
        const d = doc.data();
        if (d.questionIds) {
          attemptedIds.push(...d.questionIds);
        }
      });
    } catch (e) {
      console.warn('[DemoMode] Failed to fetch history:', e.message);
    }
  }

  // Convert previous questions text array to IDs for exclusion
  const prevIds = previousQuestions.map(qText => getQuestionIdByText(qText));
  const excludedIds = [...attemptedIds, ...prevIds];

  const selectedList = selectDemoQuestions(role, difficulty, excludedIds);
  const questionObj = selectedList[0];

  console.log(`[DemoMode] Selected MCQ Q${questionIndex + 1}: ${questionObj.id}`);

  // Resolve correct option key (fallback to 'B' if undefined)
  const baseCorrectKey = questionObj.correct || 'B';
  const correctText = questionObj.options[baseCorrectKey];

  // Gather incorrect option texts
  const incorrectTexts = Object.keys(questionObj.options)
    .filter(k => k !== baseCorrectKey)
    .map(k => questionObj.options[k]);

  // Mix correct and incorrect option texts, then shuffle
  const allTexts = [correctText, ...incorrectTexts];
  shuffleArray(allTexts);

  // Map to new options A, B, C, D
  const optionKeys = ['A', 'B', 'C', 'D'];
  const newOptions = {};
  let newCorrectAnswer = 'A';

  allTexts.forEach((text, index) => {
    const key = optionKeys[index];
    newOptions[key] = text;
    if (text === correctText) {
      newCorrectAnswer = key;
    }
  });

  // Ensure explanation text dynamically displays the correct answer letter
  const explanation = `${newCorrectAnswer} is the correct answer. ${questionObj.exp || ''}`;

  return {
    question: questionObj.q,
    options: newOptions,
    correctAnswer: newCorrectAnswer,
    explanation
  };
}
