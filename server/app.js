const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors()); 
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const loginRoutes = require('./services/loginController/loginController'); 
const evaluateRoutes = require('./services/learningController/evaluateController');
const sessionRoutes = require('./services/sessionController/sessionController');
const groupRoutes = require('./services/groupController/groupController');
const materialRoutes = require('./services/groupController/materialController');

app.use('/api/auth', loginRoutes);
app.use('/api/learning/evaluate', evaluateRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/materials', materialRoutes);


app.get('/', (req, res) => {
    res.send('Hello! Tutor System Server is running...');
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại địa chỉ: http://localhost:${PORT}`);
});