import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './TutorSessionDetails.css';
import axios from 'axios';

function TutorSessionDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showMaterialsModal, setShowMaterialsModal] = useState(false);
    const [activeMaterialsTab, setActiveMaterialsTab] = useState('upload');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [attendanceRequested, setAttendanceRequested] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [attendanceTime, setAttendanceTime] = useState({
        startTime: '',
        endTime: ''
    });
    
    // Attendance state
    const [attendanceList, setAttendanceList] = useState([]);
    
    // Review state
    const [reviewData, setReviewData] = useState({
        overallProgress: 'Bình thường', // Xuất sắc, Tốt, Bình thường, Yếu
        studentProgress: '',
        recommendations: ''
    });

    const tutorId = localStorage.getItem('userId') || 'GV001';
    const userRole = localStorage.getItem('userRole') || 'tutor';
    const userName = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Giảng viên';

    // Lấy class từ location state hoặc fetch từ backend
    useEffect(() => {
        if (location.state && location.state.class) {
            setClassData(location.state.class);
            initializeAttendanceList(location.state.class);
            setLoading(false);
        } else {
            setClassMock();
        }
    }, [location]);

    const setClassMock = () => {
        const mockClass = {
            id: 1,
            tutorId: 'GV001',
            className: 'Kiến trúc Máy tính',
            classCode: 'CO2007',
            subject: 'Kiến trúc Máy tính',
            date: '2025-10-05',
            time: '16:55',
            description: 'Bộ nhớ và Cache',
            format: 'On site',
            location: 'B1-303',
            onlineLink: null,
            status: 'Sắp diễn ra',
            studentCount: 30,
            materials: [
                { name: 'Kiến trúc máy tính slide.pdf', url: '/files/kien-truc-slide.pdf' },
                { name: 'Bài tập thực hành.zip', url: '/files/bai-tap.zip' }
            ]
        };
        setClassData(mockClass);
        initializeAttendanceList(mockClass);
        setLoading(false);
    };

    const initializeAttendanceList = (classItem) => {
        // Mock attendance data
        const mockAttendanceList = [
            { studentId: 'SV001', studentName: 'Nguyễn Văn A', attended: true, timestamp: '2025-10-05 16:55' },
            { studentId: 'SV002', studentName: 'Trần Thị B', attended: true, timestamp: '2025-10-05 16:56' },
            { studentId: 'SV003', studentName: 'Lê Minh C', attended: false, timestamp: null },
            { studentId: 'SV004', studentName: 'Phạm Thị D', attended: true, timestamp: '2025-10-05 16:57' },
            { studentId: 'SV005', studentName: 'Hoàng Văn E', attended: false, timestamp: null },
            { studentId: 'SV006', studentName: 'Đặng Thị F', attended: true, timestamp: '2025-10-05 16:58' }
        ];
        setAttendanceList(mockAttendanceList);
    };

    const handleDownload = (material) => {
        const link = document.createElement('a');
        link.href = material.url;
        link.download = material.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenAttendanceModal = () => {
        setShowAttendanceModal(true);
    };

    const handleCloseAttendanceModal = () => {
        setShowAttendanceModal(false);
    };

    const handleOpenReviewModal = () => {
        setShowReviewModal(true);
    };

    const handleCloseReviewModal = () => {
        setShowReviewModal(false);
    };

    const handleOpenMaterialsModal = () => {
        setShowMaterialsModal(true);
    };

    const handleCloseMaterialsModal = () => {
        setShowMaterialsModal(false);
    };

    const handleReviewChange = (field, value) => {
        setReviewData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmitReview = async () => {
        try {
            // TODO: Call API to save review when backend is ready
            console.log('Review submitted:', reviewData);
            setShowReviewModal(false);
        } catch (err) {
            console.error('Lỗi khi lưu đánh giá:', err);
        }
    };

    const handleFileUpload = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files).map(file => ({
                name: file.name,
                url: URL.createObjectURL(file),
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                uploadedAt: new Date().toLocaleString('vi-VN')
            }));
            setUploadedFiles([...uploadedFiles, ...newFiles]);
        }
    };

    const handleConfirmUpload = async () => {
        try {
            // TODO: Call API to upload files to server
            console.log('Files to upload:', uploadedFiles);
            // Update classData with new materials
            setClassData(prev => ({
                ...prev,
                materials: [...(prev.materials || []), ...uploadedFiles.map(f => ({
                    name: f.name,
                    url: f.url
                }))]
            }));
            setUploadedFiles([]);
            setShowMaterialsModal(false);
        } catch (err) {
            console.error('Lỗi khi upload tài liệu:', err);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleRequestAttendance = async () => {
        try {
            // Open time selection modal instead of directly requesting
            setShowTimeModal(true);
        } catch (err) {
            console.error('Lỗi khi tạo yêu cầu điểm danh:', err);
        }
    };

    const handleConfirmAttendanceRequest = async () => {
        try {
            // TODO: Call API to send attendance request with time
            console.log('Attendance request sent:', attendanceTime);
            setAttendanceRequested(true);
            setShowTimeModal(false);
            setAttendanceTime({ startTime: '', endTime: '' });
        } catch (err) {
            console.error('Lỗi khi gửi yêu cầu điểm danh:', err);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar role={userRole} userName={userName} />
                <div className="tutor-session-details-container">
                    <p>Đang tải chi tiết buổi dạy...</p>
                </div>
            </>
        );
    }

    if (!classData) {
        return (
            <>
                <Navbar role={userRole} userName={userName} />
                <div className="tutor-session-details-container">
                    <p>Không tìm thấy buổi dạy</p>
                </div>
            </>
        );
    }

    const attendedCount = attendanceList.filter(a => a.attended).length;
    const totalStudents = attendanceList.length;

    return (
        <>
            <Navbar role={userRole} userName={userName} />
            <div className="tutor-session-details-container">
                {/* Header */}
                <div className="session-details-header">
                    <div className="header-content">
                        <h1>{classData.className} ({classData.classCode})</h1>
                        <p className="session-time">
                            Thời gian: {classData.date} lúc {classData.time} | Địa điểm: {classData.location}
                        </p>
                    </div>
                </div>

                {/* Main Content - Grid 2x2 */}
                <div className="session-details-content">
                    {/* Section 1: Tài liệu */}
                    <div className="details-section">
                        <h2>Tài liệu</h2>
                        <div className="materials-list">
                            {classData.materials && classData.materials.length > 0 ? (
                                classData.materials.map((material, idx) => (
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
                                <p className="no-materials">Không có tài liệu cho buổi dạy này</p>
                            )}
                        </div>
                        <div className="materials-buttons">
                            <button className="btn btn-upload" onClick={handleOpenMaterialsModal}>
                                Tải lên tài liệu
                            </button>
                            <button className="btn btn-reference" onClick={handleOpenMaterialsModal}>
                                Giáo trình tham khảo
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Đánh giá tiến độ sinh viên */}
                    <div className="details-section">
                        <h2>Đánh giá tiến độ sinh viên</h2>
                        <div className="review-section">
                            <p className="review-description">
                                Đánh giá tổng thể tiến độ học tập của sinh viên trong buổi dạy
                            </p>
                            <button
                                className="btn btn-review"
                                onClick={handleOpenReviewModal}
                            >
                                Tạo đánh giá
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Điểm danh sinh viên */}
                    <div className="details-section">
                        <h2>Điểm danh sinh viên</h2>
                        <div className="attendance-section">
                            <div className="attendance-top-row">
                                <div className="attendance-stat">
                                    <span className="attendance-icon">👥</span>
                                    <span className="attendance-text">Có mặt: {attendedCount} / {totalStudents}</span>
                                </div>
                                <button 
                                    className="link-button"
                                    onClick={handleOpenAttendanceModal}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                            
                            <div className="attendance-export">
                                <span className="export-icon">📄</span>
                                <button className="link-button export-link">
                                    Danh sách lớp
                                </button>
                            </div>

                            <button
                                className="btn btn-request-attendance-small"
                                onClick={handleRequestAttendance}
                                disabled={attendanceRequested}
                                title={attendanceRequested ? 'Yêu cầu đã được gửi' : 'Gửi yêu cầu điểm danh cho sinh viên'}
                            >
                                {attendanceRequested ? 'Đã gửi' : 'Tạo yêu cầu'}
                            </button>
                        </div>
                    </div>

                    {/* Section 4: Tổng hợp biên bản */}
                    <div className="details-section">
                        <h2>Tổng hợp biên bản</h2>
                        <div className="summary-section">
                            <div className="summary-item">
                                <span className="summary-label">Nội dung bài giảng:</span>
                                <span className="summary-value">{classData.description}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Hình thức:</span>
                                <span className="summary-value">{classData.format}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Số sinh viên tham gia:</span>
                                <span className="summary-value">{attendedCount}/{totalStudents}</span>
                            </div>
                            <button className="btn btn-summary">
                                Xuất biên bản
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Modal */}
            {showAttendanceModal && (
                <div className="attendance-modal" onClick={handleCloseAttendanceModal}>
                    <div className="attendance-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Danh sách điểm danh</h2>
                            <button className="close-btn-text" onClick={handleCloseAttendanceModal}>Thoát</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="attendance-stats-modal">
                                <div className="stat-card">
                                    <span className="stat-number attended">{attendedCount}</span>
                                    <span className="stat-text">Đã điểm danh</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-number absent">{totalStudents - attendedCount}</span>
                                    <span className="stat-text">Vắng mặt</span>
                                </div>
                            </div>

                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>MSSV</th>
                                        <th>Tên sinh viên</th>
                                        <th>Trạng thái</th>
                                        <th>Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceList.map((student, idx) => (
                                        <tr key={student.studentId}>
                                            <td>{idx + 1}</td>
                                            <td>{student.studentId}</td>
                                            <td>{student.studentName}</td>
                                            <td>
                                                <span className={`status-badge ${student.attended ? 'attended' : 'absent'}`}>
                                                    {student.attended ? '✓ Đã điểm danh' : '✗ Vắng mặt'}
                                                </span>
                                            </td>
                                            <td>{student.timestamp || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="review-modal" onClick={handleCloseReviewModal}>
                    <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Đánh giá tiến độ sinh viên</h2>
                            <button className="close-btn-text" onClick={handleCloseReviewModal}>Thoát</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="overall-progress">Đánh giá tổng thể:</label>
                                <select
                                    id="overall-progress"
                                    className="form-control"
                                    value={reviewData.overallProgress}
                                    onChange={(e) => handleReviewChange('overallProgress', e.target.value)}
                                >
                                    <option value="Xuất sắc">Xuất sắc</option>
                                    <option value="Tốt">Tốt</option>
                                    <option value="Bình thường">Bình thường</option>
                                    <option value="Yếu">Yếu</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="student-progress">Tiến độ học tập sinh viên:</label>
                                <textarea
                                    id="student-progress"
                                    className="form-control textarea"
                                    rows="5"
                                    value={reviewData.studentProgress}
                                    onChange={(e) => handleReviewChange('studentProgress', e.target.value)}
                                    placeholder="Nhập đánh giá về tiến độ học tập..."
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="recommendations">Khuyến nghị:</label>
                                <textarea
                                    id="recommendations"
                                    className="form-control textarea"
                                    rows="5"
                                    value={reviewData.recommendations}
                                    onChange={(e) => handleReviewChange('recommendations', e.target.value)}
                                    placeholder="Nhập khuyến nghị cho sinh viên..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-save" onClick={handleSubmitReview}>
                                Lưu đánh giá
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Materials Modal */}
            {showMaterialsModal && (
                <div className="materials-modal" onClick={handleCloseMaterialsModal}>
                    <div className="materials-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Quản lý tài liệu</h2>
                            <button className="close-btn-text" onClick={handleCloseMaterialsModal}>Thoát</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="materials-tabs">
                                <button 
                                    className={`tab-btn ${activeMaterialsTab === 'upload' ? 'active' : ''}`}
                                    onClick={() => setActiveMaterialsTab('upload')}
                                >
                                    Tải lên tài liệu
                                </button>
                                <button 
                                    className={`tab-btn ${activeMaterialsTab === 'library' ? 'active' : ''}`}
                                    onClick={() => setActiveMaterialsTab('library')}
                                >
                                    Giáo trình tham khảo
                                </button>
                            </div>

                            {activeMaterialsTab === 'upload' && (
                                <div className="tab-content upload-tab">
                                    <div className="upload-area">
                                        <input 
                                            type="file" 
                                            id="file-input" 
                                            multiple 
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.xlsx"
                                            onChange={handleFileUpload}
                                        />
                                        <label htmlFor="file-input" className="upload-label">
                                            <span className="upload-icon">📤</span>
                                            <span className="upload-text">Kéo thả tài liệu hoặc click để chọn</span>
                                            <span className="upload-hint">Hỗ trợ: PDF, Word, PowerPoint, Excel, ZIP</span>
                                        </label>
                                    </div>

                                    {uploadedFiles.length > 0 && (
                                        <div className="uploaded-files-list">
                                            <h3>Tệp sẽ được tải lên ({uploadedFiles.length})</h3>
                                            <div className="files-list">
                                                {uploadedFiles.map((file, idx) => (
                                                    <div key={idx} className="file-item">
                                                        <span className="file-icon">📄</span>
                                                        <div className="file-info">
                                                            <span className="file-name">{file.name}</span>
                                                            <span className="file-size">{file.size}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeMaterialsTab === 'library' && (
                                <div className="tab-content library-tab">
                                    <div className="library-search">
                                        <input 
                                            type="text" 
                                            placeholder="Tìm kiếm tài liệu từ HCMUT_LIBRARY..."
                                            className="search-input"
                                        />
                                    </div>
                                    <div className="library-items">
                                        <p className="library-placeholder">Nhập từ khóa để tìm kiếm tài liệu trong thư viện</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-cancel" onClick={handleCloseMaterialsModal}>
                                Hủy
                            </button>
                            {activeMaterialsTab === 'upload' && uploadedFiles.length > 0 && (
                                <button className="btn btn-confirm" onClick={handleConfirmUpload}>
                                    Tải lên ({uploadedFiles.length})
                                </button>
                            )}
                            {activeMaterialsTab === 'library' && (
                                <button className="btn btn-confirm" onClick={handleCloseMaterialsModal}>
                                    Xác nhận
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Time Selection Modal */}
            {showTimeModal && (
                <div className="time-modal-overlay" onClick={() => setShowTimeModal(false)}>
                    <div className="time-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="time-modal-header">
                            <h2 className="time-modal-title">Điểm danh sinh viên</h2>
                            <button className="time-modal-close" onClick={() => setShowTimeModal(false)}>Thoát</button>
                        </div>
                        
                        <div className="time-modal-body">
                            <div className="time-input-group">
                                <div className="time-input-label">Bắt đầu lúc:</div>
                                <div className="time-input-value">{attendanceTime.startTime || 'Bắt đầu lúc:'}</div>
                                <a href="#" className="time-input-link" onClick={(e) => {
                                    e.preventDefault();
                                    const time = prompt('Nhập thời gian bắt đầu (HH:MM):');
                                    if (time) setAttendanceTime({...attendanceTime, startTime: time});
                                }}>Chọn thời điểm</a>
                            </div>

                            <div className="time-input-group">
                                <div className="time-input-label">Kết thúc lúc:</div>
                                <div className="time-input-value">{attendanceTime.endTime || 'Kết thúc lúc:'}</div>
                                <a href="#" className="time-input-link" onClick={(e) => {
                                    e.preventDefault();
                                    const time = prompt('Nhập thời gian kết thúc (HH:MM):');
                                    if (time) setAttendanceTime({...attendanceTime, endTime: time});
                                }}>Chọn thời điểm</a>
                            </div>
                        </div>

                        <div className="time-modal-footer">
                            <button 
                                className="time-modal-btn-confirm" 
                                onClick={handleConfirmAttendanceRequest}
                                disabled={!attendanceTime.startTime || !attendanceTime.endTime}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default TutorSessionDetails;
