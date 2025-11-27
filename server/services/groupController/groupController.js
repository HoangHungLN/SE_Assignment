// server/services/groupController/groupController.js
const groupDatabase = require('../../dataBase/group.js');

const { 
    authenticateUser, 
    requireStudent, 
    requireTutor, 
    requireCoordinator,
    checkGroupOwnership,
    checkTutorInGroup 
} = require('../../middleware/groupMiddleware');

// Mock tutors data với thông tin chi tiết và môn đăng ký dạy
const MOCK_TUTORS = [
    { 
        tutorID: 'T001', 
        name: 'Nguyễn Văn H', 
        subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
        email: 'nguyenvanh@hcmut.edu.vn',
        department: 'Khoa học và Kỹ thuật Máy tính',
        major: 'Khoa học Máy tính',
        degree: 'Tiến sĩ',
        role: 'Trưởng khoa',
        age: 45,
        registeredCourses: [
            { name: 'Cấu trúc dữ liệu và giải thuật (CO2015)', date: '10:05 04-08-2025', status: 'Đã duyệt' },
            { name: 'Kỹ thuật lập trình (CO1007)', date: '16:25 04-08-2025', status: 'Đã duyệt' },
            { name: 'Hệ điều hành (CO3027)', date: '14:25 03-08-2025', status: 'Chờ duyệt' }
        ]
    },
    { 
        tutorID: 'T002', 
        name: 'Lê Văn A', 
        subject: 'Giải tích 1 (MT1003)',
        email: 'levana@hcmut.edu.vn',
        department: 'Khoa Toán - Tin học',
        major: 'Toán ứng dụng',
        degree: 'Tiến sĩ',
        role: 'Phó khoa',
        age: 42,
        registeredCourses: [
            { name: 'Giải tích 1 (MT1003)', date: '09:15 05-08-2025', status: 'Đã duyệt' },
            { name: 'Giải tích 2 (MT1004)', date: '11:30 03-08-2025', status: 'Đã duyệt' },
            { name: 'Đại số tuyến tính (MT1005)', date: '14:20 02-08-2025', status: 'Đã duyệt' }
        ]
    },
    { 
        tutorID: 'T003', 
        name: 'Đặng Tiến G', 
        subject: 'Vật lý đại cương (PH1003)',
        email: 'dangtieng@hcmut.edu.vn',
        department: 'Khoa Vật lý - Vật lý Kỹ thuật',
        major: 'Vật lý học',
        degree: 'Tiến sĩ',
        role: 'Giảng viên',
        age: 38,
        registeredCourses: [
            { name: 'Vật lý đại cương (PH1003)', date: '08:45 06-08-2025', status: 'Đã duyệt' },
            { name: 'Vật lý đại cương 2 (PH1004)', date: '13:10 04-08-2025', status: 'Đã duyệt' },
            { name: 'Cơ học lượng tử (PH2001)', date: '15:55 01-08-2025', status: 'Chờ duyệt' }
        ]
    },
    { 
        tutorID: 'T004', 
        name: 'Trần Ngọc L', 
        subject: 'Giải tích 1 (MT1003)',
        email: 'tranngocl@hcmut.edu.vn',
        department: 'Khoa Toán - Tin học',
        major: 'Toán ứng dụng',
        degree: 'Thạc sĩ',
        role: 'Trợ giảng',
        age: 28,
        registeredCourses: [
            { name: 'Giải tích 1 (MT1003)', date: '16:25 04-08-2025', status: 'Đã duyệt' },
            { name: 'Xác suất thống kê (MT2003)', date: '10:30 02-08-2025', status: 'Đã duyệt' }
        ]
    },
    { 
        tutorID: 'T005', 
        name: 'Phan Thanh K', 
        subject: 'Hoá đại cương (CH1005)',
        email: 'phanthanhk@hcmut.edu.vn',
        department: 'Khoa Kỹ thuật Hóa học',
        major: 'Hóa học',
        degree: 'Tiến sĩ',
        role: 'Giảng viên',
        age: 35,
        registeredCourses: [
            { name: 'Hoá đại cương (CH1005)', date: '14:15 05-08-2025', status: 'Đã duyệt' },
            { name: 'Hoá hữu cơ (CH2001)', date: '09:40 03-08-2025', status: 'Đã duyệt' },
            { name: 'Hoá vô cơ (CH2002)', date: '11:20 01-08-2025', status: 'Chờ duyệt' }
        ]
    },
    { 
        tutorID: 'T006', 
        name: 'Đinh Thị I', 
        subject: 'Hệ điều hành (CO3027)',
        email: 'dinhthii@hcmut.edu.vn',
        department: 'Khoa học và Kỹ thuật Máy tính',
        major: 'Kỹ thuật Máy tính',
        degree: 'Tiến sĩ',
        role: 'Giảng viên',
        age: 40,
        registeredCourses: [
            { name: 'Hệ điều hành (CO3027)', date: '13:45 06-08-2025', status: 'Đã duyệt' },
            { name: 'Mạng máy tính (CO3028)', date: '15:30 04-08-2025', status: 'Đã duyệt' },
            { name: 'An toàn thông tin (CO3040)', date: '10:15 02-08-2025', status: 'Đã duyệt' }
        ]
    },
    { 
        tutorID: 'T007', 
        name: 'Lê Nhật M', 
        subject: 'Kỹ thuật số (EE2117)',
        email: 'lenhatm@hcmut.edu.vn',
        department: 'Khoa Điện - Điện tử',
        major: 'Kỹ thuật Điện tử',
        degree: 'Thạc sĩ',
        role: 'Trợ giảng',
        age: 29,
        registeredCourses: [
            { name: 'Kỹ thuật số (EE2117)', date: '08:30 05-08-2025', status: 'Đã duyệt' },
            { name: 'Vi xử lý (EE2118)', date: '11:45 03-08-2025', status: 'Đã duyệt' },
            { name: 'Điện tử công suất (EE3115)', date: '14:20 01-08-2025', status: 'Chờ duyệt' }
        ]
    }
];

class GroupController {
    
    /**
     * Student creates a new group
     */
    async studentCreateGroup(groupData) {
        console.log('[GroupController] Creating new group:', groupData);
        
        const { creatorStudent, subject, maxMembers, description, tutor } = groupData;
        
        // Validation
        if (!creatorStudent || !subject || !maxMembers || !description) {
            return { success: false, message: 'Thiếu thông tin bắt buộc' };
        }

        try {
            // Generate new group ID
            const allGroups = await groupDatabase.getAllGroups();
            const newGroupID = 'G' + String(allGroups.length + 1).padStart(3, '0');
            
            const newGroup = {
                groupID: newGroupID,
                creatorStudent: creatorStudent,
                tutor: tutor || null,
                subject: subject,
                description: description,
                maxMembers: parseInt(maxMembers),
                currentMembers: 1,
                status: 'waiting',
                member: [creatorStudent],
                createdDate: new Date().toISOString(),
                sessions: []
            };

            const result = await groupDatabase.storeGroup(newGroup);
            return { success: result, data: newGroup };
        } catch (error) {
            console.error('Error creating group:', error);
            return { success: false, message: 'Lỗi server khi tạo nhóm' };
        }
    }

    /**
     * Student joins an existing group
     */
    async studentJoinGroup(groupID, student) {
        console.log('[GroupController] Student joining group:', { groupID, student });
        
        try {
            const group = await groupDatabase.getGroupByID(groupID);
            if (!group) {
                return { success: false, message: 'Không tìm thấy nhóm' };
            }

            if (group.currentMembers >= group.maxMembers) {
                return { success: false, message: 'Nhóm đã đầy' };
            }

            // if (group.status !== 'accepted') {
            //     return { success: false, message: 'Nhóm chưa được chấp nhận' };
            // }

            // Check if student is already a member
            if (group.member.some(m => m.studentID === student.studentID)) {
                return { success: true, message: 'Đã tham gia nhóm từ trước' };
            }

            const updatedMembers = [...group.member, student];
            const updatedGroup = {
                member: updatedMembers,
                currentMembers: updatedMembers.length
            };

            const result = await groupDatabase.updateGroup(groupID, updatedGroup);
            return { success: result, message: result ? 'Tham gia nhóm thành công' : 'Lỗi khi tham gia nhóm' };
        } catch (error) {
            console.error('Error joining group:', error);
            return { success: false, message: 'Lỗi server khi tham gia nhóm' };
        }
    }

    /**
     * Student leaves an existing group
     */
    async studentLeaveGroup(groupID, studentID) {
        console.log('[GroupController] Student leaving group:', { groupID, studentID });
        
        try {
            const group = await groupDatabase.getGroupByID(groupID);
            if (!group) {
                return { success: false, message: 'Không tìm thấy nhóm' };
            }

            // Check if student is a member
            if (!group.member.some(m => m.studentID === studentID)) {
                return { success: false, message: 'Bạn không phải thành viên của nhóm này' };
            }

            // REMOVED: Creator can now leave the group
            // if (group.creatorStudent.studentID === studentID) {
            //     return { success: false, message: 'Người tạo nhóm không thể rời nhóm' };
            // }

            const updatedMembers = group.member.filter(m => m.studentID !== studentID);
            const updatedGroup = {
                member: updatedMembers,
                currentMembers: updatedMembers.length
            };

            const result = await groupDatabase.updateGroup(groupID, updatedGroup);
            return { success: result, message: result ? 'Rời nhóm thành công' : 'Lỗi khi rời nhóm' };
        } catch (error) {
            console.error('Error leaving group:', error);
            return { success: false, message: 'Lỗi server khi rời nhóm' };
        }
    }

    /**
     * Coordinator deletes a group
     */
    async coordinatorDeleteGroup(groupID) {
        console.log('[GroupController] Coordinator deleting group:', groupID);
        
        try {
            const result = await groupDatabase.deleteGroup(groupID);
            return { success: result, message: result ? 'Xóa nhóm thành công' : 'Không tìm thấy nhóm để xóa' };
        } catch (error) {
            console.error('Error deleting group:', error);
            return { success: false, message: 'Lỗi server khi xóa nhóm' };
        }
    }

    /**
     * Finds tutors matching a subject
     */
    async findTutors(subject) {
        console.log('[GroupController] Finding tutors for subject:', subject);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!subject) {
            return { success: true, data: MOCK_TUTORS };
        }

        const subjectLower = subject.toLowerCase();
        const matchedTutors = MOCK_TUTORS.filter(t => 
            t.subject.toLowerCase().includes(subjectLower) ||
            t.name.toLowerCase().includes(subjectLower) ||
            t.department.toLowerCase().includes(subjectLower)
        );

        return { success: true, data: matchedTutors };
    }

    /**
     * Student requests a tutor for a group
     */
    async requestTutor(groupID, tutorID) {
        console.log('[GroupController] Requesting tutor:', { groupID, tutorID });
        
        try {
            const group = await groupDatabase.getGroupByID(groupID);
            const tutor = MOCK_TUTORS.find(t => t.tutorID === tutorID);

            if (!group || !tutor) {
                return { success: false, message: 'Không tìm thấy nhóm hoặc tutor' };
            }

            const updatedGroup = {
                tutor: tutor,
                status: group.status === 'rejected' ? 'waiting' : group.status
            };

            const result = await groupDatabase.updateGroup(groupID, updatedGroup);
            return { success: result, message: result ? 'Yêu cầu tutor thành công' : 'Lỗi khi yêu cầu tutor' };
        } catch (error) {
            console.error('Error requesting tutor:', error);
            return { success: false, message: 'Lỗi server khi yêu cầu tutor' };
        }
    }

    /**
     * Tutor accepts a group
     */
    async tutorAcceptGroup(groupID) {
        console.log('[GroupController] Tutor accepting group:', groupID);
        
        try {
            const group = await groupDatabase.getGroupByID(groupID);
            if (!group) {
                return { success: false, message: 'Không tìm thấy nhóm' };
            }

            if (group.status === 'waiting' || group.status === 'rejected') {
                const result = await groupDatabase.updateGroup(groupID, { status: 'accepted' });
                return { success: result, message: result ? 'Chấp nhận nhóm thành công' : 'Lỗi khi chấp nhận nhóm' };
            }

            return { success: false, message: 'Không thể chấp nhận nhóm với trạng thái hiện tại' };
        } catch (error) {
            console.error('Error accepting group:', error);
            return { success: false, message: 'Lỗi server khi chấp nhận nhóm' };
        }
    }

    /**
     * Tutor rejects a group
     */
    async tutorRejectGroup(groupID) {
        console.log('[GroupController] Tutor rejecting group:', groupID);
        
        try {
            const group = await groupDatabase.getGroupByID(groupID);
            if (!group) {
                return { success: false, message: 'Không tìm thấy nhóm' };
            }

            if (group.status === 'waiting') {
                const result = await groupDatabase.updateGroup(groupID, { status: 'rejected' });
                return { success: result, message: result ? 'Từ chối nhóm thành công' : 'Lỗi khi từ chối nhóm' };
            }

            return { success: false, message: 'Không thể từ chối nhóm với trạng thái hiện tại' };
        } catch (error) {
            console.error('Error rejecting group:', error);
            return { success: false, message: 'Lỗi server khi từ chối nhóm' };
        }
    }

    /**
     * Searches groups based on criteria
     */
    async searchGroups(filters = {}) {
        console.log('[GroupController] Searching groups with filters:', filters);
        
        try {
            let groups = await groupDatabase.searchGroup(filters);
            
            // Filter for groups without tutor when searching for "chưa có"
            if (filters.tutor === null || filters.tutor === 'chưa có') {
                groups = groups.filter(group => !group.tutor || group.tutor === null);
            }
            
            return { success: true, data: groups };
        } catch (error) {
            console.error('Error searching groups:', error);
            return { success: false, message: 'Lỗi server khi tìm kiếm nhóm', data: [] };
        }
    }

    async getTutorCourses(tutorID) {
        console.log('[GroupController] Getting courses for tutor:', tutorID);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const tutor = MOCK_TUTORS.find(t => t.tutorID === tutorID);
        if (!tutor) {
            return { success: false, message: 'Không tìm thấy tutor', data: [] };
        }

        return { success: true, data: tutor.registeredCourses || [] };
    }
}

// Routes
const express = require('express');
const groupController = new GroupController();
const router = express.Router();

// API Routes
router.post('/create', async (req, res) => {
    const result = await groupController.studentCreateGroup(req.body);
    res.json(result);
});

router.post('/join', async (req, res) => {
    const result = await groupController.studentJoinGroup(req.body.groupID, req.body.student);
    res.json(result);
});

router.post('/leave', async (req, res) => {
    const result = await groupController.studentLeaveGroup(req.body.groupID, req.body.studentID);
    res.json(result);
});

router.delete('/:groupID', async (req, res) => {
    const result = await groupController.coordinatorDeleteGroup(req.params.groupID);
    res.json(result);
});

router.post('/tutors', async (req, res) => {
    const result = await groupController.findTutors(req.body.subject);
    res.json(result);
});

router.post('/request-tutor', async (req, res) => {
    const result = await groupController.requestTutor(req.body.groupID, req.body.tutorID);
    res.json(result);
});

router.post('/accept', async (req, res) => {
    const result = await groupController.tutorAcceptGroup(req.body.groupID);
    res.json(result);
});

router.post('/reject', async (req, res) => {
    const result = await groupController.tutorRejectGroup(req.body.groupID);
    res.json(result);
});

router.post('/search', async (req, res) => {
    const result = await groupController.searchGroups(req.body);
    res.json(result);
});

router.post('/tutor-courses', async (req, res) => {
    const result = await groupController.getTutorCourses(req.body.tutorID);
    res.json(result);
});

module.exports = router;