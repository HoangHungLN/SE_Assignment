// server/services/loginController/loginController.js
const express = require('express');
const router = express.Router();

// Import Adapter
const SSO_Adapter = require('../../integration/hcmutSSO');
const DataCore_Adapter = require('../../integration/hcmutDatacore');
// Import Database để thực hiện thao tác lưu (sync)
const UserDatabase = require('../../dataBase/users'); 

class LoginController {
    
    // [Theo Class Diagram - Ảnh 4]
    // - synsUserData(userID: string): void
    // Hàm này kiểm tra user có trong DB chưa, nếu chưa thì tạo mới từ DataCore
    synsUserData(userID) {
        console.log(`[Sync] Đang đồng bộ dữ liệu cho ID: ${userID}`);
        
        // 1. Kiểm tra trong DB nội bộ (UserDatabase)
        const localUser = UserDatabase.find(u => u.id === userID);

        if (localUser) {
            console.log("-> User đã tồn tại, cập nhật thời gian đăng nhập...");
            // Thực tế: Update last_login vào DB
            return localUser;
        } else {
            console.log("-> User mới, lấy từ DataCore...");
            // 2. Nếu chưa có, gọi DataCore lấy thông tin
            const dataCoreProfile = DataCore_Adapter.getUserProfile(userID);
            
            if (dataCoreProfile) {
                // 3. Lưu vào DB nội bộ (Mock: push vào mảng)
                UserDatabase.push(dataCoreProfile);
                console.log("-> Đã thêm user mới vào hệ thống.");
                return dataCoreProfile;
            }
        }
        return null;
    }

    // [Theo Class Diagram - Ảnh 2]
    // + handleSSOCallback(token: string): bool
    // Hàm này điều phối logic chính
    handleSSOCallback(token) {
        if (!token) return false;

        // 1. Từ token lấy UserID (Gọi SSO)
        const userID = SSO_Adapter.getUserID(token);
        if (!userID) return false;

        // 2. Đồng bộ dữ liệu (Gọi hàm private synsUserData)
        const userProfile = this.synsUserData(userID);

        // 3. Trả về kết quả (Thay vì lưu vào biến #currUser như diagram, ta trả về object để API dùng)
        if (userProfile) {
            return { success: true, user: userProfile };
        }
        return false;
    }
}

// Khởi tạo instance của Controller
const loginControllerInstance = new LoginController();

// --- ĐỊNH NGHĨA API ROUTE (Lớp giao tiếp HTTP) ---

router.post('/sso-callback', (req, res) => {
    const { username, password } = req.body;

    // Bước 1: Giả lập việc người dùng nhập User/Pass để lấy Token 
    // (Hàm authenticateUser của HCMUT_SSO)
    const token = SSO_Adapter.authenticateUser(username, password);

    if (!token) {
        return res.status(401).json({ success: false, message: "Sai thông tin đăng nhập" });
    }

    // Bước 2: Gọi vào Controller chính theo thiết kế
    const result = loginControllerInstance.handleSSOCallback(token);

    if (result && result.success) {
        return res.json({
            success: true,
            message: "Đăng nhập thành công",
            user: result.user,
            token: token
        });
    } else {
        return res.status(404).json({ success: false, message: "Lỗi đồng bộ dữ liệu người dùng" });
    }
});

module.exports = router;