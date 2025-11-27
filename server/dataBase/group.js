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
                tutor: { 
                    tutorID: 'T005', 
                    name: 'Phan Thanh K', 
                    subject: 'Hoá đại cương (CH1005)',
                    email: 'phanthanhk@hcmut.edu.vn',
                    department: 'Khoa Kỹ thuật Hóa học',
                    major: 'Hóa học',
                    degree: 'Tiến sĩ',
                    role: 'Giảng viên'
                },
                subject: 'Hoá đại cương (CH1005)',
                description: 'Tất cả chủ đề từ cơ bản đến nâng cao, đặc biệt tập trung vào phần bài tập tính toán và thí nghiệm.',
                maxMembers: 5,
                currentMembers: 5,
                status: 'accepted',
                member: [
                    { studentID: '2310123', name: 'Hồ Thị D', email: '2310123@student.hcmut.edu.vn' },
                    { studentID: '2310456', name: 'Nguyễn Văn X', email: '2310456@student.hcmut.edu.vn' },
                    { studentID: '2310789', name: 'Trần Thị Y', email: '2310789@student.hcmut.edu.vn' },
                    { studentID: '2310321', name: 'Lê Văn Z', email: '2310321@student.hcmut.edu.vn' },
                    { studentID: '2310678', name: 'Phạm Thị W', email: '2310678@student.hcmut.edu.vn' }
                ],
                createdDate: new Date('2025-08-04T10:30:00').toISOString(),
                sessions: [
                    {
                        sessionID: 'S002',
                        date: new Date('2025-08-08T16:00:00').toISOString(),
                        duration: 1.5,
                        location: 'Thư viện',
                        topic: 'Cân bằng hóa học'
                    }
                ]
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