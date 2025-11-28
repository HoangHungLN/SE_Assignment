// server/services/sessionController/sessionController.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Feedback mock DB + controller
const feedbackDB = require('../../dataBase/feedback');
const feedbackController = require('../learningController/feedbackController');

// Lấy mock data từ database/session.js (sessions + classes)
const {
  sessions: initialSessions,
  classes: initialClasses,
} = require('../../dataBase/session');

// Helper: load materials from database file
function loadMaterialsFromFile() {
  try {
    const materialFilePath = path.join(__dirname, '..', '..', 'dataBase', 'material.js');
    const raw = fs.readFileSync(materialFilePath, 'utf8');
    const idx = raw.indexOf('=');
    if (idx === -1) return [];
    const jsonPart = raw.slice(idx + 1).trim();
    const cleaned = jsonPart.endsWith(';') ? jsonPart.slice(0, -1) : jsonPart;
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[SessionController] Lỗi load file material:', err.message);
    return [];
  }
}

// ========== Helpers ==========

function paginate(list, page = 1, limit = 10) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 1, 1);
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / l));
  const currentPage = Math.min(p, totalPages);
  const start = (currentPage - 1) * l;
  const data = list.slice(start, start + l);

  return {
    data,
    pagination: {
      page: currentPage,
      limit: l,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
}

function filterBySubject(list, subject) {
  if (!subject || !subject.trim()) return list;
  const term = subject.toLowerCase().trim();
  return list.filter((item) =>
    (item.subject || '').toLowerCase().includes(term),
  );
}

const SUBJECT_CODE_MAP = {
  'Giải Tích 1': 'MA1001',
  'Giải Tích 2': 'MA1002',
  'Đại số tuyến tính': 'MA2001',
  'Kỹ thuật lập trình': 'CO1027',
  'Cấu trúc dữ liệu và Giải thuật': 'CO2003',
  'Lập trình hướng đối tượng': 'CO3001',
  'Cơ sở dữ liệu': 'CO3025',
  'Hệ điều hành': 'CO3011',
  'Mạng máy tính': 'CO3043',
  'Trí tuệ nhân tạo': 'CO4012',
  'Công nghệ phần mềm': 'CO3002',
};

// ========== Controller ==========

class SessionController {
  constructor() {
    // clone để nếu có create/delete thì chỉ thay đổi in-memory
    this.sessions = [...initialSessions];
    this.classes = [...initialClasses];

    // Load materials from file and merge with sessions
    const materialsDB = loadMaterialsFromFile();
    this.sessions.forEach(session => {
      const materialRecord = materialsDB.find(m => m.sessionId === session.id);
      if (materialRecord) {
        session.materials = materialRecord.materials;
      }
    });

    // enroll theo session (MySession cũ – nếu cần)
    this.enrollments = [];

    // join theo class (JoinSession)
    this.registrations = [
      {
        id: 10,
        studentId: 'SV01',
        classId: 1,
        joinedAt: '2025-10-06T16:05:00.000Z',
      },
    ];
  }

  // ===== Feedback =====
  getFeedback(sessionId, studentId) {
    try {
      const arr = feedbackController.loadFeedbackFromFile();
      if (!Array.isArray(arr)) return null;
      return (
        arr.find(
          (f) => f.sessionId === sessionId && f.studentId === studentId,
        ) || null
      );
    } catch (err) {
      console.error(
        '[SessionController] Lỗi khi load feedback từ file:',
        err.message,
      );
      return null;
    }
  }

  // ===== MySession (theo sessions DB) =====

  getStudentSessions(studentId, options = {}) {
    const {
      page = 1,
      limit = 6,
      sortBy = 'date',
      tutorId = null,
      subject = null,
    } = options;

    console.log(
      `[SessionController] Lấy buổi học cho sinh viên: ${studentId}`,
    );
    console.log('-> Options:', { page, limit, sortBy, tutorId, subject });

    let filtered = this.sessions.filter((s) => s.studentId === studentId);

    if (tutorId) {
      filtered = filtered.filter((s) => s.tutorId === tutorId);
    }

    if (subject && subject.trim()) {
      const term = subject.toLowerCase().trim();
      filtered = filtered.filter((s) =>
        (s.subject || '').toLowerCase().includes(term),
      );
    }

    if (sortBy === 'subject') {
      filtered.sort((a, b) =>
        (a.subject || '').localeCompare(b.subject || ''),
      );
    } else if (sortBy === 'tutor') {
      filtered.sort((a, b) => {
        const nameA = (a.tutor || '').split(' ').pop();
        const nameB = (b.tutor || '').split(' ').pop();
        return nameA.localeCompare(nameB);
      });
    } else {
      filtered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }

    const { data, pagination } = paginate(filtered, page, limit);

    const withFeedback = data.map((s) => ({
      ...s,
      feedback: this.getFeedback(s.id, s.studentId),
    }));

    console.log(
      `-> Tìm thấy ${filtered.length} buổi học, trang ${pagination.page}/${pagination.totalPages}`,
    );

    return {
      success: true,
      sessions: withFeedback,
      pagination,
    };
  }

  getSessionDetail(sessionId) {
    console.log(
      `[SessionController] Lấy chi tiết buổi học ID: ${sessionId}`,
    );

    const session = this.sessions.find((s) => s.id == sessionId);

    if (session) {
      console.log('-> Tìm thấy buổi học:', session.subject);
      session.feedback = this.getFeedback(session.id, session.studentId);
    } else {
      console.log('-> Không tìm thấy buổi học');
    }

    return session || null;
  }

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

  joinSession(studentId, sessionId) {
    const session = this.sessions.find((s) => s.id == sessionId);
    if (!session) {
      return {
        success: false,
        message: 'Buổi học không tồn tại',
      };
    }

    if (session.status && session.status !== 'Sắp diễn ra') {
      return {
        success: false,
        message: `Buổi học này không thể tham gia (${session.status})`,
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

  getAllSessions() {
    return this.sessions;
  }

  // ===== Tutor: classes (RegisterTeaching + JoinSession) =====

  getTutorClasses(tutorId, options = {}) {
    const { page = 1, limit = 6, subject = '' } = options;

    let filtered = this.classes.filter((c) => c.tutorId === tutorId);
    filtered = filterBySubject(filtered, subject);

    filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const { data, pagination } = paginate(filtered, page, limit);

    return {
      success: true,
      data,
      pagination,
    };
  }

  getTutorSubjects(tutorId) {
    const classes = this.classes.filter((c) => c.tutorId === tutorId);
    const subjectsMap = new Map();

    classes.forEach((c) => {
      if (!subjectsMap.has(c.subject)) {
        const codeMatch = String(c.classCode || '').match(/[A-Z]+\d+/);
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

  getTutorSessions(tutorId) {
    return this.sessions.filter((s) => s.tutorId === tutorId);
  }

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
      capacity,
    } = sessionData;

    console.log('[SessionController] Tạo buổi học mới:', subject);

    const nextSessionId =
      this.sessions.length === 0
        ? 1
        : Math.max(...this.sessions.map((s) => s.id)) + 1;

    const newSession = {
      id: nextSessionId,
      tutorId,
      subject,
      date,
      time,
      room,
      description: description || '',
      status: 'Sắp diễn ra',
      materials: [],
      capacity: capacity || null,
      createdAt: new Date().toISOString(),
    };

    this.sessions.push(newSession);
    console.log('-> Buổi học (session) ID:', newSession.id);

    const newClass = {
      id: nextSessionId,
      tutorId,
      className: description || `Buổi dạy: ${subject}`,
      classCode: '',
      subject,
      date,
      time,
      description: description || '',
      format: format || 'Không có',
      location: room || '',
      onlineLink: onlineLink || null,
      status: 'Sắp diễn ra',
      studentCount: 0,
      capacity: capacity || null,
    };

    this.classes.push(newClass);
    console.log('-> Lớp (class) ID:', newClass.id);

    return {
      success: true,
      message: 'Buổi học đã được tạo thành công',
      data: newSession,
      class: newClass,
    };
  }

  updateSession(sessionId, updateData) {
    const idx = this.sessions.findIndex((s) => s.id == sessionId);
    if (idx === -1) {
      return {
        success: false,
        message: 'Buổi học không tồn tại',
      };
    }

    this.sessions[idx] = {
      ...this.sessions[idx],
      ...updateData,
    };

    return {
      success: true,
      message: 'Cập nhật buổi học thành công',
      data: this.sessions[idx],
    };
  }

  deleteSession(sessionId) {
    console.log('[SessionController] Xóa buổi học ID:', sessionId);

    const idx = this.sessions.findIndex((s) => s.id == sessionId);
    if (idx === -1) {
      console.log('-> Lỗi: Buổi học không tồn tại');
      return {
        success: false,
        message: 'Buổi học không tồn tại',
      };
    }

    const deletedSession = this.sessions.splice(idx, 1)[0];
    console.log('-> Xóa session:', deletedSession.subject);

    const beforeLen = this.classes.length;
    this.classes = this.classes.filter((c) => c.id != sessionId);
    const afterLen = this.classes.length;
    if (beforeLen !== afterLen) {
      console.log(
        '-> Đồng thời xóa lớp dạy có id =',
        sessionId,
        'khỏi classes',
      );
    }

    return {
      success: true,
      message: 'Buổi học đã được xóa',
      data: deletedSession,
    };
  }

  // ===== Attendance mẫu =====
  getAttendanceList(sessionId) {
    console.log(
      '[SessionController] Lấy danh sách lớp điểm danh cho buổi học ID:',
      sessionId,
    );

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

  // ===== JoinSession (theo classes) =====

  getAvailableClasses(filters = {}) {
    const { subject, format } = filters;

    return this.classes.filter((cls) => {
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

  getStudentJoinedClasses(studentId) {
    const joined = this.registrations.filter(
      (r) => r.studentId === studentId,
    );
    const ids = joined.map((r) => r.classId);

    return this.classes.filter((cls) => ids.includes(cls.id));
  }

// Student tham gia 1 lớp
  joinClass(studentId, classId) {
    console.log(`[SessionController] Student ${studentId} tham gia lớp ${classId}`);

    const cls = this.classes.find(c => c.id == classId);
    if (!cls) {
      return {
        success: false,
        message: 'Lớp học không tồn tại',
      };
    }

    // kiểm tra đã đăng ký chưa
    const existed = this.registrations.find(
      r => r.studentId === studentId && r.classId == classId
    );
    if (existed) {
      return {
        success: false,
        message: 'Bạn đã tham gia buổi học này rồi',
      };
    }

    // kiểm tra full lớp
    if (cls.capacity && cls.studentCount >= cls.capacity) {
      return {
        success: false,
        message: 'Buổi học đã đủ số lượng',
      };
    }

    const newRegId =
      this.registrations.length === 0
        ? 1
        : Math.max(...this.registrations.map(r => r.id)) + 1;

    const joinedAt = new Date().toISOString();

    const reg = {
      id: newRegId,
      studentId,
      classId: cls.id,
      joinedAt,
    };

    this.registrations.push(reg);

    // tăng số lượng sinh viên
    cls.studentCount = (cls.studentCount || 0) + 1;

    // 🔹 QUAN TRỌNG: thêm 1 session mới cho student này,
    // để màn "Buổi học của tôi" (MySession) nhìn thấy.
    const nextSessionId =
      this.sessions.length === 0
        ? 1
        : Math.max(...this.sessions.map(s => s.id)) + 1;

    this.sessions.push({
      id: nextSessionId,
      studentId,
      subject: cls.subject,
      tutor: cls.tutor,
      tutorId: cls.tutorId,
      time: cls.time,                // dùng luôn format giờ của class
      date: cls.date,
      status: cls.status || 'Sắp diễn ra',
      room: cls.location,
      description: cls.description,
      materials: [],
      attendanceRequested: false,
      isAttended: false,
    });

    console.log('-> Tham gia thành công, tổng SV:', cls.studentCount);

    return {
      success: true,
      message: 'Đăng ký buổi học thành công',
      registration: reg,
      updatedClass: cls,
    };
  }

}

// ========== Init ==========

const sessionController = new SessionController();

// ========== Routes ==========

// MySession – list
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

    const result = sessionController.getStudentSessions(studentId, {
      page,
      limit,
      sortBy,
      tutorId: tutorId || null,
      subject: subject || null,
    });

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

// MySession – detail
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

// MySession – join by sessionId
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

    const result = sessionController.joinSession(studentId, sessionId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[Error] POST /join/:sessionId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi vào buổi học',
      error: error.message,
    });
  }
});

// Tutor – sessions (optional)
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

// Tutor – create session
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

// Tutor – update session
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
      error: error.message,
    });
  }
});

// MySession – feedback
router.put('/:sessionId/feedback', (req, res) => {
  try {
    console.log(
      '[Route] PUT /:sessionId/feedback called with params:',
      req.params,
      'body:',
      req.body,
    );
    const sessionId = parseInt(req.params.sessionId, 10);
    const {
      studentId,
      criteria1 = false,
      criteria2 = false,
      criteria3 = false,
      additionalComments = '',
    } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu studentId',
      });
    }

    const criteriaCount = [criteria1, criteria2, criteria3].filter(
      Boolean,
    ).length;
    const now = new Date();
    const lastUpdate = `${String(now.getDate()).padStart(
      2,
      '0',
    )}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(
      now.getHours(),
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const session = sessionController.getSessionDetail(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Buổi học không tồn tại',
      });
    }

    const existingIndex = feedbackDB.findIndex(
      (f) => f.sessionId === sessionId && f.studentId === studentId,
    );
    const newRecord = {
      sessionId,
      studentId,
      criteria1: !!criteria1,
      criteria2: !!criteria2,
      criteria3: !!criteria3,
      additionalComments: additionalComments || '',
      criteriaCount,
      lastUpdate,
    };

    if (existingIndex !== -1) {
      feedbackDB[existingIndex] = newRecord;
    } else {
      feedbackDB.push(newRecord);
    }

    try {
      const saved = feedbackController.saveFeedback(newRecord);
      session.feedback = saved;
      res.json({
        success: true,
        message: 'Feedback đã được lưu',
        data: saved,
      });
    } catch (err) {
      console.error(
        '[Error] saving feedback via feedbackController:',
        err.message,
      );
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lưu feedback',
        error: err.message,
      });
    }
  } catch (error) {
    console.error('[Error] PUT /:sessionId/feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu feedback',
      error: error.message,
    });
  }
});

// Tutor – delete session
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

// MySession – tutors
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

// MySession – subjects
router.get('/subjects/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const subjects = sessionController.getStudentSubjects(studentId);

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

// Tutor – classes
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
    console.error('[Error] GET /tutor-classes/:tutorId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lớp học',
      error: error.message,
    });
  }
});

// Tutor – subjects
router.get('/tutor-subjects/:tutorId', (req, res) => {
  try {
    const { tutorId } = req.params;
    const subjects = sessionController.getTutorSubjects(tutorId);

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error('[Error] GET /tutor-subjects/:tutorId', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách môn học',
      error: error.message,
    });
  }
});

// Attendance
router.get('/:sessionId/attendance-list', (req, res) => {
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
      '[Error] GET /:sessionId/attendance-list:',
      error,
    );
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lớp điểm danh',
      error: error.message,
    });
  }
});

// JoinSession – list available classes
router.get('/available-classes', (req, res) => {
  try {
    const { subject = '', format = '' } = req.query;
    const data = sessionController.getAvailableClasses({
      subject,
      format,
    });

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error('[Error] GET /available-classes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học có thể đăng ký',
      error: error.message,
    });
  }
});

// JoinSession – classes đã tham gia
router.get('/student-classes/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const data =
      sessionController.getStudentJoinedClasses(studentId);

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error(
      '[Error] GET /student-classes/:studentId:',
      error,
    );
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách buổi học đã tham gia',
      error: error.message,
    });
  }
});

// JoinSession – join by classId
router.post('/join', (req, res) => {
  try {
    const { studentId, classId } = req.body;
    const result = sessionController.joinClass(
      studentId,
      classId,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[Error] POST /join:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng ký tham gia buổi học',
      error: error.message,
    });
  }
});

// Export both router and sessionController
module.exports = router;
module.exports.sessionController = sessionController;
