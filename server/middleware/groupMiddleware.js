// server/middleware/groupMiddleware.js
const { verifyToken, requireRole } = require('./authMiddleware');

// Middleware xác thực và phân quyền cơ bản
const authenticateUser = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);
        next();
    });
};

// Middleware chỉ cho phép học sinh
const requireStudent = (req, res, next) => {
    if (req.currentUser.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Truy cập bị từ chối. Chỉ học sinh mới được thực hiện thao tác này.'
        });
    }
    next();
};

// Middleware chỉ cho phép tutor
const requireTutor = (req, res, next) => {
    if (req.currentUser.role !== 'tutor') {
        return res.status(403).json({
            success: false,
            message: 'Truy cập bị từ chối. Chỉ tutor mới được thực hiện thao tác này.'
        });
    }
    next();
};

// Middleware chỉ cho phép coordinator
const requireCoordinator = (req, res, next) => {
    if (req.currentUser.role !== 'coordinator') {
        return res.status(403).json({
            success: false,
            message: 'Truy cập bị từ chối. Chỉ coordinator mới được thực hiện thao tác này.'
        });
    }
    next();
};

// Middleware cho phép cả học sinh và tutor
const requireStudentOrTutor = (req, res, next) => {
    if (req.currentUser.role !== 'student' && req.currentUser.role !== 'tutor') {
        return res.status(403).json({
            success: false,
            message: 'Truy cập bị từ chối. Chỉ học sinh hoặc tutor mới được thực hiện thao tác này.'
        });
    }
    next();
};

// Middleware kiểm tra quyền sở hữu nhóm (chỉ creator mới được chỉnh sửa)
const checkGroupOwnership = async (req, res, next) => {
    try {
        const groupID = req.params.groupID || req.body.groupID;
        const userID = req.currentUser.id;

        // Lấy thông tin nhóm từ database
        const groupDatabase = require('../dataBase/group');
        const group = await groupDatabase.getGroupByID(groupID);
        
        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy nhóm' 
            });
        }
        
        // Kiểm tra nếu user là người tạo nhóm
        if (group.creatorStudent.studentID !== userID) {
            return res.status(403).json({ 
                success: false, 
                message: 'Truy cập bị từ chối. Chỉ người tạo nhóm mới được thực hiện thao tác này.' 
            });
        }
        
        next();
    } catch (error) {
        console.error('Error checking group ownership:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi kiểm tra quyền sở hữu' 
        });
    }
};

// Middleware kiểm tra tutor có trong nhóm không
const checkTutorInGroup = async (req, res, next) => {
    try {
        const groupID = req.params.groupID || req.body.groupID;
        const tutorID = req.currentUser.id;

        const groupDatabase = require('../dataBase/group');
        const group = await groupDatabase.getGroupByID(groupID);
        
        if (!group) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy nhóm' 
            });
        }
        
        // Kiểm tra nếu tutor là tutor của nhóm này
        if (!group.tutor || group.tutor.tutorID !== tutorID) {
            return res.status(403).json({ 
                success: false, 
                message: 'Truy cập bị từ chối. Bạn không phải là tutor của nhóm này.' 
            });
        }
        
        next();
    } catch (error) {
        console.error('Error checking tutor in group:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Lỗi server khi kiểm tra tutor' 
        });
    }
};

module.exports = {
    authenticateUser,
    requireStudent,
    requireTutor,
    requireCoordinator,
    requireStudentOrTutor,
    checkGroupOwnership,
    checkTutorInGroup
};