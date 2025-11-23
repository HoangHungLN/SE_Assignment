// client/src/pages/auth/login.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import bkLogo from '../../assets/Logo.png'; 

// IMPORT COMPONENT VỪA TẠO
import Button from '../../components/button'; 

const LoginLanding = () => {
    const navigate = useNavigate();

    const handleHCMUTLogin = () => {
        navigate('/sso-simulation');
    };

    return (
        <div className="landing-page">
            <header className="top-header">
                <div className="header-left">
                    <div className="home-tab">
                        <img src={bkLogo} alt="Small Logo" className="small-logo"/>
                        <span>Trang chủ</span>
                    </div>
                </div>
                <div className="header-right">
                    <span className="login-text">Đăng nhập</span>
                </div>
            </header>

            <main className="landing-content">
                <div className="login-card">
                    <div className="logo-container">
                         <img src={bkLogo} alt="BK Logo" className="big-logo" />
                    </div>

                    <h2 className="login-title">
                        Đăng nhập hệ thống bằng tài khoản của bạn
                    </h2>

                    {/* --- SỬ DỤNG COMPONENT BUTTON --- */}
                    
                    {/* Nút 1: Tài khoản HCMUT */}
                    <Button 
                        label="Tài khoản HCMUT"
                        className="btn-hcmut" 
                        icon={bkLogo}
                        onClick={handleHCMUTLogin}
                    />

                    {/* Nút 2: Quản trị viên */}
                    <Button 
                        label="Quản trị viên"
                        className="btn-admin"
                        // Nút này chưa có chức năng, có thể để trống onClick
                        onClick={handleHCMUTLogin}
                    />

                </div>
            </main>
        </div>
    );
};

export default LoginLanding;