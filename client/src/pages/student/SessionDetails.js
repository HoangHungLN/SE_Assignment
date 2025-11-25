import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import './SessionDetails.css';
import axios from 'axios';

function SessionDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    
    // Feedback state
    const [feedbackData, setFeedbackData] = useState({
        criteria1: false, // Năm bắt được kiến thức
        criteria2: false, // Giảng viên nhiệt tình
        criteria3: false, // Có số vật chất tốt
        additionalComments: ''
    });

    const studentId = localStorage.getItem('studentId') || 'SV001';

    // Lấy session từ location state hoặc fetch từ backend
    useEffect(() => {
        if (location.state && location.state.session) {
            setSession(location.state.session);
            setLoading(false);
        } else {
            // Nếu không có state, có thể fetch từ backend (khi user refresh page)
            // Tạm thời set mock data
            setSessionMock();
        }
    }, [location]);

    const setSessionMock = () => {
        const mockSession = {
            id: 1,
            subject: 'Giải Tích 1',
            tutor: 'Nguyễn Văn A',
            tutorId: 'GV001',
            time: '14:00 - 16:00',
            date: '2025-11-25',
            room: 'B4-101',
            description: 'Giới hạn và tính liên tục của hàm',
            materials: [
                { name: 'Slide bài giảng', url: '/files/giai-tich-1-slide.pdf' },
                { name: 'Bài tập về nhà', url: '/files/giai-tich-1-baitap.pdf' }
            ],
            attendanceRequested: false,
            isAttended: false,
            feedback: null // Will store feedback data after submission
        };
        setSession(mockSession);
        setLoading(false);
    };

    const handleDownload = (material) => {
        // Tạo link download - trong thực tế sẽ download file từ server
        const link = document.createElement('a');
        link.href = material.url;
        link.download = material.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAttendance = async () => {
        try {
            // Call API để cập nhật điểm danh
            const response = await axios.post(
                `http://localhost:5000/api/sessions/attendance/${session.id}`,
                { studentId }
            );
            
            if (response.data.success) {
                setSession(prev => ({
                    ...prev,
                    isAttended: true
                }));
            }
        } catch (err) {
            console.error('Lỗi khi điểm danh:', err);
        }
    };

    const handleCreateFeedback = () => {
        // Load existing feedback if available
        if (session.feedback) {
            setFeedbackData({
                criteria1: session.feedback.criteria1 || false,
                criteria2: session.feedback.criteria2 || false,
                criteria3: session.feedback.criteria3 || false,
                additionalComments: session.feedback.additionalComments || ''
            });
        }
        setShowFeedbackModal(true);
    };

    const handleCloseFeedbackModal = () => {
        setShowFeedbackModal(false);
    };

    const handleFeedbackChange = (field, value) => {
        setFeedbackData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitFeedback = async () => {
        try {
            // Calculate criteria count
            const criteriaCount = [feedbackData.criteria1, feedbackData.criteria2, feedbackData.criteria3]
                .filter(Boolean).length;
            
            const now = new Date();
            const lastUpdate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // Update session with new feedback
            setSession(prev => ({
                ...prev,
                feedback: {
                    ...feedbackData,
                    criteriaCount,
                    lastUpdate
                }
            }));

            setShowFeedbackModal(false);

            // TODO: Call API to save feedback when backend is ready
            // const response = await axios.post(
            //     `http://localhost:5000/api/sessions/feedback/${session.id}`,
            //     {
            //         studentId,
            //         ...feedbackData,
            //         criteriaCount,
            //         lastUpdate
            //     }
            // );
        } catch (err) {
            console.error('Lỗi khi lưu phản hồi:', err);
        }
    };

    const handleGoBack = () => {
        navigate(-1); // Quay lại trang trước
    };

    if (loading) {
        return (
            <MainLayout role="student">
                <div className="session-details-container">
                    <p>Đang tải chi tiết buổi học...</p>
                </div>
            </MainLayout>
        );
    }

    if (!session) {
        return (
            <MainLayout role="student">
                <div className="session-details-container">
                    <p>Không tìm thấy buổi học</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout role="student">
            <div className="session-details-container">
                {/* Header */}
                <div className="session-details-header">
                    <div className="header-content">
                        <h1>{session.subject}</h1>
                        <p className="session-time">
                            Thời gian: {session.date} từ {session.time} ({session.status})
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="session-details-content">
                    {/* Section 1: Tài liệu */}
                    <div className="details-section">
                        <h2>Tài liệu</h2>
                        <div className="materials-list">
                            {session.materials && session.materials.length > 0 ? (
                                session.materials.map((material, idx) => (
                                    <div key={idx} className="material-item">
                                        <span className="material-icon">📄</span>
                                        <span 
                                            className="material-name"
                                            onClick={() => handleDownload(material)}
                                            title="Click để tải về"
                                        >
                                            {material.name}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-materials">Không có tài liệu cho buổi học này</p>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Phản hồi chất lượng buổi học */}
                    <div className="details-section">
                        <h2>Phản hồi chất lượng buổi học</h2>
                        <div className="feedback-section">
                            <p className="feedback-description">
                                Tổng quan: {session.feedback 
                                    ? `${session.feedback.criteriaCount}/3`
                                    : 'Vui lòng tạo phản hồi để xem'}
                            </p>
                            <p className="feedback-last-update">
                                Chỉnh sửa lần cuối: {session.feedback?.lastUpdate || 'chưa chỉnh sửa'}
                            </p>
                            <button
                                className="btn btn-feedback"
                                onClick={handleCreateFeedback}
                                disabled={session.status === 'Sắp diễn ra'}
                                title={session.status === 'Sắp diễn ra' ? 'Chỉ có thể tạo phản hồi sau khi buổi học diễn ra' : 'Tạo phản hồi'}
                            >
                                Tạo phản hồi
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Điểm danh sinh viên */}
                    <div className="details-section">
                        <h2>Điểm danh sinh viên</h2>
                        <div className="attendance-section">
                            <p className="attendance-description">
                                Sinh viên nhấn nút điểm danh sau khi có yêu cầu từ giảng viên
                            </p>
                            <div className="attendance-status">
                                <span className="status-label">
                                    Trạng thái: {session.isAttended ? 'đã điểm danh' : 'chưa điểm danh'}
                                </span>
                            </div>
                            <button
                                className={`btn btn-attendance ${!session.attendanceRequested ? 'disabled' : ''}`}
                                onClick={handleAttendance}
                                disabled={!session.attendanceRequested || session.isAttended}
                                title={
                                    !session.attendanceRequested
                                        ? 'Chờ giảng viên tạo yêu cầu điểm danh'
                                        : session.isAttended
                                        ? 'Đã điểm danh'
                                        : 'Nhấn để điểm danh'
                                }
                            >
                                Điểm danh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="feedback-modal" onClick={handleCloseFeedbackModal}>
                    <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Phản hồi chất lượng buổi học</h2>
                            <button className="close-btn-text" onClick={handleCloseFeedbackModal}>Thoát</button>
                        </div>
                        
                        <div className="modal-body">
                            <table className="feedback-table">
                                <thead>
                                    <tr>
                                        <th>Nội dung</th>
                                        <th>Đạt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Nắm bắt được kiến thức</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={feedbackData.criteria1}
                                                onChange={(e) => handleFeedbackChange('criteria1', e.target.checked)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Giảng viên nhiệt tình</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={feedbackData.criteria2}
                                                onChange={(e) => handleFeedbackChange('criteria2', e.target.checked)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Cơ sở vật chất tốt</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={feedbackData.criteria3}
                                                onChange={(e) => handleFeedbackChange('criteria3', e.target.checked)}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="feedback-textarea-section">
                                <label htmlFor="additional-comments">Đánh giá thêm</label>
                                <textarea
                                    id="additional-comments"
                                    className="feedback-textarea"
                                    rows="6"
                                    value={feedbackData.additionalComments}
                                    onChange={(e) => handleFeedbackChange('additionalComments', e.target.value)}
                                    placeholder="Nhập đánh giá thêm của bạn..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-save" onClick={handleSubmitFeedback}>
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default SessionDetails;
