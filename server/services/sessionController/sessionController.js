// server/services/sessionController/sessionController.js
const express = require('express');
const router = express.Router();
// Load feedback database (moved out from sessions)
const feedbackDB = require('../../dataBase/feedback');
// Feedback persistence moved to feedbackController
const feedbackController = require('../learningController/feedbackController');

class SessionController {
    // Constructor - Khởi tạo dữ liệu mock (không dùng database)
    constructor() {
        this.loadSessionsFromFile();

        // Dữ liệu lớp học của tutor (classes/sections)
        this.classes = [
            {
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
                studentCount: 30
            },
            {
                id: 2,
                tutorId: 'GV001',
                className: 'Cấu trúc rời rạc',
                classCode: 'CO1007',
                subject: 'Cấu trúc rời rạc',
                date: '2025-10-06',
                time: '16:05',
                description: 'Ứng dụng toán rời rạc',
                format: 'Không có',
                location: 'B1-303',
                onlineLink: null,
                status: 'Sắp diễn ra',
                studentCount: 28
            },
            {
                id: 3,
                tutorId: 'GV001',
                className: 'Kỹ thuật lập trình',
                classCode: 'CO1027',
                subject: 'Kỹ thuật lập trình',
                date: '2025-11-24',
                time: '16:55',
                description: 'OOP nâng cao',
                format: 'Off site',
                location: 'H6-506',
                onlineLink: 'Google Meet',
                status: 'Sắp diễn ra',
                studentCount: 35
            },
            {
                id: 4,
                tutorId: 'GV001',
                className: 'Cấu trúc dữ liệu',
                classCode: 'CO2003',
                subject: 'Cấu trúc dữ liệu',
                date: '2025-12-10',
                time: '17:45',
                description: 'Cấu trúc cây nâng cao',
                format: 'Both',
                location: 'B2-404',
                onlineLink: 'Google Meet',
                status: 'Sắp diễn ra',
                studentCount: 32
            },
            {
                id: 5,
                tutorId: 'GV001',
                className: 'Cơ sở dữ liệu',
                classCode: 'CO3025',
                subject: 'Cơ sở dữ liệu',
                date: '2025-12-15',
                time: '14:00',
                description: 'Database Design',
                format: 'On site',
                location: 'B3-201',
                onlineLink: null,
                status: 'Sắp diễn ra',
                studentCount: 25
            },
            {
                id: 6,
                tutorId: 'GV001',
                className: 'Lập trình hệ thống',
                classCode: 'CO3041',
                subject: 'Lập trình hệ thống',
                date: '2025-12-20',
                time: '15:00',
                description: 'System Call và API',
                format: 'Off site',
                location: 'B4-105',
                onlineLink: 'Microsoft Teams',
                status: 'Sắp diễn ra',
                studentCount: 20
            }
        ];

        this.enrollments = []; // Lưu các sinh viên tham gia
        this.registrations = [
            // SV001 đã tham gia lớp id = 1
            {
                id: 10,
                studentId: 'SV01',
                classId: 1,
                joinedAt: '2025-10-06T16:05:00.000Z'
            }
            // có thể thêm vài cái nếu muốn
            ];
    }

    /**
     * Load sessions from file (clear require cache to get latest data)
     */
    loadSessionsFromFile() {
        const sessionPath = require.resolve('../../dataBase/session');
        delete require.cache[sessionPath];
        this.sessions = require('../../dataBase/session');
    }

    /**
     * Lấy feedback từ feedbackDB theo sessionId và studentId
     * @param {number} sessionId
     * @param {string} studentId
     * @returns {Object|null}
     */
    getFeedback(sessionId, studentId) {
        // Load fresh feedback array from file to ensure latest saved data is returned
        try {
            const arr = feedbackController.loadFeedbackFromFile();
            if (!Array.isArray(arr)) return null;
            return arr.find(f => f.sessionId === sessionId && f.studentId === studentId) || null;
        } catch (err) {
            console.error('[SessionController] Lỗi khi load feedback từ file:', err.message);
            return null;
        }
    }
    /**
     * Lấy danh sách buổi học của một sinh viên (với phân trang, lọc, sắp xếp)
     * @param {string} studentId - ID của sinh viên
     * @param {Object} options - Tùy chọn { page, limit, sortBy, tutorId, subject }
     * @returns {Object} { sessions: Array, total: number, page: number, totalPages: number }
     */
    getStudentSessions(studentId, options = {}) {
        // Reload sessions from file to ensure fresh data
        this.loadSessionsFromFile();
        
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
        // Gắn feedback (nếu có) từ feedbackDB
        const paginatedWithFeedback = paginatedSessions.map(s => ({
            ...s,
            feedback: this.getFeedback(s.id, s.studentId)
        }));

        console.log(`-> Tìm thấy ${total} buổi học, trang ${page}/${totalPages}`);

        return {
            success: true,
            sessions: paginatedWithFeedback,
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

// =====================
// Controller chính
// =====================

class SessionController {
  constructor() {
    this.sessions = sessions;
    this.classes = classes;
    this.enrollments = enrollments || [];
  }

  /**
   * Lấy danh sách buổi học của một sinh viên (có lọc + phân trang)
   * @param {string} studentId
   * @param {Object} options { page, limit, sortBy, tutorId, subject }
   */
  getStudentSessions(studentId, options = {}) {
    const {
      page = 1,
      limit = 6,
      sortBy = 'date',
      tutorId = null,
      subject = null,
    } = options;

    let filtered = this.sessions.filter(
      (s) => s.studentId === studentId,
    );

    if (tutorId) {
      filtered = filtered.filter((s) => s.tutorId === tutorId);
    }

    /**
     * Lấy chi tiết một buổi học
     * @param {number} sessionId - ID của buổi học
     * @returns {Object|null} Chi tiết buổi học hoặc null nếu không tìm thấy
     */
    getSessionDetail(sessionId) {
        // Reload sessions from file to ensure fresh data
        this.loadSessionsFromFile();
        
        console.log(`[SessionController] Lấy chi tiết buổi học ID: ${sessionId}`);
        
        const session = this.sessions.find(s => s.id == sessionId);

        if (session) {
            console.log(`-> Tìm thấy buổi học: ${session.subject}`);
            // Gắn feedback từ feedbackDB (nếu có)
            session.feedback = this.getFeedback(session.id, session.studentId);
        } else {
            console.log(`-> Không tìm thấy buổi học`);
        }

        return session || null;
    }

    const { data, pagination } = paginate(filtered, page, limit);

    return {
      success: true,
      sessions: data,
      pagination,
    };
  }

  /**
   * Lấy danh sách tutors mà một sinh viên đã/đang học
   */
  getStudentTutors(studentId) {
    const sessions = this.sessions.filter(
      (s) => s.studentId === studentId,
    );
    const tutorsMap = new Map();

    sessions.forEach((s) => {
      if (!tutorsMap.has(s.tutorId)) {
        tutorsMap.set(s.tutorId, {
          tutorId: s.tutorId,
          tutorName: s.tutor,
        });
      }
    });

    return Array.from(tutorsMap.values());
  }

  /**
   * Lấy danh sách môn học một sinh viên đã/đang học
   */
  getStudentSubjects(studentId) {
    const sessions = this.sessions.filter(
      (s) => s.studentId === studentId,
    );
    const subjectsMap = new Map();

    sessions.forEach((s) => {
      if (!subjectsMap.has(s.subject)) {
        subjectsMap.set(s.subject, {
          name: s.subject,
          code: SUBJECT_CODE_MAP[s.subject] || 'N/A',
        });
      }
    });

    return Array.from(subjectsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  /**
   * Lấy chi tiết một buổi học
   */
  getSessionDetail(sessionId) {
    const session = this.sessions.find(
      (s) => s.id == sessionId,
    );
    return session || null;
  }

  /**
   * Sinh viên tham gia buổi học
   */
  joinSession(studentId, sessionId) {
    const session = this.sessions.find(
      (s) => s.id == sessionId,
    );
    if (!session) {
      return {
        success: false,
        message: 'Buổi học không tồn tại',
      };
    }

    if (session.status !== 'Sắp diễn ra') {
      return {
        success: false,
        message: `Buổi học này không thể tham gia (${session.status})`,
      };
    }

    /**
     * Tạo buổi học mới (dành cho gia sư)
     * @param {Object} sessionData - Dữ liệu buổi học
     * @returns {Object} Buổi học vừa tạo
     */
    // createSession(sessionData) {
    //     const { tutorId, subject, date, time, room, description } = sessionData;
        
    //     console.log(`[SessionController] Tạo buổi học mới: ${subject}`);
        
    //     const newSession = {
    //         id: Math.max(...this.sessions.map(s => s.id), 0) + 1,
    //         tutorId: tutorId,
    //         subject: subject,
    //         date: date,
    //         time: time,
    //         room: room,
    //         description: description || '',
    //         status: 'Sắp diễn ra',
    //         materials: [],
    //         createdAt: new Date().toISOString()
    //     };

    //     this.sessions.push(newSession);
    //     console.log(`-> Buổi học mới đã tạo với ID: ${newSession.id}`);
        
    //     return {
    //         success: true,
    //         message: 'Buổi học đã được tạo thành công',
    //         data: newSession
    //     };
    // }
    createSession(sessionData) {
        const {
            tutorId,
            subject,
            date,
            time,
            room,
            description,
            format,
            onlineLink,
            capacity
        } = sessionData;
        
        console.log(`[SessionController] Tạo buổi học mới: ${subject}`);
        
        // 1) Tạo bản ghi trong "sessions" (mock DB cho buổi học)
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
            capacity: capacity || null,
            createdAt: new Date().toISOString()
        };

        this.sessions.push(newSession);
        console.log(`-> Buổi học mới đã tạo với ID (session): ${newSession.id}`);

        // 2) Đồng thời tạo bản ghi trong "classes"
        //    để API /tutor-classes/:tutorId và /tutor-subjects/:tutorId nhìn thấy
        const newClassId =
            this.classes.length === 0
                ? 1
                : Math.max(...this.classes.map(c => c.id)) + 1;

        const newClass = {
            id: newClassId,
            tutorId: tutorId,
            className: description || `Buổi dạy: ${subject}`,
            classCode: '', // hiện tại không có mã lớp => để rỗng
            subject: subject,
            date: date,
            time: time,
            description: description || '',
            format: format || 'Không có',
            location: room || '',
            onlineLink: onlineLink || null,
            status: 'Sắp diễn ra',
            studentCount: 0
        };

        this.classes.push(newClass);
        console.log(`-> Đồng thời tạo lớp mới với ID (class): ${newClass.id}`);

        // 3) Trả về cả session lẫn class vừa tạo
        return {
            success: true,
            message: 'Buổi học đã được tạo thành công',
            data: newSession,
            class: newClass
        };
    }

    const joinedAt = new Date().toISOString();

    this.enrollments.push({
      studentId,
      sessionId,
      joinedAt,
    });

    return {
      success: true,
      message: 'Bạn đã tham gia buổi học thành công',
      data: {
        sessionId,
        sessionName: session.subject,
        joinedAt,
      },
    };
  }

  /**
   * Lấy tất cả buổi học (nếu cần)
   */
  getAllSessions() {
    return this.sessions;
  }

  /**
   * Lấy danh sách lớp của một giảng viên (có lọc + phân trang)
   */
  getTutorClasses(tutorId, options = {}) {
    const { page = 1, limit = 6, subject = null } = options;

    let filtered = this.classes.filter(
      (c) => c.tutorId === tutorId,
    );

    filtered = filterBySubject(filtered, subject);

    filtered.sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    const { data, pagination } = paginate(filtered, page, limit);

    return {
      success: true,
      data,
      pagination,
    };
  }

  /**
   * Lấy danh sách môn học của giảng viên
   */
  getTutorSubjects(tutorId) {
    const classes = this.classes.filter(
      (c) => c.tutorId === tutorId,
    );
    const subjectsMap = new Map();

    classes.forEach((c) => {
      if (!subjectsMap.has(c.subject)) {
        const codeMatch = String(c.classCode || '').match(
          /[A-Z]+\d+/,
        );
        subjectsMap.set(c.subject, {
          name: c.subject,
          code: codeMatch ? codeMatch[0] : 'N/A',
        });
      }
    });

    return Array.from(subjectsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  /**
   * Lấy các buổi học của một gia sư
   */
  getTutorSessions(tutorId) {
    return this.sessions.filter((s) => s.tutorId === tutorId);
  }

  /**
   * Tạo buổi học mới
   */
  createSession(sessionData) {
    const { tutorId, subject, date, time, room, description } =
      sessionData;

    const nextId =
      Math.max(0, ...this.sessions.map((s) => s.id)) + 1;

    const newSession = {
      id: nextId,
      tutorId,
      subject,
      date,
      time,
      room,
      description: description || '',
      status: 'Sắp diễn ra',
      materials: [],
      createdAt: new Date().toISOString(),
    };

    this.sessions.push(newSession);

    return {
      success: true,
      message: 'Buổi học đã được tạo thành công',
      data: newSession,
    };
  }

  /**
   * Cập nhật buổi học
   */
  updateSession(sessionId, updateData) {
    const idx = this.sessions.findIndex(
      (s) => s.id == sessionId,
    );
    if (idx === -1) {
      return {
        success: false,
        message: 'Buổi học không tồn tại',
      };
    }

    /**
     * Xóa buổi học
     * @param {number} sessionId - ID buổi học
     * @returns {Object} Kết quả xóa
     */
    // deleteSession(sessionId) {
    //     console.log(`[SessionController] Xóa buổi học ID: ${sessionId}`);
        
    //     const sessionIndex = this.sessions.findIndex(s => s.id == sessionId);
        
    //     if (sessionIndex === -1) {
    //         console.log(`-> Lỗi: Buổi học không tồn tại`);
    //         return {
    //             success: false,
    //             message: 'Buổi học không tồn tại'
    //         };
    //     }

    //     const deletedSession = this.sessions.splice(sessionIndex, 1)[0];
    //     console.log(`-> Xóa thành công buổi học: ${deletedSession.subject}`);
        
    //     return {
    //         success: true,
    //         message: 'Buổi học đã được xóa',
    //         data: deletedSession
    //     };
    // }
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
        console.log(`-> Xóa thành công buổi học (session): ${deletedSession.subject}`);

        // XÓA LUÔN record tương ứng trong this.classes (nếu có)
        const beforeLen = this.classes.length;
        this.classes = this.classes.filter(c => c.id != sessionId);
        const afterLen = this.classes.length;

        if (beforeLen !== afterLen) {
            console.log(`-> Đồng thời xóa lớp dạy có id = ${sessionId} khỏi classes`);
        }

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
      // Lấy danh sách buổi học có thể đăng ký (cho student)
    getAvailableClasses(filters = {}) {
        const { subject, format } = filters;

        return this.classes.filter(cls => {
        // chỉ lấy các buổi chưa kết thúc
        if (cls.status === 'Đã kết thúc') return false;

        if (subject && subject.trim()) {
            const s = subject.toLowerCase();
            const subName = (cls.subject || '').toLowerCase();
            if (!subName.includes(s)) return false;
        }

        if (format && format !== 'Any') {
            if ((cls.format || '').toLowerCase() !== format.toLowerCase()) {
            return false;
            }
        }

        return true;
        });
    }

    // Lấy danh sách buổi học mà 1 student đã tham gia
    getStudentJoinedClasses(studentId) {
        const joined = this.registrations.filter(r => r.studentId === studentId);
        const ids = joined.map(r => r.classId);

        return this.classes.filter(cls => ids.includes(cls.id));
    }

    // Student tham gia 1 lớp
    joinClass(studentId, classId) {
        console.log(`[SessionController] Student ${studentId} tham gia lớp ${classId}`);

        const cls = this.classes.find(c => c.id == classId);
        if (!cls) {
        return {
            success: false,
            message: 'Lớp học không tồn tại'
        };
        }

        // check đã đăng ký chưa
        const existed = this.registrations.find(
        r => r.studentId === studentId && r.classId == classId
        );
        if (existed) {
        return {
            success: false,
            message: 'Bạn đã tham gia buổi học này rồi'
        };
        }

        // check full lớp
        if (cls.capacity && cls.studentCount >= cls.capacity) {
        return {
            success: false,
            message: 'Buổi học đã đủ số lượng'
        };
        }

        const newRegId =
        this.registrations.length === 0
            ? 1
            : Math.max(...this.registrations.map(r => r.id)) + 1;

        const reg = {
        id: newRegId,
        studentId,
        classId: cls.id,
        joinedAt: new Date().toISOString()
        };

        this.registrations.push(reg);

        // tăng số lượng
        cls.studentCount = (cls.studentCount || 0) + 1;

        console.log('-> Tham gia thành công, tổng SV:', cls.studentCount);

        return {
        success: true,
        message: 'Đăng ký buổi học thành công',
        registration: reg,
        updatedClass: cls
        };
    }

}


// Khởi tạo Controller
const sessionController = new SessionController();

// =====================
// Định nghĩa routes
// =====================

/**
 * GET /my-sessions/:studentId
 */
router.get('/my-sessions/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      page = 1,
      limit = 6,
      sortBy = 'date',
      tutorId,
      subject,
    } = req.query;

    const result = sessionController.getStudentSessions(
      studentId,
      {
        page,
        limit,
        sortBy,
        tutorId: tutorId || null,
        subject: subject || null,
      },
    );

    res.json({
      success: result.success,
      count: result.sessions.length,
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('[Error] GET /my-sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học',
      error: error.message,
    });
  }
});

/**
 * GET /detail/:sessionId
 */
router.get('/detail/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionController.getSessionDetail(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Buổi học không tồn tại',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('[Error] GET /detail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết buổi học',
      error: error.message,
    });
  }
});

/**
 * POST /join/:sessionId
 */
router.post('/join/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu studentId',
      });
    }

    const result = sessionController.joinSession(
      studentId,
      sessionId,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[Error] POST /join:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi vào buổi học',
      error: error.message,
    });
  }
});

/**
 * GET /tutor/:tutorId
 * Các buổi học của gia sư
 */
router.get('/tutor/:tutorId', (req, res) => {
  try {
    const { tutorId } = req.params;
    const sessions = sessionController.getTutorSessions(tutorId);

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error('[Error] GET /tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy buổi học của gia sư',
      error: error.message,
    });
  }
});

/**
 * POST /create
 * Tạo buổi học mới
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
      error: error.message,
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
    const result = sessionController.updateSession(
      sessionId,
      req.body,
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[Error] PUT /:sessionId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật buổi học',
      error: error.message,
    });
  }
});

/**
 * PUT /:sessionId/feedback
 * Ghi hoặc cập nhật feedback cho một session (ghi đè vào server/dataBase/feedback.js)
 * Body: { studentId, criteria1, criteria2, criteria3, additionalComments }
 */
router.put('/:sessionId/feedback', (req, res) => {
    try {
        console.log('[Route] PUT /:sessionId/feedback called with params:', req.params, 'body:', req.body);
        const sessionId = parseInt(req.params.sessionId);
        const {
            studentId,
            criteria1 = false,
            criteria2 = false,
            criteria3 = false,
            additionalComments = ''
        } = req.body;

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Thiếu studentId' });
        }

        // Tính criteriaCount và lastUpdate
        const criteriaCount = [criteria1, criteria2, criteria3].filter(Boolean).length;
        const now = new Date();
        const lastUpdate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Tìm session để xác nhận tồn tại (không bắt buộc phải match studentId ở đây, nhưng có thể kiểm tra)
        const session = sessionController.getSessionDetail(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Buổi học không tồn tại' });
        }

        // Cập nhật hoặc thêm mới vào feedbackDB (in-memory)
        const existingIndex = feedbackDB.findIndex(f => f.sessionId === sessionId && f.studentId === studentId);
        const newRecord = {
            sessionId,
            studentId,
            criteria1: !!criteria1,
            criteria2: !!criteria2,
            criteria3: !!criteria3,
            additionalComments: additionalComments || '',
            criteriaCount,
            lastUpdate
        };

        if (existingIndex !== -1) {
            feedbackDB[existingIndex] = newRecord;
        } else {
            feedbackDB.push(newRecord);
        }

        // Delegate persistence to feedbackController
        try {
            const saved = feedbackController.saveFeedback(newRecord);
            // Cập nhật feedback trên đối tượng session trả về (in-memory)
            session.feedback = saved;
            res.json({ success: true, message: 'Feedback đã được lưu', data: saved });
        } catch (err) {
            console.error('[Error] saving feedback via feedbackController:', err.message);
            return res.status(500).json({ success: false, message: 'Lỗi khi lưu feedback', error: err.message });
        }
    } catch (error) {
        console.error('[Error] PUT /:sessionId/feedback:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lưu feedback', error: error.message });
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
      error: error.message,
    });
  }
});

/**
 * GET /tutors/:studentId
 * Danh sách tutors của sinh viên
 */
router.get('/tutors/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const tutors = sessionController.getStudentTutors(studentId);

    res.json({
      success: true,
      count: tutors.length,
      data: tutors,
    });
  } catch (error) {
    console.error('[Error] GET /tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tutors',
      error: error.message,
    });
  }
});

/**
 * GET /subjects/:studentId
 * Danh sách môn học của sinh viên
 */
router.get('/subjects/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const subjects = sessionController.getStudentSubjects(
      studentId,
    );

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error('[Error] GET /subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách môn học',
      error: error.message,
    });
  }
});

/**
 * GET /tutor-classes/:tutorId
 * Danh sách lớp học của giảng viên (có phân trang + lọc)
 */
router.get('/tutor-classes/:tutorId', (req, res) => {
  try {
    const { tutorId } = req.params;
    const { page = 1, limit = 6, subject = '' } = req.query;

    const result = sessionController.getTutorClasses(tutorId, {
      page,
      limit,
      subject,
    });

    res.json(result);
  } catch (error) {
    console.error(
      '[Error] GET /tutor-classes/:tutorId:',
      error,
    );
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lớp học',
      error: error.message,
    });
  }
});

/**
 * GET /tutor-subjects/:tutorId
 * Danh sách môn học của giảng viên
 */
router.get('/tutor-subjects/:tutorId', (req, res) => {
  try {
    const { tutorId } = req.params;
    const subjects = sessionController.getTutorSubjects(
      tutorId,
    );

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error(
      '[Error] GET /tutor-subjects/:tutorId',
      error,
    );
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách môn học',
      error: error.message,
    });
  }
});

/**
 * GET /api/sessions/:sessionId/attendance-list
 * Lấy danh sách điểm danh của một buổi học
 */
router.get(
  '/api/sessions/:sessionId/attendance-list',
  (req, res) => {
    try {
      const { sessionId } = req.params;
      const attendance =
        sessionController.getAttendanceList(sessionId);

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      console.error(
        '[Error] GET /api/sessions/:sessionId/attendance-list:',
        error,
      );
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách lớp điểm danh',
        error: error.message,
      });
    }
  },
);

router.get('/available-classes', (req, res) => {
  try {
    const { subject = '', format = '' } = req.query;
    const data = sessionController.getAvailableClasses({ subject, format });

    res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    console.error('[Error] GET /api/sessions/available-classes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học có thể đăng ký',
      error: error.message
    });
  }
});

/**
 * GET /api/sessions/student-classes/:studentId
 * Lấy danh sách buổi học mà student đã tham gia
 */
router.get('/student-classes/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const data = sessionController.getStudentJoinedClasses(studentId);

    res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    console.error('[Error] GET /api/sessions/student-classes/:studentId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học đã tham gia',
      error: error.message
    });
  }
});

/**
 * POST /api/sessions/join
 * body: { studentId, classId }
 */
router.post('/join', (req, res) => {
  try {
    const { studentId, classId } = req.body;
    const result = sessionController.joinClass(studentId, classId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[Error] POST /api/sessions/join:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng ký tham gia buổi học',
      error: error.message
    });
  }
});
module.exports = router;
