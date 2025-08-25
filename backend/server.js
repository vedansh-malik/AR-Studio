const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect('mongodb+srv://vedanshmalik:P%40ssword5088@cluster0.davtddh.mongodb.net/ARclient', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// AR Model Schema
const ARModelSchema = new mongoose.Schema({
  modelId: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  metadata: {
    scale: { type: String, default: '0.5 0.5 0.5' },
    position: { type: String, default: '0 0 0' },
    rotation: { type: String, default: '0 0 0' },
  }
});

const ARModel = mongoose.model('ARModel', ARModelSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/models';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.glb', '.gltf', '.obj', '.fbx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only GLB, GLTF, OBJ, and FBX files are allowed.'));
    }
  }
});

// API Routes

// Upload AR model
app.post('/api/upload', upload.single('arModel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const modelId = uuidv4();
    const newModel = new ARModel({
      modelId: modelId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).toLowerCase(),
    });

    const savedModel = await newModel.save();

    res.json({
      success: true,
      model: savedModel,
      fileUrl: `/uploads/models/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get all models
app.get('/api/models', async (req, res) => {
  try {
    const models = await ARModel.find({ isActive: true }).sort({ uploadDate: -1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Get specific model
app.get('/api/models/:modelId', async (req, res) => {
  try {
    const model = await ARModel.findOne({ modelId: req.params.modelId, isActive: true });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch model' });
  }
});

// Generate AR code
app.get('/api/generate-code/:modelId', async (req, res) => {
  try {
    const model = await ARModel.findOne({ modelId: req.params.modelId });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const arCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AR Model - ${model.originalName}</title>
    <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/aframe/build/aframe-ar-nft.js"></script>
</head>
<body>
    <a-scene
        vr-mode-ui="enabled: false"
        embedded
        arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false;"
        renderer="antialias: true; alpha: true">
        
        <!-- Place model directly in front of camera -->
        <a-entity
            id="ar-model-${model.modelId}"
            gltf-model="url(${process.env.BASE_URL || 'http://localhost:5000'}/uploads/models/${model.filename})"
            scale="${model.metadata.scale}"
            position="0 0 -2"
            rotation="${model.metadata.rotation}"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 10000">
        </a-entity>
        
        <a-entity camera></a-entity>
    </a-scene>

    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        a-scene { width: 100%; height: 100vh; }
        .ar-info {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 1000;
        }
    </style>

    <div class="ar-info">
        <h3>AR Model: ${model.originalName}</h3>
        <p>Model placed in front of you (no marker needed)</p>
    </div>
</body>
</html>
`;

    // Update download count
    await ARModel.findByIdAndUpdate(model._id, { $inc: { downloadCount: 1 } });

    res.json({
      success: true,
      code: arCode,
      model: model
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// Update model metadata
app.put('/api/models/:modelId', async (req, res) => {
  try {
    const { scale, position, rotation } = req.body;
    const updatedModel = await ARModel.findOneAndUpdate(
      { modelId: req.params.modelId },
      {
        $set: {
          'metadata.scale': scale || '0.5 0.5 0.5',
          'metadata.position': position || '0 0 0',
          'metadata.rotation': rotation || '0 0 0'
        }
      },
      { new: true }
    );

    if (!updatedModel) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json({ success: true, model: updatedModel });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update model' });
  }
});

// Delete model
app.delete('/api/models/:modelId', async (req, res) => {
  try {
    const model = await ARModel.findOneAndUpdate(
      { modelId: req.params.modelId },
      { isActive: false },
      { new: true }
    );

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json({ success: true, message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});