# Project Name

Welcome to the Project Name! This project is designed to enhance skills assessment analytics by integrating advanced features and ensuring accurate scoring for submitted solutions.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Collaborators](#collaborators)
- [Video Resources](#video-resources)

## Overview
This project provides a comprehensive platform for skills assessment, allowing users to generate coding questions, submit solutions, and receive detailed analytics on their performance. The admin dashboard offers insights into overall performance, skill level distribution, and focus area strengths.

## Features
- Skills Assessment API for storing and evaluating assessment results.
- Admin Dashboard with analytics for total assessments, average scores, and skill distribution.
- Integration with GLHF API for question generation and solution assessment.
- User authentication and authorization using Clerk.
- Visualizations using Recharts for an interactive experience.

## Technology Stack
- **Frontend**: React, Next.js
- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Prisma
- **APIs**: GLHF API, Clerk API
- **Charts**: Recharts

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ManojINaik/Devops
   cd Devops
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create Environment File**:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<YOUR-API-KEY>
   CLERK_SECRET_KEY=<YOUR-API-KEY>
   DATABASE_URL=<YOUR-API-KEY>
   NEXT_PUBLIC_GLHF_API_KEY=<YOUR-API-KEY>
   # Add other environment variables as needed
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Push Database Schema**:
   ```bash
   npx prisma db push
   ```

6. **Run the Development Server**:
   ```bash
   npm run dev
   ```

## Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk public key.
- `CLERK_SECRET_KEY`: Your Clerk secret key.
- `DATABASE_URL`: Connection string for your PostgreSQL database.
- `NEXT_PUBLIC_GLHF_API_KEY`: API key for GLHF API.
- Additional keys for other integrated services.

## Collaborators
- **Abhishek**: Role - [GitHub](https://github.com/abhishekreddywadi)
- **Areez**: Role - [GitHub](https://github.com/AreezM)
- **Sujay**: Role - [GitHub](https://github.com/sujay-bhandari)

## 📹 Video Resources
Explore the video demonstrations to understand the project better:
### 📺 Admin Panel
https://github.com/ManojINaik/Devops/video/admin.mp4

### 📺 Analytics analytics
https://github.com/ManojINaik/Devops/video/analytics.mp4
### 📺 Aptitude Feature
https://github.com/ManojINaik/Devops/video/aptitude.mp4

### 📺 Dashboard Walkthrough
https://github.com/ManojINaik/Devops/video/dashboard.mp4

### 📺 Skills Section
https://github.com/ManojINaik/Devops/video/skills.mp4



Explore the video demonstrations and tutorials in the [video](./video) directory to get a better understanding of the project features and setup.

---

Feel free to reach out to the collaborators for any questions or contributions. Enjoy exploring the project!
