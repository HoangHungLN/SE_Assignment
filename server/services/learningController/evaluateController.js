// server/services/learningController/evaluateController.js
const express = require('express');
const router = express.Router();

const participationResults = require('../../dataBase/participationResult');
let { EVALUATIONS_DB } = require('../../dataBase/evaluate'); 

class EvaluateController {
    
    searchEvaluation() {
        return EVALUATIONS_DB;
    }

    getEvaluationBySession(sessionId) {
        const record = EVALUATIONS_DB.find(e => e.id == sessionId);
        if (record) {
            return record.details;
        }
        return participationResults.map((s, index) => ({
            stt: index + 1,
            studentId: s.mssv,
            name: s.name,
            mssv: s.mssv,
            passed: false,
            comment: ""
        }));
    }

    saveEvaluation(sessionId, details) {
        const index = EVALUATIONS_DB.findIndex(e => e.id == sessionId);
        
        if (index !== -1) {
            EVALUATIONS_DB[index].details = details;
            const passedCount = details.filter(d => d.passed).length;
            EVALUATIONS_DB[index].attendance = Math.round((passedCount / details.length) * 100); 
        } else {
            const passedCount = details.filter(d => d.passed).length;
            const newRecord = {
                id: parseInt(sessionId),
                tutorName: "Giảng viên (Current)",
                subject: "Môn học (Current)",
                date: new Date().toLocaleDateString('vi-VN'),
                time: "Current",
                attendance: Math.round((passedCount / details.length) * 100),
                status: "Đạt",
                details: details
            };
            EVALUATIONS_DB.push(newRecord);
        }
        return true;
    }

    getAllStudentProgress() {
        return participationResults;
    }
}

const evaluateController = new EvaluateController();

// --- API ROUTES ---

router.get('/search', (req, res) => {
    const filters = req.query;
    const results = evaluateController.searchEvaluation(filters);
    res.json({ success: true, data: results });
});

router.get('/progress', (req, res) => {
    try {
        const results = evaluateController.getAllStudentProgress();
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});

router.get('/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const data = evaluateController.getEvaluationBySession(sessionId);
    res.json({ success: true, data: data });
});

router.post('/save', (req, res) => {
    const { sessionId, details } = req.body;
    evaluateController.saveEvaluation(sessionId, details);
    res.json({ success: true, message: "Lưu thành công" });
});

module.exports = router;