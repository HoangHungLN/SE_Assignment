// server/integration/hcmutDatacore.js

// ĐÂY LÀ DỮ LIỆU GIẢ LẬP CỦA TRƯỜNG (BÊN NGOÀI HỆ THỐNG)
// Hệ thống Tutor không được quyền sửa đổi trực tiếp dữ liệu này
const DATACORE_USERS = [
    {
        id: "2311327", 
        name: "Lại Nguyễn Hoàng Hưng",
        email: "hung.lai@hcmut.edu.vn",
        role: "student",
        faculty: "Khoa học và Kỹ thuật Máy tính",
        avatar: "https://via.placeholder.com/150",
        gpa: 3.8
    },
    {
        id: "2311746",
        name: "Nguyễn Thái Sơn",
        email: "hohoho@hcmut.edu.vn",
        role: "student",
        faculty: "Khoa học và Kỹ thuật Máy tính",
        avatar: "https://via.placeholder.com/150",
        gpa: 3.5
    },
    {
        id: "GV001", 
        name: "Nguyễn Văn H",
        email: "h.nguyenvan@hcmut.edu.vn",
        role: "tutor",
        faculty: "Khoa học và Kỹ thuật Máy tính",
        major: "Khoa học máy tính",
        avatar: "https://via.placeholder.com/150",
        degree: "PhD"
    },
    {
        id: "GV002", 
        name: "Trần Tốt Ngiệp",
        email: "tot.nghiep@hcmut.edu.vn",
        role: "tutor",
        faculty: "Khoa học và Kỹ thuật Máy tính",
        major: "Kỹ thuật máy tính",
        avatar: "https://via.placeholder.com/150",
        degree: "PhD"
    },
    {
        id: "ADMIN01",
        name: "Quản trị viên",
        email: "admin@hcmut.edu.vn",
        role: "admin",
        faculty: "P. Đào tạo",
        avatar: "https://via.placeholder.com/150"
    }
];

class HCMUT_DATACORE {
    getUserProfile(userID) {
        console.log(`[DataCore External] Đang nhận yêu cầu lấy tin cho ID: ${userID}`);
        
        const user = DATACORE_USERS.find(u => u.id === userID);
        
        if (user) {
            console.log(`[DataCore External] Tìm thấy sinh viên: ${user.name}`);
            return user; 
        } else {
            console.log(`[DataCore External] Không tìm thấy ID này trong hồ sơ trường.`);
            return null;
        }
    }
}

module.exports = new HCMUT_DATACORE();