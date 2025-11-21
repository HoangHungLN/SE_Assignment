// server/app.js
const express = require('express');
const cors = require('cors');

// Import Artifacts (Các Controller)
const groupController = require('./artifacts/GroupController');
// const sessionController = require('./artifacts/SessionController'); // Khi nào bạn 4 làm xong thì bỏ comment

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- Routing (Điều hướng request vào đúng phương thức của Class) ---

// Mapping request GET /api/groups vào method searchGroup của GroupController
app.get('/api/groups', (req, res) => groupController.searchGroup(req, res));

// Mapping request POST /api/groups vào method studentCreateGroup của GroupController
app.post('/api/groups', (req, res) => groupController.studentCreateGroup(req, res));

app.listen(PORT, () => {
    console.log(`Web Server running at http://localhost:${PORT}`);
});