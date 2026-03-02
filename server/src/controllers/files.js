const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const store = require('../store/memStore');
const { getBotReply } = require('../utils/botResponder');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

async function upload(ctx, broadcast) {
  const { file } = ctx.request.files || {};
  if (!file) {
    ctx.status = 400;
    ctx.body = { error: 'No file provided' };
    return;
  }

  const originalName = file.originalFilename || file.name || 'file';
  const ext = path.extname(originalName);
  const filename = `${nanoid()}${ext}`;
  const destPath = path.join(UPLOADS_DIR, filename);

  // Move temp file to uploads directory
  const fileData = fs.readFileSync(file.filepath || file.path);
  fs.writeFileSync(destPath, fileData);

  // Determine message type from MIME
  const mime = file.mimetype || file.type || '';
  let type = 'file';
  if (mime.startsWith('image/')) type = 'image';
  else if (mime.startsWith('video/')) type = 'video';
  else if (mime.startsWith('audio/')) type = 'audio';

  const url = `/api/files/${filename}`;
  const msg = store.addMessage({
    type,
    content: originalName,
    url,
    size: file.size,
    author: 'user',
  });

  broadcast({ type: 'message:new', payload: msg });

  ctx.status = 201;
  ctx.body = msg;
}

async function download(ctx) {
  const { filename } = ctx.params;
  // Prevent path traversal
  const safe = path.basename(filename);
  const filePath = path.join(UPLOADS_DIR, safe);

  if (!fs.existsSync(filePath)) {
    ctx.status = 404;
    ctx.body = { error: 'File not found' };
    return;
  }

  ctx.attachment(safe);
  ctx.body = fs.createReadStream(filePath);
}

module.exports = { upload, download };
