import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../components/MainLayout';
import './Admin.css';

const TutorReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/learning/evaluate/search');
                if(response.data.success) {
                    setReviews(response.data.data);
                }
            } catch (err) {
                console.error("Lỗi:", err);
            }
        };
        fetchData();
    }, []);

    return (
        <MainLayout role="admin">
             <div className="admin-page-container">
                <div className="filter-sidebar">
                    <div className="filter-title">Tìm kiếm</div>
                    <div className="filter-group">
                        <label>Môn học</label>
                        <select className="filter-select"><option>Any</option></select>
                    </div>
                    <button className="btn-search">Tìm kiếm</button>
                </div>

                <div className="main-content">
                    <div className="content-header">
                        <span className="header-title">Danh sách đánh giá</span>
                        <span className="header-note">Tuần 43</span>
                    </div>

                    {reviews.map((item) => (
                        <div className="review-card" key={item.id}>
                            <div className="tutor-header">
                                <div className="tutor-avatar">👤</div>
                                <div>
                                    <div className="tutor-name">{item.tutorName}</div>
                                    <div className="tutor-sub">Số buổi đã dạy: 12</div>
                                </div>
                            </div>
                            <div className="stats-grid">
                                <div className="stat-item"><strong>Buổi học</strong>{item.subject}</div>
                                <div className="stat-item"><strong>Ngày</strong>{item.date}</div>
                                <div className="stat-item"><strong>Trạng thái</strong>{item.status}</div>
                                <div className="stat-item"><strong>Đánh giá</strong>
                                    <span className="link-detail" onClick={() => setSelectedReview(item)}>Xem chi tiết</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedReview && (
                <div className="modal-overlay" onClick={() => setSelectedReview(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">{selectedReview.subject} - Chi tiết đánh giá</div>
                        
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{width: '50px'}}>STT</th>
                                        <th style={{textAlign: 'left'}}>Họ và tên</th>
                                        <th>MSSV</th>
                                        <th style={{textAlign: 'center'}}>Đạt</th>
                                        <th style={{textAlign: 'left'}}>Đánh giá thêm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedReview.details.map(d => (
                                        <tr key={d.stt}>
                                            <td>{d.stt}</td>
                                            <td style={{textAlign: 'left', fontWeight: '500'}}>{d.name}</td>
                                            <td>{d.mssv}</td>
                                            <td style={{textAlign: 'center'}}>
                                                <input type="checkbox" checked={d.passed} readOnly style={{width: '16px', height: '16px'}} />
                                            </td>
                                            <td style={{textAlign: 'left'}}>{d.comment}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-search" style={{width: '100px'}} onClick={() => setSelectedReview(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default TutorReviews;