# Codebase Review and Recommendations

## 1. Executive Summary

This document provides a comprehensive review of the EQUIP (Equip Quantum Upskilling Institute of the Philippines Inc.) platform. The current application is a React (Vite) frontend with a Node.js/Express backend utilizing Prisma ORM and PostgreSQL. It incorporates integrations for AI chat (Google Gemini) and aggregates jobs and courses from external APIs (Remotive, OpenWebNinja, etc.).

This review highlights architectural, security, and scalability considerations, and proposes high-level designs for requested new features: **Calendar**, **Class Scheduling**, and **Advanced AI/LLM/NLP integrations**.

## 2. Technical Codebase Review

### 2.1 Architecture & Structure
*   **Frontend (React/Vite):**
    *   Structured using standard page/component hierarchy (`src/pages/`, `src/components/`).
    *   Uses TailwindCSS for styling and Lucide React for icons.
    *   Includes basic internationalization (`t()` function observed).
*   **Backend (Node.js/Express/Prisma):**
    *   Good separation of concerns (`routes/`, `services/`, `middleware/`, `lib/`).
    *   Uses Prisma for robust database interactions with a comprehensive schema (Users, Qualifications, Enrollments, Jobs, etc.).
    *   External API aggregation logic (`jobAggregator.js`, `courseAggregator.js`) uses simulated and live data with fallbacks.
*   **Containerization:**
    *   Standard `docker-compose.yml` orchestrates the frontend (Nginx), backend (Node), and PostgreSQL database.

### 2.2 Security Findings
*   **CORS:** Broad origin rules are currently set, checking against a list of allowed origins. It supports dynamic configuration via `CORS_ORIGIN` env var.
*   **Rate Limiting:** Implemented on AI routes (`express-rate-limit`). Should be expanded to authentication endpoints (login, registration) to prevent brute-force attacks.
*   **Authentication:** Mentioned via JWT and OTP in system memory. Ensure JWT secrets and expiration times are robustly configured.
*   **Input Validation:** Relies on basic checks (e.g., `if (!message)` in AI route). Recommendation: Integrate `zod` or `joi` for strict schema validation on all incoming API requests (especially `auth`, `enrollments`, and `users`).

### 2.3 Performance & Optimization
*   **Database:**
    *   Prisma schema uses indexing on frequent search fields (`role`, `studentStatus`).
    *   *Recommendation:* Add indexes to foreign keys (`userId`, `qualificationId` in Enrollment) if missing, to speed up relation queries.
*   **Aggregators:**
    *   `courseAggregator` and `jobAggregator` fetch from external APIs.
    *   *Recommendation:* Implement a robust caching layer (Redis) to cache external API responses and prevent rate-limiting from third-party services.

### 2.4 Testing
*   No standard test suites (`package.json` not present in repository context, but standard `jest` / `vitest` assumed absent).
*   *Recommendation:* Introduce unit tests for backend services (especially aggregators) and frontend components using Vitest/React Testing Library.

---

## 3. New Features Recommendations

### 3.1 Calendar & Class Scheduling System
Currently, the system handles "Enrollments" and "Qualifications", but lacks granular time management.

#### Architectural Proposal:
1.  **Database Updates (Prisma Schema):**
    ```prisma
    model Cohort {
      id              String   @id @default(uuid())
      qualificationId String
      name            String   // e.g., "Batch 1 - Spring 2024"
      startDate       DateTime
      endDate         DateTime
      capacity        Int

      qualification   Qualification @relation(fields: [qualificationId], references: [id])
      sessions        ClassSession[]
      enrollments     Enrollment[]  // Link Enrollment to specific Cohort
    }

    model ClassSession {
      id        String   @id @default(uuid())
      cohortId  String
      trainerId String
      title     String
      startTime DateTime
      endTime   DateTime
      location  String?  // Physical or Zoom Link

      cohort    Cohort @relation(fields: [cohortId], references: [id])
      trainer   User   @relation(fields: [trainerId], references: [id])
    }
    ```

2.  **Backend Services:**
    *   Implement CRUD endpoints for Cohorts and Class Sessions.
    *   Conflict resolution logic: Prevent trainers from being double-booked.

3.  **Frontend Integration:**
    *   Integrate a robust React calendar library (e.g., `react-big-calendar` or `@fullcalendar/react`).
    *   **Student View:** View upcoming classes, assignments deadlines.
    *   **Trainer View:** Manage schedules, start classes, mark attendance.

### 3.2 Advanced AI, LLM, and NLP Integrations
The current system uses a basic Gemini implementation for AI Chat. We can significantly expand this.

#### 3.2.1 AI Course Recommendation Engine (NLP)
*   **Concept:** Instead of simple keyword search, users input a natural language description of their goals (e.g., "I want to work in Japan as a caregiver but I only have basic Japanese.").
*   **Implementation:**
    *   Use embeddings (e.g., Google `text-embedding-004`) to vector-search the `Qualification` and `Job` databases.
    *   Prisma + PostgreSQL `pgvector` extension can be used to store and query these embeddings.
    *   The LLM parses the user prompt, queries vector space, and generates a personalized "Learning Roadmap".

#### 3.2.2 Automated Resume & Skills Parsing (NLP/LLM)
*   **Concept:** Users upload their existing resumes. The system parses it and auto-fills their profile.
*   **Implementation:**
    *   When a `Document` of type "Resume" is uploaded, trigger an AI service.
    *   Use Gemini's multimodal capabilities (or text capabilities if PDF text is extracted) to extract `skills`, `experience`, and `education`.
    *   Map extracted skills against the vocational platform's ontology (e.g., mapping "welded pipes" to "SMAW NC II").

#### 3.2.3 AI Teaching Assistant & Tutor
*   **Concept:** Context-aware tutoring for specific courses.
*   **Implementation:**
    *   Enhance the existing `/api/ai/chat` endpoint to accept `courseId` or `lessonId`.
    *   Implement RAG (Retrieval-Augmented Generation). Inject course syllabus and lesson materials into the prompt context so the AI answers *only* based on the course curriculum, preventing hallucinations.

#### 3.2.4 NLP Sentiment Analysis on Course Feedback
*   **Concept:** Automatically gauge student satisfaction.
*   **Implementation:**
    *   When students complete an `Enrollment`, they submit a review.
    *   Run a lightweight NLP sentiment analysis (or prompt Gemini) to categorize feedback into Positive/Neutral/Negative and extract key improvement areas for trainers.

## 4. Next Steps & Execution Strategy

1.  **Phase 1: Stabilization & Security**
    *   Implement input validation, strict rate limiting, and setup Redis caching for job/course aggregators.
2.  **Phase 2: Scheduling Core**
    *   Update Prisma schema with `Cohort` and `ClassSession`.
    *   Build administrative UI for creating schedules.
3.  **Phase 3: AI Expansion**
    *   Implement PostgreSQL `pgvector`.
    *   Upgrade the AI Chat to support RAG-based context injection for specific courses.