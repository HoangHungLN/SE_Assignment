// server/services/sessionController/session.js

// Dữ liệu buổi học (sessions)
const sessions = [
  // Copy NGUYÊN nội dung mảng this.sessions trong constructor ở SessionController
  // từ { id: 1, studentId: '2311327', ... } đến phần tử cuối cùng
    {
        id: 1,
        studentId: '2311327',
        subject: 'Giải Tích 1',
        tutor: 'Nguyễn Văn A',
        tutorId: 'GV001',
        time: '14:00 - 16:00',
        date: '2025-11-25',
        status: 'Sắp diễn ra',
        room: 'B4-101',
        description: 'Giới hạn và tính liên tục của hàm',
        materials: [
            { name: 'Slide bài giảng', url: '/files/giai-tich-1-slide.pdf' },
            { name: 'Bài tập về nhà', url: '/files/giai-tich-1-baitap.pdf' }
        ],
        attendanceRequested: false,
        isAttended: false
    },
    {
        id: 2,
        studentId: '2311327',
        subject: 'Kỹ thuật lập trình',
        tutor: 'Trần Thị B',
        tutorId: 'GV002',
        time: '09:00 - 11:00',
        date: '2025-11-24',
        status: 'Đã diễn ra',
        room: 'B4-102',
        description: 'Pointer và Dynamic Memory',
        materials: [
            { name: 'Slide bài giảng', url: '/files/ky-thuat-lap-trinh-slide.pdf' }
        ],
        attendanceRequested: true,
        isAttended: true
    },
    {
        id: 3,
        studentId: '2311327',
        subject: 'Cấu trúc dữ liệu và Giải thuật',
        tutor: 'Lê Minh C',
        tutorId: 'GV003',
        time: '16:00 - 18:00',
        date: '2025-11-26',
        status: 'Sắp diễn ra',
        room: 'B4-103',
        description: 'Cây nhị phân và duyệt cây',
        materials: [
            { name: 'Slide bài giảng', url: '/files/cau-truc-du-lieu-slide.pdf' },
            { name: 'Code ví dụ', url: '/files/cau-truc-du-lieu-code.zip' }
        ],
        attendanceRequested: false,
        isAttended: false
    },
    {
        id: 5,
        studentId: '2311327',
        subject: 'Giải Tích 2',
        tutor: 'Phạm Thị E',
        tutorId: 'GV005',
        time: '10:00 - 12:00',
        date: '2025-11-27',
        status: 'Sắp diễn ra',
        room: 'B4-104',
        description: 'Hàm nhiều biến và đạo hàm riêng',
        materials: [
            { name: 'Slide bài giảng', url: '/files/giai-tich-2-slide.pdf' }
        ],
        attendanceRequested: true,
        isAttended: false
    },
    {
        id: 6,
        studentId: '2311327',
        subject: 'Đại số tuyến tính',
        tutor: 'Trần Văn F',
        tutorId: 'GV006',
        time: '13:00 - 15:00',
        date: '2025-11-23',
        status: 'Đã diễn ra',
        room: 'B4-105',
        description: 'Ma trận và định thức',
        materials: [
            { name: 'Slide bài giảng', url: '/files/dai-so-tuyen-tinh-slide.pdf' },
            { name: 'Bài tập về nhà', url: '/files/dai-so-tuyen-tinh-baitap.pdf' }
        ],
        attendanceRequested: true,
        isAttended: true
    },
    // Dữ liệu cho sinh viên SV002
    {
        id: 4,
        studentId: 'SV002',
        subject: 'Lập trình hướng đối tượng',
        tutor: 'Trần Thị E',
        tutorId: 'GV005',
        time: '09:00 - 11:00',
        date: '2025-11-20',
        status: 'Đã diễn ra',
        room: 'B1-301',
        description: 'Kế thừa và Đa hình',
        materials: [
            { name: 'OOP_Inheritance.pdf', url: '/files/oop1.pdf' },
            { name: 'Polymorphism_Examples.pptx', url: '/files/oop2.pptx' }
        ],
        feedback: {
            criteria1: true,
            criteria2: true,
            criteria3: false,
            additionalComments: 'Bài giảng rất chi tiết',
            criteriaCount: 2,
            lastUpdate: '23-11-2025 14:30'
        },
        attendanceRequested: true,
        isAttended: true
    },
    {
        id: 5,
        studentId: 'SV002',
        subject: 'Cơ sở dữ liệu',
        tutor: 'Nguyễn Văn F',
        tutorId: 'GV006',
        time: '13:00 - 15:00',
        date: '2025-11-22',
        status: 'Đã diễn ra',
        room: 'B2-204',
        description: 'SQL và Relational Database',
        materials: [
            { name: 'SQL_Basics.pdf', url: '/files/sql1.pdf' }
        ],
        feedback: null,
        attendanceRequested: true,
        isAttended: true
    },
    {
        id: 6,
        studentId: 'SV002',
        subject: 'Hệ điều hành',
        tutor: 'Lê Văn G',
        tutorId: 'GV007',
        time: '15:00 - 17:00',
        date: '2025-11-27',
        status: 'Sắp diễn ra',
        room: 'B3-105',
        description: 'Process và Thread Management',
        materials: [],
        feedback: null,
        attendanceRequested: false,
        isAttended: false
    },
    {
        id: 7,
        studentId: 'SV002',
        subject: 'Mạng máy tính',
        tutor: 'Phạm Thị H',
        tutorId: 'GV008',
        time: '10:00 - 12:00',
        date: '2025-11-28',
        status: 'Sắp diễn ra',
        room: 'B4-201',
        description: 'TCP/IP Protocol',
        materials: [],
        feedback: null,
        attendanceRequested: false,
        isAttended: false
    },
    {
        id: 8,
        studentId: 'SV002',
        subject: 'Trí tuệ nhân tạo',
        tutor: 'Đỗ Văn I',
        tutorId: 'GV009',
        time: '08:00 - 10:00',
        date: '2025-12-01',
        status: 'Sắp diễn ra',
        room: 'B1-402',
        description: 'Machine Learning cơ bản',
        materials: [],
        feedback: null,
        attendanceRequested: false,
        isAttended: false
    },
    {
        id: 9,
        studentId: 'SV002',
        subject: 'Công nghệ phần mềm',
        tutor: 'Hoàng Văn K',
        tutorId: 'GV010',
        time: '14:00 - 16:00',
        date: '2025-12-03',
        status: 'Sắp diễn ra',
        room: 'B2-303',
        description: 'Agile và Scrum',
        materials: [],
        feedback: null,
        attendanceRequested: false,
        isAttended: false
    },
    {
        id: 10,
        studentId: 'SV002',
        subject: 'Lập trình hướng đối tượng',
        tutor: 'Trần Thị E',
        tutorId: 'GV005',
        time: '16:00 - 18:00',
        date: '2025-12-05',
        status: 'Sắp diễn ra',
        room: 'B1-301',
        description: 'Design Patterns',
        materials: [],
        feedback: null,
        attendanceRequested: false,
        isAttended: false
    }
];

// Dữ liệu lớp học của tutor (classes/sections)
const classes = [
  // Copy NGUYÊN nội dung mảng this.classes trong constructor
    {
        id: 1,
        tutorId: 'GV001',
        className: 'Kiến trúc Máy tính',
        classCode: 'CO2007',
        subject: 'Kiến trúc Máy tính',
        date: '2025-10-05',
        time: '16:55',
        description: 'Bộ nhớ và Cache',
        format: 'On site',
        location: 'B1-303',
        onlineLink: null,
        status: 'Sắp diễn ra',
        studentCount: 30
    },
    {
        id: 2,
        tutorId: 'GV001',
        className: 'Cấu trúc rời rạc',
        classCode: 'CO1007',
        subject: 'Cấu trúc rời rạc',
        date: '2025-10-06',
        time: '16:05',
        description: 'Ứng dụng toán rời rạc',
        format: 'Không có',
        location: 'B1-303',
        onlineLink: null,
        status: 'Sắp diễn ra',
        studentCount: 28
    },
    {
        id: 3,
        tutorId: 'GV001',
        className: 'Kỹ thuật lập trình',
        classCode: 'CO1027',
        subject: 'Kỹ thuật lập trình',
        date: '2025-11-24',
        time: '16:55',
        description: 'OOP nâng cao',
        format: 'Off site',
        location: 'H6-506',
        onlineLink: 'Google Meet',
        status: 'Sắp diễn ra',
        studentCount: 35
    },
    {
        id: 4,
        tutorId: 'GV001',
        className: 'Cấu trúc dữ liệu',
        classCode: 'CO2003',
        subject: 'Cấu trúc dữ liệu',
        date: '2025-12-10',
        time: '17:45',
        description: 'Cấu trúc cây nâng cao',
        format: 'Both',
        location: 'B2-404',
        onlineLink: 'Google Meet',
        status: 'Sắp diễn ra',
        studentCount: 32
    },
    {
        id: 5,
        tutorId: 'GV001',
        className: 'Cơ sở dữ liệu',
        classCode: 'CO3025',
        subject: 'Cơ sở dữ liệu',
        date: '2025-12-15',
        time: '14:00',
        description: 'Database Design',
        format: 'On site',
        location: 'B3-201',
        onlineLink: null,
        status: 'Sắp diễn ra',
        studentCount: 25
    },
    {
        id: 6,
        tutorId: 'GV001',
        className: 'Lập trình hệ thống',
        classCode: 'CO3041',
        subject: 'Lập trình hệ thống',
        date: '2025-12-20',
        time: '15:00',
        description: 'System Call và API',
        format: 'Off site',
        location: 'B4-105',
        onlineLink: 'Microsoft Teams',
        status: 'Sắp diễn ra',
        studentCount: 20
    }
];

// Nếu muốn khởi tạo enrollments trống
const enrollments = []; 

module.exports = {
  sessions,
  classes,
  enrollments,
};
