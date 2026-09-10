import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Feed } from './pages/Feed.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';
import { PostTask } from './pages/PostTask.jsx';
import { TaskDetail } from './pages/TaskDetail.jsx';
import { MyTasks } from './pages/MyTasks.jsx';
import { Profile } from './pages/Profile.jsx';
import { Teams } from './pages/Teams.jsx';
import { TeamDetail } from './pages/TeamDetail.jsx';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Protected Routes */}
          <Route
            path="/post-task"
            element={
              <ProtectedRoute>
                <PostTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute>
                <MyTasks />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
