# Pan-African Journal of Social Work and Social Policy

A full-stack scholarly journal platform for peer-reviewed articles.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **File Storage**: Cloudinary
- **Authentication**: JWT (access + refresh tokens)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Installation

```bash
# Install all dependencies (root + backend + frontend)
npm run install:all

# Seed the database with sample data
npm run seed

# Start both backend and frontend in development mode
npm run dev
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:3000`

### Test Accounts (after seeding)

| Role     | Email                       | Password        |
|----------|-----------------------------|-----------------|
| Admin    | admin@panafrijournal.org     | Admin@123456    |
| Editor   | editor@panafrijournal.org    | Editor@123456   |
| Reviewer | reviewer1@panafrijournal.org | Reviewer@123456 |
| Author   | author@panafrijournal.org    | Author@123456   |

## Project Structure

```
Pan-Afri/
├── backend/           # Express API server
│   └── src/
│       ├── config/    # DB connection, Cloudinary, env config
│       ├── models/    # Mongoose models (User, Manuscript, Review, Article)
│       ├── routes/    # Express route handlers
│       ├── services/  # Business logic (file uploads, email)
│       ├── middleware/ # Auth, validation, file upload
│       └── server.ts  # App entry point
├── frontend/          # Next.js frontend
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/# React components
│       ├── lib/       # API client, auth, utilities
│       └── types/     # TypeScript types
├── .env               # Environment variables
└── package.json       # Root workspace scripts
```
