class HCMUT_SSO {
    // Mô phỏng hàm authenticateUser trong Class Diagram
    // Nhận vào username/pass, trả về token giả nếu đúng
    authenticateUser(username, password) {
        // Giả lập logic check pass đơn giản cho MVP
        if (username === "hung.lai" && password === "123") {
            return "token_student_123";
        }
        if (username === "thay.hung" && password === "123") {
            return "token_tutor_456";
        }
        if (username === "admin" && password === "123") {
            return "token_admin_999";
        }
        return null; // Sai mật khẩu
    }

    // Mô phỏng hàm getUserID trong Class Diagram
    getUserID(token) {
        if (token === "token_student_123") return "2311327";
        if (token === "token_tutor_456") return "GV001";
        if (token === "token_admin_999") return "ADMIN01"
        return null;
    }
}

module.exports = new HCMUT_SSO();