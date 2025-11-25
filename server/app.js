const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Khởi tạo app
const app = express();
const PORT = 5000;

// Cấu hình Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// --- KHU VỰC IMPORT ROUTES ---
// 1. Import LoginController (Lưu ý đường dẫn file)
// Giả định folder của bạn tên là 'loginController' hoặc 'authController'. 
// Hãy kiểm tra kỹ tên folder chứa file loginController.js nhé!
// Dưới đây mình để đường dẫn phổ biến nhất dựa trên ảnh bạn gửi trước đó:
const loginRoutes = require('./services/loginController/loginController'); 
const evaluateRoutes = require('./services/learningController/evaluateController');
const sessionRoutes = require('./services/sessionController/sessionController');
const groupRoutes = require('./services/groupController/groupController');

// HOẶC nếu folder vẫn tên là authController thì dùng dòng dưới:
// const loginRoutes = require('./services/authController/loginController');

// --- ĐĂNG KÝ ROUTES ---
// 2. Kích hoạt route. Khi Client gọi '/api/auth/...', nó sẽ chạy vào loginRoutes
app.use('/api/auth', loginRoutes);
app.use('/api/learning/evaluate', evaluateRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/groups', groupRoutes);


// Route kiểm tra Server sống hay chết
app.get('/', (req, res) => {
    res.send('Hello! Tutor System Server is running...');
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại địa chỉ: http://localhost:${PORT}`);
});