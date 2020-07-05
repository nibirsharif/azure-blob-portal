import React from 'react';
import logo from './logo.svg';
import './App.css';
import FileInput from './FileInput';

function App() {
  const { BlobServiceClient } = require("@azure/storage-blob");

  return (
    <div>
      <FileInput />
    </div>
  );
}

export default App;
