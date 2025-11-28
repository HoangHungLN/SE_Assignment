class HCMUT_SSO {

    authenticateUser(username, password) {
        if (username === "hung.lai" && password === "123") {
            return "token_student_123";
        }
        if (username === "thay.hung" && password === "123") {
            return "token_tutor_456";
        }
        if (username === "admin" && password === "123") {
            return "token_admin_999";
        }
        if (username === "qwe" && password === "123") {
            return "token_student_qwe";
        }
        if (username === "totnghiep" && password === "123") {
            return "token_totnghiep";
        }
        return null;
    }

    getUserID(token) {
        if (token === "token_student_123") return "2311327";
        if (token === "token_tutor_456") return "GV001";
        if (token === "token_totnghiep") return "GV002";
        if (token === "token_admin_999") return "ADMIN01";
        if (token === "token_student_qwe") return "2311746";
        return null;
    }
}

module.exports = new HCMUT_SSO();