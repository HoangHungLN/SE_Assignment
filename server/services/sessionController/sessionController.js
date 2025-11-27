// server/services/sessionController/sessionController.js
const express = require('express');
const router = express.Router();

class SessionController {
    
    /**
     * Lấy danh sách buổi học của một sinh viên (với phân trang, lọc, sắp xếp)
     * @param {string} studentId - ID của sinh viên
     * @param {Object} options - Tùy chọn { page, limit, sortBy, tutorId, subject }
     * @returns {Object} { sessions: Array, total: number, page: number, totalPages: number }
     */
    getStudentSessions(studentId, options = {}) {
        const { 
            page = 1, 
            limit = 6, 
            sortBy = 'date', 
            tutorId = null, 
            subject = null 
        } = options;

        console.log(`[SessionController] Lấy buổi học cho sinh viên: ${studentId}`);
        console.log(`-> Options:`, { page, limit, sortBy, tutorId, subject });
        
        // Bước 1: Lọc theo studentId
        let filtered = this.sessions.filter(s => s.studentId === studentId);
        
        // Bước 2: Lọc theo tutorId (nếu có)
        if (tutorId) {
            filtered = filtered.filter(s => s.tutorId === tutorId);
        }
        
        // Bước 3: Lọc theo subject (tìm kiếm trong tên môn học)
        if (subject && subject.trim()) {
            const searchTerm = subject.toLowerCase().trim();
            filtered = filtered.filter(s => 
                s.subject.toLowerCase().includes(searchTerm)
            );
        }
        
        // Bước 4: Sắp xếp
        if (sortBy === 'date') {
            // Sắp xếp từ quá khứ đến tương lai (ascending)
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortBy === 'subject') {
            filtered.sort((a, b) => a.subject.localeCompare(b.subject));
        } else if (sortBy === 'tutor') {
            // Sắp xếp theo chữ cái đầu của tên riêng (phần cuối)
            filtered.sort((a, b) => {
                const nameA = a.tutor.split(' ').pop(); // Lấy tên riêng (phần cuối)
                const nameB = b.tutor.split(' ').pop();
                return nameA.localeCompare(nameB);
            });
        }
        
        // Bước 5: Phân trang
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSessions = filtered.slice(startIndex, endIndex);
        
        console.log(`-> Tìm thấy ${total} buổi học, trang ${page}/${totalPages}`);
        
        return {
            success: true,
            sessions: paginatedSessions,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    }

    /**
     * Lấy danh sách các tutors của sinh viên
     * @param {string} studentId - ID của sinh viên
     * @returns {Array} Danh sách tutors
     */
    getStudentTutors(studentId) {
        const sessions = this.sessions.filter(s => s.studentId === studentId);
        const tutorsMap = new Map();
        
        sessions.forEach(s => {
            if (!tutorsMap.has(s.tutorId)) {
                tutorsMap.set(s.tutorId, {
                    tutorId: s.tutorId,
                    tutorName: s.tutor
                });
            }
        });
        
        return Array.from(tutorsMap.values());
    }

    /**
     * Lấy danh sách các môn học của sinh viên
     * @param {string} studentId - ID của sinh viên
     * @returns {Array} Danh sách môn học với mã môn
     */
    getStudentSubjects(studentId) {
        const subjectCodeMap = {
            'Giải Tích 1': 'MA001',
            'Kỹ thuật lập trình': 'CO1027',
            'Cấu trúc dữ liệu và Giải thuật': 'CO2001',
            'Giải Tích 2': 'MA002',
            'Đại số tuyến tính': 'MA003',
            'Lập trình hướng đối tượng': 'CO1009',
            'Cơ sở dữ liệu': 'CO2005',
            'Hệ điều hành': 'CO1019',
            'Mạng máy tính': 'CO1013',
            'Kiến trúc Máy tính': 'CO2007'
        };

        const sessions = this.sessions.filter(s => s.studentId === studentId);
        const subjectsMap = new Map();
        
        sessions.forEach(s => {
            if (!subjectsMap.has(s.subject)) {
                subjectsMap.set(s.subject, {
                    name: s.subject,
                    code: subjectCodeMap[s.subject] || 'N/A'
                });
            }
        });
        
        return Array.from(subjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Lấy chi tiết một buổi học
     * @param {number} sessionId - ID của buổi học
     * @returns {Object|null} Chi tiết buổi học hoặc null nếu không tìm thấy
     */
    getSessionDetail(sessionId) {
        console.log(`[SessionController] Lấy chi tiết buổi học ID: ${sessionId}`);
        
        const session = this.sessions.find(s => s.id == sessionId);
        
        if (session) {
            console.log(`-> Tìm thấy buổi học: ${session.subject}`);
        } else {
            console.log(`-> Không tìm thấy buổi học`);
        }
        
        return session || null;
    }

    /**
     * Sinh viên vào/tham gia buổi học
     * @param {string} studentId - ID của sinh viên
     * @param {number} sessionId - ID của buổi học
     * @returns {Object} Kết quả xử lý
     */
    joinSession(studentId, sessionId) {
        console.log(`[SessionController] Sinh viên ${studentId} vào buổi học ${sessionId}`);
        
        // Kiểm tra buổi học có tồn tại không
        const session = this.sessions.find(s => s.id == sessionId);
        if (!session) {
            console.log(`-> Lỗi: Buổi học không tồn tại`);
            return {
                success: false,
                message: 'Buổi học không tồn tại'
            };
        }

        // Kiểm tra buổi học có trong trạng thái sắp diễn ra không
        if (session.status !== 'Sắp diễn ra') {
            console.log(`-> Lỗi: Buổi học không thể tham gia (trạng thái: ${session.status})`);
            return {
                success: false,
                message: `Buổi học này không thể tham gia (${session.status})`
            };
        }

        // Kiểm tra đã tham gia chưa
        const alreadyJoined = this.enrollments.find(
            e => e.studentId === studentId && e.sessionId === sessionId
        );
        
        if (alreadyJoined) {
            console.log(`-> Lỗi: Sinh viên đã tham gia buổi học này rồi`);
            return {
                success: false,
                message: 'Bạn đã tham gia buổi học này rồi'
            };
        }

        // Thêm sinh viên vào danh sách tham gia
        this.enrollments.push({
            studentId: studentId,
            sessionId: sessionId,
            joinedAt: new Date().toISOString()
        });

        console.log(`-> Sinh viên ${studentId} đã tham gia thành công`);
        
        return {
            success: true,
            message: 'Bạn đã tham gia buổi học thành công',
            data: {
                sessionId: sessionId,
                sessionName: session.subject,
                joinedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Lấy danh sách tất cả các buổi học (để tutor xem buổi học của họ)
     * @returns {Array} Danh sách tất cả buổi học
     */
    getAllSessions() {
        console.log(`[SessionController] Lấy danh sách tất cả buổi học`);
        return this.sessions;
    }

    /**
     * Lấy danh sách lớp học của một giảng viên (với phân trang, lọc)
     * @param {string} tutorId - ID của giảng viên
     * @param {Object} options - Tùy chọn { page, limit, subject }
     * @returns {Object} { classes: Array, total: number, page: number, totalPages: number }
     */
    getTutorClasses(tutorId, options = {}) {
        const { 
            page = 1, 
            limit = 6, 
            subject = null 
        } = options;

        console.log(`[SessionController] Lấy danh sách lớp của giảng viên: ${tutorId}`);
        console.log(`-> Options:`, { page, limit, subject });
        
        // Bước 1: Lọc theo tutorId
        let filtered = this.classes.filter(c => c.tutorId === tutorId);
        
        // Bước 2: Lọc theo subject (nếu có)
        if (subject && subject.trim()) {
            const searchTerm = subject.toLowerCase().trim();
            filtered = filtered.filter(c => 
                c.subject.toLowerCase().includes(searchTerm)
            );
        }
        
        // Bước 3: Sắp xếp theo ngày
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Bước 4: Phân trang
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedClasses = filtered.slice(startIndex, endIndex);
        
        console.log(`-> Tìm thấy ${total} lớp học, trang ${page}/${totalPages}`);
        
        return {
            success: true,
            data: paginatedClasses,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    }

    /**
     * Lấy danh sách các môn học của giảng viên
     * @param {string} tutorId - ID của giảng viên
     * @returns {Array} Danh sách môn học với mã môn
     */
    getTutorSubjects(tutorId) {
        const classes = this.classes.filter(c => c.tutorId === tutorId);
        const subjectsMap = new Map();
        
        classes.forEach(c => {
            if (!subjectsMap.has(c.subject)) {
                // Extract subject code from classCode (e.g., CO2007 from CO2007)
                const codeMatch = c.classCode.match(/[A-Z]+\d+/);
                subjectsMap.set(c.subject, {
                    name: c.subject,
                    code: codeMatch ? codeMatch[0] : 'N/A'
                });
            }
        });
        
        return Array.from(subjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Lấy các buổi học của một gia sư
     * @param {string} tutorId - ID của gia sư
     * @returns {Array} Danh sách buổi học của gia sư
     */
    getTutorSessions(tutorId) {
        console.log(`[SessionController] Lấy buổi học của gia sư: ${tutorId}`);
        
        const tutorSessions = this.sessions.filter(s => s.tutorId === tutorId);
        console.log(`-> Tìm thấy ${tutorSessions.length} buổi học`);
        
        return tutorSessions;
    }

    /**
     * Tạo buổi học mới (dành cho gia sư)
     * @param {Object} sessionData - Dữ liệu buổi học
     * @returns {Object} Buổi học vừa tạo
     */
    createSession(sessionData) {
        const { tutorId, subject, date, time, room, description } = sessionData;
        
        console.log(`[SessionController] Tạo buổi học mới: ${subject}`);
        
        const newSession = {
            id: Math.max(...this.sessions.map(s => s.id), 0) + 1,
            tutorId: tutorId,
            subject: subject,
            date: date,
            time: time,
            room: room,
            description: description || '',
            status: 'Sắp diễn ra',
            materials: [],
            createdAt: new Date().toISOString()
        };

        this.sessions.push(newSession);
        console.log(`-> Buổi học mới đã tạo với ID: ${newSession.id}`);
        
        return {
            success: true,
            message: 'Buổi học đã được tạo thành công',
            data: newSession
        };
    }

    /**
     * Cập nhật thông tin buổi học
     * @param {number} sessionId - ID buổi học
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Object} Kết quả cập nhật
     */
    updateSession(sessionId, updateData) {
        console.log(`[SessionController] Cập nhật buổi học ID: ${sessionId}`);
        
        const sessionIndex = this.sessions.findIndex(s => s.id == sessionId);
        
        if (sessionIndex === -1) {
            console.log(`-> Lỗi: Buổi học không tồn tại`);
            return {
                success: false,
                message: 'Buổi học không tồn tại'
            };
        }

        // Cập nhật dữ liệu
        this.sessions[sessionIndex] = {
            ...this.sessions[sessionIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        console.log(`-> Cập nhật thành công`);
        
        return {
            success: true,
            message: 'Buổi học đã được cập nhật',
            data: this.sessions[sessionIndex]
        };
    }

    /**
     * Xóa buổi học
     * @param {number} sessionId - ID buổi học
     * @returns {Object} Kết quả xóa
     */
    deleteSession(sessionId) {
        console.log(`[SessionController] Xóa buổi học ID: ${sessionId}`);
        
        const sessionIndex = this.sessions.findIndex(s => s.id == sessionId);
        
        if (sessionIndex === -1) {
            console.log(`-> Lỗi: Buổi học không tồn tại`);
            return {
                success: false,
                message: 'Buổi học không tồn tại'
            };
        }

        const deletedSession = this.sessions.splice(sessionIndex, 1)[0];
        console.log(`-> Xóa thành công buổi học: ${deletedSession.subject}`);
        
        return {
            success: true,
            message: 'Buổi học đã được xóa',
            data: deletedSession
        };
    }

    /**
     * Lấy danh sách lớp điểm danh của một buổi học
     * @param {number} sessionId - ID của buổi học
     * @returns {Array} Danh sách lớp điểm danh
     */
    getAttendanceList(sessionId) {
        console.log(`[SessionController] Lấy danh sách lớp điểm danh cho buổi học ID: ${sessionId}`);
        
        // Danh sách lớp điểm danh mẫu
        const attendanceListSample = [
            { id: 1, name: 'Nguyễn A', mssv: '2196542', lop: 'MT21KTTN', email: 'abcdef@hcmut.edu.vn', present: true },
            { id: 2, name: 'Trần Quang B', mssv: '2213654', lop: 'MT22KTT', email: 'abcfqef@hcmut.edu.vn', present: true },
            { id: 3, name: 'Thái Thị C', mssv: '2310166', lop: 'MT23KTT', email: 'abcwvf@hcmut.edu.vn', present: true },
            { id: 4, name: 'Lương Ngọc Thảo D', mssv: '2310007', lop: 'MT23KTT', email: 'avewcwef@hcmut.edu.vn', present: false },
            { id: 5, name: 'Võ Quang H', mssv: '2345678', lop: 'MT23KTT', email: 'sieudz@hcmut.edu.vn', present: false },
        ];

        // sessionId có thể dùng để lấy dữ liệu động, hiện tại hardcode
        return {
            sessionId: sessionId,
            attendanceList: attendanceListSample
        };
    }
}

// Khởi tạo Controller
const sessionController = new SessionController();

// ========== ĐỊNH NGHĨA API ROUTES ==========

/**
 * GET /my-sessions/:studentId
 * Lấy danh sách buổi học của một sinh viên (hỗ trợ phân trang, lọc, sắp xếp)
 * Query params: 
 *   - page: số trang (mặc định 1)
 *   - limit: số buổi học trên một trang (mặc định 6)
 *   - sortBy: sắp xếp theo (date, subject, tutor) - mặc định date
 *   - tutorId: lọc theo ID giáo viên
 *   - subject: lọc theo tên môn học
 */
router.get('/my-sessions/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 6, sortBy = 'date', tutorId, subject } = req.query;
        
        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 6,
            sortBy: sortBy || 'date',
            tutorId: tutorId || null,
            subject: subject || null
        };
        
        const result = sessionController.getStudentSessions(studentId, options);
        
        res.json({
            success: result.success,
            count: result.sessions.length,
            data: result.sessions,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('[Error] GET /my-sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách buổi học',
            error: error.message
        });
    }
});

/**
 * GET /detail/:sessionId
 * Lấy chi tiết một buổi học
 */
router.get('/detail/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = sessionController.getSessionDetail(sessionId);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Buổi học không tồn tại'
            });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('[Error] GET /detail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết buổi học',
            error: error.message
        });
    }
});

/**
 * POST /join/:sessionId
 * Sinh viên vào/tham gia buổi học
 */
router.post('/join/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { studentId } = req.body;
        
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu studentId'
            });
        }

        const result = sessionController.joinSession(studentId, sessionId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('[Error] POST /join:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi vào buổi học',
            error: error.message
        });
    }
});

/**
 * GET /tutor/:tutorId
 * Lấy danh sách buổi học của một gia sư
 */
router.get('/tutor/:tutorId', (req, res) => {
    try {
        const { tutorId } = req.params;
        
        const sessions = sessionController.getTutorSessions(tutorId);
        
        res.json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        console.error('[Error] GET /tutor:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy buổi học của gia sư',
            error: error.message
        });
    }
});

/**
 * POST /create
 * Gia sư tạo buổi học mới
 */
router.post('/create', (req, res) => {
    try {
        const result = sessionController.createSession(req.body);
        
        res.status(201).json(result);
    } catch (error) {
        console.error('[Error] POST /create:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo buổi học',
            error: error.message
        });
    }
});

/**
 * PUT /:sessionId
 * Cập nhật buổi học
 */
router.put('/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const result = sessionController.updateSession(sessionId, req.body);
        
        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('[Error] PUT /:sessionId:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật buổi học',
            error: error.message
        });
    }
});

/**
 * DELETE /:sessionId
 * Xóa buổi học
 */
router.delete('/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const result = sessionController.deleteSession(sessionId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('[Error] DELETE /:sessionId:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa buổi học',
            error: error.message
        });
    }
});

/**
 * GET /tutors/:studentId
 * Lấy danh sách các tutors của một sinh viên
 */
router.get('/tutors/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        
        const tutors = sessionController.getStudentTutors(studentId);
        
        res.json({
            success: true,
            count: tutors.length,
            data: tutors
        });
    } catch (error) {
        console.error('[Error] GET /tutors:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách tutors',
            error: error.message
        });
    }
});

/**
 * GET /subjects/:studentId
 * Lấy danh sách các môn học của một sinh viên
 */
router.get('/subjects/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        
        const subjects = sessionController.getStudentSubjects(studentId);
        
        res.json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    } catch (error) {
        console.error('[Error] GET /subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách môn học',
            error: error.message
        });
    }
});

/**
 * GET /tutor-classes/:tutorId
 * Lấy danh sách lớp học của giảng viên
 */
router.get('/tutor-classes/:tutorId', (req, res) => {
    try {
        const { tutorId } = req.params;
        const { page = 1, limit = 6, subject = '' } = req.query;
        
        const result = sessionController.getTutorClasses(tutorId, {
            page: parseInt(page),
            limit: parseInt(limit),
            subject: subject
        });
        
        res.json(result);
    } catch (error) {
        console.error('[Error] GET /tutor-classes/:tutorId:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách lớp học',
            error: error.message
        });
    }
});

/**
 * GET /tutor-subjects/:tutorId
 * Lấy danh sách các môn học của giảng viên
 */
router.get('/tutor-subjects/:tutorId', (req, res) => {
    try {
        const { tutorId } = req.params;
        
        const subjects = sessionController.getTutorSubjects(tutorId);
        
        res.json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    } catch (error) {
        console.error('[Error] GET /tutor-subjects/:tutorId', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách môn học',
            error: error.message
        });
    }
});

/**
 * GET /api/sessions/:sessionId/attendance-list
 * Lấy danh sách lớp điểm danh của một buổi học
 */
router.get('/api/sessions/:sessionId/attendance-list', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const attendanceList = sessionController.getAttendanceList(sessionId);
        
        res.json({
            success: true,
            data: attendanceList
        });
    } catch (error) {
        console.error('[Error] GET /api/sessions/:sessionId/attendance-list:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách lớp điểm danh',
            error: error.message
        });
    }
});

// Định nghĩa hàm lấy danh sách lớp điểm danh
function getAttendanceList(req, res) {
  const attendanceListSample = [
    { id: 1, name: 'Nguyễn A', mssv: '2196542', lop: 'MT21KTTN', email: 'abcdef@hcmut.edu.vn', present: true },
    { id: 2, name: 'Trần Quang B', mssv: '2213654', lop: 'MT22KTT', email: 'abcfqef@hcmut.edu.vn', present: true },
    { id: 3, name: 'Thái Thị C', mssv: '2310166', lop: 'MT23KTT', email: 'abcwvf@hcmut.edu.vn', present: true },
    { id: 4, name: 'Lương Ngọc Thảo D', mssv: '2310007', lop: 'MT23KTT', email: 'avewcwef@hcmut.edu.vn', present: false },
    { id: 5, name: 'Võ Quang H', mssv: '2345678', lop: 'MT23KTT', email: 'sieudz@hcmut.edu.vn', present: false },
  ];
  res.json({ attendanceList: attendanceListSample });
}

router.get('/:sessionId/attendance-list', getAttendanceList);

module.exports = router;

