// src/services/firebaseRules.js

export const FIRESTORE_RULES_TEXT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /interview_history/{docId} {
      allow read, update, delete: if request.auth != null 
                                  && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
    }
  }
}`;
