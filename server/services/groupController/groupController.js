// server/services/groupController/groupController.js
const express = require('express');
const router = express.Router();

/**
 * GroupController
 * - Quản lý các "nhóm dạy" / "lớp dạy" mà tutor mở ra.
 * - Dùng dữ liệu mock (hard-code) trong bộ nhớ, không dùng DB thật.
 */
class GroupController {
  constructor() {
    // Mock data cho các nhóm dạy
    this.groups = [
      {
        id: 1,
        tutorId: 'GV001',
        subjectCode: 'CO2007',
        subjectName: 'Kiến trúc Máy tính',
        groupName: 'Nhóm 1 - Ôn tập chương 1',
        description: 'Ôn tập kiến trúc cơ bản, pipeline, cache.',
        date: '2025-10-05',
        time: '16:55',
        format: 'On site',
        location: 'B1-303',
        onlineLink: '',
        maxStudents: 30,
        currentStudents: 12,
        status: 'open'
      },
      {
        id: 2,
        tutorId: 'GV001',
        subjectCode: 'CO2003',
        subjectName: 'Cấu trúc dữ liệu',
        groupName: 'Nhóm 2 - Cây nhị phân',
        description: 'Ôn tập cây, heap, BST.',
        date: '2025-11-12',
        time: '17:45',
        format: 'Online',
        location: '',
        onlineLink: 'https://meet.google.com/mock-ctdl',
        maxStudents: 40,
        currentStudents: 25,
        status: 'open'
      },
      {
        id: 3,
        tutorId: 'GV002',
        subjectCode: 'CO2013',
        subjectName: 'Lập trình hướng đối tượng',
        groupName: 'Nhóm 1 - OOP cơ bản',
        description: 'Class, object, kế thừa, đa hình.',
        date: '2025-10-20',
        time: '19:00',
        format: 'Both',
        location: 'H6-506',
        onlineLink: 'https://meet.google.com/mock-oop',
        maxStudents: 35,
        currentStudents: 18,
        status: 'open'
      }
    ];
  }

  // Lấy tất cả nhóm
  getAllGroups() {
    console.log('[GroupController] getAllGroups');
    return this.groups;
  }

  // Lấy danh sách nhóm của một tutor
  getTutorGroups(tutorId) {
    console.log('[GroupController] getTutorGroups:', tutorId);
    return this.groups.filter(g => g.tutorId === tutorId);
  }

  // Lấy chi tiết 1 nhóm
  getGroupById(groupId) {
    console.log('[GroupController] getGroupById:', groupId);
    const id = parseInt(groupId, 10);
    return this.groups.find(g => g.id === id) || null;
  }

  // Tạo nhóm dạy mới
  createGroup(groupData) {
    console.log('[GroupController] createGroup với dữ liệu:', groupData);

    const newId =
      this.groups.length === 0
        ? 1
        : Math.max(...this.groups.map(g => g.id)) + 1;

    const newGroup = {
      id: newId,
      tutorId: groupData.tutorId || 'GV001',
      subjectCode: groupData.subjectCode || '',
      subjectName: groupData.subjectName || '',
      groupName: groupData.groupName || `Nhóm ${newId}`,
      description: groupData.description || '',
      date: groupData.date || '',
      time: groupData.time || '',
      format: groupData.format || 'On site',
      location: groupData.location || '',
      onlineLink: groupData.onlineLink || '',
      maxStudents: parseInt(groupData.maxStudents || 30, 10),
      currentStudents: 0,
      status: 'open'
    };

    this.groups.push(newGroup);

    return {
      success: true,
      message: 'Tạo nhóm dạy mới thành công',
      data: newGroup
    };
  }

  // Cập nhật nhóm
  updateGroup(groupId, updates) {
    console.log('[GroupController] updateGroup:', groupId, updates);
    const id = parseInt(groupId, 10);
    const index = this.groups.findIndex(g => g.id === id);

    if (index === -1) {
      return {
        success: false,
        message: 'Không tìm thấy nhóm dạy'
      };
    }

    const updated = {
      ...this.groups[index],
      ...updates,
      id // không cho sửa id
    };

    this.groups[index] = updated;

    return {
      success: true,
      message: 'Cập nhật nhóm dạy thành công',
      data: updated
    };
  }

  // Xóa nhóm
  deleteGroup(groupId) {
    console.log('[GroupController] deleteGroup:', groupId);
    const id = parseInt(groupId, 10);
    const lengthBefore = this.groups.length;
    this.groups = this.groups.filter(g => g.id !== id);

    if (this.groups.length === lengthBefore) {
      return {
        success: false,
        message: 'Không tìm thấy nhóm để xóa'
      };
    }

    return {
      success: true,
      message: 'Xóa nhóm dạy thành công'
    };
  }

  // Lấy danh sách môn (subject) mà tutor có nhóm dạy
  getTutorSubjects(tutorId) {
    const groups = this.getTutorGroups(tutorId);
    const map = new Map();

    groups.forEach(g => {
      const key = g.subjectName;
      if (!map.has(key)) {
        map.set(key, {
          name: g.subjectName,
          code: g.subjectCode || 'N/A'
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
}

// Khởi tạo instance
const groupController = new GroupController();

// ========== API ROUTES ==========

/**
 * GET /api/groups
 * Lấy tất cả nhóm dạy
 */
router.get('/', (req, res) => {
  try {
    const data = groupController.getAllGroups();
    res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    console.error('[Error] GET /api/groups:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhóm dạy',
      error: error.message
    });
  }
});

/**
 * GET /api/groups/tutor/:tutorId
 * Lấy danh sách nhóm dạy của một tutor
 */
router.get('/tutor/:tutorId', (req, res) => {
  try {
    const { tutorId } = req.params;
    const data = groupController.getTutorGroups(tutorId);

    res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    console.error('[Error] GET /api/groups/tutor/:tutorId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy nhóm dạy của tutor',
      error: error.message
    });
  }
});

/**
 * GET /api/groups/tutor/:tutorId/subjects
 * Lấy danh sách môn mà tutor đang có nhóm dạy
 */
router.get('/tutor/:tutorId/subjects', (req, res) => {
  try {
    const { tutorId } = req.params;
    const data = groupController.getTutorSubjects(tutorId);

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('[Error] GET /api/groups/tutor/:tutorId/subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách môn của tutor',
      error: error.message
    });
  }
});

/**
 * GET /api/groups/:groupId
 * Lấy chi tiết một nhóm dạy
 */
router.get('/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    const group = groupController.getGroupById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm dạy'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('[Error] GET /api/groups/:groupId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết nhóm dạy',
      error: error.message
    });
  }
});

/**
 * POST /api/groups
 * Tạo nhóm dạy mới
 */
router.post('/', (req, res) => {
  try {
    const result = groupController.createGroup(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('[Error] POST /api/groups:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo nhóm dạy',
      error: error.message
    });
  }
});

/**
 * PUT /api/groups/:groupId
 * Cập nhật nhóm dạy
 */
router.put('/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    const result = groupController.updateGroup(groupId, req.body);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[Error] PUT /api/groups/:groupId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật nhóm dạy',
      error: error.message
    });
  }
});

/**
 * DELETE /api/groups/:groupId
 * Xóa nhóm dạy
 */
router.delete('/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    const result = groupController.deleteGroup(groupId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('[Error] DELETE /api/groups/:groupId:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa nhóm dạy',
      error: error.message
    });
  }
});

module.exports = router;
