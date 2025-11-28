// server/dataBase/group.js
class GroupDatabase {
    constructor() {
        this.groups = [
            {
                groupID: 'G001',
                creatorStudent: { 
                    studentID: '2310812', 
                    name: 'Nguyễn Văn A',
                    email: '2310812@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T003', 
                    name: 'Đặng Tiến G', 
                    subject: 'Vật lý đại cương (PH1003)',
                    email: 'dangtieng@hcmut.edu.vn',
                    department: 'Khoa Vật lý - Vật lý Kỹ thuật',
                    major: 'Vật lý học',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Vật lý đại cương (PH1003)',
                description: 'Nhóm học Vật lý đại cương, tập trung giải bài tập và ôn thi cuối kỳ. Mục tiêu đạt điểm A môn học.',
                maxMembers: 6,
                currentMembers: 4,
                status: 'accepted',
                member: [
                    { studentID: '2310812', name: 'Nguyễn Văn A', email: '2310812@student.hcmut.edu.vn' },
                    { studentID: '2310431', name: 'Trần Thị B', email: '2310431@student.hcmut.edu.vn' },
                    { studentID: '2310267', name: 'Lê Văn C', email: '2310267@student.hcmut.edu.vn' },
                    { studentID: '2310382', name: 'Phạm Ngọc E', email: '2310382@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-05T16:45:00').toISOString(),
                sessions: [
                    {
                        sessionID: 'S001',
                        date: new Date('2025-08-10T14:00:00').toISOString(),
                        duration: 2,
                        location: 'Phòng A1.201',
                        topic: 'Chương 1: Động học chất điểm'
                    }
                ]
            },
            {
                groupID: 'G002',
                creatorStudent: { 
                    studentID: '2310431', 
                    name: 'Trần Thị B',
                    email: '2310431@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T004', 
                    name: 'Trần Ngọc L', 
                    subject: 'Giải tích 1 (MT1003)',
                    email: 'tranngocl@hcmut.edu.vn',
                    department: 'Khoa Toán - Tin học',
                    major: 'Toán ứng dụng',
                    degree: 'Thạc sĩ',
                    role: 'Trợ giảng'
                },
                subject: 'Giải tích 1 (MT1003)',
                description: 'Nhóm ôn tập thi cuối kỳ Giải tích 1, tập trung vào giải đề thi các năm trước và các dạng bài tập khó.',
                maxMembers: 5,
                currentMembers: 2,
                status: 'waiting',
                member: [
                    { studentID: '2310431', name: 'Trần Thị B', email: '2310431@student.hcmut.edu.vn' },
                    { studentID: '2310123', name: 'Hồ Thị D', email: '2310123@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-05T14:25:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G003',
                creatorStudent: { 
                    studentID: '2310267', 
                    name: 'Lê Văn C',
                    email: '2310267@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: null,
                subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
                description: 'Nhóm ôn tập kiến thức để làm BTL, tập trung vào các thuật toán sắp xếp, tìm kiếm và cấu trúc dữ liệu nâng cao.',
                maxMembers: 7,
                currentMembers: 1,
                status: 'waiting',
                member: [
                    { studentID: '2310267', name: 'Lê Văn C', email: '2310267@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-04T19:05:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G004',
                creatorStudent: { 
                    studentID: '2310123', 
                    name: 'Hồ Thị D',
                    email: '2310123@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: null,
                subject: 'Hoá đại cương (CH1005)',
                description: 'Tất cả chủ đề từ cơ bản đến nâng cao, đặc biệt tập trung vào phần bài tập tính toán và thí nghiệm.',
                maxMembers: 5,
                currentMembers: 5,
                status: 'waiting',
                member: [
                    { studentID: '2310123', name: 'Hồ Thị D', email: '2310123@student.hcmut.edu.vn' },
                    { studentID: '2310456', name: 'Nguyễn Văn X', email: '2310456@student.hcmut.edu.vn' },
                    { studentID: '2310789', name: 'Trần Thị Y', email: '2310789@student.hcmut.edu.vn' },
                    { studentID: '2310321', name: 'Lê Văn Z', email: '2310321@student.hcmut.edu.vn' },
                    { studentID: '2310678', name: 'Phạm Thị W', email: '2310678@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-04T10:30:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G005',
                creatorStudent: { 
                    studentID: '2310382', 
                    name: 'Phạm Ngọc E',
                    email: '2310382@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T006', 
                    name: 'Đinh Thị I', 
                    subject: 'Hệ điều hành (CO3027)',
                    email: 'dinhthii@hcmut.edu.vn',
                    department: 'Khoa học và Kỹ thuật Máy tính',
                    major: 'Kỹ thuật Máy tính',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Hệ điều hành (CO3027)',
                description: 'Nhóm nghiên cứu sâu về hệ điều hành Linux, quản lý tiến trình và bộ nhớ.',
                maxMembers: 8,
                currentMembers: 2,
                status: 'waiting',
                member: [
                    { studentID: '2310382', name: 'Phạm Ngọc E', email: '2310382@student.hcmut.edu.vn' },
                    { studentID: '2310486', name: 'Hoàng Quốc F', email: '2310486@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-03T15:54:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G006',
                creatorStudent: { 
                    studentID: '2310486', 
                    name: 'Hoàng Quốc F',
                    email: '2310486@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T007', 
                    name: 'Lê Nhật M', 
                    subject: 'Kỹ thuật số (EE2117)',
                    email: 'lenhatm@hcmut.edu.vn',
                    department: 'Khoa Điện - Điện tử',
                    major: 'Kỹ thuật Điện tử',
                    degree: 'Thạc sĩ',
                    role: 'Trợ giảng'
                },
                subject: 'Kỹ thuật số (EE2117)',
                description: 'Nhóm học môn Kỹ thuật số, tập trung vào thiết kế mạch logic và vi điều khiển.',
                maxMembers: 6,
                currentMembers: 1,
                status: 'rejected',
                member: [
                    { studentID: '2310486', name: 'Hoàng Quốc F', email: '2310486@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-02T08:50:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G010',
                creatorStudent: { 
                    studentID: '2310901', 
                    name: 'Nguyễn Minh H',
                    email: '2310901@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T001', 
                    name: 'Trần Ngọc Bảo D', 
                    subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
                    email: 't001@hcmut.edu.vn',
                    department: 'Khoa Khoa học và Kỹ thuật Máy tính',
                    major: 'Kỹ thuật phần mềm',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
                description: 'Nhóm ôn sâu cấu trúc dữ liệu cơ bản, luyện tập danh sách liên kết và ngăn xếp.',
                maxMembers: 4,
                currentMembers: 3,
                status: 'waiting',
                member: [
                    { studentID: '2310901', name: 'Nguyễn Minh H', email: '2310901@student.hcmut.edu.vn' },
                    { studentID: '2310702', name: 'Trần Quốc I', email: '2310702@student.hcmut.edu.vn' },
                    { studentID: '2310507', name: 'Phạm Thảo K', email: '2310507@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-06T09:30:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G011',
                creatorStudent: { 
                    studentID: '2310933', 
                    name: 'Trần Minh L',
                    email: '2310933@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T001', 
                    name: 'Trần Ngọc Bảo D', 
                    subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
                    email: 't001@hcmut.edu.vn',
                    department: 'Khoa Khoa học và Kỹ thuật Máy tính',
                    major: 'Kỹ thuật phần mềm',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Thiết kế thuật toán (CO3095)',
                description: 'Tổng hợp các mẫu thuật toán nâng cao và phân tích độ phức tạp.',
                maxMembers: 4,
                currentMembers: 4,
                status: 'waiting',
                member: [
                    { studentID: '2310933', name: 'Trần Minh L', email: '2310933@student.hcmut.edu.vn' },
                    { studentID: '2310844', name: 'Phạm Thành M', email: '2310844@student.hcmut.edu.vn' },
                    { studentID: '2310781', name: 'Nguyễn Thu N', email: '2310781@student.hcmut.edu.vn' },
                    { studentID: '2310652', name: 'Lê Thanh O', email: '2310652@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-06T11:10:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G012',
                creatorStudent: { 
                    studentID: '2310825', 
                    name: 'Phạm Tuấn P',
                    email: '2310825@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T001', 
                    name: 'Trần Ngọc Bảo D', 
                    subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
                    email: 't001@hcmut.edu.vn',
                    department: 'Khoa Khoa học và Kỹ thuật Máy tính',
                    major: 'Kỹ thuật phần mềm',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Kỹ thuật lập trình (CO1007)',
                description: 'Nhóm ôn nâng cao các mẫu thiết kế lập trình và kỹ thuật xử lý con trỏ.',
                maxMembers: 3,
                currentMembers: 2,
                status: 'waiting',
                member: [
                    { studentID: '2310825', name: 'Phạm Tuấn P', email: '2310825@student.hcmut.edu.vn' },
                    { studentID: '2310819', name: 'Võ An Q', email: '2310819@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-06T15:05:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G013',
                creatorStudent: { 
                    studentID: '2310774', 
                    name: 'Nguyễn Thị R',
                    email: '2310774@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T001', 
                    name: 'Trần Ngọc Bảo D', 
                    subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
                    email: 't001@hcmut.edu.vn',
                    department: 'Khoa Khoa học và Kỹ thuật Máy tính',
                    major: 'Kỹ thuật phần mềm',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Nhập môn trí tuệ nhân tạo (CO3024)',
                description: 'Tài liệu hóa kiến thức cơ sở về heuristics và cấu trúc dữ liệu hỗ trợ AI.',
                maxMembers: 4,
                currentMembers: 3,
                status: 'waiting',
                member: [
                    { studentID: '2310774', name: 'Nguyễn Thị R', email: '2310774@student.hcmut.edu.vn' },
                    { studentID: '2310766', name: 'Trần Hải S', email: '2310766@student.hcmut.edu.vn' },
                    { studentID: '2310718', name: 'Phạm Hoàng T', email: '2310718@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-06T16:45:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G014',
                creatorStudent: { 
                    studentID: '2310742', 
                    name: 'Lê Tuấn U',
                    email: '2310742@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T001', 
                    name: 'Trần Ngọc Bảo D', 
                    subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
                    email: 't001@hcmut.edu.vn',
                    department: 'Khoa Khoa học và Kỹ thuật Máy tính',
                    major: 'Kỹ thuật phần mềm',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Lập trình hướng đối tượng (CO2013)',
                description: 'Thực hành thiết kế mô hình hướng đối tượng và xây dựng project nhỏ.',
                maxMembers: 4,
                currentMembers: 2,
                status: 'accepted',
                member: [
                    { studentID: '2310742', name: 'Lê Tuấn U', email: '2310742@student.hcmut.edu.vn' },
                    { studentID: '2310730', name: 'Trần Mai V', email: '2310730@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-06T18:00:00').toISOString(),
                sessions: [
                    {
                        sessionID: 'S014',
                        date: new Date('2025-08-12T07:45:00').toISOString(),
                        duration: 2,
                        location: 'Phòng B3.201',
                        topic: 'Thiết kế class diagram'
                    }
                ]
            },
            {
                groupID: 'G015',
                creatorStudent: { 
                    studentID: '2310695', 
                    name: 'Phan Ngọc W',
                    email: '2310695@student.hcmut.edu.vn',
                    faculty: 'Khoa học và kỹ thuật máy tính'
                },
                tutor: { 
                    tutorID: 'T001', 
                    name: 'Trần Ngọc Bảo D', 
                    subject: 'Cấu trúc dữ liệu và giải thuật (CO2015)',
                    email: 't001@hcmut.edu.vn',
                    department: 'Khoa Khoa học và Kỹ thuật Máy tính',
                    major: 'Kỹ thuật phần mềm',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Cơ sở dữ liệu (CO2017)',
                description: 'Nhóm thực hành thiết kế lược đồ, câu truy vấn SQL và tối ưu.',
                maxMembers: 5,
                currentMembers: 4,
                status: 'accepted',
                member: [
                    { studentID: '2310695', name: 'Phan Ngọc W', email: '2310695@student.hcmut.edu.vn' },
                    { studentID: '2310687', name: 'Nguyễn Khang X', email: '2310687@student.hcmut.edu.vn' },
                    { studentID: '2310668', name: 'Trần Gia Y', email: '2310668@student.hcmut.edu.vn' },
                    { studentID: '2310644', name: 'Lê Ngọc Z', email: '2310644@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T07:55:00').toISOString(),
                sessions: [
                    {
                        sessionID: 'S015',
                        date: new Date('2025-08-12T15:15:00').toISOString(),
                        duration: 1.5,
                        location: 'Lab B1.301',
                        topic: 'Chuẩn hóa lược đồ 3NF'
                    }
                ]
            },
            {
                groupID: 'G016',
                creatorStudent: { 
                    studentID: '2310611', 
                    name: 'Nguyen Anh AA',
                    email: '2310611@student.hcmut.edu.vn',
                    faculty: 'Khoa hoc va ky thuat may tinh'
                },
                tutor: null,
                subject: 'Computer Networks (CO3028)',
                description: 'Thao luan kien thuc LAP, chia se kinh nghiem cau hinh switch co ban.',
                maxMembers: 5,
                currentMembers: 2,
                status: 'waiting',
                member: [
                    { studentID: '2310611', name: 'Nguyen Anh AA', email: '2310611@student.hcmut.edu.vn' },
                    { studentID: '2310620', name: 'Tran Bach AB', email: '2310620@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T09:15:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G017',
                creatorStudent: { 
                    studentID: '2310588', 
                    name: 'Le Thi AC',
                    email: '2310588@student.hcmut.edu.vn',
                    faculty: 'Khoa hoc va ky thuat may tinh'
                },
                tutor: null,
                subject: 'Ngon ngu lap trinh C (CO1008)',
                description: 'Tu hoc C co ban, tap trung vao con tro va quan ly bo nho.',
                maxMembers: 4,
                currentMembers: 1,
                status: 'waiting',
                member: [
                    { studentID: '2310588', name: 'Le Thi AC', email: '2310588@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T10:40:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G018',
                creatorStudent: { 
                    studentID: '2310572', 
                    name: 'Pham Quan AD',
                    email: '2310572@student.hcmut.edu.vn',
                    faculty: 'Khoa hoc va ky thuat may tinh'
                },
                tutor: null,
                subject: 'Xac suat thong ke (MT2003)',
                description: 'Phan tich bai tap tong hop va thuc hanh voi Python.',
                maxMembers: 5,
                currentMembers: 3,
                status: 'waiting',
                member: [
                    { studentID: '2310572', name: 'Pham Quan AD', email: '2310572@student.hcmut.edu.vn' },
                    { studentID: '2310591', name: 'Nguyen Minh AE', email: '2310591@student.hcmut.edu.vn' },
                    { studentID: '2310633', name: 'Tran Khai AF', email: '2310633@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T12:05:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G019',
                creatorStudent: { 
                    studentID: '2310544', 
                    name: 'Ho Khanh AG',
                    email: '2310544@student.hcmut.edu.vn',
                    faculty: 'Khoa hoc va ky thuat may tinh'
                },
                tutor: null,
                subject: 'Phan tich va thiet ke he thong (CO2001)',
                description: 'Chia se tai lieu SRS va kinh nghiem lap bieu do use case.',
                maxMembers: 4,
                currentMembers: 2,
                status: 'waiting',
                member: [
                    { studentID: '2310544', name: 'Ho Khanh AG', email: '2310544@student.hcmut.edu.vn' },
                    { studentID: '2310550', name: 'Phan Tan AH', email: '2310550@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T13:30:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G020',
                creatorStudent: { 
                    studentID: '2310521', 
                    name: 'Tran Minh AI',
                    email: '2310521@student.hcmut.edu.vn',
                    faculty: 'Khoa hoc va ky thuat may tinh'
                },
                tutor: null,
                subject: 'Co so du lieu (CO2017)',
                description: 'Cung nhau luyen cau truy van SQL nang cao va toi uu chi muc.',
                maxMembers: 5,
                currentMembers: 3,
                status: 'waiting',
                member: [
                    { studentID: '2310521', name: 'Tran Minh AI', email: '2310521@student.hcmut.edu.vn' },
                    { studentID: '2310533', name: 'Nguyen Hai AJ', email: '2310533@student.hcmut.edu.vn' },
                    { studentID: '2310566', name: 'Le Thanh AK', email: '2310566@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T14:55:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G021',
                creatorStudent: { 
                    studentID: '2310510', 
                    name: 'Pham Quoc AL',
                    email: '2310510@student.hcmut.edu.vn',
                    faculty: 'Khoa hoc va ky thuat may tinh'
                },
                tutor: null,
                subject: 'He dieu hanh (CO3027)',
                description: 'On tap dong bo hoa va bai toan deadlock qua vi du thuc te.',
                maxMembers: 4,
                currentMembers: 1,
                status: 'waiting',
                member: [
                    { studentID: '2310510', name: 'Pham Quoc AL', email: '2310510@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T16:20:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G022',
                creatorStudent: { 
                    studentID: '2310499', 
                    name: 'Vo Anh AM',
                    email: '2310499@student.hcmut.edu.vn',
                    faculty: 'Khoa hoc va ky thuat may tinh'
                },
                tutor: null,
                subject: 'Lap trinh he thong (CO2031)',
                description: 'Nghien cuu ky thuat socket va chia se project Node.js.',
                maxMembers: 4,
                currentMembers: 2,
                status: 'waiting',
                member: [
                    { studentID: '2310499', name: 'Vo Anh AM', email: '2310499@student.hcmut.edu.vn' },
                    { studentID: '2310502', name: 'Le Van AN', email: '2310502@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T18:05:00').toISOString(),
                sessions: []
            },
            {
                groupID: 'G023',
                creatorStudent: { 
                    studentID: '2310477', 
                    name: 'Tran Thu AO',
                    email: '2310477@student.hcmut.edu.vn',
                    faculty: 'Khoa hoc va ky thuat may tinh'
                },
                tutor: null,
                subject: 'Thiet ke giao dien (CO3004)',
                description: 'Thuc hanh Figma, xay wireframe va chia se kinh nghiem prototype.',
                maxMembers: 4,
                currentMembers: 3,
                status: 'waiting',
                member: [
                    { studentID: '2310477', name: 'Tran Thu AO', email: '2310477@student.hcmut.edu.vn' },
                    { studentID: '2310480', name: 'Nguyen Nhat AP', email: '2310480@student.hcmut.edu.vn' },
                    { studentID: '2310490', name: 'Pham Minh AQ', email: '2310490@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-07T20:10:00').toISOString(),
                sessions: []
            }
        ];
    }

    // Mock delay for async operations
    _delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Stores a new group or updates an existing one
     */
    async storeGroup(group) {
        await this._delay();
        
        const index = this.groups.findIndex(g => g.groupID === group.groupID);
        if (index > -1) {
            // Update existing group
            this.groups[index] = { ...this.groups[index], ...group };
            return true;
        } else {
            // Store new group
            this.groups.push(group);
            return true;
        }
    }

    /**
     * Retrieves all groups
     */
    async getAllGroups() {
        await this._delay();
        return JSON.parse(JSON.stringify(this.groups));
    }

    /**
     * Retrieves a group by its ID
     */
    async getGroupByID(groupID) {
        await this._delay();
        const group = this.groups.find(g => g.groupID === groupID);
        return group ? JSON.parse(JSON.stringify(group)) : null;
    }

    /**
     * Retrieves groups by student ID
     */
    async getGroupsByStudent(studentID) {
        await this._delay();
        const studentGroups = this.groups.filter(g => 
            g.member.some(m => m.studentID === studentID)
        );
        return JSON.parse(JSON.stringify(studentGroups));
    }

    /**
     * Retrieves groups by tutor ID
     */
    async getGroupsByTutor(tutorID) {
        await this._delay();
        const tutorGroups = this.groups.filter(g => 
            g.tutor && g.tutor.tutorID === tutorID
        );
        return JSON.parse(JSON.stringify(tutorGroups));
    }

    /**
     * Searches groups based on criteria
     */
    async searchGroup(filters = {}) {
        await this._delay();
        let filteredGroups = [...this.groups];

        if (filters.creator) {
            filteredGroups = filteredGroups.filter(g => 
                g.creatorStudent.name.toLowerCase().includes(filters.creator.toLowerCase()) ||
                g.creatorStudent.studentID.includes(filters.creator)
            );
        }

        if (filters.subject) {
            filteredGroups = filteredGroups.filter(g => 
                g.subject.toLowerCase().includes(filters.subject.toLowerCase())
            );
        }

        if (filters.tutor) {
            filteredGroups = filteredGroups.filter(g => 
                g.tutor && g.tutor.name.toLowerCase().includes(filters.tutor.toLowerCase())
            );
        }

        if (filters.date) {
            filteredGroups = filteredGroups.filter(g => 
                g.createdDate.substring(0, 10) === filters.date
            );
        }

        if (filters.status) {
            filteredGroups = filteredGroups.filter(g => g.status === filters.status);
        }

        return JSON.parse(JSON.stringify(filteredGroups));
    }

    /**
     * Updates a group's properties
     */
    async updateGroup(groupID, updates) {
        await this._delay();
        const index = this.groups.findIndex(g => g.groupID === groupID);
        if (index > -1) {
            this.groups[index] = { ...this.groups[index], ...updates };
            return true;
        }
        return false;
    }

    /**
     * Deletes a group by ID
     */
    async deleteGroup(groupID) {
        await this._delay();
        const initialLength = this.groups.length;
        this.groups = this.groups.filter(g => g.groupID !== groupID);
        return this.groups.length < initialLength;
    }
}

// Global instance
const groupDatabase = new GroupDatabase();
module.exports = groupDatabase;
