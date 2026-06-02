# CSMU Cloud Notes — Product Requirements Document (PRD)

**Version:** 2.0.0
**Date:** June 2026
**Author:** Anuj Mhatre
**Status:** Ready for Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Objectives & Goals](#2-objectives--goals)
3. [Deployment Architecture](#3-deployment-architecture)
4. [Tech Stack & Dependencies](#4-tech-stack--dependencies)
5. [Roles & Access Control](#5-roles--access-control)
6. [Feature Requirements](#6-feature-requirements)
7. [UI/UX Design Requirements](#7-uiux-design-requirements)
8. [Database Schema](#8-database-schema)
9. [Storage Architecture](#9-storage-architecture)
10. [Authentication Flow](#10-authentication-flow)
11. [Backend API Routes](#11-backend-api-routes)
12. [Upgraded Project Prompt](#12-upgraded-project-prompt)
13. [Full File Structure](#13-full-file-structure)
14. [System Architecture Diagram](#14-system-architecture-diagram)
15. [User Flow Diagrams](#15-user-flow-diagrams)
16. [Environment Variables & Configuration](#16-environment-variables--configuration)
17. [Security Requirements](#17-security-requirements)
18. [Non-Functional Requirements](#18-non-functional-requirements)
19. [Development Phases & Milestones](#19-development-phases--milestones)

---

## 1. Project Overview

**CSMU Cloud Notes** is a secure, full-stack, cloud-based academic resource-sharing platform designed for college students at CSMU (Chhatrapati Shivaji Maharaj University). The platform allows admin-controlled content management and student-facing, authenticated read-only access to academic materials such as notes, assignments, lab manuals, question papers, and question banks.

The system is built on a **three-tier architecture**:

| Tier | Technology | Hosting |
|---|---|---|
| Frontend (SPA) | React + TypeScript + Vite | **Vercel** |
| Backend (REST API) | Node.js + Express | **Railway** |
| Auth | Firebase Authentication (Google + Email) | Firebase Cloud |
| Database | Supabase PostgreSQL | Supabase Cloud |
| File Storage | Supabase Storage | Supabase Cloud |

The backend on Railway acts as a secure middleware between the frontend and Supabase — all file uploads, deletes, and sensitive DB operations go through the Express API (never directly from the browser to Supabase for write operations). Read operations (fetching file lists) can be done directly from the frontend via the Supabase JS client.

---

## 2. Objectives & Goals

### Primary Goals

- Provide a centralized, cloud-hosted repository for CSMU academic materials
- Enforce strict role-based access control (RBAC) at both API and database level
- Allow only verified admins to upload, manage, and delete academic files
- Give all authenticated students browse, search, filter, and download access
- Build a visually stunning, modern, mobile-first UI that feels premium and trustworthy

### Secondary Goals

- Ensure the platform is scalable and maintainable by a small team
- Maintain structured, category-based content organization
- Provide real-time feedback and smooth UX interactions
- Support multiple file types: PDF, DOCX, PPTX, XLSX, JPG, PNG
- Make the system extendable for future features like notifications, bookmarks, and comments

---

## 3. Deployment Architecture

### Where Everything Lives

```
┌─────────────────────────────────────────────────────────┐
│                        VERCEL                            │
│           Frontend — React + TypeScript + Vite           │
│           Domain: csmu-cloud-notes.vercel.app            │
│           CDN: Vercel Edge Network (global)              │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS REST API calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                       RAILWAY                            │
│           Backend — Node.js + Express                    │
│           Domain: csmu-api.up.railway.app                │
│           Auto-deploy from GitHub main branch            │
│           Handles: Auth verify, upload, delete, metadata │
└────────┬───────────────────────────┬────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐      ┌──────────────────────────────┐
│    FIREBASE      │      │           SUPABASE            │
│  Authentication  │      │  PostgreSQL DB + Storage      │
│  Google OAuth    │      │  Tables: files                │
│  Email/Password  │      │  Buckets: notes, assignments  │
│  ID Token (JWT)  │      │          lab-manuals, etc.    │
└─────────────────┘      └──────────────────────────────┘
```

### Request Flow for Writes (Upload / Delete)

```
Browser → POST /api/files/upload → Railway Express Server
                                         │
                                    Verify Firebase JWT
                                    Check admin email
                                         │
                                    Upload to Supabase Storage
                                    Insert row to Supabase DB
                                         │
                                    Return success response
                                         │
Browser ← { success: true, file } ←─────┘
```

### Request Flow for Reads (Fetch Files)

```
Browser → Supabase JS Client → Supabase DB (SELECT * FROM files)
        ← File list ──────────────────────────────────────────────
```

> Reads are done directly from browser → Supabase (via Supabase anon key + RLS). Writes always go through Railway backend for extra security.

---

## 4. Tech Stack & Dependencies

### Frontend (Vercel)

| Technology | Version | Purpose |
|---|---|---|
| React | ^18.x | UI framework |
| TypeScript | ^5.x | Type safety |
| Vite | ^5.x | Build tool & dev server |
| React Router DOM | ^6.x | Client-side routing |
| Tailwind CSS | ^3.x | Utility-first styling |
| Framer Motion | ^11.x | Animations & transitions |
| React Hot Toast | ^2.x | Toast notifications |
| Lucide React | ^0.x | Icon library |
| @supabase/supabase-js | ^2.x | Supabase client (reads) |
| firebase | ^10.x | Firebase Auth SDK |
| axios | ^1.x | HTTP client for Railway API calls |

### Backend (Railway)

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ^20.x | Runtime |
| Express | ^4.x | HTTP server & routing |
| TypeScript | ^5.x | Type safety |
| @supabase/supabase-js | ^2.x | Supabase server-side client |
| firebase-admin | ^12.x | Verify Firebase ID tokens server-side |
| multer | ^1.x | Handle multipart file uploads |
| cors | ^2.x | Allow Vercel frontend origin |
| dotenv | ^16.x | Environment variables |
| helmet | ^7.x | HTTP security headers |
| express-rate-limit | ^7.x | Rate limit API endpoints |
| morgan | ^1.x | HTTP request logging |

### Infrastructure & Services

| Service | Purpose | Hosting |
|---|---|---|
| Firebase Authentication | Google OAuth + Email/Password | Firebase Cloud |
| Supabase PostgreSQL | File metadata storage | Supabase Cloud |
| Supabase Storage | Actual file storage (5 buckets) | Supabase Cloud |
| Vercel | Frontend deploy + CDN + HTTPS | Vercel Cloud |
| Railway | Backend Node.js server + auto-deploy | Railway Cloud |
| GitHub | Source control + CI/CD trigger | GitHub |

---

## 5. Roles & Access Control

### Role Definitions

**Admin** — A hardcoded list of exactly 3 email addresses verified server-side on Railway.

| Email | Role |
|---|---|
| anujmhatre125@gmail.com | Admin |
| nehapatil0045@gmail.com | Admin |
| khushalp1729@gmail.com | Admin |

**Student** — Any other authenticated user (Google login or Email/Password). Read-only access.

**Unauthenticated User** — Cannot access any content. Redirected to landing/login page.

### Permission Matrix

| Action | Unauthenticated | Student | Admin |
|---|---|---|---|
| View landing page | ✅ | ✅ | ✅ |
| Log in | ✅ | ✅ | ✅ |
| View student dashboard | ❌ | ✅ | ✅ |
| Browse / search / filter files | ❌ | ✅ | ✅ |
| Download files | ❌ | ✅ | ✅ |
| View admin dashboard | ❌ | ❌ | ✅ |
| Upload files (via Railway API) | ❌ | ❌ | ✅ |
| Delete files (via Railway API) | ❌ | ❌ | ✅ |
| Edit file metadata (via Railway API) | ❌ | ❌ | ✅ |

### Admin Detection (Backend — Railway)

```typescript
// backend/src/config/admins.ts
export const ADMIN_EMAILS = [
  "anujmhatre125@gmail.com",
  "nehapatil0045@gmail.com",
  "khushalp1729@gmail.com"
] as const;

export const isAdmin = (email: string): boolean =>
  ADMIN_EMAILS.includes(email.toLowerCase() as typeof ADMIN_EMAILS[number]);
```

### Middleware Chain (Railway)

```
Request → verifyFirebaseToken → checkAdminRole → routeHandler
```

```typescript
// verifyFirebaseToken middleware
export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// checkAdminRole middleware
export const checkAdminRole = (req, res, next) => {
  if (!isAdmin(req.user.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
```

---

## 6. Feature Requirements

### 6.1 Landing Page

- Full-screen hero with animated gradient background
- Project name **CSMU Cloud Notes** with tagline
- Single CTA: **"Login to Access Notes"**
- Feature highlights section (3 cards: Secure, Organized, Instant Download)
- Footer with project name + college name
- No content accessible without login

### 6.2 Authentication

- **Google Sign-In** via Firebase (primary)
- **Email/Password** via Firebase (secondary)
- After login → check email → route to `/admin/dashboard` or `/student/dashboard`
- Persistent session via Firebase `onAuthStateChanged`
- Firebase ID token sent as `Authorization: Bearer <token>` to Railway API
- Logout clears Firebase session + resets app state

### 6.3 Student Dashboard

- Category tab bar: All / Notes / Assignments / Lab Manuals / Question Papers / Question Bank
- Debounced search (300ms) by file title
- File cards grid (3 col desktop / 2 tablet / 1 mobile) showing:
  - Category badge, file type icon, title, subject, uploader, date, size
  - Download button → fetches Supabase signed URL → triggers download
- Skeleton loader while fetching, empty state when no results

### 6.4 Admin Dashboard

- Sidebar navigation: Overview / Upload / Manage Files
- **Overview:** stats cards (total files, per-category counts, storage used), recent uploads table
- **Upload page:** title input, category select, subject input, drag-drop file zone, upload progress bar, success/error toast
- **Manage page:** sortable file table, category filter, search, per-row delete with confirmation modal

### 6.5 File Categories

| Category | Bucket | Description |
|---|---|---|
| Notes | `notes` | Lecture notes, study material |
| Assignments | `assignments` | Assignment PDFs/docs |
| Lab Manuals | `lab-manuals` | Practical lab manuals |
| Question Papers | `question-papers` | Previous year papers |
| Question Bank | `question-bank` | Topic-wise Q&A banks |

---

## 7. UI/UX Design Requirements

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#FF9A86` | Buttons, accents, active states |
| `--secondary` | `#ECB390` | Cards, section backgrounds |
| `--background` | `#FFF8F5` | Page background |
| `--surface` | `rgba(255,255,255,0.75)` | Card surface (glassmorphism) |
| `--text-primary` | `#2D1B14` | Headings |
| `--text-secondary` | `#7A5C50` | Subtext, labels |
| `--border` | `rgba(255,154,134,0.25)` | Card borders |
| `--shadow` | `rgba(236,179,144,0.30)` | Box shadows |

### Typography

| Usage | Font | Weight | Size |
|---|---|---|---|
| Headings H1 | Poppins | 700 | 2.5rem–4rem |
| Headings H2–H3 | Poppins | 600 | 1.5rem–2rem |
| Body / Labels | Inter | 400–500 | 0.875rem–1rem |
| Category Badges | Montserrat | 600 | 0.75rem |

### Component Style Rules

- **Cards** — `backdrop-filter: blur(12px)`, semi-transparent white, 1px primary-color border, `border-radius: 16px`
- **Buttons** — gradient `#FF9A86 → #ECB390`, white text, hover scale + shadow deepen
- **Shadows** — `0 8px 32px rgba(236,179,144,0.30)`
- **Hover** — cards lift: `transform: translateY(-4px)` + deeper shadow
- **Transitions** — `transition: all 0.2s ease` on all interactive elements
- **Animations** — Framer Motion: page fade-in, staggered card renders (0.05s each), modal scale-in

---

## 8. Database Schema

### Table: `files`

```sql
CREATE TABLE files (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN (
                   'notes','assignments','lab-manuals',
                   'question-papers','question-bank'
                 )),
  file_url       TEXT NOT NULL,
  storage_path   TEXT NOT NULL,
  file_type      TEXT,
  file_size      BIGINT,
  subject        TEXT,
  uploader_name  TEXT NOT NULL,
  uploader_email TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security Policies

```sql
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Students: read-only
CREATE POLICY "Authenticated users can view files"
  ON files FOR SELECT
  USING (auth.role() = 'authenticated');

-- Backend service role handles inserts and deletes
-- (Railway uses Supabase SERVICE_ROLE_KEY — bypasses RLS entirely)
```

> **Key difference from v1:** The Railway backend uses the Supabase `SERVICE_ROLE_KEY` (secret, only on server), which bypasses RLS for writes. The frontend only ever uses the `ANON_KEY` for reads. This is more secure — the service role key never touches the browser.

---

## 9. Storage Architecture

### Supabase Storage Buckets

| Bucket | Access Policy | Max Size | MIME Types |
|---|---|---|---|
| `notes` | Auth read / Service write | 50MB | pdf, image/*, docx, pptx, xlsx |
| `assignments` | Auth read / Service write | 50MB | Same |
| `lab-manuals` | Auth read / Service write | 50MB | Same |
| `question-papers` | Auth read / Service write | 50MB | Same |
| `question-bank` | Auth read / Service write | 50MB | Same |

### File Path Convention

```
{bucket}/{year}/{month}/{uuid}-{sanitized-filename}
e.g. notes/2026/06/a3f12b09-OS_Unit2_Notes.pdf
```

### Storage Access Pattern

- **Frontend** → uses Supabase anon key → can only read (download via signed URL)
- **Backend (Railway)** → uses Supabase service role key → can upload, delete, manage

---

## 10. Authentication Flow

### Full Auth Flow (Frontend → Firebase → Railway → Supabase)

```
1. User clicks "Login with Google" on Vercel frontend
2. Firebase triggers Google OAuth popup
3. Firebase returns authenticated user object
4. Frontend calls: user.getIdToken() → gets Firebase JWT (1hr expiry)
5. Frontend stores token in memory (AuthContext)
6. For READ operations:
   → Frontend uses Supabase JS client with anon key directly
7. For WRITE operations (upload/delete):
   → Frontend sends: POST /api/files/upload
     Headers: Authorization: Bearer <firebase-id-token>
   → Railway verifyFirebaseToken middleware:
     calls firebaseAdmin.auth().verifyIdToken(token)
   → Railway checkAdminRole middleware:
     checks decoded.email against ADMIN_EMAILS list
   → Railway uses Supabase service_role_key to perform write
   → Returns success/error to frontend
8. Firebase SDK auto-refreshes token before expiry
9. Logout: firebase.signOut() → clear AuthContext state
```

### Route Protection (Frontend)

```typescript
// ProtectedRoute.tsx — requires any authenticated user
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/" />;
  return children;
};

// AdminRoute.tsx — requires admin email
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/" />;
  if (!isAdmin) return <Navigate to="/unauthorized" />;
  return children;
};
```

---

## 11. Backend API Routes

All routes hosted on Railway at `https://csmu-api.up.railway.app`

### Public Routes

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check — returns `{ status: "ok" }` |

### Protected Routes (require Firebase JWT)

| Method | Route | Auth Required | Description |
|---|---|---|---|
| GET | `/api/files` | Any auth user | Get all files (proxied from Supabase) |
| GET | `/api/files/:id` | Any auth user | Get single file metadata |

### Admin-Only Routes (require Firebase JWT + admin email)

| Method | Route | Description |
|---|---|---|
| POST | `/api/files/upload` | Upload file to Supabase Storage + insert DB row |
| DELETE | `/api/files/:id` | Delete file from Storage + remove DB row |
| PATCH | `/api/files/:id` | Update file title / subject / category |
| GET | `/api/admin/stats` | Get file counts per category + total storage |

### Upload Endpoint Detail

```
POST /api/files/upload
Headers:
  Authorization: Bearer <firebase-id-token>
  Content-Type: multipart/form-data
Body (form-data):
  file       → binary file (max 50MB)
  title      → string (required)
  category   → string (required, one of 5 valid values)
  subject    → string (optional)

Response 200:
{
  "success": true,
  "file": {
    "id": "uuid",
    "title": "OS Unit 2 Notes",
    "category": "notes",
    "file_url": "https://...supabase.co/storage/...",
    "created_at": "2026-06-02T..."
  }
}

Response 403:
{ "error": "Admin access required" }

Response 400:
{ "error": "File size exceeds 50MB limit" }
```

### Delete Endpoint Detail

```
DELETE /api/files/:id
Headers:
  Authorization: Bearer <firebase-id-token>

Response 200:
{ "success": true, "message": "File deleted successfully" }

Response 404:
{ "error": "File not found" }
```

---

## 12. Upgraded Project Prompt

> Full production-grade prompt for AI coding tools (Bolt.new, Cursor, Lovable, v0, Windsurf, Codex).

---

**CSMU Cloud Notes — Full-Stack Development Prompt (Production Grade v2.0)**

Build a complete, production-ready, full-stack web application called **CSMU Cloud Notes** — a secure, role-based, cloud-hosted academic resource platform for college students. This is a three-tier architecture: React frontend on Vercel, Node.js/Express backend on Railway, and Firebase + Supabase for auth, database, and storage.

---

### Architecture Overview

```
Vercel (React Frontend)
  ↕ HTTPS
Railway (Node.js/Express Backend)
  ↕ Firebase Admin SDK → verifies Firebase JWT tokens
  ↕ Supabase service_role_key → DB reads/writes + Storage uploads/deletes
Firebase (Authentication only — Google OAuth + Email/Password)
Supabase (PostgreSQL DB + Object Storage — 5 buckets)
```

---

### Frontend Tech Stack (Vercel)

- React 18 + TypeScript + Vite
- Tailwind CSS + custom CSS variables for design tokens
- Framer Motion for page transitions, staggered lists, modal animations
- React Router DOM v6 with `createBrowserRouter`
- Firebase SDK v10 (auth only — `getIdToken()` for API calls)
- Supabase JS client v2 (reads only — anon key)
- Axios for all Railway API calls
- Lucide React for icons
- React Hot Toast for notifications

### Backend Tech Stack (Railway)

- Node.js 20 + Express 4 + TypeScript
- firebase-admin SDK (verify Firebase ID tokens server-side)
- @supabase/supabase-js with SERVICE_ROLE_KEY (bypasses RLS for writes)
- multer (handle file uploads in memory before streaming to Supabase)
- cors (whitelist Vercel frontend domain)
- helmet (security headers)
- express-rate-limit (100 req/15min per IP)
- morgan (request logging)

---

### Design System

Colors:
- Primary: `#FF9A86` | Secondary: `#ECB390` | Background: `#FFF8F5`
- Surface: `rgba(255,255,255,0.75)` + `backdrop-filter: blur(12px)`
- Text primary: `#2D1B14` | Text secondary: `#7A5C50`
- Border: `rgba(255,154,134,0.25)` | Shadow: `0 8px 32px rgba(236,179,144,0.30)`

Typography:
- Poppins 700/600 for headings (Google Fonts)
- Inter 400/500 for body (Google Fonts)
- Montserrat 600 for badges (Google Fonts)

Components:
- Glassmorphism cards with hover lift (`translateY(-4px)`)
- Gradient buttons (#FF9A86 → #ECB390)
- Pill category badges (color-coded per category)
- Skeleton loaders, empty states, animated modals
- Framer Motion stagger: 0.05s delay between each card

---

### Pages & Routes (Frontend)

```
/                        → LandingPage (public)
/login                   → LoginPage (public)
/student/dashboard       → StudentDashboard (ProtectedRoute)
/admin/dashboard         → AdminDashboard (AdminRoute)
/admin/upload            → AdminUpload (AdminRoute)
/admin/manage            → AdminManage (AdminRoute)
/unauthorized            → UnauthorizedPage (public)
```

---

### Admin Emails (hardcoded in both frontend + backend)

```typescript
export const ADMIN_EMAILS = [
  "anujmhatre125@gmail.com",
  "nehapatil0045@gmail.com",
  "khushalp1729@gmail.com"
] as const;
```

---

### Backend API (Railway — Express)

**Middleware chain for protected routes:**
`verifyFirebaseToken → checkAdminRole (admin routes only) → handler`

**Routes:**

```
GET    /health                  → { status: "ok" }
GET    /api/files               → fetch all files (any auth)
GET    /api/files/:id           → fetch single file (any auth)
POST   /api/files/upload        → upload file (admin only)
DELETE /api/files/:id           → delete file (admin only)
PATCH  /api/files/:id           → update metadata (admin only)
GET    /api/admin/stats         → category counts + storage (admin only)
```

**Upload flow:**
1. multer stores file in memory buffer
2. Verify Firebase JWT → check admin email
3. `supabase.storage.from(category).upload(path, buffer, { contentType })`
4. `supabase.storage.from(category).getPublicUrl(path)`
5. `supabase.from('files').insert({ title, category, file_url, storage_path, ... })`
6. Return `{ success: true, file }` to frontend

**Delete flow:**
1. Verify Firebase JWT → check admin email
2. Fetch `storage_path` from `files` table by ID
3. `supabase.storage.from(category).remove([storage_path])`
4. `supabase.from('files').delete().eq('id', id)`
5. Return `{ success: true }`

---

### Supabase Database

```sql
CREATE TABLE files (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN (
                   'notes','assignments','lab-manuals',
                   'question-papers','question-bank')),
  file_url       TEXT NOT NULL,
  storage_path   TEXT NOT NULL,
  file_type      TEXT,
  file_size      BIGINT,
  subject        TEXT,
  uploader_name  TEXT NOT NULL,
  uploader_email TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Frontend (anon key) can only SELECT
CREATE POLICY "Authenticated users can view files"
  ON files FOR SELECT USING (auth.role() = 'authenticated');
-- Backend uses service_role_key → bypasses RLS for INSERT/DELETE
```

Create 5 Storage buckets: `notes`, `assignments`, `lab-manuals`, `question-papers`, `question-bank`
Each: private, 50MB limit, PDF/image/office MIME types.

---

### Environment Variables

**Frontend (.env on Vercel):**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RAILWAY_API_URL=https://csmu-api.up.railway.app
```

**Backend (.env on Railway):**
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
FRONTEND_URL=https://csmu-cloud-notes.vercel.app
PORT=3000
```

---

### Code Quality Standards

- All components: functional + full TypeScript interfaces
- No `any` types anywhere
- Custom hooks: `useAuth()`, `useFiles()`, `useAdmin()`
- Services: `src/services/fileService.ts` (Supabase reads), `src/services/apiService.ts` (Railway calls), `src/services/authService.ts`
- Error boundaries on all dashboard pages
- All async ops wrapped in try/catch with toast feedback
- Loading states on every async operation
- Optimistic UI updates on delete (remove card before server confirms)

---

## 13. Full File Structure

### Frontend (Vercel)

```
csmu-cloud-notes-frontend/
│
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── og-image.png
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── hero-bg.svg
│   │   │   ├── empty-state.svg
│   │   │   └── logo.svg
│   │   └── icons/
│   │       ├── pdf.svg
│   │       ├── docx.svg
│   │       ├── pptx.svg
│   │       └── image.svg
│   │
│   ├── components/
│   │   │
│   │   ├── common/
│   │   │   ├── Button.tsx              ← primary / secondary / danger variants
│   │   │   ├── Card.tsx                ← glassmorphism base card
│   │   │   ├── Badge.tsx               ← category pill badge
│   │   │   ├── Input.tsx               ← styled input with label + error
│   │   │   ├── Select.tsx              ← styled dropdown
│   │   │   ├── Modal.tsx               ← animated dialog/modal
│   │   │   ├── LoadingSpinner.tsx      ← full-page + inline loader
│   │   │   ├── SkeletonCard.tsx        ← placeholder card while loading
│   │   │   ├── ProgressBar.tsx         ← upload progress indicator
│   │   │   ├── EmptyState.tsx          ← no results illustration + message
│   │   │   ├── FileTypeIcon.tsx        ← returns icon per file type
│   │   │   └── ErrorBoundary.tsx       ← catches render errors gracefully
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              ← logo + user info + logout button
│   │   │   ├── AdminSidebar.tsx        ← sidebar nav for admin pages
│   │   │   ├── StudentLayout.tsx       ← wrapper for student pages
│   │   │   ├── AdminLayout.tsx         ← wrapper for admin pages
│   │   │   └── Footer.tsx              ← site footer
│   │   │
│   │   ├── auth/
│   │   │   ├── GoogleLoginButton.tsx   ← Firebase Google sign-in button
│   │   │   ├── EmailLoginForm.tsx      ← email + password form
│   │   │   ├── ProtectedRoute.tsx      ← requires any authenticated user
│   │   │   └── AdminRoute.tsx          ← requires admin email
│   │   │
│   │   ├── student/
│   │   │   ├── CategoryTabs.tsx        ← horizontal scrollable category filter
│   │   │   ├── SearchBar.tsx           ← debounced search input
│   │   │   ├── FileCard.tsx            ← individual file display card
│   │   │   ├── FileGrid.tsx            ← responsive grid with Framer stagger
│   │   │   └── DownloadButton.tsx      ← Supabase signed URL download
│   │   │
│   │   └── admin/
│   │       ├── StatsCard.tsx           ← dashboard stat box
│   │       ├── UploadForm.tsx          ← full upload form
│   │       ├── DragDropZone.tsx        ← file drag-and-drop area
│   │       ├── FilesTable.tsx          ← admin file management table
│   │       ├── DeleteModal.tsx         ← delete confirmation modal
│   │       └── RecentUploads.tsx       ← last 10 uploads widget
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx             ← public homepage
│   │   ├── LoginPage.tsx               ← Google + email login
│   │   ├── UnauthorizedPage.tsx        ← shown for non-admins on admin routes
│   │   ├── student/
│   │   │   └── StudentDashboard.tsx    ← main student view
│   │   └── admin/
│   │       ├── AdminDashboard.tsx      ← stats + recent uploads
│   │       ├── AdminUpload.tsx         ← upload file page
│   │       └── AdminManage.tsx         ← manage/delete files
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx             ← Firebase auth state + isAdmin flag
│   │   └── FilesContext.tsx            ← files list + filter state
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                  ← consumes AuthContext
│   │   ├── useFiles.ts                 ← fetch + filter files from Supabase
│   │   ├── useAdmin.ts                 ← upload/delete via Railway API
│   │   ├── useDebounce.ts              ← debounce hook for search
│   │   └── useLocalStorage.ts          ← persist small UI state
│   │
│   ├── services/
│   │   ├── authService.ts              ← Firebase login/logout methods
│   │   ├── fileService.ts              ← Supabase JS reads (SELECT from files)
│   │   └── apiService.ts               ← Axios calls to Railway backend
│   │
│   ├── config/
│   │   ├── firebase.ts                 ← Firebase app init (env vars)
│   │   ├── supabase.ts                 ← Supabase client init (anon key)
│   │   ├── admins.ts                   ← ADMIN_EMAILS constant
│   │   └── constants.ts                ← categories, file types, size limits
│   │
│   ├── types/
│   │   ├── file.types.ts               ← FileRecord, Category, FileType
│   │   ├── auth.types.ts               ← AuthUser, AuthContextType
│   │   └── api.types.ts                ← API request/response shapes
│   │
│   ├── utils/
│   │   ├── formatters.ts               ← formatDate, formatFileSize, relativeTime
│   │   ├── fileHelpers.ts              ← getFileType, sanitizeFileName, storagePath
│   │   ├── validators.ts               ← validateUploadForm, validateFileType
│   │   └── categoryHelpers.ts          ← getCategoryColor, getCategoryLabel
│   │
│   ├── styles/
│   │   ├── globals.css                 ← CSS reset + Google Fonts + CSS variables
│   │   ├── components.css              ← shared component styles
│   │   └── animations.css              ← keyframes + Framer Motion presets
│   │
│   ├── router/
│   │   └── index.tsx                   ← createBrowserRouter + all routes + guards
│   │
│   ├── App.tsx                         ← root component + providers
│   └── main.tsx                        ← Vite entry point
│
├── .env                                ← local env vars (never committed)
├── .env.example                        ← all required env var names
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── index.html                          ← Vite HTML with Google Fonts links
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── vercel.json                         ← SPA rewrite rules
└── package.json
```

### Backend (Railway)

```
csmu-cloud-notes-backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── firebase.ts                 ← firebase-admin init (service account)
│   │   ├── supabase.ts                 ← supabase client (SERVICE_ROLE_KEY)
│   │   ├── admins.ts                   ← ADMIN_EMAILS list
│   │   └── constants.ts                ← allowed MIME types, max file size, bucket names
│   │
│   ├── middleware/
│   │   ├── verifyFirebaseToken.ts      ← decodes + verifies Firebase JWT
│   │   ├── checkAdminRole.ts           ← checks req.user.email in ADMIN_EMAILS
│   │   ├── rateLimiter.ts              ← express-rate-limit config (100/15min)
│   │   ├── errorHandler.ts             ← global Express error handler
│   │   └── validateUpload.ts           ← validates file type + size before upload
│   │
│   ├── routes/
│   │   ├── health.route.ts             ← GET /health
│   │   ├── files.route.ts              ← GET /api/files, GET /api/files/:id
│   │   ├── upload.route.ts             ← POST /api/files/upload (admin only)
│   │   ├── delete.route.ts             ← DELETE /api/files/:id (admin only)
│   │   ├── update.route.ts             ← PATCH /api/files/:id (admin only)
│   │   └── stats.route.ts              ← GET /api/admin/stats (admin only)
│   │
│   ├── controllers/
│   │   ├── files.controller.ts         ← fetch all / single file logic
│   │   ├── upload.controller.ts        ← upload flow: storage + DB insert
│   │   ├── delete.controller.ts        ← delete flow: storage + DB delete
│   │   ├── update.controller.ts        ← update file metadata in DB
│   │   └── stats.controller.ts         ← aggregate stats queries
│   │
│   ├── services/
│   │   ├── storageService.ts           ← Supabase Storage upload/delete/getUrl
│   │   └── dbService.ts                ← Supabase DB insert/delete/select/update
│   │
│   ├── utils/
│   │   ├── fileHelpers.ts              ← sanitizeFileName, generateStoragePath
│   │   └── responseHelpers.ts          ← sendSuccess, sendError helpers
│   │
│   ├── types/
│   │   ├── express.d.ts                ← extends Request with `user` property
│   │   └── file.types.ts               ← FileRecord, UploadPayload interfaces
│   │
│   └── app.ts                          ← Express app setup (cors, helmet, routes)
│
├── server.ts                           ← entry point (listens on PORT)
├── .env                                ← Railway env vars (never committed)
├── .env.example
├── .gitignore
├── .eslintrc.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## 14. System Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════╗
║                    CSMU CLOUD NOTES — ARCHITECTURE               ║
╚══════════════════════════════════════════════════════════════════╝

  ┌──────────────────────────────────────────────────────────┐
  │                      USER BROWSER                         │
  │   ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │
  │   │  Landing   │  │   Student    │  │  Admin          │  │
  │   │  Page      │  │  Dashboard   │  │  Dashboard      │  │
  │   └────────────┘  └──────────────┘  └─────────────────┘  │
  └────────┬──────────────────┬──────────────────┬───────────┘
           │ Google OAuth     │ Supabase JS       │ Axios API
           │ Firebase SDK     │ (reads only)      │ calls
           ▼                  ▼                   ▼
  ┌──────────────┐   ┌───────────────┐   ┌────────────────────┐
  │   FIREBASE   │   │   SUPABASE    │   │     RAILWAY        │
  │    AUTH      │   │  PostgreSQL   │   │  Express Backend   │
  │              │   │   (anon key)  │   │                    │
  │ Google OAuth │   │  SELECT only  │   │ verifyFirebase()   │
  │ Email/Pass   │   │  files table  │   │ checkAdmin()       │
  │              │   │               │   │ multer upload      │
  │ Returns:     │   │ Returns:      │   │                    │
  │ Firebase JWT │   │ File list     │   │ Uses:              │
  └──────┬───────┘   └───────────────┘   │ firebase-admin SDK │
         │                               │ supabase           │
         │ Firebase JWT                  │ (service_role_key) │
         │ sent as Bearer token          └────────┬───────────┘
         └───────────────────────────────────────▶│
                                                  │
                                    ┌─────────────▼──────────────┐
                                    │         SUPABASE            │
                                    │                             │
                                    │  ┌──────────────────────┐   │
                                    │  │   PostgreSQL DB       │   │
                                    │  │   Table: files        │   │
                                    │  │   (service role —     │   │
                                    │  │    INSERT / DELETE)   │   │
                                    │  └──────────────────────┘   │
                                    │                             │
                                    │  ┌──────────────────────┐   │
                                    │  │   Storage Buckets     │   │
                                    │  │   notes/              │   │
                                    │  │   assignments/        │   │
                                    │  │   lab-manuals/        │   │
                                    │  │   question-papers/    │   │
                                    │  │   question-bank/      │   │
                                    │  └──────────────────────┘   │
                                    └─────────────────────────────┘
```

---

## 15. User Flow Diagrams

### Student Flow

```
Landing Page (Vercel)
        │
        ▼
[Click "Login to Access Notes"]
        │
        ▼
Login Page
   ├── Google Sign-In ──┐
   └── Email/Password ──┤
                        ▼
               Firebase Auth Success
               → get Firebase JWT
                        │
                 email = admin? ──── YES ──→ /admin/dashboard
                        │
                       NO
                        ▼
               /student/dashboard
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   Select Category   Search Title   Browse All
         │              │              │
         └──────────────┼──────────────┘
                        ▼
               File Cards Grid
               (fetched from Supabase via anon key)
                        │
                        ▼
               Click "Download"
                        │
                        ▼
               Supabase Signed URL generated
                        │
                        ▼
               File downloads in browser ✓
```

### Admin Upload Flow

```
Admin Dashboard (Vercel)
        │
        ▼
Click "Upload File" in Sidebar
        │
        ▼
Fill Upload Form:
  ✏ File Title (required)
  📂 Category (required)
  📚 Subject (optional)
  📎 Drag & drop / pick file
        │
        ▼
Click "Upload" Button
        │
        ├── Validation fails → show errors inline
        │
        └── Validation passes
                 │
                 ▼
        Axios POST /api/files/upload
        Headers: Authorization: Bearer <Firebase JWT>
        Body: FormData (file + metadata)
                 │
                 ▼ (Railway)
        verifyFirebaseToken middleware
        → Firebase Admin SDK verifies JWT ✓
                 │
                 ▼
        checkAdminRole middleware
        → email in ADMIN_EMAILS? ✓
                 │
                 ▼
        multer parses file buffer
                 │
                 ▼
        supabase.storage.upload(path, buffer)
                 │
                 ▼
        supabase.from('files').insert(metadata)
                 │
                 ▼
        Return { success: true, file }
                 │
                 ▼ (Vercel)
        Show success toast ✓
        Reset form
        Redirect to /admin/manage
```

### Admin Delete Flow

```
/admin/manage — Files Table
        │
        ▼
Click 🗑 Delete on a file row
        │
        ▼
DeleteModal opens:
  "Are you sure you want to delete [Title]?"
  [Cancel]  [Confirm Delete]
        │
        ├── Cancel → close modal, no action
        │
        └── Confirm
                 │
                 ▼
        Optimistic UI: remove card immediately
                 │
                 ▼
        Axios DELETE /api/files/:id
        Headers: Authorization: Bearer <Firebase JWT>
                 │
                 ▼ (Railway)
        verifyFirebaseToken ✓ → checkAdminRole ✓
                 │
                 ▼
        Fetch storage_path from DB by ID
                 │
                 ▼
        supabase.storage.remove([storage_path])
                 │
                 ▼
        supabase.from('files').delete().eq('id', id)
                 │
                 ▼
        Return { success: true }
                 │
                 ▼ (Vercel)
        Show success toast ✓
        (card already removed from UI)
```

---

## 16. Environment Variables & Configuration

### Frontend `.env.example` (Vercel)

```env
# Firebase (frontend — auth only)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Supabase (frontend — reads only, anon key)
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Railway Backend URL
VITE_RAILWAY_API_URL=https://csmu-api.up.railway.app
```

### Backend `.env.example` (Railway)

```env
# Firebase Admin (server-side token verification)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase (server-side — service role key for writes)
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS
FRONTEND_URL=https://csmu-cloud-notes.vercel.app

# Server
PORT=3000
NODE_ENV=production
```

### `vercel.json` (SPA Rewrites)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Railway `package.json` start script

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn src/server.ts"
  }
}
```

---

## 17. Security Requirements

- All admin write operations go through Railway backend — never directly from browser
- Firebase ID tokens verified server-side using `firebase-admin` (not just decoded client-side)
- Admin email check happens in Railway middleware — cannot be bypassed from frontend
- Supabase `SERVICE_ROLE_KEY` only exists on Railway server — never exposed to browser
- Frontend only uses `ANON_KEY` which is safe to expose (read-only via RLS)
- Supabase RLS policies enforce read-only for authenticated non-admin users at DB level
- File uploads validated: MIME type + file size before hitting Supabase Storage
- CORS on Railway configured to only allow Vercel frontend origin
- Helmet middleware sets HTTP security headers on all Railway responses
- Rate limiting: 100 requests per 15 minutes per IP on Railway
- Storage paths include UUID to prevent filename collision and enumeration
- No sensitive keys in frontend `.env` — service role key + Firebase private key only on Railway
- All API routes use HTTPS (both Vercel and Railway enforce HTTPS by default)

---

## 18. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time (LCP) | < 2.5s on 4G |
| API response time (Railway) | < 500ms for metadata ops |
| File upload max size | 50MB |
| Supported browsers | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| Mobile responsiveness | Full support from 320px width |
| Accessibility | WCAG 2.1 AA (focus states, alt text, color contrast ≥ 4.5:1) |
| Uptime | Supabase 99.9% / Firebase 99.9% / Railway 99.5% / Vercel 99.9% |
| Concurrent users | Supabase free tier: ~500 concurrent |
| Search response time | < 300ms (client-side filter on pre-fetched list) |
| Upload feedback | Progress bar updates every 10% |

---

## 19. Development Phases & Milestones

### Phase 1 — Project Setup (Day 1–2)

- [ ] Create GitHub repos: `csmu-cloud-notes-frontend` + `csmu-cloud-notes-backend`
- [ ] Init Vite + React + TypeScript + Tailwind frontend
- [ ] Init Node.js + Express + TypeScript backend
- [ ] Firebase project created, Google Auth + Email/Password enabled
- [ ] Supabase project created, `files` table + RLS created, 5 storage buckets created
- [ ] Railway project connected to backend GitHub repo (auto-deploy on push)
- [ ] Vercel project connected to frontend GitHub repo (auto-deploy on push)
- [ ] All environment variables set on Railway + Vercel dashboards

### Phase 2 — Auth & Routing (Day 3–4)

- [ ] Firebase Google login working on frontend
- [ ] Firebase Email/Password login working on frontend
- [ ] Firebase JWT retrieved and stored in AuthContext
- [ ] `isAdmin` detection working on frontend
- [ ] `ProtectedRoute` + `AdminRoute` guards implemented
- [ ] `verifyFirebaseToken` middleware on Railway
- [ ] `checkAdminRole` middleware on Railway
- [ ] Landing page + Login page built
- [ ] All routes set up with guards

### Phase 3 — Student Dashboard (Day 5–6)

- [ ] Files fetched from Supabase via anon key (direct client read)
- [ ] Category tabs working with filter
- [ ] Debounced search working
- [ ] File cards grid with Framer Motion stagger
- [ ] Download via Supabase signed URL working
- [ ] Skeleton loader + empty state

### Phase 4 — Admin Dashboard + Railway API (Day 7–9)

- [ ] Admin sidebar layout
- [ ] Stats overview page (`GET /api/admin/stats`)
- [ ] Upload form + drag-drop zone
- [ ] Upload flow through Railway (`POST /api/files/upload`)
- [ ] File table with manage view
- [ ] Delete flow through Railway (`DELETE /api/files/:id`)
- [ ] Delete confirmation modal + optimistic UI

### Phase 5 — Polish, Security & Deploy (Day 10–12)

- [ ] Framer Motion animations on all pages
- [ ] Full glassmorphism visual polish
- [ ] Mobile responsiveness tested (320px, 768px, 1280px)
- [ ] Error boundaries on all dashboard pages
- [ ] Rate limiting + CORS + Helmet confirmed on Railway
- [ ] All toast notifications wired up
- [ ] HTTPS confirmed on both Vercel + Railway
- [ ] README.md written for both repos
- [ ] Final QA pass (auth, upload, download, delete, mobile)

---

*CSMU Cloud Notes PRD — v2.0.0 | Vercel + Railway + Firebase + Supabase | June 2026*
