# EQUIP Platform - System Policies & Guidelines

This document consolidates all established rules, criteria, and policies for the EQUIP platform.

## 👥 Roles & Access Control

### 👨‍🎓 Students
- **Profile Completion**: Students must complete their personal profile (including contact details and photo) before they can request enrollment in any course.
- **Enrollment Limit**: A student can only have **one active enrollment** at any given time. This includes both `PENDING` requests and `APPROVED` enrollments.
- **Course Status**: Students can view their progress and recent activity only for their currently active course.

### 👨‍🏫 Trainers
- **Course Load**: A trainer can handle a **minimum of 1 and a maximum of 3 courses** simultaneously. 
- **Registration**: Trainers can be registered in the system without an initial course assignment (optional field).
- **Assigned Courses**: One course equals one specific batch. Trainers have management access only to students within their assigned batches.
- **Batch Size**: Each trainer's batch is strictly limited to a **maximum of 25 students**.

### 💼 Staff
- **Roles**: Staff members can be designated as Teaching, Non-Teaching, or both.
- **Management**: Only users with **Admin** privileges can invite, modify, or remove staff members.

### 🔑 Administrators (Superusers)
- **Eligibility**: Admin status is strictly restricted to authorized email addresses (e.g., `quantumgroupph@gmail.com`, `perezdenmars@gmail.com`).
- **Capabilities**: Full access to all modules, including Staff Management, Trainer Assignments, Student Oversight, and Site Settings.
- **Self-Protection**: Administrators cannot delete their own accounts from the system to prevent accidental lockout.

## 🏛️ System & CMS Policies

### 🖼️ Branding & Content
- **Management**: Only Administrators can update branding assets, including:
    - Site Logo
    - Favicon
    - Hero Banner Image
- **Dynamic Updates**: Branding changes reflect across the platform in real-time.

### 🛡️ Security & Privacy
- **Authentication**: Secure JWT-based sessions with configurable expiry.
- **OTP Security**: Rate-limited OTP requests to prevent brute-force attacks.
- **Audit Logging**: Major actions (enrollments, status changes, deletions) are logged for accountability.
- **Data Protection**: Generic error messages in production to prevent internal schema leakage.
- **CORS Protection**: Strict origin validation to prevent unauthorized subdomain access.

## 📊 Batch & Enrollment Metrics
- **Hard Limit**: 25 students per Batch/Qualification.
- **Status Flow**: `PENDING` → `APPROVED` OR `REJECTED`.
- **Validation**: The system automatically blocks approvals if a batch is already at full capacity (25/25).
