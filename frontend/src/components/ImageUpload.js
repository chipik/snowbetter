import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import api from '../api/axios';

const UploadContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const UploadArea = styled(motion.div)`
  border: 2px dashed ${props => props.isDragOver ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  background: ${props => props.isDragOver ? 'rgba(102, 126, 234, 0.05)' : '#f8f9fa'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  ${props => props.hasImage && `
    border-style: solid;
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  `}

  ${props => props.hasError && `
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  `}
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 15px;
  color: ${props => props.hasError ? '#ef4444' : props.hasImage ? '#10b981' : '#667eea'};
`;

const UploadText = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const UploadSubtext = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
`;

const ImagePreview = styled.div`
  position: relative;
  margin-top: 15px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 1);
    transform: scale(1.1);
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  font-size: 0.9rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const UrlInputContainer = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
`;

const UrlInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const OrDivider = styled.div`
  text-align: center;
  margin: 20px 0;
  position: relative;
  color: #666;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e2e8f0;
  }

  span {
    background: white;
    padding: 0 15px;
  }
`;

function ImageUpload({ 
  value, 
  onChange, 
  label = "Изображение трюка",
  required = false,
  allowUrl = true 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setError('');
    setSuccess('');
    setIsUploading(true);

    // Валидация на клиенте
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Неподдерживаемый формат файла. Разрешены: JPG, PNG, GIF, WebP');
      setIsUploading(false);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Файл слишком большой. Максимальный размер: 5MB');
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const imageUrl = `http://localhost:8000${response.data.image_url}`;
        onChange(imageUrl);
        setSuccess('Изображение успешно загружено!');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError(error.response?.data?.detail || 'Ошибка при загрузке изображения');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setUrlInput(url);
    
    // Простая валидация URL
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      onChange(url);
      setError('');
      setSuccess('URL изображения установлен');
    } else if (!url) {
      onChange('');
      setSuccess('');
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setUrlInput('');
    setSuccess('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAreaClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const hasImage = !!value;
  const hasError = !!error;

  return (
    <UploadContainer>
      <Label>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </Label>
      
      <UploadArea
        isDragOver={isDragOver}
        hasImage={hasImage}
        hasError={hasError}
        onClick={handleAreaClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isUploading && (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        )}
        
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
        />
        
        <UploadIcon hasImage={hasImage} hasError={hasError}>
          {hasError ? (
            <AlertCircle size={48} />
          ) : hasImage ? (
            <Check size={48} />
          ) : (
            <Upload size={48} />
          )}
        </UploadIcon>
        
        <UploadText>
          {hasImage ? 'Изображение загружено' : 'Загрузить изображение'}
        </UploadText>
        
        <UploadSubtext>
          Перетащите файл сюда или нажмите для выбора
          <br />
          Поддерживаемые форматы: JPG, PNG, GIF, WebP (до 5MB)
        </UploadSubtext>

        {hasImage && (
          <ImagePreview>
            <PreviewImage src={value} alt="Preview" />
            <RemoveButton onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}>
              <X size={16} />
            </RemoveButton>
          </ImagePreview>
        )}
      </UploadArea>

      {allowUrl && (
        <>
          <OrDivider>
            <span>или</span>
          </OrDivider>
          
          <UrlInputContainer>
            <UrlInput
              type="url"
              placeholder="Вставьте ссылку на изображение"
              value={urlInput}
              onChange={handleUrlChange}
            />
          </UrlInputContainer>
        </>
      )}

      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}

      {success && (
        <SuccessMessage>
          <Check size={16} />
          {success}
        </SuccessMessage>
      )}
    </UploadContainer>
  );
}

export default ImageUpload;
