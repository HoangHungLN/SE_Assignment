// server/services/learningController/materialController.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const materialFilePath = path.join(__dirname, '..', '..', 'dataBase', 'material.js');

// Helper: load current material DB from file
function loadMaterialFromFile() {
    try {
        const raw = fs.readFileSync(materialFilePath, 'utf8');
        const idx = raw.indexOf('=');
        if (idx === -1) return [];
        const jsonPart = raw.slice(idx + 1).trim();
        const cleaned = jsonPart.endsWith(';') ? jsonPart.slice(0, -1) : jsonPart;
        return JSON.parse(cleaned);
    } catch (err) {
        console.error('[materialController] Không thể đọc file material:', err.message);
        return [];
    }
}

// Helper: persist material array to file
function writeMaterialToFile(arr) {
    try {
        const fileContent = 'module.exports = ' + JSON.stringify(arr, null, 4) + ';\n';
        fs.writeFileSync(materialFilePath, fileContent, 'utf8');
        return true;
    } catch (err) {
        console.error('[materialController] Lỗi ghi file material:', err.message);
        throw err;
    }
}

/**
 * Upload materials to a session
 * PUT /api/learning/materials/:sessionId
 */
router.put('/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { materials } = req.body;

        console.log('[materialController] Upload materials to session:', sessionId);
        console.log('[materialController] Materials data:', materials);

        // Validate input
        if (!materials || !Array.isArray(materials)) {
            return res.status(400).json({
                success: false,
                message: 'Materials phải là một mảng'
            });
        }

        // Load current materials from file
        const arr = loadMaterialFromFile();
        
        // Find or create material record for this session
        const sessionIndex = arr.findIndex(m => m.sessionId == sessionId);
        
        if (sessionIndex !== -1) {
            arr[sessionIndex].materials = materials;
        } else {
            arr.push({
                sessionId: parseInt(sessionId),
                materials: materials
            });
        }

        // Write to file
        writeMaterialToFile(arr);

        console.log('[materialController] Materials updated successfully');

        return res.json({
            success: true,
            message: 'Cập nhật tài liệu thành công',
            data: {
                sessionId: parseInt(sessionId),
                materials: materials
            }
        });

    } catch (error) {
        console.error('[materialController] Error uploading materials:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật tài liệu',
            error: error.message
        });
    }
});

/**
 * Search materials by keyword
 * GET /api/learning/materials/search?keyword=xyz
 */
router.get('/search', (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword || !keyword.trim()) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Load all materials from file
        const arr = loadMaterialFromFile();
        const searchTerm = keyword.toLowerCase().trim();

        // Collect all unique materials from all sessions
        const allMaterials = [];
        const seenMaterialNames = new Set();

        arr.forEach(session => {
            if (session.materials && Array.isArray(session.materials)) {
                session.materials.forEach(material => {
                    const materialName = material.name.toLowerCase();
                    // Only add if not already seen and matches search term
                    if (!seenMaterialNames.has(material.name) && materialName.includes(searchTerm)) {
                        allMaterials.push({
                            ...material,
                            sessionId: session.sessionId
                        });
                        seenMaterialNames.add(material.name);
                    }
                });
            }
        });

        console.log('[materialController] Search results for keyword:', keyword, '-> Found:', allMaterials.length);

        return res.json({
            success: true,
            data: allMaterials
        });

    } catch (error) {
        console.error('[materialController] Error searching materials:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi tìm kiếm tài liệu',
            error: error.message
        });
    }
});

/**
 * Get materials of a session
 * GET /api/learning/materials/:sessionId
 */
router.get('/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;

        console.log('[materialController] Get materials of session:', sessionId);

        // Load materials from file
        const arr = loadMaterialFromFile();
        const materialRecord = arr.find(m => m.sessionId == sessionId);
        
        if (!materialRecord) {
            return res.json({
                success: true,
                data: {
                    sessionId: parseInt(sessionId),
                    materials: []
                }
            });
        }

        return res.json({
            success: true,
            data: {
                sessionId: materialRecord.sessionId,
                materials: materialRecord.materials || []
            }
        });

    } catch (error) {
        console.error('[materialController] Error getting materials:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy tài liệu',
            error: error.message
        });
    }
});

/**
 * Add a material from library to a session
 * POST /api/learning/materials/:sessionId/add
 */
router.post('/:sessionId/add', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { material } = req.body;

        console.log('[materialController] Add material to session:', sessionId);
        console.log('[materialController] Material:', material);

        // Validate input
        if (!material || !material.name || !material.url) {
            return res.status(400).json({
                success: false,
                message: 'Material phải có name và url'
            });
        }

        // Load current materials from file
        const arr = loadMaterialFromFile();
        const sessionIndex = arr.findIndex(m => m.sessionId == sessionId);

        if (sessionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy session'
            });
        }

        // Check if material already exists in this session
        const materialExists = arr[sessionIndex].materials.some(
            m => m.name === material.name && m.url === material.url
        );

        if (materialExists) {
            return res.status(400).json({
                success: false,
                message: 'Tài liệu này đã tồn tại trong buổi học'
            });
        }

        // Add material to session
        arr[sessionIndex].materials.push({
            name: material.name,
            url: material.url
        });

        // Write to file
        writeMaterialToFile(arr);

        console.log('[materialController] Material added successfully');

        return res.json({
            success: true,
            message: 'Thêm tài liệu thành công',
            data: {
                sessionId: arr[sessionIndex].sessionId,
                materials: arr[sessionIndex].materials
            }
        });

    } catch (error) {
        console.error('[materialController] Error adding material:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm tài liệu',
            error: error.message
        });
    }
});

/**
 * Delete a material from session
 * DELETE /api/learning/materials/:sessionId/:materialIndex
 */
router.delete('/:sessionId/:materialIndex', (req, res) => {
    try {
        const { sessionId, materialIndex } = req.params;

        console.log('[materialController] Delete material from session:', sessionId, 'at index:', materialIndex);

        // Load materials from file
        const arr = loadMaterialFromFile();
        const sessionIndex = arr.findIndex(m => m.sessionId == sessionId);
        
        if (sessionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy buổi học'
            });
        }

        // Validate material index
        const matIndex = parseInt(materialIndex);
        if (isNaN(matIndex) || matIndex < 0 || matIndex >= arr[sessionIndex].materials.length) {
            return res.status(400).json({
                success: false,
                message: 'Index tài liệu không hợp lệ'
            });
        }

        // Remove material
        arr[sessionIndex].materials.splice(matIndex, 1);

        // Write to file
        writeMaterialToFile(arr);

        console.log('[materialController] Material deleted successfully');

        return res.json({
            success: true,
            message: 'Xóa tài liệu thành công',
            data: {
                sessionId: arr[sessionIndex].sessionId,
                materials: arr[sessionIndex].materials
            }
        });

    } catch (error) {
        console.error('[materialController] Error deleting material:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa tài liệu',
            error: error.message
        });
    }
});

module.exports = router;
