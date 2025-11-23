// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// --- 1. Auth Pages ---
import LoginLanding from './pages/auth/login'; 
import SSOSimulation from './pages/auth/SSOSimulation';

// --- 2. Dashboards ---
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TutorDashboard from './pages/dashboard/TutorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// --- 3. Admin Features (Phòng CTSV) ---
import TutorReviews from './pages/admin/TutorReviews';
import ParticipationResults from './pages/admin/ParticipationResults';

// --- 4. Student & Tutor Features ---
// ĐÃ XÓA: import RegisterGroup ...
import GenericPage from './pages/dashboard/GenericPage'; // Trang mẫu cho các tính năng đang phát triển

function App() {
  return (
    <Router>
      <Routes>
        {/* --- LUỒNG ĐĂNG NHẬP --- */}
        <Route path="/" element={<LoginLanding />} />
        <Route path="/sso-simulation" element={<SSOSimulation />} />
        
        {/* --- STUDENT ROUTES --- */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        {/* ĐÃ XÓA: Route /register-group */}
        
        {/* Các trang dùng GenericPage tạm thời */}
        <Route path="/my-sessions" element={<GenericPage role="student" title="Buổi học của tôi" />} />
        <Route path="/register-session" element={<GenericPage role="student" title="Đăng ký buổi học" />} />

        {/* --- TUTOR ROUTES --- */}
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/manage-sessions" element={<GenericPage role="tutor" title="Quản lý buổi học" />} />
        <Route path="/register-teaching" element={<GenericPage role="tutor" title="Đăng ký dạy" />} />
        <Route path="/accept-group" element={<GenericPage role="tutor" title="Nhận nhóm" />} />

        {/* --- ADMIN ROUTES (P.CTSV) --- */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/tutor-reviews" element={<TutorReviews />} />
        <Route path="/participation-results" element={<ParticipationResults />} />

        {/* --- FALLBACK (Trang lỗi) --- */}
        <Route path="*" element={<LoginLanding />} />
      </Routes>
    </Router>
  );
}

export default App;