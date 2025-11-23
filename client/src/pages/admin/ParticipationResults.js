import React, { useState, useEffect } from 'react';
import axios from 'axios';
// SỬA ĐƯỜNG DẪN IMPORT:
import MainLayout from '../../components/MainLayout';
import './Admin.css';

const ParticipationResults = () => {
    // ... (Code logic giữ nguyên)
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const response = await axios.get('http://localhost:5000/api/learning/evaluate/progress', {
                    headers: { 'Authorization': user.token }
                });
                if(response.data.success) setStudents(response.data.data);
            } catch (err) {
                console.error(err);
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
                        <label>Khoa</label>
                        <select className="filter-select"><option>Any</option></select>
                    </div>
                    <button className="btn-search">Tìm kiếm</button>
                    <button className="btn-reset">Đặt lại</button>
                </div>

                <div className="main-content">
                    <div className="content-header">
                        <span>Danh sách tham gia</span>
                        <span style={{fontSize: '12px'}}>Sắp xếp theo: Tên (A-Z)</span>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>STT</th><th>Họ và tên</th><th>MSSV</th>
                                <th>Số buổi đăng ký</th><th>Số buổi có mặt</th><th>Tỷ lệ (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.stt}>
                                    <td>{s.stt}</td>
                                    <td style={{textAlign: 'left'}}>{s.name}</td>
                                    <td>{s.mssv}</td>
                                    <td>{s.registered}</td>
                                    <td>{s.attended}</td>
                                    <td>{s.percent}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default ParticipationResults;