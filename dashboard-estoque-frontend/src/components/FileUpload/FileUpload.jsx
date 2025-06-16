import React, { useState, useRef } from 'react';
import './FileUpload.scss';

const FileUpload = ({ label, onFileSelect, acceptedFormats, icon }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const getIcon = () => {
    switch (icon) {
      case 'package':
        return '📦';
      case 'chart-bar':
        return '📊';
      default:
        return '📄';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const accepted = acceptedFormats.split(',').map(format => format.trim());
    
    if (accepted.includes(fileExtension)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert(`Formato não suportado. Use: ${acceptedFormats}`);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept={acceptedFormats}
          style={{ display: 'none' }}
        />
        
        <div className="upload-icon">
          {selectedFile ? '✅' : getIcon()}
        </div>
        
        <div className="upload-content">
          <h3 className="upload-label">{label}</h3>
          
          {selectedFile ? (
            <div className="file-info">
              <div className="file-name">{selectedFile.name}</div>
              <div className="file-size">{formatFileSize(selectedFile.size)}</div>
              <div className="file-status">Arquivo carregado com sucesso!</div>
            </div>
          ) : (
            <div className="upload-instructions">
              <p className="main-text">Arraste e solte ou clique para selecionar</p>
              <p className="format-text">Formatos aceitos: {acceptedFormats}</p>
            </div>
          )}
        </div>
        
        {!selectedFile && (
          <div className="upload-button">
            <span>Selecionar Arquivo</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;