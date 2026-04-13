# 🚀 JAMB Prep App

A modern, dynamic learning platform designed to help students prepare effectively for the JAMB examination. Built with performance, engagement, and scalability in mind.

---

## 📌 Overview

This application provides an interactive quiz-based learning experience tailored for JAMB students. It focuses on timed practice, performance tracking, and a clean user experience to help users study smarter and improve their scores.

---

## ✨ Features

* ⏱️ **Timed Quiz System**
  Each question comes with a countdown timer to simulate real exam conditions.

* ✅ **Auto-Submission on Timeout**
  If time runs out, answers are automatically submitted.

* 📊 **Progress Tracking**
  Track answered questions and completion status.

* 🎯 **Daily Goals System**
  Stay consistent with daily study targets and XP rewards.

* 🧠 **State Management with Zustand**
  Lightweight and scalable global state handling.

* 🎨 **Modern UI/UX**
  Clean, responsive interface designed for focus and ease of use.

* 📱 **Responsive Design**
  Works across desktop and mobile devices.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS / MUI (depending on your setup)

### State Management

* Zustand

### Routing

* React Router

---

## 📁 Project Structure

```
src/
│
├── Pages/
│   ├── Dashboard.tsx
│   └── Quiz.tsx
│
├── components/
│   ├── TimerBar.tsx
│   └── DailyGoals.tsx
│
├── store/
│   ├── useQuizStore.ts
│   └── useGoalStore.ts
│
├── hooks/
│   └── useTimer.ts
│
├── lib/
│   └── utils.ts
│
├── Types/
│   └── index.ts
│
└── App.tsx
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```
git clone https://github.com/your-username/jamb-prep-app.git
cd jamb-prep-app
```

### 2. Install dependencies

```
npm install
```

### 3. Start development server

```
npm run dev
```

---

## 🧩 Core Concepts

### Quiz Flow

* Questions are loaded into global state
* Each question is timed
* User selects an answer or time expires
* App moves to next question
* Final state shows completion

### Timer System

* Countdown resets on each question
* Auto-submits if user does not answer
* Visual progress bar with warning states

### Goals System

* Daily tasks with XP rewards
* Toggle completion
* Track progress

---

## 🚧 Future Improvements

* 🔥 Adaptive learning (questions based on weak areas)
* 📈 Performance analytics dashboard
* 🧑‍🤝‍🧑 User authentication
* ☁️ Backend integration (Node.js + database)
* 🏆 Leaderboards & streaks
* 📚 Subject-based filtering (Math, English, etc.)

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 💡 Vision

To build a smart, engaging, and accessible platform that helps students across Nigeria succeed in JAMB and beyond.

---
