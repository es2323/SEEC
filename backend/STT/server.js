// server.js
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const multer = require('multer');
const { AssemblyAI } = require('assemblyai');
const cors = require('cors');
const fs = require('fs-extra'); // Using fs-extra for easier file operations
const path = require('path');

const app = express();
const port = process.env.PORT || 5000; // Use port 5000 by default or from environment

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes (adjust for production as needed)
app.use(express.json()); // To parse JSON request bodies (though not strictly needed for this specific endpoint)

// --- AssemblyAI Client Initialization ---
const assembly = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY, // Access API key from environment variables
});

// --- Multer Configuration for File Uploads ---
// Set up disk storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/'; // Directory to save uploaded files
    fs.ensureDirSync(uploadDir); // Ensure the upload directory exists
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename based on the original name and timestamp
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- API Endpoint: Transcribe Audio ---
app.post('/api/transcribe', upload.single('audio_file'), async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    console.error('Error: No audio file uploaded.');
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }

  const audioFilePath = req.file.path; // Path to the temporarily stored audio file

  try {
    console.log(`Transcribing audio file: ${audioFilePath}`);

    // Upload the audio file to AssemblyAI
    const uploadResult = await assembly.files.upload({
      data: fs.createReadStream(audioFilePath),
    });
    console.log(`File uploaded to AssemblyAI. Upload URL: ${uploadResult.uploadUrl}`);

    // Create a transcription job
    const transcript = await assembly.transcripts.submit({
      audio_url: uploadResult.uploadUrl,
      // Optional: Add other AssemblyAI options here, e.g.,
      // sentiment_analysis: true,
      // speaker_labels: true,
      // auto_chapters: true,
    });
    console.log(`Transcription job submitted. ID: ${transcript.id}, Status: ${transcript.status}`);

    // --- Polling for Transcription Completion ---
    // Since transcription is asynchronous, we need to poll the status
    let pollingResult = transcript;
    while (pollingResult.status !== 'completed' && pollingResult.status !== 'error') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      pollingResult = await assembly.transcripts.get(pollingResult.id);
      console.log(`Polling status for ${pollingResult.id}: ${pollingResult.status}`);
    }

    // Check final status and send response
    if (pollingResult.status === 'completed') {
      console.log(`Transcription completed successfully: ${pollingResult.text}`);
      res.json({ transcription: pollingResult.text });
    } else {
      console.error(`Transcription failed for ID ${pollingResult.id}: ${pollingResult.error}`);
      res.status(500).json({ error: `Transcription failed: ${pollingResult.error}` });
    }

  } catch (error) {
    console.error('Error during transcription process:', error);
    res.status(500).json({ error: 'Failed to transcribe audio.', details: error.message });
  } finally {
    // Crucially, delete the temporary audio file after processing
    try {
      await fs.remove(audioFilePath); // Use fs-extra's remove for cleaner deletion
      console.log(`Deleted temporary file: ${audioFilePath}`);
    } catch (cleanupError) {
      console.error(`Error deleting temporary file ${audioFilePath}:`, cleanupError);
    }
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});