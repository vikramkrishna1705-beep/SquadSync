# SquadSync

## Project Overview

SquadSync is a modern web application designed for team collaboration and task management. It provides an intuitive interface for teams to organize their work, featuring drag-and-drop capabilities for seamless workflow management and a robust backend for reliable data storage.

## Features Implemented

- **Task Management**: Create, read, update, and delete tasks.
- **Drag-and-Drop Interface**: Easily reorder tasks or move them across different workflow stages using smooth drag-and-drop interactions.
- **Real-time Database**: Persistent storage with MongoDB to ensure your data is always up-to-date and securely saved.
- **Modern UI**: A responsive and accessible user interface built with Tailwind CSS and Lucide icons.

## Technology Stack Used

- **Frontend**: Next.js (App Router), React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB, Mongoose
- **Drag and Drop**: `@dnd-kit`
- **Icons**: `lucide-react`

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/vikramkrishna1705-beep/squadsync.git
   cd squadsync
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add your MongoDB connection string and any other required variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string_here
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment Instructions

The easiest way to deploy SquadSync is using the [Vercel Platform](https://vercel.com/):

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and sign in.
3. Click "Add New Project" and import your GitHub repository.
4. Add your Environment Variables (e.g., `MONGODB_URI`) in the Vercel dashboard.
5. Click "Deploy". Vercel will automatically build and deploy your Next.js application.

Alternatively, you can build the project for a custom Node.js hosting environment:

```bash
npm run build
npm run start
```

## Screenshots of the working website

> Please add screenshots of your application here.

- **Dashboard / Kanban Board**:
  `![Dashboard Screenshot](./public/screenshot-dashboard.png)`

- **Task Details**:
  `![Task Details Screenshot](./public/screenshot-task.png)`

## Known Limitations

- List any current bugs or limitations here.
- Mobile drag-and-drop might require further optimization for touch devices.
- Currently lacks real-time WebSocket syncing (data requires manual refresh or optimistic UI updates).
