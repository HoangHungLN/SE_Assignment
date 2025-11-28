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

// --- 4. Student Features ---
import GroupRegister from './pages/student/groupRegister';
import MySession from './pages/student/MySession';
import SessionDetails from './pages/student/SessionDetails';
import JoinSession from './pages/student/JoinSession';

// --- 5. Tutor Features ---
import ManageSessions from './pages/tutor/ManageSessions';
import TutorSessionDetails from './pages/tutor/TutorSessionDetails';
import RegisterTeaching from './pages/tutor/RegisterTeaching';
import AcceptRegister from './pages/tutor/AcceptRegister';

// --- 6. Other Features ---
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
        <Route path="/my-sessions" element={<MySession />} />
        <Route path="/session-details" element={<SessionDetails />} />
        <Route path="join-session" element={<JoinSession />} />
        <Route path="/register-session" element={<GenericPage role="student" title="Đăng ký buổi học" />} />
        <Route path="/register-group" element={<GroupRegister role="student" title="Đăng ký nhóm" />} />

        {/* --- TUTOR ROUTES --- */}
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/manage-sessions" element={<ManageSessions />} />
        <Route path="/tutor-session-details" element={<TutorSessionDetails />} />
        <Route path="/register-teaching" element={<RegisterTeaching />} />
        <Route path="/accept-group" element={<AcceptRegister />} />

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