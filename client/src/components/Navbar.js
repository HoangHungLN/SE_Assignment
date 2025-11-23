// client/src/components/Navbar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import '../App.css';
import bkLogo from '../assets/Logo.png';

const Navbar = ({ role, userName }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Lấy đường dẫn hiện tại

    const getMenu = () => {
        switch(role) {
            case 'student':
                return [
                    { name: 'Trang chủ', path: '/student-dashboard' },
                    { name: 'Buổi học của tôi', path: '/my-sessions' },
                    { name: 'Đăng ký nhóm', path: '/register-group' },
                    { name: 'Đăng ký buổi học', path: '/register-session' }
                ];
            case 'tutor':
                return [
                    { name: 'Trang chủ', path: '/tutor-dashboard' },
                    { name: 'Quản lý buổi học', path: '/manage-sessions' },
                    { name: 'Đăng ký dạy', path: '/register-teaching' },
                    { name: 'Nhận nhóm', path: '/accept-group' }
                ];
            case 'admin':
                return [
                    { name: 'Trang chủ', path: '/admin-dashboard' },
                    { name: 'Đánh giá của Tutor', path: '/tutor-reviews' },
                    { name: 'Xem kết quả tham gia', path: '/participation-results' }
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenu();

    return (
        <div className="dashboard-navbar">
            <div className="nav-left">
                {/* Logo bỏ onClick để không bấm được */}
                <img src={bkLogo} alt="Logo" className="nav-logo" />
                
                <div className="nav-links">
                    {menuItems.map((item, index) => (
                        <div 
                            key={index} 
                            // Logic Active: Nếu đường dẫn hiện tại khớp với item.path thì thêm class active
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} 
                            onClick={() => navigate(item.path)}
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="nav-right">
                <div className="role-tag">
                    {role === 'student' ? 'Student' : role === 'tutor' ? 'Tutor' : 'P. CTSV'}
                </div>
                <div className="nav-icon">🔔</div>
                <div className="user-avatar" onClick={() => {
                    localStorage.removeItem('user');
                    navigate('/');
                }}>
                    <div className="avatar-circle">👤</div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;