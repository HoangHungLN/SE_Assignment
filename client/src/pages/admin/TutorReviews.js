import React, { useState, useEffect } from 'react';
import axios from 'axios';
// SỬA ĐƯỜNG DẪN IMPORT Ở ĐÂY:
import MainLayout from '../../components/MainLayout'; // Lên 2 cấp thay vì 3
import './Admin.css'; // File CSS nằm ngay bên cạnh, dùng ./

const TutorReviews = () => {
    // ... (Phần logic code bên trong giữ nguyên y hệt như tin nhắn trước)
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const response = await axios.get('http://localhost:5000/api/learning/evaluate/search', {
                    headers: { 'Authorization': user.token },
                    params: { tutor: 'Any' }
                });
                if(response.data.success) setReviews(response.data.data);
            } catch (err) {
                console.error("Lỗi:", err);
            }
        };
        fetchData();
    }, []);

    return (
        <MainLayout role="admin">
            {/* ... (Phần giao diện giữ nguyên y hệt) ... */}
             <div className="admin-page-container">
                <div className="filter-sidebar">
                    <div className="filter-title">Tìm kiếm</div>
                    <div className="filter-group">
                        <label>Môn học</label>
                        <select className="filter-select"><option>Any</option></select>
                    </div>
                    <div className="filter-group">
                        <label>Tutor</label>
                        <input type="text" className="filter-input" placeholder="Nhập tên..." />
                    </div>
                    <button className="btn-search">Tìm kiếm</button>
                    <button className="btn-reset">Đặt lại</button>
                </div>

                <div className="main-content">
                    <div className="content-header">
                        <span>Danh sách đánh giá</span>
                        <span style={{color: 'red', fontSize: '12px'}}>Tuần 43</span>
                    </div>

                    {reviews.map((item) => (
                        <div className="review-card" key={item.id}>
                            <div className="tutor-header">
                                <div className="tutor-avatar">👤</div>
                                <div>
                                    <div className="tutor-name">{item.tutorName}</div>
                                    <div style={{fontSize: '12px', color: '#666'}}>Số buổi đã dạy: {item.sessionsCount}</div>
                                </div>
                            </div>
                            <div className="stats-grid">
                                <div><div className="stat-label">Buổi học</div>{item.subject}<br/>{item.status}</div>
                                <div><div className="stat-label">Ngày</div>{item.date}</div>
                                <div><div className="stat-label">Tiết</div>{item.time}</div>
                                <div><div className="stat-label">SV có mặt</div>{item.attendance}</div>
                                <div><div className="stat-label">Link</div>
                                    <span className="link-detail" onClick={() => setSelectedReview(item)}>Xem chi tiết</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedReview && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">{selectedReview.subject}</div>
                        <table className="data-table">
                            <thead>
                                <tr><th>STT</th><th>Họ và tên</th><th>MSSV</th><th>Đánh giá thêm</th></tr>
                            </thead>
                            <tbody>
                                {selectedReview.details.map(d => (
                                    <tr key={d.stt}>
                                        <td>{d.stt}</td><td>{d.name}</td><td>{d.mssv}</td>
                                        <td style={{textAlign: 'left'}}>{d.comment}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{textAlign: 'right', marginTop: '20px'}}>
                            <button className="btn-search" style={{width: '100px'}} onClick={() => setSelectedReview(null)}>Xong</button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default TutorReviews;