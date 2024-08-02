const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


mongoose.connect('mongodb://localhost:27017/fileExplorer', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['file', 'directory'] },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
  createdAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

app.get('/api/files', async (req, res) => {
  try {
    const files = await File.find().populate('parent');
    res.json(files);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching files', error: error.message });
  }
});


app.post('/api/files', async (req, res) => {
  try {
    const file = new File(req.body);
    const savedFile = await file.save();
    res.status(201).json(savedFile);
  } catch (error) {
    res.status(400).json({ message: 'Error saving file', error: error.message });
  }
});


app.put('/api/files/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    res.status(400).json({ message: 'Error updating file', error: error.message });
  }
});


app.delete('/api/files/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findByIdAndDelete(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    if (file.type === 'directory') {
      await File.deleteMany({ parent: file._id });
    }
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});


const port = 5005;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
