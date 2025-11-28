const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const materialFilePath = path.join(__dirname, '..', '..', 'dataBase', 'material.js');

// --- PHẦN 1: IMPLEMENTATION CLASS (Khớp 1:1 với Diagram) ---
class MaterialController {
    
    constructor() {
        this.filePath = materialFilePath;
    }

    // Private Helper
    _loadDB() {
        try {
            if (!fs.existsSync(this.filePath)) return [];
            const raw = fs.readFileSync(this.filePath, 'utf8');
            const idx = raw.indexOf('=');
            if (idx === -1) return [];
            let jsonPart = raw.slice(idx + 1).trim();
            if (jsonPart.endsWith(';')) jsonPart = jsonPart.slice(0, -1);
            return JSON.parse(jsonPart);
        } catch (err) {
            console.error('Error reading DB:', err);
            return [];
        }
    }

    // Private Helper
    _saveDB(data) {
        try {
            const content = 'module.exports = ' + JSON.stringify(data, null, 4) + ';\n';
            fs.writeFileSync(this.filePath, content, 'utf8');
            return true;
        } catch (err) {
            console.error('Error writing DB:', err);
            return false;
        }
    }

    // + getMaterials(sessionID: string): List<Material>
    getMaterials(sessionID) {
        const db = this._loadDB();
        const record = db.find(r => r.sessionId == sessionID);
        return record ? record.materials : [];
    }

    // + updateMaterials(sessionID: string, materials: List<Material>): bool
    updateMaterials(sessionID, materials) {
        const db = this._loadDB();
        const index = db.findIndex(r => r.sessionId == sessionID);
        
        if (index !== -1) {
            db[index].materials = materials;
        } else {
            db.push({ sessionId: parseInt(sessionID), materials: materials });
        }
        return this._saveDB(db);
    }

    // + searchMaterials(keyword: string): List<Material>
    searchMaterials(keyword) {
        if (!keyword) return [];
        const db = this._loadDB();
        const term = keyword.toLowerCase().trim();
        const results = [];
        const seen = new Set();

        db.forEach(session => {
            if (session.materials) {
                session.materials.forEach(mat => {
                    if (mat.name.toLowerCase().includes(term) && !seen.has(mat.name)) {
                        // Trả về kèm sessionId để biết ngữ cảnh (nếu cần)
                        results.push({ ...mat, sessionId: session.sessionId });
                        seen.add(mat.name);
                    }
                });
            }
        });
        return results;
    }

    // + addMaterial(sessionID: string, material: Material): bool
    addMaterial(sessionID, material) {
        const db = this._loadDB();
        const index = db.findIndex(r => r.sessionId == sessionID);

        if (index === -1) return false; // Không tìm thấy session

        // Check trùng
        const exists = db[index].materials.some(m => m.name === material.name && m.url === material.url);
        if (exists) return false;

        db[index].materials.push(material);
        return this._saveDB(db);
    }

    // + deleteMaterial(sessionID: string, materialIndex: int): bool
    deleteMaterial(sessionID, materialIndex) {
        const db = this._loadDB();
        const index = db.findIndex(r => r.sessionId == sessionID);

        if (index === -1) return false;

        const matIdx = parseInt(materialIndex);
        if (isNaN(matIdx) || matIdx < 0 || matIdx >= db[index].materials.length) {
            return false;
        }

        db[index].materials.splice(matIdx, 1);
        return this._saveDB(db);
    }
}

// Khởi tạo Controller Instance
const materialController = new MaterialController();


// --- PHẦN 2: ROUTER (Gọi hàm của Controller) ---

// PUT /:sessionId -> updateMaterials
router.put('/:sessionId', (req, res) => {
    try {
        const success = materialController.updateMaterials(req.params.sessionId, req.body.materials);
        if (success) {
            res.json({ success: true, message: 'Updated successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Write error' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /search -> searchMaterials
router.get('/search', (req, res) => {
    try {
        const data = materialController.searchMaterials(req.query.keyword);
        res.json({ success: true, data });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /:sessionId -> getMaterials
router.get('/:sessionId', (req, res) => {
    try {
        const data = materialController.getMaterials(req.params.sessionId);
        // Wrapper lại format cũ để FE không gãy
        res.json({ success: true, data: { sessionId: parseInt(req.params.sessionId), materials: data } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /:sessionId/add -> addMaterial
router.post('/:sessionId/add', (req, res) => {
    try {
        const success = materialController.addMaterial(req.params.sessionId, req.body.material);
        if (success) {
            // Lấy lại danh sách mới nhất để trả về cho FE cập nhật UI ngay
            const newList = materialController.getMaterials(req.params.sessionId);
            res.json({ success: true, message: 'Added', data: { materials: newList } });
        } else {
            res.status(400).json({ success: false, message: 'Session not found or Material exists' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /:sessionId/:idx -> deleteMaterial
router.delete('/:sessionId/:idx', (req, res) => {
    try {
        const success = materialController.deleteMaterial(req.params.sessionId, req.params.idx);
        if (success) {
            const newList = materialController.getMaterials(req.params.sessionId);
            res.json({ success: true, message: 'Deleted', data: { materials: newList } });
        } else {
            res.status(400).json({ success: false, message: 'Invalid index or session' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;