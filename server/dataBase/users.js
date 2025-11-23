// // server/database/user.js
// const users = [
//     {
//         id: "2311327", 
//         name: "Lại Nguyễn Hoàng Hưng",
//         email: "hung.lai@hcmut.edu.vn",
//         role: "student",
//         faculty: "Khoa học và Kỹ thuật Máy tính",
//         avatar: "https://via.placeholder.com/150"
//     },
//     {
//         id: "GV001", 
//         name: "Nguyễn Văn H",
//         email: "h.nguyenvan@hcmut.edu.vn",
//         role: "tutor",
//         faculty: "Khoa học và Kỹ thuật Máy tính",
//         major: "Khoa học máy tính",
//         avatar: "https://via.placeholder.com/150"
//     },
//     {
//         id: "ADMIN01",
//         name: "Quản trị viên",
//         email: "admin@hcmut.edu.vn",
//         role: "admin",
//         faculty: "P. Đào tạo",
//         avatar: "https://via.placeholder.com/150"
//     }
// ];

// server/database/user.js

// Ban đầu hệ thống Tutor chưa có ai cả (trừ khi bạn muốn seed data sẵn)
// Chúng ta để rỗng để test tính năng Sync từ DataCore
const localUsers = [];

module.exports = localUsers;

// module.exports = users;