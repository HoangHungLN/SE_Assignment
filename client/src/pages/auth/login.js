// client/src/pages/auth/login.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import bkLogo from '../../assets/Logo.png'; 

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
                    
                    <Button 
                        label="Tài khoản HCMUT"
                        className="btn-hcmut" 
                        icon={bkLogo}
                        onClick={handleHCMUTLogin}
                    />

                    <Button 
                        label="Quản trị viên"
                        className="btn-admin"
                        onClick={handleHCMUTLogin}
                    />

                </div>
            </main>
        </div>
    );
};

export default LoginLanding;