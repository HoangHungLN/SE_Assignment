import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TutorMySession.css';

const TutorMySession = () => {
    const navigate = useNavigate();
    const tutorId = localStorage.getItem('userId') || 'GV001';
    
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
        navigate('/class-details', { state: { class: classItem } });
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
        return <div className="tutor-my-session loading">Đang tải...</div>;
    }

    const lastUpdateTime = new Date().toLocaleString('vi-VN');
    const classCount = classes.length;
    const currentWeek = 43;

    return (
        <div className="tutor-my-session">
            <div className="tutor-session-container">
                {/* Sidebar */}
                <aside className="tutor-sidebar">
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
                                <option value="">Any</option>
                                {subjectsList.map(subject => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-search" onClick={fetchClasses}>Tìm kiếm</button>
                        <button className="btn-reset" onClick={handleResetFilters}>Đặt lại</button>
                    </div>
                </aside>

                {/* Main Content */}
                <section className="tutor-session-list-panel">
                    {/* Header */}
                    <div className="tutor-session-header">
                        <h2>Danh sách buổi dạy</h2>
                        <div className="tutor-session-controls">
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
                    <div className="tutor-classes-grid">
                        {classes.length > 0 ? (
                            classes.map(classItem => (
                                <div key={classItem.id} className="tutor-class-card">
                                    <div className="tutor-class-header">
                                        <h3 className="tutor-class-title">
                                            {classItem.className} ({classItem.classCode})
                                        </h3>
                                        <p className="tutor-class-date">
                                            {new Date(classItem.date).toLocaleDateString('vi-VN')} {classItem.time}
                                        </p>
                                    </div>

                                    <div className="tutor-class-content">
                                        <div className="tutor-class-info-group">
                                            <span className="tutor-class-label">Nội dung:</span>
                                            <p className="tutor-class-description">{classItem.description}</p>
                                        </div>

                                        <div className="tutor-class-info-row">
                                            <span className="tutor-class-label">Hình thức:</span>
                                            <p className="tutor-class-value">{classItem.format}</p>
                                        </div>

                                        <div className="tutor-class-info-row">
                                            <span className="tutor-class-label">Địa điểm:</span>
                                            <p className="tutor-class-value">{classItem.location}</p>
                                        </div>

                                        <div className="tutor-class-info-row">
                                            <span className="tutor-class-label">Link học online:</span>
                                            <p className="tutor-class-value">
                                                {classItem.onlineLink ? classItem.onlineLink : 'Không có'}
                                            </p>
                                        </div>

                                        <div className="tutor-class-info-row">
                                            <span className="tutor-class-label">Thời gian:</span>
                                            <p className="tutor-class-value">
                                                {new Date(classItem.date).toLocaleDateString('vi-VN')} từ {classItem.time}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="tutor-class-footer">
                                        <button 
                                            className="btn-detail"
                                            onClick={() => handleViewDetail(classItem)}
                                        >
                                            Chi tiết
                                        </button>
                                        <span className="tutor-class-status">{classItem.status}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">Không có buổi dạy nào</div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="tutor-pagination">
                            <button 
                                className="tutor-pagination-btn"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            <span className="tutor-pagination-info">
                                {currentPage} / {totalPages}
                            </span>
                            <button 
                                className="tutor-pagination-btn"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="tutor-session-footer">
                        <span className="tutor-footer-info">Số lượng nhóm: {classCount}</span>
                        <span className="tutor-footer-info">Cập nhật lần cuối: {lastUpdateTime}</span>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TutorMySession;
