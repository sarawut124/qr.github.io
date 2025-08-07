const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// ตั้งค่า multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // ใช้ timestamp เพื่อหลีกเลี่ยงชื่อไฟล์ซ้ำ
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.post('/submit', upload.single('image'), (req, res) => {
    const { message, contact, selectedIcon } = req.body;
    const imagePath = req.file ? req.file.path : '';

    // บันทึกข้อมูลลงใน JSON
    const data = { message, contact, selectedIcon, image: imagePath };
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

    // ตั้งเวลา 5 วินาทีเพื่อเคลียร์ข้อมูล
    setTimeout(() => {
        fs.writeFileSync('data.json', JSON.stringify({})); // เคลียร์ข้อมูลใน JSON
    }, 5000); // 5000 มิลลิวินาที = 5 วินาที

    res.redirect('/view-data');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync('data.json'));
    res.json(data);
});

app.get('/view-data', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewData.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
