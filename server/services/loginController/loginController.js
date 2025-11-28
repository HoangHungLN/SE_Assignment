// server/services/loginController/loginController.js
const express = require('express');
const router = express.Router();

const SSO_Adapter = require('../../integration/hcmutSSO');
const DataCore_Adapter = require('../../integration/hcmutDatacore');

const localUsersDB = require('../../dataBase/users'); 

class LoginController {
    
    syncUserData(userID) {
        console.log(`[Sync Process] Bắt đầu đồng bộ cho User ID: ${userID}`);
        
        const dataCoreProfile = DataCore_Adapter.getUserProfile(userID);
        
        if (!dataCoreProfile) {
            console.error(`[Sync Error] Không tìm thấy thông tin user ${userID} bên DataCore.`);
            return null;
        }

        // Bước 2: Kiểm tra xem user này đã có trong database local (users.js) chưa
        const existingUserIndex = localUsersDB.findIndex(u => u.id === userID);

        if (existingUserIndex !== -1) {
            //User ĐÃ tồn tại -> CẬP NHẬT (Update)
            console.log(`-> User cũ. Đang cập nhật thông tin mới nhất...`);
            
            localUsersDB[existingUserIndex] = {
                ...localUsersDB[existingUserIndex], // Giữ lại data cũ
                ...dataCoreProfile,                 // Ghi đè data mới từ trường
                lastLogin: new Date().toISOString() // Cập nhật thời gian đăng nhập
            };
            
            return localUsersDB[existingUserIndex];

        } else {
            //User CHƯA tồn tại -> THÊM MỚI (Insert)
            console.log(`-> User mới. Đang thêm vào Database...`);
            
            const newUser = {
                ...dataCoreProfile,
                firstLogin: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            localUsersDB.push(newUser);
            
            return newUser;
        }
    }

    handleSSOCallback(token) {
        if (!token) return { success: false, message: "Token không tồn tại" };

        const userID = SSO_Adapter.getUserID(token);
        if (!userID) {
            return { success: false, message: "Token không hợp lệ hoặc hết hạn" };
        }

        const userProfile = this.syncUserData(userID);

        if (userProfile) {
            return { success: true, user: userProfile };
        } else {
            return { success: false, message: "Không thể đồng bộ dữ liệu từ DataCore" };
        }
    }
}

const loginControllerInstance = new LoginController();

// --- API ROUTES ---

router.post('/sso-callback', (req, res) => {
    const { username, password } = req.body;

    console.log(`\n--- YÊU CẦU ĐĂNG NHẬP: ${username} ---`);

    const token = SSO_Adapter.authenticateUser(username, password);

    if (!token) {
        console.log(`[Auth Fail] Sai mật khẩu hoặc username.`);
        return res.status(401).json({ success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng." });
    }

    const result = loginControllerInstance.handleSSOCallback(token);

    if (result.success) {
        console.log(`[Auth Success] Đăng nhập thành công cho: ${result.user.name}`);
        console.log(`[DB Status] Tổng số user trong hệ thống hiện tại: ${localUsersDB.length}`);
        
        return res.json({
            success: true,
            message: "Đăng nhập thành công",
            token: token,       // Trả token về cho Client lưu vào localStorage
            user: result.user   // Trả thông tin user về cho Client hiển thị
        });
    } else {
        console.log(`[Auth Fail] Lỗi hệ thống: ${result.message}`);
        return res.status(404).json({ success: false, message: result.message });
    }
});

module.exports = router;