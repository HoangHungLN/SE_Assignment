// client/src/components/Navbar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import bkLogo from '../assets/Logo.png';

const Navbar = ({ role, userName }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [showDropdown, setShowDropdown] = useState(false);

    const getMenu = () => {
        switch(role) {
            case 'student':
                return [
                    { name: 'Trang chủ', path: '/student-dashboard' },
                    { name: 'Buổi học của tôi', path: '/my-sessions' },
                    { name: 'Đăng ký nhóm', path: '/register-group' },
                    { name: 'Tham gia buổi học', path: '/join-session'}
                ];
            case 'tutor':
                return [
                    { name: 'Trang chủ', path: '/tutor-dashboard' },
                    { name: 'Quản lý buổi dạy', path: '/manage-sessions' },
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

    const handleLogout = (e) => {
        e.stopPropagation();
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="dashboard-navbar">
            <div className="nav-left">
                <img src={bkLogo} alt="Logo" className="nav-logo" />
                
                <div className="nav-links">
                    {menuItems.map((item, index) => (
                        <div 
                            key={index} 
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
                
                <div 
                    className="user-avatar-container" 
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className="avatar-circle">👤</div>
                    
                    {showDropdown && (
                        <div className="avatar-dropdown">
                            <div className="dropdown-info">
                                <span className="dropdown-name">{userName || 'Người dùng'}</span>
                                <span className="dropdown-role">({role})</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                🚪 Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;