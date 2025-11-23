const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Có thể dùng hoặc dùng express.json() đều được

// Khởi tạo app
const app = express();
const PORT = 5000; // Client chạy port 3000, Server chạy port 5000

// Cấu hình Middleware
app.use(cors()); // Cho phép React ở port 3000 gọi sang
app.use(express.json()); // Để server hiểu dữ liệu JSON gửi lên
app.use(bodyParser.urlencoded({ extended: true }));

// --- KHU VỰC IMPORT ROUTES (Sẽ thêm dần sau này) ---
// Ví dụ: const groupRoutes = require('./services/groupController/groupController');
// app.use('/api/groups', groupRoutes);

// Route kiểm tra Server sống hay chết
app.get('/', (req, res) => {
    res.send('Hello! Tutor System Server is running...');
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại địa chỉ: http://localhost:${PORT}`);
});