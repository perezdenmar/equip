# Implementation Plan: Phase 1 - Enhanced Learning Experience

This document outlines the technical implementation strategy for integrating Learning Management System (LMS) capabilities, Skill Assessment Quizzes, and Interactive Syllabuses into the EQUIP platform.

---

## 1. Learning Management System (LMS) Integration

**Goal:** Transition from linking to external courses to hosting internal modules with video playback, text content, and progress tracking for proprietary courses (e.g., TESDA NC II prep).

### Technical Approach

**A. Database Schema Changes (Prisma)**
We need to model modules, lessons, and user progress.

```prisma
model Module {
  id              String        @id @default(uuid())
  qualificationId String
  title           String
  description     String?
  order           Int           // For sorting modules
  qualification   Qualification @relation(fields: [qualificationId], references: [id], onDelete: Cascade)
  lessons         Lesson[]
}

enum LessonType {
  VIDEO
  TEXT
  QUIZ
}

model Lesson {
  id              String        @id @default(uuid())
  moduleId        String
  title           String
  type            LessonType
  content         String?       // For TEXT lessons (Markdown/HTML)
  videoUrl        String?       // For VIDEO lessons (S3, Vimeo, YouTube)
  order           Int
  module          Module        @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progress        LessonProgress[]
  quizzes         Quiz[]        // Relation for QUIZ type
}

model LessonProgress {
  id              String   @id @default(uuid())
  userId          String
  lessonId        String
  isCompleted     Boolean  @default(false)
  lastAccessedAt  DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson          Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}
```

**B. Backend Implementation (Node.js/Express)**
*   **Video Hosting:**
    *   *Option 1 (Cost-effective):* Host videos on **YouTube** (Unlisted) or **Vimeo** and store the embed URLs in the database.
    *   *Option 2 (Secure/Controlled):* Use a cloud storage provider like **AWS S3** or **Cloudflare R2**. Serve videos securely using presigned URLs or a CDN (Cloudflare) to prevent unauthorized downloading.
*   **API Endpoints:**
    *   `GET /api/qualifications/:id/modules` - Fetch course structure.
    *   `GET /api/lessons/:id` - Fetch lesson content (requires authorization to check if enrolled).
    *   `POST /api/lessons/:id/progress` - Mark lesson as complete.

**C. Frontend Implementation (React)**
*   **Video Player:** Use a versatile library like [`react-player`](https://www.npmjs.com/package/react-player) which supports YouTube, Vimeo, and raw MP4 files from S3/CDNs.
*   **Content Rendering:** For text-based lessons, use `react-markdown` to render formatted content securely.
*   **Progress Tracking UI:** Implement a sidebar or navigation drawer showing the course outline with checkmarks for completed lessons, calculating overall progress percentages based on the `LessonProgress` data.

---

## 2. Skill Assessment Quizzes & AI Recommendations

**Goal:** Allow users to take preliminary tests to determine skill levels. The AI assistant recommends learning paths based on the results.

### Technical Approach

**A. Database Schema Changes (Prisma)**
```prisma
model Quiz {
  id          String     @id @default(uuid())
  lessonId    String?    @unique // If part of a course
  title       String
  description String?
  questions   Question[]
  attempts    QuizAttempt[]
  lesson      Lesson?    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}

model Question {
  id            String   @id @default(uuid())
  quizId        String
  text          String
  options       Json     // Array of strings or objects: [{id: 'A', text: 'Option A'}]
  correctOption String   // The ID or index of the correct option
  explanation   String?  // Shown after answering
  quiz          Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
}

model QuizAttempt {
  id          String   @id @default(uuid())
  userId      String
  quizId      String
  score       Int
  total       Int
  completedAt DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
}
```

**B. Backend Implementation & AI Integration**
*   **Quiz Endpoints:**
    *   `GET /api/quizzes/:id` - Fetch quiz questions (exclude `correctOption` from the payload to prevent cheating).
    *   `POST /api/quizzes/:id/submit` - Receives user answers, calculates the score, stores the `QuizAttempt`, and returns the results with explanations.
*   **AI Recommendation Engine:**
    *   Modify the existing `/api/ai/chat` endpoint or create a new one (`/api/ai/recommend`).
    *   When a user completes an assessment, pass their `score`, `quiz topic`, and existing `enrollments` as context to the Gemini API (`@google/genai`).
    *   **Prompt Example:** *"The user scored 40% on the 'Basic Networking' assessment. They are weak in IP subnetting. Based on our available qualifications [List of Qualifications], recommend 2 specific courses or modules to help them improve, and provide a brief, encouraging study plan."*

**C. Frontend Implementation (React)**
*   **Quiz UI:** Build a dynamic form component to handle multiple-choice, true/false, or multiple-select questions. Include a timer if necessary.
*   **Results Dashboard:** Display a clear score, correct/incorrect answers with explanations, and a dedicated section highlighting the "AI Learning Recommendations" generated by Gemini.

---

## 3. Interactive Syllabus / Roadmaps

**Goal:** Visually display a student's progress through a qualification's syllabus.

### Technical Approach

**A. Database Utilization**
We will leverage the existing `syllabus` array in the `Qualification` model, or ideally, migrate to the structured `Module` -> `Lesson` architecture defined in Step 1. The progress is calculated using the `LessonProgress` model.

**B. Frontend Implementation (React)**
*   **Visualization Library:** Use a library to build interactive, visually appealing roadmaps.
    *   **Option 1 (Custom CSS/Tailwind):** Build a vertical timeline using Tailwind CSS. This is lightweight and highly customizable.
    *   **Option 2 (Flowcharts/Graphs):** For non-linear learning paths, use [`react-flow`](https://reactflow.dev/) to build node-based visual roadmaps where completed nodes change color.
*   **Component Structure:**
    *   Create a `RoadmapView` component that fetches the user's enrolled qualification and all associated modules/lessons.
    *   Map through the modules. If all lessons in a module have `LessonProgress.isCompleted == true`, mark the module as "Unlocked" or "Completed".
    *   Implement "Locked" states for future modules to enforce sequential learning, visually dimming them and disabling clicks until prerequisite modules are finished.
*   **Gamification Hooks:** Add small visual celebrations (e.g., [`react-confetti`](https://www.npmjs.com/package/react-confetti)) when a major milestone or module on the roadmap is completed.

---
**Summary of Technologies & APIs Needed:**
*   **Video Delivery:** AWS S3 / Cloudflare R2 (Storage) or YouTube/Vimeo.
*   **Frontend Libraries:** `react-player` (Video), `react-markdown` (Text formatting), `react-flow` (Optional, for complex roadmaps).
*   **AI:** Google Gen AI SDK (`@google/genai` - Already integrated, needs prompt engineering).
*   **Database:** Prisma (New models: `Module`, `Lesson`, `LessonProgress`, `Quiz`, `Question`, `QuizAttempt`).