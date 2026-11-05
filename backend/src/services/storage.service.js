/**
 * Upload storage.
 *
 * Two drivers, selected with STORAGE_DRIVER:
 *   local (default) — writes to backend/uploads on disk. Correct for local
 *                     development, Docker and any host with a persistent disk.
 *   s3              — writes to an S3-compatible bucket (AWS S3, Cloudflare R2,
 *                     Supabase Storage, Backblaze B2, MinIO). Required in
 *                     production on hosts with an ephemeral filesystem, where a
 *                     local file disappears on the next deploy or restart.
 *
 * Both drivers expose the same contract to callers:
 *   req.file.storageReference — where the bytes live (path, or object key)
 *   req.file.integrityHash    — SHA-256 of the stored bytes
 */

const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DRIVER = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
const MAX_FILE_BYTES = Number.parseInt(process.env.MAX_UPLOAD_BYTES ?? '', 10) || 5 * 1024 * 1024;

const isVercel = Boolean(process.env.VERCEL);

// The local driver may only use the filesystem when it is writable and durable.
const uploadDir = isVercel ? os.tmpdir() : path.join(__dirname, '../../uploads');

if (DRIVER === 'local' && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let s3 = null;

if (DRIVER === 's3') {
  let S3Client;
  let PutObjectCommand;

  try {
    ({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'));
  } catch {
    throw new Error(
      'STORAGE_DRIVER=s3 requires the @aws-sdk/client-s3 package. Run "npm install" in backend/.'
    );
  }

  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error('STORAGE_DRIVER=s3 requires S3_BUCKET to be set.');
  }

  s3 = {
    bucket,
    putObject: PutObjectCommand,
    client: new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
            }
          : undefined
    })
  };
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${path.basename(file.originalname)}`);
  }
});

const upload = multer({
  storage: DRIVER === 's3' ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: MAX_FILE_BYTES }
});

const hashBuffer = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

const calculateFileHash = (filePath) =>
  new Promise((resolve, reject) => {
    if (Buffer.isBuffer(filePath)) {
      return resolve(hashBuffer(filePath));
    }

    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });

/**
 * Persist one uploaded file with the active driver and attach the reference
 * plus integrity hash to the multer file object.
 */
async function persistFile(file) {
  if (DRIVER === 's3') {
    const extension = path.extname(file.originalname);
    const key = `verification-documents/${Date.now()}-${crypto.randomUUID()}${extension}`;

    await s3.client.send(
      new s3.putObject({
        Bucket: s3.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256'
      })
    );

    file.storageReference = key;
    file.integrityHash = hashBuffer(file.buffer);
    file.buffer = null; // release the buffer as soon as it is stored
    return file;
  }

  file.storageReference = file.path;
  file.integrityHash = await calculateFileHash(file.path);
  return file;
}

/**
 * Drop-in replacement for `upload.single(field)` that also performs the
 * (possibly remote) write, so route handlers stay synchronous about it.
 */
const uploadSingle = (field) => (req, res, next) => {
  upload.single(field)(req, res, (error) => {
    if (error) return next(error);
    if (!req.file) return next();

    persistFile(req.file)
      .then(() => next())
      .catch(next);
  });
};

module.exports = {
  upload,
  uploadSingle,
  calculateFileHash,
  storageDriver: DRIVER,
  maxUploadBytes: MAX_FILE_BYTES
};
