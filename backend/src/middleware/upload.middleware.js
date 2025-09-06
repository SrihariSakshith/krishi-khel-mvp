const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'src/uploads/';
// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Store on disk for permanent user uploads (missions, posts)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Store in memory for temporary processing (AI diagnosis)
const memoryStorage = multer.memoryStorage();

module.exports = {
  uploadToDisk: multer({ storage: diskStorage }),
  uploadToMemory: multer({ storage: memoryStorage }),
};