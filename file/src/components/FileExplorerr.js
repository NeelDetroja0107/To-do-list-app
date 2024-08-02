import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileExplorer = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('file');
  const [parent, setParent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const res = await axios.get('http://localhost:5005/api/files');
    setFiles(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5005/api/files', { name, type, parent });
    fetchFiles();
    setName('');
    setType('file');
    setParent(null);
  };

  const handleRename = async () => {
    await axios.put(`http://localhost:5005/api/files/${selectedFile._id}`, { name });
    fetchFiles();
    setSelectedFile(null);
    setName('');
  };

  const handleDelete = async () => {
    await axios.delete(`http://localhost:5005/api/files/${selectedFile._id}`);
    fetchFiles();
    setSelectedFile(null);
  };

  const renderFiles = (files, parentId = null) => {
    return files
      .filter((file) => file.parent === parentId)
      .map((file) => (
        <div key={file._id} className="file">
          <span onClick={() => setSelectedFile(file)}>{file.name}</span>
          {file.type === 'directory' && renderFiles(files, file._id)}
        </div>
      ));
  };

  return (
    <div className="file-explorer">
      <h1>File Explorer</h1>
      <div className="file-list">{renderFiles(files)}</div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="file">File</option>
          <option value="directory">Directory</option>
        </select>
        <button type="submit">Add</button>
      </form>
      {selectedFile && (
        <div>
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
  );
};

export default FileExplorer;
