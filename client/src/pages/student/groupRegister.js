// client/src/pages/groupRegister/GroupRegister.js
import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../components/MainLayout';
import './groupRegister.css';

const GroupRegister = () => {
    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTutorListModal, setShowTutorListModal] = useState(false);
    const [showTutorInfoModal, setShowTutorInfoModal] = useState(false);
    const [showCourseListModal, setShowCourseListModal] = useState(false);
    const [showGroupDetailModal, setShowGroupDetailModal] = useState(false);
    const [showJoinedGroupsModal, setShowJoinedGroupsModal] = useState(false);
    const [showCreatedGroupsModal, setShowCreatedGroupsModal] = useState(false);

    // State for data
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedTutors, setSelectedTutors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('newest');
    const [groups, setGroups] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customTutor, setCustomTutor] = useState('');
    const [courses, setCourses] = useState([]);

    // State for search filters
    const [searchFilters, setSearchFilters] = useState({
        creator: '',
        subject: '',
        tutor: '',
        date: ''
    });

    // State for create group form
    const [formData, setFormData] = useState({
        subject: '',
        maxMembers: '',
        description: '',
        tutor: ''
    });

    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || { id: '2310812', name: 'Nguyễn Văn A' };

    // Fetch groups from server
    const fetchGroups = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            console.log('Fetching groups with filters:', filters);
            
            const response = await fetch('http://localhost:5000/api/groups/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Groups fetched:', result);
            
            if (result.success) {
                setGroups(result.data || []);
            } else {
                console.error('Server returned error:', result.message);
                setGroups([]);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch tutors from server
    const fetchTutors = async (subject) => {
        try {
            console.log('Fetching tutors for subject:', subject);
            
            const response = await fetch('http://localhost:5000/api/groups/tutors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subject })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Tutors fetched:', result);
            
            if (result.success) {
                setTutors(result.data || []);
            } else {
                console.error('Server returned error:', result.message);
                setTutors([]);
            }
        } catch (error) {
            console.error('Error fetching tutors:', error);
            setTutors([]);
        }
    };

    // Fetch courses for tutor
    const fetchCourses = async (tutorID) => {
        try {
            console.log('Fetching courses for tutor:', tutorID);
            
            const response = await fetch('http://localhost:5000/api/groups/tutor-courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tutorID })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Courses fetched:', result);
            
            if (result.success) {
                setCourses(result.data || []);
            } else {
                console.error('Server returned error:', result.message);
                setCourses([]);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        }
    };

    // Initialize component
    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // Format date time
    const formatDateTime = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${hours}:${minutes} ${day}-${month}-${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    // Format text with ellipsis
    const formatText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Filter and sort groups
    const getFilteredAndSortedGroups = () => {
        let filtered = [...groups];

        // Sort
        if (sortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        } else {
            filtered.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
        }

        return filtered;
    };

    const filteredGroups = getFilteredAndSortedGroups();

    // Pagination
    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredGroups.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentGroups = filteredGroups.slice(startIndex, endIndex);

    // Toggle join/leave group
    const handleToggleJoin = async (groupId, e) => {
        e.stopPropagation();
        
        const group = groups.find(g => g.groupID === groupId);
        if (!group) return;

        try {
            if (group.member.some(m => m.studentID === user.id)) {
                // Leave group - CHO PHÉP NGƯỜI TẠO RỜI NHÓM
                const response = await fetch('http://localhost:5000/api/groups/leave', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        groupID: groupId,
                        studentID: user.id
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    fetchGroups();
                    alert('Rời nhóm thành công!');
                } else {
                    alert(result.message || 'Có lỗi xảy ra khi rời nhóm');
                }
            } else {
                // Join group - CHO PHÉP THAM GIA NHÓM ĐANG CHỜ
                if (group.currentMembers >= group.maxMembers) {
                    alert('Nhóm đã đầy! Không thể tham gia.');
                    return;
                }

                const response = await fetch('http://localhost:5000/api/groups/join', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        groupID: groupId,
                        student: {
                            studentID: user.id,
                            name: user.name
                        }
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    fetchGroups();
                    alert('Tham gia nhóm thành công!');
                } else {
                    alert(result.message || 'Có lỗi xảy ra khi tham gia nhóm');
                }
            }
        } catch (error) {
            console.error('Error toggling group membership:', error);
            alert('Lỗi kết nối server. Vui lòng thử lại.');
        }
    };

    // Validate subject format
    const validateSubjectFormat = (subject) => {
        const pattern = /^.+\(\w+\d+\)$/;
        return pattern.test(subject);
    };

    // Create new group
    const handleCreateGroup = async () => {
        // Validate form
        if (!formData.subject || !formData.maxMembers || !formData.description) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Validate subject format
        if (!validateSubjectFormat(formData.subject)) {
            alert('Môn học phải theo định dạng: "Tên môn (Mã môn)"\nVí dụ: Cấu trúc dữ liệu và giải thuật (CO2015)');
            return;
        }

        if (parseInt(formData.maxMembers) < 1) {
            alert('Số thành viên tối đa phải lớn hơn 0!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creatorStudent: {
                        studentID: user.id,
                        name: user.name
                    },
                    subject: formData.subject,
                    maxMembers: parseInt(formData.maxMembers),
                    description: formData.description,
                    tutor: formData.tutor || null
                })
            });
            
            const result = await response.json();
            if (result.success) {
                // Reset form
                setFormData({
                    subject: '',
                    maxMembers: '',
                    description: '',
                    tutor: ''
                });
                setSelectedTutors([]);
                setCustomTutor('');
                setCurrentPage(1);
                
                alert('Nhóm đã được tạo thành công!');
                setShowCreateModal(false);
                fetchGroups();
            } else {
                alert(result.message || 'Có lỗi xảy ra khi tạo nhóm');
            }
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Lỗi kết nối server. Vui lòng thử lại.');
        }
    };

    // Apply search filters - CHỈ TÌM KIẾM KHI NHẤN ÁP DỤNG
    const handleApplyFilters = () => {
        setCurrentPage(1);
        const filters = { ...searchFilters };
        
        // Xử lý tìm kiếm nhóm không có tutor
        if (filters.tutor === 'chưa có' || filters.tutor === 'Chưa có') {
            filters.tutor = null; // Gửi null để server filter
        }
        
        fetchGroups(filters);
    };

    // Reset search filters
    const handleResetFilters = () => {
        setSearchFilters({
            creator: '',
            subject: '',
            tutor: '',
            date: ''
        });
        setCurrentPage(1);
        fetchGroups();
    };

    // Show tutor info
    const handleShowTutorInfo = (tutor) => {
        setSelectedTutor(tutor);
        setShowTutorListModal(false);
        setShowTutorInfoModal(true);
    };

    // Show tutor list
    const handleShowTutorList = () => {
        if (formData.subject) {
            fetchTutors(formData.subject);
            setShowCreateModal(false);
            setShowTutorListModal(true);
        } else {
            alert('Vui lòng nhập môn học trước khi tìm tutor');
        }
    };

    // Close tutor list
    const handleCloseTutorList = () => {
        setShowTutorListModal(false);
        setShowCreateModal(true);
    };

    // Show course list
    const handleShowCourseList = () => {
        if (selectedTutor) {
            fetchCourses(selectedTutor.tutorID);
            setShowTutorInfoModal(false);
            setShowCourseListModal(true);
        }
    };

    // Close course list
    const handleCloseCourseList = () => {
        setShowCourseListModal(false);
        setShowTutorInfoModal(true);
    };

    // Show group detail
    const handleShowGroupDetail = (groupId) => {
        const group = groups.find(g => g.groupID === groupId);
        setSelectedGroup(group);
        setShowGroupDetailModal(true);
    };

    // Toggle tutor selection
    const handleToggleTutor = (tutor) => {
        if (selectedTutors.some(t => t.tutorID === tutor.tutorID)) {
            setSelectedTutors(selectedTutors.filter(t => t.tutorID !== tutor.tutorID));
        } else {
            setSelectedTutors([tutor]); // Chỉ cho phép chọn 1 tutor
        }
    };

    // Confirm tutor selection
    const handleConfirmTutors = () => {
        if (selectedTutors.length > 0) {
            setFormData(prev => ({ ...prev, tutor: selectedTutors[0] }));
        } else if (customTutor.trim()) {
            // Tạo tutor tùy chỉnh
            const customTutorObj = {
                tutorID: 'CUSTOM',
                name: customTutor.trim(),
                subject: formData.subject,
                email: '',
                department: 'Tự yêu cầu',
                major: '',
                degree: '',
                role: 'Tutor tùy chỉnh'
            };
            setFormData(prev => ({ ...prev, tutor: customTutorObj }));
        }
        handleCloseTutorList();
    };

    // Get status text for group card
    const getStatusText = (group) => {
        return group.status === 'accepted' ? 'Đã chấp nhận' : 'Đang chờ';
    };

    // Get join button text
    const getJoinButtonText = (group) => {
        return group.member.some(m => m.studentID === user.id) ? 'Hủy tham gia' : 'Tham gia';
    };

    // Get join button class
    const getJoinButtonClass = (group) => {
        return group.member.some(m => m.studentID === user.id) ? 'btn-available' : 'btn-join';
    };

    // Pagination handlers
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

    // Get joined groups
    const joinedGroups = groups.filter(g => g.member.some(m => m.studentID === user.id));
    
    // Get created groups
    const createdGroups = groups.filter(g => g.creatorStudent.studentID === user.id);

    return (
        <MainLayout role="student">
            <div className="group-register-container">
                <h1 className="page-title">Đăng ký nhóm học tập</h1>

                <div className="content-wrapper">
                    {/* SIDEBAR - RỘNG HƠN */}
                    <aside className="sidebar">
                        <div className="section">
                            <h2 className="section-title">Đăng ký nhóm mới</h2>
                            <button 
                                className="btn-primary full-width" 
                                onClick={() => setShowCreateModal(true)}
                            >
                                Tạo nhóm mới
                            </button>
                        </div>

                        <div className="section">
                            <h2 className="section-title">Tìm kiếm nhóm</h2>
                            
                            <div className="form-group">
                                <label>Người tạo</label>
                                <input 
                                    type="text" 
                                    placeholder="Tên người tạo" 
                                    className="input-field"
                                    value={searchFilters.creator}
                                    onChange={(e) => setSearchFilters({...searchFilters, creator: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Môn học</label>
                                <input 
                                    type="text" 
                                    placeholder="Tên môn học" 
                                    className="input-field"
                                    value={searchFilters.subject}
                                    onChange={(e) => setSearchFilters({...searchFilters, subject: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tutor</label>
                                <input 
                                    type="text" 
                                    placeholder="Tên tutor hoặc 'chưa có'" 
                                    className="input-field"
                                    value={searchFilters.tutor}
                                    onChange={(e) => setSearchFilters({...searchFilters, tutor: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ngày tạo</label>
                                <input 
                                    type="date" 
                                    className="input-field"
                                    value={searchFilters.date}
                                    onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})}
                                />
                            </div>

                            <div className="button-group">
                                <button className="btn-primary" onClick={handleApplyFilters}>
                                    Áp dụng
                                </button>
                                <button className="btn-secondary" onClick={handleResetFilters}>
                                    Đặt lại
                                </button>
                            </div>
                        </div>

                        <div className="section">
                            <div className="section-header">
                                <h2 className="section-title">Nhóm tham gia gần đây</h2>
                                <span 
                                    className="link-small" 
                                    onClick={() => setShowJoinedGroupsModal(true)}
                                >
                                    Xem tất cả
                                </span>
                            </div>
                            <div className="stats-group">
                                {joinedGroups.slice(0, 2).map(group => (
                                    <div key={group.groupID} className="stat-item">
                                        <div className="stat-label">
                                            {formatText(group.subject.split('(')[0].trim(), 15)}
                                        </div>
                                        <div className="stat-value">
                                            {group.currentMembers}/{group.maxMembers}
                                        </div>
                                    </div>
                                ))}
                                {joinedGroups.length === 0 && (
                                    <div className="stat-item">
                                        <div className="stat-label">Trống</div>
                                        <div className="stat-value">0/0</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="section">
                            <div className="section-header">
                                <h2 className="section-title">Nhóm tạo gần đây</h2>
                                <span 
                                    className="link-small" 
                                    onClick={() => setShowCreatedGroupsModal(true)}
                                >
                                    Xem tất cả
                                </span>
                            </div>
                            <div className="stats-group">
                                {createdGroups.slice(0, 2).map(group => (
                                    <div key={group.groupID} className="stat-item">
                                        <div className="stat-label">
                                            {formatText(group.subject.split('(')[0].trim(), 15)}
                                        </div>
                                        <div className="stat-value">
                                            {group.currentMembers}/{group.maxMembers}
                                        </div>
                                    </div>
                                ))}
                                {createdGroups.length === 0 && (
                                    <div className="stat-item">
                                        <div className="stat-label">Trống</div>
                                        <div className="stat-value">0/0</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT - THU HẸP LẠI */}
                    <main className="main-content">
                        <div className="content-header">
                            <h2 className="content-title">Danh sách nhóm hiện có</h2>
                            <div className="sort-group">
                                <span>Sắp xếp theo:</span>
                                <select 
                                    className="select-field"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                Đang tải dữ liệu...
                            </div>
                        ) : (
                            <>
                                <div className="group-grid">
                                    {currentGroups.map(group => (
                                        <div 
                                            key={group.groupID} 
                                            className="group-card" 
                                            onClick={() => handleShowGroupDetail(group.groupID)}
                                        >
                                            {/* Hàng 1: Tên môn + Thời gian tạo */}
                                            <div className="card-row">
                                                <h3 className="card-title" title={group.subject}>
                                                    {formatText(group.subject, 35)}
                                                </h3>
                                                <span className="card-date">
                                                    {formatDateTime(group.createdDate)}
                                                </span>
                                            </div>
                                            
                                            {/* Hàng 2: Người tạo + MSSV */}
                                            <div className="card-row">
                                                <span className="card-info-left">
                                                    Người tạo: {formatText(group.creatorStudent.name, 20)}
                                                </span>
                                                <span className="card-date">
                                                    MSSV: {group.creatorStudent.studentID}
                                                </span>
                                            </div>
                                            
                                            {/* Hàng 3: Tutor + Trạng thái */}
                                            <div className="card-row">
                                                <span className="card-info-left">
                                                    Tutor: {formatText(group.tutor?.name || 'Chưa có', 20)}
                                                </span>
                                                <span className="card-info-right status-badge">
                                                    {getStatusText(group)}
                                                </span>
                                            </div>
                                            
                                            {/* Hàng 4: Sĩ số + Nút tham gia */}
                                            <div className="card-row">
                                                <span className="card-info-left">
                                                    Thành viên: {group.currentMembers}/{group.maxMembers}
                                                </span>
                                                <button 
                                                    className={`btn-status ${getJoinButtonClass(group)}`}
                                                    onClick={(e) => handleToggleJoin(group.groupID, e)}
                                                >
                                                    {getJoinButtonText(group)}
                                                </button>
                                            </div>
                                            
                                            {/* Hàng 5: Mô tả */}
                                            <div className="card-row">
                                                <p className="card-description" title={group.description}>
                                                    {formatText(group.description, 60)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredGroups.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        Không tìm thấy nhóm nào phù hợp với tiêu chí tìm kiếm.
                                    </div>
                                )}

                                {/* FOOTER - GỘP TẤT CẢ VÀO 1 BLOCK */}
                                <div className="pagination-footer">
                                    <div className="footer-left">
                                        <p><strong>Số lượng nhóm: {filteredGroups.length}</strong></p>
                                        <p>Cập nhật lần cuối: {formatDateTime(new Date())}</p>
                                    </div>
                                    <div className="footer-right">
                                        <div className="pagination-controls">
                                            <button 
                                                className="btn-page" 
                                                onClick={handlePrevPage}
                                                disabled={currentPage === 1}
                                            >
                                                {'<'}
                                            </button>
                                            <span className="page-info">
                                                {currentPage} / {totalPages}
                                            </span>
                                            <button 
                                                className="btn-page"
                                                onClick={handleNextPage}
                                                disabled={currentPage === totalPages || totalPages === 0}
                                            >
                                                {'>'}
                                            </button>
                                            <span 
                                                className="link-refresh" 
                                                onClick={() => {
                                                    setCurrentPage(1);
                                                    fetchGroups();
                                                }}
                                            >
                                                Làm mới
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* MODAL TẠO NHÓM MỚI */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Tạo nhóm mới</h3>
                            <button 
                                className="modal-close" 
                                onClick={() => setShowCreateModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Môn học <span style={{color: 'red'}}>*</span></label>
                                <input 
                                    type="text" 
                                    placeholder="Tên môn học (Mã môn) - VD: Cấu trúc dữ liệu và giải thuật (CO2015)" 
                                    className="input-field"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tutor (Không bắt buộc)</label>
                                <input 
                                    type="text" 
                                    placeholder="Nhấn vào để xem danh sách tutor phù hợp" 
                                    className="input-field"
                                    value={formData.tutor?.name || ''}
                                    readOnly
                                    onClick={handleShowTutorList}
                                />
                            </div>
                            <div className="form-group">
                                <label>Số thành viên tối đa <span style={{color: 'red'}}>*</span></label>
                                <input 
                                    type="number" 
                                    placeholder="Số thành viên" 
                                    className="input-field"
                                    value={formData.maxMembers}
                                    onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả <span style={{color: 'red'}}>*</span></label>
                                <textarea 
                                    placeholder="Mô tả về nhóm học tập"
                                    className="textarea-field"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="4"
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={handleCreateGroup}>
                                Tạo nhóm
                            </button>
                            <button className="btn-secondary" onClick={() => {
                                setFormData({
                                    subject: '',
                                    maxMembers: '',
                                    description: '',
                                    tutor: ''
                                });
                                setSelectedTutors([]);
                                setCustomTutor('');
                            }}>
                                Đặt lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DANH SÁCH TUTOR */}
            {showTutorListModal && (
                <div className="modal-overlay" onClick={handleCloseTutorList}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Danh sách tutor phù hợp</h3>
                            <button className="modal-close" onClick={handleCloseTutorList}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <div className="detail-title">{formData.subject}</div>
                                <div className="tutor-list">
                                    {tutors.map((tutor, index) => (
                                        <div 
                                            key={index} 
                                            className="tutor-item-checkbox"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '10px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                backgroundColor: selectedTutors.some(t => t.tutorID === tutor.tutorID) ? '#e0f2fe' : 'white',
                                                marginBottom: '8px'
                                            }}
                                            onClick={() => handleToggleTutor(tutor)}
                                        >
                                            <input 
                                                type="checkbox"
                                                checked={selectedTutors.some(t => t.tutorID === tutor.tutorID)}
                                                onChange={() => handleToggleTutor(tutor)}
                                                style={{ marginRight: '8px', cursor: 'pointer' }}
                                            />
                                            <span 
                                                style={{ flex: 1, fontSize: '14px', cursor: 'pointer' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShowTutorInfo(tutor);
                                                }}
                                            >
                                                {tutor.name} - {tutor.subject}
                                            </span>
                                        </div>
                                    ))}
                                    {tutors.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                            Không tìm thấy tutor nào phù hợp
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="tutor-search-section">
                                <label className="tutor-search-label">Khác (Tự yêu cầu)</label>
                                <input 
                                    type="text" 
                                    placeholder="Nhập tên tutor tự yêu cầu" 
                                    className="input-field"
                                    value={customTutor}
                                    onChange={(e) => setCustomTutor(e.target.value)}
                                />
                                <p className="tutor-note">*Nhấn vào tên tutor để xem thông tin chi tiết</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-done" onClick={handleConfirmTutors}>Xong</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÔNG TIN TUTOR */}
            {showTutorInfoModal && selectedTutor && (
                <div className="modal-overlay" onClick={() => setShowTutorInfoModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thông tin tutor</h3>
                            <button 
                                className="modal-close" 
                                onClick={() => setShowTutorInfoModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="info-row">
                                <span className="info-label">Họ và tên: </span>
                                <span className="info-value">{selectedTutor.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Môn học: </span>
                                <span className="info-value">{selectedTutor.subject}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Mã tutor: </span>
                                <span className="info-value">{selectedTutor.tutorID}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email: </span>
                                <span className="info-value">{selectedTutor.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Khoa: </span>
                                <span className="info-value">{selectedTutor.department}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Chuyên ngành: </span>
                                <span className="info-value">{selectedTutor.major}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Vai trò: </span>
                                <span className="info-value">{selectedTutor.role}</span>
                            </div>
                            <div className="info-row" style={{marginTop: '15px'}}>
                                <span className="link-blue" onClick={handleShowCourseList}>
                                    Danh sách môn đăng ký dạy
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DANH SÁCH MÔN ĐĂNG KÝ DẠY */}
            {showCourseListModal && (
                <div className="modal-overlay" onClick={handleCloseCourseList}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Danh sách môn đăng ký dạy</h3>
                            <button className="modal-close" onClick={handleCloseCourseList}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <div className="detail-title">{selectedTutor?.name}</div>
                                <div className="sort-controls">
                                    <span className="sort-label">Tìm</span>
                                    <select className="select-field">
                                        <option>Mới nhất</option>
                                        <option>Cũ nhất</option>
                                    </select>
                                </div>
                                <div className="course-list">
                                    {courses.length > 0 ? (
                                        courses.map((course, index) => (
                                            <div key={index} className="course-item">
                                                <div className="course-name">{course.name}</div>
                                                <div className="course-info">
                                                    <span className="course-date">Ngày đăng ký: {course.date}</span>
                                                    <span className={`course-status ${
                                                        course.status === 'Đã duyệt' ? 'status-approved' : 
                                                        course.status === 'Chờ duyệt' ? 'status-pending' : 'status-rejected'
                                                    }`}>
                                                        {/* {course.status} */}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                                            Không có môn nào được đăng ký
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHI TIẾT NHÓM */}
            {showGroupDetailModal && selectedGroup && (
                <div className="modal-overlay" onClick={() => setShowGroupDetailModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thông tin nhóm chi tiết</h3>
                            <button 
                                className="modal-close" 
                                onClick={() => setShowGroupDetailModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <div className="detail-title">{selectedGroup.subject}</div>
                                
                                <div className="info-row">
                                    <span className="info-label">Người tạo: </span>
                                    <span className="info-value">{selectedGroup.creatorStudent.name}</span>
                                </div>
                                
                                <div className="info-row">
                                    <span className="info-label">MSSV: </span>
                                    <span className="info-value">{selectedGroup.creatorStudent.studentID}</span>
                                </div>
                                
                                <div className="info-row">
                                    <span className="info-label">Tutor: </span>
                                    <span className="info-value">{selectedGroup.tutor?.name || 'Chưa có'}</span>
                                </div>
                                
                                <div className="info-row">
                                    <span className="info-label">Thành viên: </span>
                                    <span className="info-value">{selectedGroup.currentMembers}/{selectedGroup.maxMembers}</span>
                                </div>
                                
                                <div className="info-row">
                                    <span className="info-label">Ngày tạo: </span>
                                    <span className="info-value">{formatDateTime(selectedGroup.createdDate)}</span>
                                </div>
                                
                                <div className="info-row">
                                    <span className="info-label">Trạng thái: </span>
                                    <span className="info-value">
                                        {selectedGroup.status === 'accepted' ? 'Đã chấp nhận' : 'Đang chờ'}
                                    </span>
                                </div>
                                
                                <div style={{marginTop: '15px'}}>
                                    <div className="info-label" style={{marginBottom: '8px'}}>Mô tả:</div>
                                    <div className="detail-content">{selectedGroup.description}</div>
                                </div>

                                <div style={{marginTop: '15px'}}>
                                    <div className="info-label" style={{marginBottom: '8px'}}>Thành viên:</div>
                                    <div className="detail-content">
                                        {selectedGroup.member.map((member, index) => (
                                            <div key={index}>
                                                {member.name} ({member.studentID})
                                                {member.studentID === selectedGroup.creatorStudent.studentID && ' - Người tạo'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="action-buttons">
                                <button 
                                    className={`btn-status ${
                                        selectedGroup.member.some(m => m.studentID === user.id) ? 'btn-available' : 'btn-join'
                                    }`}
                                    onClick={async () => {
                                        try {
                                            if (selectedGroup.member.some(m => m.studentID === user.id)) {
                                                // Leave group
                                                const response = await fetch('http://localhost:5000/api/groups/leave', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        groupID: selectedGroup.groupID,
                                                        studentID: user.id
                                                    })
                                                });
                                                const result = await response.json();
                                                if (result.success) {
                                                    setShowGroupDetailModal(false);
                                                    fetchGroups();
                                                }
                                            } else {
                                                // Join group
                                                if (selectedGroup.currentMembers >= selectedGroup.maxMembers) {
                                                    alert('Nhóm đã đầy! Không thể tham gia.');
                                                    return;
                                                }
                                                const response = await fetch('http://localhost:5000/api/groups/join', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        groupID: selectedGroup.groupID,
                                                        student: {
                                                            studentID: user.id,
                                                            name: user.name
                                                        }
                                                    })
                                                });
                                                const result = await response.json();
                                                if (result.success) {
                                                    setShowGroupDetailModal(false);
                                                    fetchGroups();
                                                }
                                            }
                                        } catch (error) {
                                            console.error('Error toggling group membership:', error);
                                        }
                                    }}
                                >
                                    {selectedGroup.member.some(m => m.studentID === user.id) ? 'Hủy tham gia' : 'Tham gia'}
                                </button>
                                <button className="btn-reject" onClick={() => setShowGroupDetailModal(false)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TẤT CẢ NHÓM ĐÃ THAM GIA */}
            {showJoinedGroupsModal && (
                <div className="modal-overlay" onClick={() => setShowJoinedGroupsModal(false)}>
                    <div className="modal-box large-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Tất cả nhóm đã tham gia</h3>
                            <button className="modal-close" onClick={() => setShowJoinedGroupsModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="groups-list">
                                {joinedGroups.length > 0 ? (
                                    joinedGroups.map(group => (
                                        <div key={group.groupID} className="group-item">
                                            <div className="group-item-header">
                                                <h4>{group.subject}</h4>
                                                <span>{formatDateTime(group.createdDate)}</span>
                                            </div>
                                            <div className="group-item-info">
                                                <p>Người tạo: {group.creatorStudent.name}</p>
                                                <p>Thành viên: {group.currentMembers}/{group.maxMembers}</p>
                                                <p>Trạng thái: 
                                                    <span className={`status-badge ${
                                                        group.status === 'accepted' ? 'accepted' : 'waiting'
                                                    }`}>
                                                        {group.status === 'accepted' ? 'Đã chấp nhận' : 'Đang chờ'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                                        Chưa tham gia nhóm nào
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TẤT CẢ NHÓM ĐÃ TẠO */}
            {showCreatedGroupsModal && (
                <div className="modal-overlay" onClick={() => setShowCreatedGroupsModal(false)}>
                    <div className="modal-box large-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Tất cả nhóm đã tạo</h3>
                            <button className="modal-close" onClick={() => setShowCreatedGroupsModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="groups-list">
                                {createdGroups.length > 0 ? (
                                    createdGroups.map(group => (
                                        <div key={group.groupID} className="group-item">
                                            <div className="group-item-header">
                                                <h4>{group.subject}</h4>
                                                <span>{formatDateTime(group.createdDate)}</span>
                                            </div>
                                            <div className="group-item-info">
                                                <p>Thành viên: {group.currentMembers}/{group.maxMembers}</p>
                                                <p>Trạng thái: 
                                                    <span className={`status-badge ${
                                                        group.status === 'accepted' ? 'accepted' : 'waiting'
                                                    }`}>
                                                        {group.status === 'accepted' ? 'Đã chấp nhận' : 'Đang chờ'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                                        Chưa tạo nhóm nào
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default GroupRegister;