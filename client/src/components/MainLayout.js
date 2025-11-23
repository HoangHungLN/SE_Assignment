import React from 'react';
import Navbar from './Navbar';
import '../App.css';
import bgImage from '../assets/bg_hcmut.jpg'; 

// Thêm prop showBackground (mặc định là false)
const MainLayout = ({ role, children, showBackground = false }) => {
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };

    return (
        <div className="main-layout">
            <Navbar role={role} userName={user.name} />
            
            <div 
                className="content-body" 
                style={{
                    // Logic: Nếu showBackground=true thì lấy ảnh, ngược lại lấy màu nền xám nhạt
                    backgroundImage: showBackground ? `url(${bgImage})` : 'none',
                    backgroundColor: showBackground ? 'transparent' : '#f0f2f5' 
                }}
            >
                {/* Chỉ hiện Hướng dẫn & Thông báo khi ở trang Dashboard chính (có ảnh nền) */}
                {showBackground && (
                    <>
                        <div className="guide-box">
                            <h3>Hướng dẫn sử dụng<br/>(User guide)</h3>
                            <span style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold'}}>
                                Xem (View)
                            </span>
                        </div>

                        <div className="notice-box">
                            <div className="notice-header">Thông báo:</div>
                            <div className="notice-content">
                                Hệ thống sẽ bảo trì vào lúc 23:00 ngày 2/11 - 5:00 ngày 3/11. 
                                Quý thầy cô và các bạn sinh viên chú sắp xếp.<br/><br/>
                                Trân trọng.
                            </div>
                        </div>
                    </>
                )}

                {children}
            </div>
        </div>
    );
};

export default MainLayout;