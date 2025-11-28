// client/src/pages/admin/ParticipationResults.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../components/MainLayout';
import './Admin.css';

const ParticipationResults = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const lastUpdate = "06-10-2025 16:05";
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/learning/evaluate/progress');
            if(response.data.success) {
                setStudents(response.data.data);
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <MainLayout role="admin">
             <div className="admin-page-container">
                <div className="filter-sidebar">
                    <div className="filter-title">Tìm kiếm</div>
                    <div className="filter-group">
                        <label>Khoa</label>
                        <select className="filter-select">
                            <option>Any</option>
                            <option>Khoa học và Kỹ thuật Máy tính</option>
                            <option>Điện - Điện tử</option>
                        </select>
                    </div>
                    <button className="btn-search" onClick={fetchData}>Tìm kiếm</button>
                    <button className="btn-reset">Đặt lại</button>
                </div>

                <div className="main-content">
                    <div className="content-header">
                        <div className="header-left">Danh sách</div>
                        <div className="header-right">
                            <span className="week-highlight">Tuần 43</span>
                            <span>Sắp xếp theo:</span>
                            <select className="sort-select">
                                <option>Tên (A-Z)</option>
                                <option>% Tăng</option>
                                <option>% Giảm</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{width: '50px'}}>STT</th>
                                    <th style={{textAlign: 'left'}}>Họ và tên</th>
                                    <th>MSSV</th>
                                    <th>Số buổi đăng ký<br/><span style={{fontWeight:'normal', fontSize:'11px'}}>(đã diễn ra, có điểm danh)</span></th>
                                    <th>Số buổi có mặt</th>
                                    <th>Tỷ lệ phần trăm (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{padding: '20px'}}>Đang tải dữ liệu...</td></tr>
                                ) : (
                                    students.map(s => (
                                        <tr key={s.stt}>
                                            <td>{s.stt}</td>
                                            <td style={{textAlign: 'left', fontWeight: '500'}}>{s.name}</td>
                                            <td>{s.mssv}</td>
                                            <td>{s.registered}</td>
                                            <td>{s.attended}</td>
                                            <td>{s.percent}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="content-footer">
                        <div>Cập nhật lần cuối: {lastUpdate}</div>
                        <div className="pagination-controls">
                            <button className="btn-page-nav">‹</button>
                            <span> 1 / 1 </span>
                            <button className="btn-page-nav">›</button>
                        </div>
                        <div className="refresh-link" onClick={fetchData}>Làm mới</div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ParticipationResults;