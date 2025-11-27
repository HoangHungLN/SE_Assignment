// server/middleware/authMiddleware.js
const SSO_Adapter = require('../integration/hcmutSSO');
const DataCore_Adapter = require('../integration/hcmutDATACORE');

// 1. Xác thực: Kiểm tra Token
const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ success: false, message: "Chưa đăng nhập" });
    
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) return res.status(403).json({ success: false, message: "Chưa đăng nhập" });

    const userID = SSO_Adapter.getUserID(token);
    if (!userID) return res.status(401).json({ success: false, message: "Token không hợp lệ" });

    // Lấy thông tin user để các hàm sau sử dụng
    const user = DataCore_Adapter.getUserProfile(userID);
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại" });

    req.currentUser = user; // Gắn user vào request
    next();
};

// 2. Phân quyền: Kiểm tra Role
const requireRole = (roles) => {
    const allowed = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
        if (!allowed.includes(req.currentUser.role)) {
        return res.status(403).json({ success:false, message:`...` });
        }
    next();
    };
};


module.exports = { verifyToken, requireRole };