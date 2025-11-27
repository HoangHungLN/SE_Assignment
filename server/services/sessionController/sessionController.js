// server/services/sessionController/sessionController.js
const express = require('express');
const router = express.Router();

// Import data từ file session.js
const { sessions, classes, enrollments } = require('../../dataBase/session');

// =====================
// Helper & cấu hình chung
// =====================

const SUBJECT_CODE_MAP = {
  'Giải Tích 1': 'MA001',
  'Kỹ thuật lập trình': 'CO1027',
  'Cấu trúc dữ liệu và Giải thuật': 'CO2001',
  'Giải Tích 2': 'MA002',
  'Đại số tuyến tính': 'MA003',
  'Lập trình hướng đối tượng': 'CO1009',
  'Cơ sở dữ liệu': 'CO2005',
  'Hệ điều hành': 'CO1019',
  'Mạng máy tính': 'CO1013',
  'Kiến trúc Máy tính': 'CO2007',
};

// Lọc theo tên môn học (subject) nếu có
function filterBySubject(list, subject) {
  if (!subject || !subject.trim()) return list;

  const searchTerm = subject.toLowerCase().trim();
  return list.filter(
    (item) =>
      item.subject &&
      item.subject.toLowerCase().includes(searchTerm),
  );
}

// Phân trang đơn giản cho 1 mảng
function paginate(list, page = 1, limit = 6) {
  const safeLimit = parseInt(limit, 10) || 6;
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const currentPage = Math.min(
    Math.max(parseInt(page, 10) || 1, 1),
    totalPages,
  );

  const startIndex = (currentPage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;

  return {
    data: list.slice(startIndex, endIndex),
    pagination: {
      page: currentPage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
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

    filtered = filterBySubject(filtered, subject);

    if (sortBy === 'date') {
      filtered.sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
    } else if (sortBy === 'subject') {
      filtered.sort((a, b) =>
        String(a.subject).localeCompare(String(b.subject)),
      );
    } else if (sortBy === 'tutor') {
      filtered.sort((a, b) => {
        const nameA = String(a.tutor || '').split(' ').pop();
        const nameB = String(b.tutor || '').split(' ').pop();
        return nameA.localeCompare(nameB);
      });
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

    const alreadyJoined = this.enrollments.find(
      (e) =>
        e.studentId === studentId && e.sessionId === sessionId,
    );
    if (alreadyJoined) {
      return {
        success: false,
        message: 'Bạn đã tham gia buổi học này rồi',
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

    this.sessions[idx] = {
      ...this.sessions[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Buổi học đã được cập nhật',
      data: this.sessions[idx],
    };
  }

  /**
   * Xóa buổi học
   */
  deleteSession(sessionId) {
    const idx = this.sessions.findIndex(
      (s) => s.id == sessionId,
    );
    if (idx === -1) {
      return {
        success: false,
        message: 'Buổi học không tồn tại',
      };
    }

    const deleted = this.sessions.splice(idx, 1)[0];

    return {
      success: true,
      message: 'Buổi học đã được xóa',
      data: deleted,
    };
  }

  /**
   * Lấy danh sách điểm danh (hiện đang dùng dữ liệu mẫu)
   */
  getAttendanceList(sessionId) {
    // TODO: sau này có thể thay bằng dữ liệu thật theo sessionId
    const attendanceListSample = [
      {
        id: 1,
        name: 'Nguyễn A',
        mssv: '2196542',
        lop: 'MT21KTTN',
        email: 'abcdef@hcmut.edu.vn',
        present: true,
      },
      {
        id: 2,
        name: 'Trần Quang B',
        mssv: '2213654',
        lop: 'MT22KTT',
        email: 'abcfqef@hcmut.edu.vn',
        present: true,
      },
      {
        id: 3,
        name: 'Thái Thị C',
        mssv: '2310166',
        lop: 'MT23KTT',
        email: 'abcwvf@hcmut.edu.vn',
        present: true,
      },
      {
        id: 4,
        name: 'Lương Ngọc Thảo D',
        mssv: '2310007',
        lop: 'MT23KTT',
        email: 'avewcwef@hcmut.edu.vn',
        present: false,
      },
      {
        id: 5,
        name: 'Võ Quang H',
        mssv: '2345678',
        lop: 'MT23KTT',
        email: 'sieudz@hcmut.edu.vn',
        present: false,
      },
    ];

    return {
      sessionId,
      attendanceList: attendanceListSample,
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

module.exports = router;
