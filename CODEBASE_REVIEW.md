# EQUIP Platform Codebase Review & Technical Recommendations

## 1. Executive Summary

This document provides a comprehensive technical review of the EQUIP (Equip Quantum Upskilling Institute of the Philippines Inc.) platform codebase. It covers the current architecture, existing features, and detailed technical recommendations for integrating new functionalities, specifically focusing on Calendar & Class Scheduling, Artificial Intelligence (AI), Large Language Models (LLM), and Natural Language Processing (NLP).

## 2. Current Architecture & Stack Analysis

The platform is a modern web application structured as a monorepo with distinct frontend and backend services, orchestrated via Docker.

### 2.1 Backend (Node.js / Express / Prisma)
- **Framework:** Express.js provides the API routing layer.
- **Database ORM:** Prisma is used for database interactions with PostgreSQL.
- **Authentication:** JWT-based authentication with role-based access control (Student, Staff, Trainer, Admin).
- **External Integrations:**
  - Google Gemini API (`@google/genai`) for basic chat support.
  - Job APIs (Remotive, OpenWebNinja) for aggregating job postings.
  - Course APIs for aggregating online courses.
- **Structure:** Modularized into routes (`ai.js`, `auth.js`, `courses.js`, `jobs.js`, etc.) and services (`courseAggregator.js`, `jobAggregator.js`, `ai.js`).

### 2.2 Frontend (React / Vite)
- **Framework:** React with Vite for fast builds.
- **Styling:** Tailwind CSS.
- **Routing:** React Router DOM.
- **State/Context:** Context API used for global state (e.g., `SettingsContext`).
- **i18n:** `react-i18next` for multilingual support.

### 2.3 Deployment & Infrastructure
- **Containerization:** Docker and Docker Compose (`docker-compose.yml`) manage the PostgreSQL database, Node.js backend, and Nginx-served Vite frontend.
- **Networking:** Cloudflare Tunnel (`cloudflared`) is configured for secure exposition.

## 3. Existing Functionalities Review

- **User Management & Roles:** Comprehensive role system (Admin, Trainer, Staff, Student) with strict enrollment policies (e.g., one active course per student, max 25 students per batch).
- **Course & Job Aggregation:** Robust fallback mechanisms (mock data) in place if external APIs fail.
- **Basic AI Chat:** Implemented in `backend/src/routes/ai.js` using Google Gemini 2.5 Flash, providing contextual support based on the EQUIP identity. Rate-limited to prevent abuse.

## 4. Technical Debt & Areas for Improvement

- **Testing:** The codebase currently lacks a formal automated testing suite (Unit, Integration, E2E). This is a significant risk for stability as the platform scales.
- **Error Handling:** While a global error handler exists, more granular, contextual error logging could improve observability.
- **Caching:** In-memory caching (`cacheService.js`) is used for jobs. A distributed cache like Redis might be necessary for distributed deployments or scaling.

---

## 5. New Features Recommendations & Implementation Plan

### 5.1 Calendar & Class Scheduling

**Objective:** Enable Trainers to schedule classes, manage batches, and allow Students to view their class schedules.

**Implementation Steps:**
1.  **Database Schema Update (Prisma):**
    -   Create a `Schedule` or `Session` model linking to `Enrollment` or a new `Batch` model.
    -   Fields: `id`, `trainerId`, `qualificationId`, `startTime`, `endTime`, `location` (or link), `type` (Online/On-site).
2.  **Backend Routes (`backend/src/routes/schedules.js`):**
    -   CRUD endpoints for schedules, protected by role (Trainers can create/update, Students can read).
3.  **Frontend Integration:**
    -   Implement a calendar UI component (e.g., using `react-big-calendar` or FullCalendar).
    -   Create views for Trainers (manage schedule) and Students (view schedule).

### 5.2 Advanced AI & LLM Integrations

**Objective:** Enhance the current basic AI chat into a comprehensive virtual assistant and learning aide.

**Implementation Steps:**
1.  **Context-Aware Tutoring:**
    -   Extend the Gemini integration. Pass the student's current enrolled course (`Qualification` syllabus) as context to the LLM to provide targeted tutoring.
2.  **Automated Essay/Assignment Grading (Draft):**
    -   Utilize LLMs to provide preliminary feedback on written submissions based on predefined rubrics.
3.  **Resume & Cover Letter Builder:**
    -   Integrate LLM to generate or improve student resumes based on their completed qualifications and profile data.
4.  **Tech Stack:** Continue using Google Gemini API, or explore OpenAI API depending on specific feature requirements and cost analysis.

### 5.3 NLP (Natural Language Processing) Integrations

**Objective:** Extract insights from unstructured data to improve platform matching and user experience.

**Implementation Steps:**
1.  **Semantic Search for Courses & Jobs:**
    -   Replace basic keyword matching in `jobAggregator.js` and `courses.js` with semantic search.
    -   Use NLP embeddings (e.g., via Hugging Face or Gemini embeddings) to map user queries (e.g., "I like building things") to relevant courses (e.g., "Web Development", "Welding").
2.  **Skill Extraction from Resumes:**
    -   Implement NLP tools (like spaCy or cloud NLP APIs) to automatically parse uploaded resumes and extract skills to populate the student's profile.
3.  **Sentiment Analysis on Feedback:**
    -   Analyze course reviews or contact forms using NLP to gauge student satisfaction automatically.

### 5.4 Dynamic Job Aggregation Mechanisms

**Objective:** Ensure the `/jobs` page always displays fresh, relevant vocational and technical jobs daily without relying solely on static or mock data.

**Current State Analysis:**
Currently, `backend/src/services/syncScheduler.js` uses `node-cron` to fetch data daily at midnight, and `cacheService.js` stores this in-memory. However, the data sources (`jobAggregator.js`) rely heavily on generic API calls (Remotive, OpenWebNinja) and hardcoded simulated data for local Philippine jobs (PhilJobNet).

**Recommendations for True Dynamic Aggregation:**

1.  **Database Persistence over In-Memory Cache:**
    -   *Current:* The in-memory cache resets on server restart, leading to potential data loss or API rate limit hits on boot.
    -   *Recommendation:* Introduce a `JobListing` table in Prisma. The daily cron job should fetch new jobs, deduplicate them against the database (using external IDs or URL hashes), and insert the fresh ones. This allows for historical data analysis and pagination.

2.  **API Integration Expansion:**
    -   *Action:* Integrate with robust, dedicated job board APIs that offer Philippine and technical/vocational specific filters (e.g., Jobstreet API if accessible, LinkedIn API via specialized partnerships).
    -   *Pros:* Clean data, structured JSON, minimal maintenance.
    -   *Cons:* Can be expensive or have strict rate limits/access hurdles.

3.  **Web Scraping (Playwright/Puppeteer):**
    -   *Action:* For vital local boards lacking APIs (like the actual PhilJobNet or specialized TESDA job boards), implement a headless browser scraper using Playwright.
    -   *Mechanism:* A secondary cron job runs weekly or daily, navigates to target sites, extracts HTML elements (Title, Company, Location, Salary), formats them to the standard schema, and inserts them into the database.
    -   *Pros:* Access to data not available via public APIs.
    -   *Cons:* Fragile (breaks when website UI changes), slower execution, potential legal/TOS issues (respect `robots.txt` and implement rate limiting/delays).

4.  **RSS/XML Feed Parsing:**
    -   *Action:* Many job boards and corporate career pages provide RSS or XML feeds of their latest postings. Use a library like `rss-parser`.
    -   *Mechanism:* The daily cron job iterates through a curated list of feed URLs, parses the new items, and ingests them.
    -   *Pros:* Extremely lightweight, standardized format, very reliable.
    -   *Cons:* Limited to sites that explicitly offer RSS feeds.

**Strategic Implementation Path for Jobs:**
Phase 1: Migrate from in-memory cache to PostgreSQL persistence for jobs to ensure stability.
Phase 2: Implement RSS parsing for easy, lightweight ingestion of generic job boards.
Phase 3: Develop targeted Playwright scrapers specifically for high-value, local technical/vocational job sites that lack APIs or RSS feeds.

## 6. Conclusion

The EQUIP platform possesses a solid, modern foundation. The immediate priority should be establishing a testing framework and migrating job caching to persistent storage. Subsequently, implementing the Calendar scheduling and expanding the AI/NLP capabilities will significantly elevate the platform's value proposition for both students and trainers.
