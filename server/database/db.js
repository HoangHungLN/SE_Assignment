// server/artifacts/db.js
const db = {
    // Schema Users
    users: [
        { userID: "SV01", name: "Nguyễn Thái Sơn", role: "student" },
        { userID: "GV01", name: "Nguyễn Văn H", role: "tutor" }
    ],
    // Schema Groups
    groups: [
        {
            groupID: "G001",
            subject: "Cấu trúc dữ liệu (CO2015)",
            description: "Cần tìm tutor hướng dẫn BTL",
            status: "Đang chờ hướng dẫn",
            maxMembers: 5,
            currentMembers: 1,
            members: ["SV01"]
        }
    ],
    // Schema Sessions
    sessions: []
};

module.exports = db;