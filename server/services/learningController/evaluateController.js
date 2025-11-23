// server/services/LearningController/evaluateController.js
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../../middleware/authMiddleware');

// --- DỮ LIỆU GIẢ LẬP (DATABASE) ---
// Thực tế dữ liệu này sẽ nằm trong EvaluateDatabase và SessionDatabase
const EVALUATIONS_DB = [
    {
        id: 1,
        tutorName: "Phương Mỹ C",
        subject: "Kiến trúc Máy Tính",
        date: "06-10-2025",
        time: "6-8",
        attendance: 87,
        passRate: 80,
        status: "Đạt",
        details: [
            { stt: 1, name: "Nguyễn Anh A", mssv: "2196452", comment: "Nắm bài rất tốt, giải được bài tập thêm" },
            { stt: 2, name: "Trần Quang B", mssv: "2213654", comment: "Không có dữ liệu" },
            { stt: 3, name: "Thái Thị C", mssv: "2310166", comment: "Yếu, chưa nắm bắt được Data Hazard" }
        ]
    }
];

const STUDENT_PROGRESS_DB = [
    { stt: 1, name: "Nguyễn Anh A", mssv: "7654321", registered: 10, attended: 1, percent: 10 },
    { stt: 2, name: "Trần Thị B", mssv: "7654322", registered: 10, attended: 10, percent: 100 },
    { stt: 3, name: "Lương Văn D", mssv: "7654325", registered: 6, attended: 6, percent: 100 },
    { stt: 4, name: "Thạch Ngọc E", mssv: "7654327", registered: 3, attended: 2, percent: 67 },
    { stt: 5, name: "Đỗ Bách K", mssv: "7659994", registered: 15, attended: 15, percent: 100 },
];

class EvaluateController {
    
    // [Method in Class Diagram]: + searchEvaluation(key: map): List<Evaluation>
    // Dùng để phục vụ tính năng "Xem đánh giá của Tutor"
    searchEvaluation(filters) {
        console.log("[EvaluateController] Searching evaluations with filter:", filters);
        // Logic lọc dữ liệu (Ở đây trả về hết cho MVP)
        return EVALUATIONS_DB;
    }

    // [Logic derived from EvaluateDatabase]: + getStudentProgress(studentID)
    // Dùng để phục vụ tính năng "Xem kết quả tham gia"
    getAllStudentProgress() {
        console.log("[EvaluateController] Getting all student progress");
        return STUDENT_PROGRESS_DB;
    }
}

// Khởi tạo Instance
const evaluateController = new EvaluateController();

// --- API ROUTES ---

// 1. API: Tìm kiếm đánh giá (Mapping với searchEvaluation)
router.get('/search', verifyToken, requireRole('admin'), (req, res) => {
    const filters = req.query; // Lấy tham số từ URL (?subject=..., ?tutor=...)
    const results = evaluateController.searchEvaluation(filters);
    res.json({ success: true, data: results });
});

// 2. API: Xem tiến độ/kết quả tham gia
router.get('/progress', verifyToken, requireRole('admin'), (req, res) => {
    const results = evaluateController.getAllStudentProgress();
    res.json({ success: true, data: results });
});

module.exports = router;