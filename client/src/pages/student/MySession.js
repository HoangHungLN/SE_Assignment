import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import './MySession.css';
import axios from 'axios';

function MySession() {
    const navigate = useNavigate();
    // State cho danh sách buổi học
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState(null);
    
    // State cho lọc và sắp xếp
    const [filters, setFilters] = useState({
        subject: '',
        sortBy: 'date'
    });
    
    // State cho dropdown lọc
    const [tutorsList, setTutorsList] = useState([]);
    const [subjectsList, setSubjectsList] = useState([]);
    const [loadingFilters, setLoadingFilters] = useState(false);
    
    // State cho chi tiết buổi
    const [selectedSession, setSelectedSession] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    
    // Lấy studentId từ localStorage (hỗ trợ nhiều key do tên không đồng nhất)
    const studentId =
        localStorage.getItem('studentId') ||
        localStorage.getItem('userId') ||
        localStorage.getItem('userID') ||
        '2311327';
    
    // Get current timestamp
    const getCurrentTimestamp = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    // Tải danh sách tutors và subjects
    useEffect(() => {
        fetchFiltersData();
    }, []);

    // Tải danh sách buổi học khi filter hoặc page thay đổi
    useEffect(() => {
        fetchSessions();
    }, [currentPage, filters]);

    const fetchFiltersData = async () => {
        try {
            setLoadingFilters(true);
            const [tutorsRes, subjectsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/sessions/tutors/${studentId}`),
                axios.get(`http://localhost:5000/api/sessions/subjects/${studentId}`)
            ]);
            
            setTutorsList(tutorsRes.data.data || []);
            setSubjectsList(subjectsRes.data.data || []);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu lọc:', err);
            setTutorsList([]);
            setSubjectsList([]);
        } finally {
            setLoadingFilters(false);
        }
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            
            // Xây dựng query params
            const params = new URLSearchParams({
                page: currentPage,
                limit: 6,
                sortBy: filters.sortBy,
                ...(filters.subject && { subject: filters.subject })
            });
            
            const response = await axios.get(
                `http://localhost:5000/api/sessions/my-sessions/${studentId}?${params}`
            );
            
            setSessions(response.data.data || []);
            setPagination(response.data.pagination);
            if (response.data.pagination) {
                setTotalPages(response.data.pagination.totalPages);
            }
            setError(null);
        } catch (err) {
            console.error('Lỗi khi tải buổi học:', err);
            setError('Không thể tải danh sách buổi học. Vui lòng kiểm tra kết nối server.');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thay đổi filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
        // Trigger lại fetchSessions bằng cách cập nhật state
    };

    // Reset filter
    const handleResetFilters = () => {
        setFilters({
            subject: '',
            sortBy: 'date'
        });
        setCurrentPage(1);
    };

    // Xử lý xem chi tiết
    const handleViewDetail = (session) => {
        navigate('/session-details', { state: { session } });
    };

    const handleCloseDetail = () => {
        setShowDetail(false);
        setSelectedSession(null);
    };

    // Xử lý chuyển trang
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Render pagination
    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        
        return pages.map(page => (
            <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
            >
                {page}
            </button>
        ));
    };

    return (
        <MainLayout role="student">
            <div className="my-session-main-layout">
                {/* Sidebar - Tìm kiếm & Lọc */}
                <div className="session-sidebar">
                    <div className="search-section">
                        <h3>Tìm kiếm</h3>
                        <div className="search-group">
                            <label htmlFor="subject-filter" className="filter-label">Môn học</label>
                            <select
                                id="subject-filter"
                                className="filter-select"
                                value={filters.subject}
                                onChange={(e) => handleFilterChange('subject', e.target.value)}
                                disabled={loadingFilters}
                            >
                                <option value="">Tất cả</option>
                                {subjectsList.map((subject, idx) => (
                                    <option key={idx} value={subject.name}>
                                        {subject.name} ({subject.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button 
                            className="btn-search"
                            onClick={fetchSessions}
                        >
                            Tìm kiếm
                        </button>
                        <button 
                            className="btn-reset"
                            onClick={handleResetFilters}
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>

                {/* Main Content - Danh sách buổi học */}
                <div className="session-list-panel">
                    {/* Header */}
                    <div className="session-list-header">
                        <div>
                            <h2>Danh sách buổi học</h2>
                        </div>
                        <div className="session-list-controls">
                            <span className="week-label">Tuần 43</span>
                            <span className="sort-label">Sắp xếp theo:</span>
                            <select 
                                className="sort-select"
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                <option value="date">Thứ tự dạy</option>
                                <option value="subject">Tên môn học</option>
                                <option value="tutor">Tên tutor</option>
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="session-list-content">
                        {loading ? (
                            <div className="loading-spinner">
                                <p>Đang tải danh sách buổi học...</p>
                            </div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : sessions.length === 0 ? (
                            <div className="no-data">
                                <p>Không có buổi học nào phù hợp với điều kiện tìm kiếm</p>
                            </div>
                        ) : (
                            <div className="session-cards-row">
                                {sessions.map((session) => (
                                    <div key={session.id} className="session-card-v2">
                                        <div className="session-card-title-row">
                                            <span className="session-title">{session.subject}</span>
                                            <span className="session-date">
                                                {new Date(session.date).toLocaleDateString('vi-VN', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="session-card-body-v2">
                                            <div className="session-content-row">
                                                <span className="session-label">Nội dung:</span>
                                                <span className="session-value">
                                                    {session.description || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="session-content-row">
                                                <span className="session-label">Tutor:</span>
                                                <span className="session-value">{session.tutor}</span>
                                            </div>
                                            <div className="session-content-row">
                                                <span className="session-label">Thời gian:</span>
                                                <span className="session-value">{session.time}</span>
                                            </div>
                                            {session.room && (
                                                <div className="session-content-row">
                                                    <span className="session-label">Địa điểm:</span>
                                                    <span className="session-value">{session.room}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="session-card-footer-v2">
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => handleViewDetail(session)}
                                            >
                                                Chi tiết
                                            </button>
                                            <span className={`session-status-v2 ${session.status === 'Đã diễn ra' ? 'status-completed' : ''}`}>{session.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination & Footer */}
                    <div className="session-list-bottom">
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <button
                                    className="pagination-nav-btn"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    ← Trước
                                </button>
                                <div className="pagination-buttons">
                                    {renderPagination()}
                                </div>
                                <button
                                    className="pagination-nav-btn"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Tiếp →
                                </button>
                            </div>
                        )}

                        {/* Info & Actions */}
                        <div className="footer-info">
                            <span>Số lượng nhóm: {pagination?.total || 0}</span>
                            <span className="last-update">Cập nhật lần cuối: {getCurrentTimestamp()}</span>
                            <button 
                                className="refresh-btn"
                                onClick={() => {
                                    setCurrentPage(1);
                                    fetchSessions();
                                }}
                            >
                                Làm mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal chi tiết buổi học */}
            {showDetail && selectedSession && (
                <div className="session-detail-modal" onClick={handleCloseDetail}>
                    <div className="session-detail-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={handleCloseDetail}>✕</button>
                        <h2>Chi tiết buổi học</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Môn học:</label>
                                <span>{selectedSession.subject}</span>
                            </div>
                            <div className="detail-item">
                                <label>Tutor:</label>
                                <span>{selectedSession.tutor}</span>
                            </div>
                            <div className="detail-item">
                                <label>Ngày:</label>
                                <span>{selectedSession.date}</span>
                            </div>
                            <div className="detail-item">
                                <label>Thời gian:</label>
                                <span>{selectedSession.time}</span>
                            </div>
                            <div className="detail-item">
                                <label>Địa điểm:</label>
                                <span>{selectedSession.room || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Trạng thái:</label>
                                <span>{selectedSession.status}</span>
                            </div>
                            <div className="detail-item full-width">
                                <label>Nội dung:</label>
                                <span>{selectedSession.description || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="detail-actions">
                            <button className="btn btn-primary">Tham gia</button>
                            <button className="btn btn-secondary" onClick={handleCloseDetail}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default MySession;