// server/database/evaluateDatabase.js

// Đây là “database” giả lập cho các buổi đánh giá Tutor
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

// Export để controller có thể dùng
module.exports = {
    EVALUATIONS_DB,
};
