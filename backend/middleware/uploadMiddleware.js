const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads');
const maxFileSize = 900 * 1024;
const allowedTypes = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

class UnsupportedFileTypeError extends Error {}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdir(uploadDirectory, { recursive: true }, (error) => {
      callback(error, uploadDirectory);
    });
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomBytes(16).toString('hex')}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes[extension] !== file.mimetype) {
      return callback(new UnsupportedFileTypeError());
    }

    return callback(null, true);
  },
});

const hasValidSignature = (mimeType, signature) => {
  if (mimeType === 'application/pdf') {
    return signature.toString('ascii', 0, 4) === '%PDF';
  }

  return signature[0] === 0x50 && signature[1] === 0x4b;
};

const uploadAttachment = (req, res, next) => {
  upload.single('attachment')(req, res, async (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File must be no larger than 900 KiB' });
    }

    if (error instanceof UnsupportedFileTypeError) {
      return res.status(400).json({ message: 'Only PDF and DOCX files are allowed' });
    }

    if (error) {
      return next(error);
    }

    if (!req.file) {
      return next();
    }

    try {
      const file = await fs.promises.open(req.file.path, 'r');
      const signature = Buffer.alloc(4);
      try {
        await file.read(signature, 0, signature.length, 0);
      } finally {
        await file.close();
      }

      if (!hasValidSignature(req.file.mimetype, signature)) {
        await fs.promises.unlink(req.file.path);
        return res.status(400).json({ message: 'File content does not match its file type' });
      }

      return next();
    } catch (processingError) {
      return next(processingError);
    }
  });
};

module.exports = uploadAttachment;
