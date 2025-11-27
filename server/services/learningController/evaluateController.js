// server/services/LearningController/evaluateController.js

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../../middleware/authMiddleware');

// Import database giả lập từ folder "database"
const { EVALUATIONS_DB } = require('../../dataBase/evaluate');

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

// ... phần router.get('/search' ...) và router.get('/progress' ...) giữ nguyên ...

const STUDENT_PROGRESS_DB = [
    { stt: 1, name: "Nguyễn Anh A", mssv: "7654321", registered: 10, attended: 1, percent: 10 },
    { stt: 2, name: "Trần Thị B", mssv: "7654322", registered: 10, attended: 10, percent: 100 },
    { stt: 3, name: "Lương Văn D", mssv: "7654325", registered: 6, attended: 6, percent: 100 },
    { stt: 4, name: "Thạch Ngọc E", mssv: "7654327", registered: 3, attended: 2, percent: 67 },
    { stt: 5, name: "Thái sơn", mssv: "7659994", registered: 15, attended: 15, percent: 100 },
];


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
router.get('/progress', verifyToken, requireRole(['admin', 'tutor']), (req, res) => {
    const results = evaluateController.getAllStudentProgress();
    res.json({ success: true, data: results });
    // console.log("abcdeadaskasjjjjjjjjjjjj");
});

module.exports = router;