# InterviewAI — AI Mock Interview Platform

A production-ready, full-stack AI Mock Interview Platform built with **React + Vite**, **Firebase**, and **Google Gemini AI**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Rename `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Firebase — https://console.firebase.google.com
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini — https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_key
```

### 3. Run Locally
```bash
npm run dev
```

Open http://localhost:5173

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in production mode
5. Add a Firestore security rule:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /interviews/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

6. Copy your project config from **Project Settings → Your Apps → Firebase SDK snippet**

---

## 🤖 Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Paste it as `VITE_GEMINI_API_KEY` in your `.env` file

---

## 🏗️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | React 18 + Vite                     |
| Styling     | Vanilla CSS (Glassmorphism, Dark)   |
| Auth        | Firebase Authentication             |
| Database    | Firebase Firestore                  |
| AI          | Google Gemini 1.5 Flash             |
| Routing     | React Router DOM v6                 |
| Icons       | Lucide React                        |
| Fonts       | Inter (Google Fonts)                |

---

## 📄 Pages

| Page            | Route             | Protected |
|-----------------|-------------------|-----------|
| Landing         | `/`               | No        |
| Login           | `/login`          | No        |
| Signup          | `/signup`         | No        |
| Forgot Password | `/forgot-password`| No        |
| Dashboard       | `/dashboard`      | Yes       |
| Interview Setup | `/setup`          | Yes       |
| Interview Room  | `/interview`      | Yes       |
| Results         | `/results/:id`    | Yes       |
| History         | `/history`        | Yes       |
| Profile         | `/profile`        | Yes       |

---

## 🌍 Deploy

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```
Add environment variables in Vercel Dashboard → Project Settings → Environment Variables.

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 📦 Build

```bash
npm run build
```

Output in `dist/` — ready to deploy anywhere.

---

## ✨ Features

- 🔐 Firebase Auth (Email/Password, Forgot Password)
- 🤖 AI-generated interview questions (Gemini 1.5 Flash)
- ⏱️ 60-second per-question timer
- 📊 Real-time per-answer evaluation (Score, Strengths, Weaknesses, Model Answer)
- 📈 Final report (Overall, Technical, Communication, Confidence scores + Hiring Recommendation)
- 💾 Interview history saved to Firestore
- 🎨 Premium glassmorphism dark UI
- 📱 Fully responsive
