// client/src/pages/auth/SSOSimulation.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SSOSimulation.css';
import bkLogo from '../../assets/Logo.png';

const SSOSimulation = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/sso-callback', {
                username,
                password
            });

            if (response.data.success) {
                const userData = response.data.user;
    
                // Lưu thông tin
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('studentId', userData.id);
                localStorage.setItem('userId', userData.id);
                localStorage.setItem('userRole', userData.role);
                
                // --- PHÂN QUYỀN ĐIỀU HƯỚNG ---
                // Kiểm tra role trả về từ Server (khớp với file dataBase/users.js)
                switch(userData.role) {
                    case 'student':
                        navigate('/student-dashboard');
                        break;
                    case 'tutor':
                        navigate('/tutor-dashboard');
                        break;
                    case 'admin':
                        navigate('/admin-dashboard');
                        break;
                    default:
                        // Trường hợp role lạ hoặc chưa quy định
                        alert("Vai trò không hợp lệ!");
                        navigate('/'); 
                }
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError('Không thể kết nối đến server SSO');
            }
        }
    };

    return (
        <div className="sso-page">
            <header className="sso-header">
                <div className="sso-logo-box">
                    <img src={bkLogo} alt="BK Logo" className="sso-logo" />
                </div>
                <h1>Central Authentication Service</h1>
            </header>

            <div className="sso-body">
                <div className="sso-container">
                    
                    <div className="sso-left-col">
                        <h2 className="sso-title">Enter your Username and Password</h2>
                        
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label>Username</label>
                                <input 
                                    type="text" 
                                    className="sso-input"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Password</label>
                                <input 
                                    type="password" 
                                    className="sso-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="checkbox-group">
                                <input type="checkbox" id="warn" />
                                <label htmlFor="warn" style={{fontWeight: 'normal', color: '#666'}}>
                                    Warn me before logging me into other sites.
                                </label>
                            </div>

                            {error && <p style={{color: 'red', fontSize: '12px', marginBottom: '10px'}}>{error}</p>}

                            <div className="sso-btn-group">
                                <button type="submit" className="sso-btn">Login</button>
                                <button type="button" className="sso-btn" onClick={() => {setUsername(''); setPassword('')}}>Clear</button>
                            </div>

                            <div className="sso-link">Change password?</div>
                        </form>
                    </div>

                    <div className="sso-right-col">
                        <div className="info-title">Languages</div>
                        {/* --- ĐÃ SỬA ĐOẠN NÀY --- */}
                        <div>
                            <button className="mock-link" style={{color: 'blue'}}>Vietnamese</button> | <button className="mock-link" style={{color: 'blue'}}>English</button>
                        </div>
                        {/* ----------------------- */}

                        <div className="info-title">Please note</div>
                        <p>
                            The Login page enables single sign-on to multiple websites at HCMUT. 
                            This means that you only have to enter your user name and password 
                            once for websites that subscribe to the Login page.
                        </p>
                        <p>
                            You will need to use your HCMUT Username and password to login to this site. 
                            The "HCMUT" account provides access to many resources including the 
                            HCMUT Information System, e-mail, ...
                        </p>
                        <p>
                            For security reasons, please Exit your web browser when you are done 
                            accessing services that require authentication!
                        </p>

                        <div className="info-title">Technical support</div>
                        <div>
                            {/* Link mailto là hợp lệ nên giữ nguyên thẻ a được, nhưng đổi style cho đẹp */}
                            E-mail: <a href="mailto:support@hcmut.edu.vn" style={{color: 'blue', textDecoration: 'underline'}}>support@hcmut.edu.vn</a>
                            <span style={{marginLeft: '15px'}}>Tel: (84-8) 3864xxxx - xxxx</span>
                        </div>
                    </div>
                </div>

                <footer className="sso-footer">
                    <div>Copyright © 2011 - 2012 Ho Chi Minh University of Technology. All rights reserved.</div>
                    {/* --- ĐÃ SỬA ĐOẠN NÀY --- */}
                    <div>Powered by <button className="mock-link" style={{color: '#800080'}}>Jasig CAS 3.5.1</button></div>
                    {/* ----------------------- */}
                </footer>
            </div>
        </div>
    );
};

export default SSOSimulation;