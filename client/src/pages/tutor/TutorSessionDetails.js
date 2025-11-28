import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './TutorSessionDetails.css';
import axios from 'axios';

// const evaluateRouter = require('../../services/learningController/evaluateController');

function TutorSessionDetails() {
        // State cho file biên bản đính kèm
        const [summaryFile, setSummaryFile] = useState(null);

        // Xử lý upload file biên bản
        const handleSummaryFileUpload = (event) => {
            const file = event.target.files[0];
            if (file) {
                setSummaryFile(file);
                setLastEditTime(new Date());
            }
        };
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

    const [reviewList, setReviewList] = useState([]);   // ← CÁI NÀY RẤT QUAN TRỌNG
    // const [reviewDraft, setReviewDraft] = useState([]);
    // const [showReviewModal, setShowReviewModal] = useState(false);

    // ... (Các phần code khác giữ nguyên)

    const loadReviewListFromServer = async () => {
        try {
            // Gọi API lấy danh sách sinh viên (dữ liệu thô)
            const res = await axios.get('http://localhost:5000/api/learning/evaluate/progress');
            const data = res.data.data;

            // Map dữ liệu để hiển thị lên bảng
            const reviews = data.map((item, idx) => ({
                id: idx + 1,
                name: item.name,
                mssv: item.mssv,
                // SỬA Ở ĐÂY: Luôn để false khi mới load (để Tutor tự tích)
                passed: false, 
                comment: '',
            }));

            // Không setReviewList ở đây để tránh render lại giao diện chính khi chưa cần thiết
            // setReviewList(reviews); <--- Bỏ dòng này nếu không muốn list chính bị reset

            return reviews;
        } catch (err) {
            console.error('Lỗi load review list:', err);
            return [];
        }
    };

    // ... (Các phần code khác giữ nguyên)

    const [reviewDraft, setReviewDraft] = useState([]);
    const [lastEditTime, setLastEditTime] = useState(null);

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
        setLoading(true);
        axios.get('http://localhost:5000/api/sessions/1/attendance-list')
            .then(res => {
                // Chuyển đổi dữ liệu backend về đúng format cho bảng
                const data = res.data.attendanceList.map((item, idx) => ({
                    id: item.id,
                    mssv: item.mssv,
                    name: item.name,
                    lop: item.lop,
                    email: item.email,
                    present: item.present
                }));
                setAttendanceList(data);
                setShowAttendanceModal(true);
                setLoading(false);
            })
            .catch(() => {
                setError('Không lấy được dữ liệu điểm danh');
                setLoading(false);
            });
    };

    const handleCloseAttendanceModal = () => {
        setShowAttendanceModal(false);
    };

    const handleOpenReviewModal = async () => {
        const reviews = await loadReviewListFromServer();  // chờ API xong

        // clone sang draft để chỉnh trong modal
        setReviewDraft(JSON.parse(JSON.stringify(reviews)));

        setShowReviewModal(true);
    };



    const handleCloseReviewModal = () => {
        setShowReviewModal(false);
    };

    const handleCloseMaterialsModal = () => {
        setShowMaterialsModal(false);
    };

    const handleSubmitReview = async () => {
        // TODO: nếu sau này bạn muốn gửi reviewDraft lên server thì gọi API ở đây

        setReviewList(reviewDraft);         // cập nhật lại danh sách chính
        setLastEditTime(new Date());
        setShowReviewModal(false);
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

    const handleReviewCheck = (idx, checked) => {
        const newList = [...reviewDraft];
        newList[idx].passed = checked;
        setReviewDraft(newList);
    };

    const handleReviewComment = (idx, value) => {
        const newList = [...reviewDraft];
        newList[idx].comment = value;
        setReviewDraft(newList);
    };

    const [sortType, setSortType] = useState('default');
    const attendanceListSorted = React.useMemo(() => {
        if (sortType === 'name') {
            return [...attendanceList].sort((a, b) => a.name.localeCompare(b.name));
        }
        if (sortType === 'present') {
            return [...attendanceList].sort((a, b) => b.present - a.present);
        }
        return attendanceList;
    }, [attendanceList, sortType]);

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

    // Đếm số sinh viên có mặt dựa trên trường 'present' (backend) hoặc 'attended' (mock)
    const attendedCount = attendanceList.filter(a => a.present || a.attended).length;
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
                            <button className="btn btn-upload" onClick={() => { setActiveMaterialsTab('upload'); setShowMaterialsModal(true); }}>
                                Tải lên tài liệu
                            </button>
                            <button className="btn btn-reference" onClick={() => { setActiveMaterialsTab('library'); setShowMaterialsModal(true); }}>
                                Giáo trình tham khảo
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Đánh giá tiến độ sinh viên */}
                    <div className="details-section review-section">
                        <h2>Đánh giá tiến độ sinh viên</h2>
                        <div className="review-summary">
                            <div>
                                Tổng quan: {reviewList.filter(s => s.passed).length}/{reviewList.length} Đạt
                            </div>
                            <div>
                                Chỉnh sửa lần cuối: {lastEditTime ? lastEditTime.toLocaleString('vi-VN') : 'chưa chỉnh sửa'}
                            </div>
                        </div>
                        <button className="btn-review" onClick={handleOpenReviewModal}>Truy cập danh sách</button>
                    </div>

                    {/* Section 3: Điểm danh sinh viên */}
                    <div className="details-section">
                        <h2>Điểm danh sinh viên</h2>
                        <div className="attendance-section">
                            <div className="attendance-top-row">
                                <div className="attendance-stat">
                                    <span className="attendance-icon">👥</span>
                                    <span className="attendance-text" style={{fontWeight: 'normal'}}>Có mặt: {attendedCount} / {totalStudents}</span>
                                </div>
                                <button 
                                    className="link-button"
                                    onClick={handleOpenAttendanceModal}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                            
                            <button
                                className="btn-request-attendance"
                                onClick={handleRequestAttendance}
                                disabled={attendanceRequested}
                                title={attendanceRequested ? 'Yêu cầu đã được gửi' : 'Gửi yêu cầu điểm danh cho sinh viên'}
                            >
                                {attendanceRequested ? 'Đã gửi' : 'Tạo yêu cầu'}
                            </button>
                        </div>
                    </div>

                    {/* Section 4: Tổng hợp biên bản */}
                    <div className="details-section file-summary-section">
                        <h2>Tổng hợp biên bản</h2>
                        <div className="file-summary-content">
                            <div className="file-summary-updated">
                                Chỉnh sửa lần cuối: {lastEditTime ? lastEditTime.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'chưa chỉnh sửa'}
                            </div>
                            <div className="file-summary-attachment">
                                <span className="file-summary-icon" role="img" aria-label="PDF">📄</span>
                                {summaryFile ? (
                                    <a href={URL.createObjectURL(summaryFile)} className="file-summary-link" download={summaryFile.name}>{summaryFile.name}</a>
                                ) : (
                                    <span className="file-summary-link" style={{color: '#999'}}>Chưa có file biên bản</span>
                                )}
                            </div>
                            <label className="btn btn-upload-file" style={{marginTop: '16px', alignSelf: 'flex-start'}}>
                                Tải file lên
                                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.xlsx" style={{display: 'none'}} onChange={handleSummaryFileUpload} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Modal */}
            {showAttendanceModal && (
                <div className="attendance-modal" onClick={handleCloseAttendanceModal}>
                    <div className="attendance-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="attendance-modal-header">
                            <h2 className="attendance-modal-title">Danh sách lớp</h2>
                            <div className="attendance-modal-sort">
                                Sắp xếp: <span className="sort-link" onClick={() => setSortType('default')}>Mặc định</span> | <span className="sort-link" onClick={() => setSortType('name')}>Tên</span> | <span className="sort-link" onClick={() => setSortType('present')}>Có mặt</span>
                            </div>
                        </div>
                        {loading ? (
                            <div style={{textAlign: 'center', padding: '32px'}}>Đang tải dữ liệu...</div>
                        ) : error ? (
                            <div style={{textAlign: 'center', color: 'red', padding: '32px'}}>{error}</div>
                        ) : (
                            <div className="attendance-modal-table">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th className="stt">STT</th>
                                            <th>Họ và tên</th>
                                            <th className="mssv">MSSV</th>
                                            <th>Lớp</th>
                                            <th>Email</th>
                                            <th>Có mặt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceListSorted.map((student, idx) => (
                                            <tr key={student.id}>
                                                <td className="stt">{idx + 1}</td>
                                                <td>{student.name}</td>
                                                <td className="mssv">{student.mssv}</td>
                                                <td>{student.lop}</td>
                                                <td>{student.email}</td>
                                                <td><input type="checkbox" checked={student.present} readOnly /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="attendance-modal-footer">
                            <button className="attendance-modal-btn-close" onClick={handleCloseAttendanceModal}>Xong</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="review-modal" onClick={handleCloseReviewModal}>
                    <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="review-modal-header">
                            <h2 className="review-modal-title">Đánh giá tiến độ sinh viên</h2>
                            <button className="review-modal-close" onClick={handleCloseReviewModal}>Thoát</button>
                        </div>
                        <div className="review-modal-body">
                            <table className="review-table">
                                <thead>
                                    <tr>
                                        <th className="stt">STT</th>
                                        <th>Họ và tên</th>
                                        <th className="mssv">MSSV</th>
                                        <th>Đạt</th>
                                        <th>Đánh giá thêm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviewDraft.map((student, idx) => (
                                        <tr key={student.id}>
                                            <td className="stt">{idx + 1}</td>
                                            <td>{student.name}</td>
                                            <td className="mssv">{student.mssv}</td>
                                            <td>
                                                <input type="checkbox" checked={student.passed} onChange={e => handleReviewCheck(idx, e.target.checked)} />
                                            </td>
                                            <td>
                                                <input type="text" className="review-input" value={student.comment} onChange={e => handleReviewComment(idx, e.target.value)} placeholder="Nhập đánh giá thêm..." />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="review-modal-footer">
                            <button className="review-modal-btn-save" onClick={handleSubmitReview}>Lưu thay đổi</button>
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

            {/* Time Selection Modal - Styled to match screenshot */}
            {showTimeModal && (
                <div className="time-modal-overlay" onClick={() => setShowTimeModal(false)}>
                    <div className="time-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="time-modal-header">
                            <span className="time-modal-title">Điểm danh sinh viên</span>
                            <span className="time-modal-close" onClick={() => setShowTimeModal(false)}>Thoát</span>
                        </div>
                        <div className="time-modal-body">
                            <div className="time-input-group">
                                <span className="time-input-label">Bắt đầu lúc:</span>
                                <span className="time-input-value">{attendanceTime.startTime || ''}</span>
                                <span className="time-input-link" onClick={() => {
                                    const time = prompt('Nhập thời gian bắt đầu (HH:MM):');
                                    if (time) setAttendanceTime({...attendanceTime, startTime: time});
                                }}>Chọn thời điểm</span>
                            </div>
                            <div className="time-input-group">
                                <span className="time-input-label">Kết thúc lúc:</span>
                                <span className="time-input-value">{attendanceTime.endTime || ''}</span>
                                <span className="time-input-link" onClick={() => {
                                    const time = prompt('Nhập thời gian kết thúc (HH:MM):');
                                    if (time) setAttendanceTime({...attendanceTime, endTime: time});
                                }}>Chọn thời điểm</span>
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
