import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileExplorer.css'; 


const FileExplorer = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('file');
  const [parent, setParent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('http://localhost:5005/api/files');
      setFiles(res.data);
    } catch (err) {
      setError('Failed to fetch files');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5005/api/files', { name, type, parent });
      fetchFiles();
      setName('');
      setType('file');
      setParent(null);
    } catch (err) {
      setError('Failed to add file');
    }
  };

  const handleRename = async () => {
    if (!selectedFile) return;
    setError('');
    try {
      await axios.put(`http://localhost:5005/api/files/${selectedFile._id}`, { name });
      fetchFiles();
      setSelectedFile(null);
      setName('');
    } catch (err) {
      setError('Failed to rename file');
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    setError('');
    try {
      await axios.delete(`http://localhost:5005/api/files/${selectedFile._id}`);
      fetchFiles();
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const renderFiles = (files, parentId = null) => {
    return (
      <ul>
        {files
          .filter((file) => file.parent === parentId)
          .map((file) => (
            <li key={file._id} className="file-item">
              <span onClick={() => setSelectedFile(file)} className="file-name">
                {file.name}
              </span>
              {file.type === 'directory' && renderFiles(files, file._id)}
            </li>
          ))}
      </ul>
    );
  };

  return (
    <div className="file-explorer">
      <h1>File Explorer</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="explorer-container">
        <div className="file-tree">
          <h2>File Structure</h2>
          {renderFiles(files)}
        </div>
        <div className="file-actions">
          <form onSubmit={handleSubmit} className="file-form">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="file">File</option>
              <option value="directory">Directory</option>
            </select>
            <button type="submit">Add</button>
          </form>
          {selectedFile && (
            <div className="selected-file-actions">
              <input
                type="text"
                placeholder="New name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button onClick={handleRename}>Rename</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
