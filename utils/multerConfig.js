const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const valid = allowed.test(file.mimetype);
    valid ? cb(null, true) : cb(new Error('Solo se permiten imágenes'));
  }
});

module.exports = upload;

