// server/services/learningController/feedbackController.js
const fs = require('fs');
const path = require('path');

const feedbackFilePath = path.join(__dirname, '..', '..', 'dataBase', 'feedback.js');

// Helper: load current feedback DB (require cache may be stale, read file)
function loadFeedbackFromFile() {
    try {
        // Require cache unsafe for writes; read file and eval module.exports
        const raw = fs.readFileSync(feedbackFilePath, 'utf8');
        // file has form: module.exports = [ ... ];
        const idx = raw.indexOf('=');
        if (idx === -1) return [];
        const jsonPart = raw.slice(idx + 1).trim();
        // Remove trailing semicolon if present
        const cleaned = jsonPart.endsWith(';') ? jsonPart.slice(0, -1) : jsonPart;
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('[FeedbackController] Không thể đọc file feedback:', err.message);
        return [];
    }
}

// Helper: persist feedback array to file (module.exports = ...)
function writeFeedbackToFile(arr) {
    try {
        const fileContent = 'module.exports = ' + JSON.stringify(arr, null, 4) + ';\n';
        fs.writeFileSync(feedbackFilePath, fileContent, 'utf8');
        return true;
    } catch (err) {
        console.error('[FeedbackController] Lỗi ghi file feedback:', err.message);
        throw err;
    }
}

/**
 * Save (upsert) feedback record and persist to file
 * @param {Object} record - { sessionId, studentId, criteria1, criteria2, criteria3, additionalComments, criteriaCount, lastUpdate }
 * @returns {Object} saved record
 */
function saveFeedback(record) {
    if (!record || !record.sessionId || !record.studentId) {
        throw new Error('Thiếu sessionId hoặc studentId');
    }

    const arr = loadFeedbackFromFile();

    const idx = arr.findIndex(f => f.sessionId === record.sessionId && f.studentId === record.studentId);
    if (idx !== -1) {
        arr[idx] = record;
    } else {
        arr.push(record);
    }

    writeFeedbackToFile(arr);
    return record;
}

module.exports = {
    saveFeedback,
    loadFeedbackFromFile,
    writeFeedbackToFile
};
