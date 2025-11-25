import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageSessions.css';
import Navbar from '../../components/Navbar';

const ManageSessions = () => {
    const navigate = useNavigate();
    const tutorId = localStorage.getItem('userId') || 'GV001';
    const userRole = localStorage.getItem('userRole') || 'tutor';
    const userName = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Giảng viên';
    
    const [classes, setClasses] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        subject: ''
    });
    
    const [subjectsList, setSubjectsList] = useState([]);

    // Tải danh sách classes và subjects
    useEffect(() => {
        const loadData = async () => {
            try {
                const subjectsRes = await axios.get(
                    `http://localhost:5000/api/sessions/tutor-subjects/${tutorId}`
                );
                setSubjectsList(subjectsRes.data.data || []);
            } catch (err) {
                console.error('Lỗi khi tải danh sách môn học:', err);
                setSubjectsList([]);
            }
        };
        loadData();
    }, [tutorId]);

    // Tải danh sách classes
    useEffect(() => {
        fetchClasses();
    }, [currentPage, filters, tutorId]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            
            const params = new URLSearchParams({
                page: currentPage,
                limit: 6,
                ...(filters.subject && { subject: filters.subject })
            });
            
            const response = await axios.get(
                `http://localhost:5000/api/sessions/tutor-classes/${tutorId}?${params}`
            );
            
            setClasses(response.data.data || []);
            setPagination(response.data.pagination);
            if (response.data.pagination) {
                setTotalPages(response.data.pagination.totalPages);
            }
            setError(null);
        } catch (err) {
            console.error('Lỗi khi tải danh sách lớp:', err);
            setError('Không thể tải danh sách lớp học. Vui lòng kiểm tra kết nối server.');
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setFilters({
            subject: ''
        });
        setCurrentPage(1);
    };

    const handleViewDetail = (classItem) => {
        navigate('/tutor-session-details', { state: { class: classItem } });
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    if (loading) {
        return <div className="manage-sessions loading">Đang tải...</div>;
    }

    const lastUpdateTime = new Date().toLocaleString('vi-VN');
    const classCount = classes.length;
    const currentWeek = 43;

    return (
        <>
            <Navbar role={userRole} userName={userName} />
            <div className="manage-sessions">
                <div className="sessions-container">
                    {/* Sidebar */}
                    <aside className="sidebar">
                        <div className="search-section">
                            <label htmlFor="subject-search">Tìm kiếm</label>
                            <div className="search-group">
                                <label htmlFor="subject-filter" className="filter-label">Môn học</label>
                                <select
                                    id="subject-filter"
                                    className="filter-select"
                                    value={filters.subject}
                                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    {subjectsList.map(subject => (
                                        <option key={subject.name} value={subject.name}>
                                            {subject.name} ({subject.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn-search" onClick={fetchClasses}>Tìm kiếm</button>
                            <button className="btn-reset" onClick={handleResetFilters}>Đặt lại</button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="sessions-list-panel">
                        {/* Header */}
                        <div className="sessions-header">
                            <h2>Danh sách buổi dạy</h2>
                            <div className="sessions-controls">
                                <span className="week-tag">Tuần {currentWeek}</span>
                                <div className="control-group">
                                    <label htmlFor="sort-by">Sắp kế theo:</label>
                                    <select id="sort-by" className="sort-select">
                                        <option>Thứ tự dạy</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        {/* Classes Grid */}
                        <div className="classes-grid">
                            {classes.length > 0 ? (
                                classes.map(classItem => (
                                    <div key={classItem.id} className="class-card">
                                        <div className="class-header">
                                            <h3 className="class-title">
                                                {classItem.className} ({classItem.classCode})
                                            </h3>
                                            <p className="class-date">
                                                {new Date(classItem.date).toLocaleDateString('vi-VN')} {classItem.time}
                                            </p>
                                        </div>

                                        <div className="class-content">
                                            <div className="class-info-group">
                                                <span className="class-label">Nội dung:</span>
                                                <p className="class-description">{classItem.description}</p>
                                            </div>

                                            <div className="class-info-row">
                                                <span className="class-label">Hình thức:</span>
                                                <p className="class-value">{classItem.format}</p>
                                            </div>

                                            <div className="class-info-row">
                                                <span className="class-label">Địa điểm:</span>
                                                <p className="class-value">{classItem.location}</p>
                                            </div>

                                            <div className="class-info-row">
                                                <span className="class-label">Link học online:</span>
                                                <p className="class-value">
                                                    {classItem.onlineLink ? classItem.onlineLink : 'Không có'}
                                                </p>
                                            </div>

                                            <div className="class-info-row">
                                                <span className="class-label">Thời gian:</span>
                                                <p className="class-value">
                                                    {new Date(classItem.date).toLocaleDateString('vi-VN')} từ {classItem.time}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="class-footer">
                                            <button 
                                                className="btn-detail"
                                                onClick={() => handleViewDetail(classItem)}
                                            >
                                                Chi tiết
                                            </button>
                                            <span className="class-status">{classItem.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">Không có buổi dạy nào</div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button 
                                    className="pagination-btn"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                >
                                    &lt;
                                </button>
                                <span className="pagination-info">
                                    {currentPage} / {totalPages}
                                </span>
                                <button 
                                    className="pagination-btn"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    &gt;
                                </button>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="sessions-footer">
                            <span className="footer-info">Số lượng nhóm: {classCount}</span>
                            <span className="footer-info">Cập nhật lần cuối: {lastUpdateTime}</span>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default ManageSessions;
