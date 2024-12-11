const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(process.cwd(), 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const modelFiles = [
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
    filename: 'tiny_face_detector_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',
    filename: 'tiny_face_detector_model-shard1'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_tiny_model-weights_manifest.json',
    filename: 'face_landmark_68_tiny_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_tiny_model-shard1',
    filename: 'face_landmark_68_tiny_model-shard1'
  }
];

const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
};

async function downloadModels() {
  console.log('Downloading face-api.js models...');
  console.log('Target directory:', modelsDir);
  
  try {
    for (const file of modelFiles) {
      console.log(`Downloading ${file.filename}...`);
      await downloadFile(file.url, file.filename);
    }
    console.log('All models downloaded successfully!');
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

downloadModels();
