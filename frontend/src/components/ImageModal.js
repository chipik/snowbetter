import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  border-radius: 12px;
`;

const ModalImage = styled(motion.img)`
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  cursor: ${props => props.zoomable ? 'zoom-in' : 'default'};
  transform: scale(${props => props.scale || 1}) rotate(${props => props.rotation || 0}deg);
  transition: transform 0.3s ease;
  
  ${props => props.scale > 1 && `
    cursor: grab;
    
    &:active {
      cursor: grabbing;
    }
  `}
`;

const Controls = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10001;
`;

const ControlButton = styled.button`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CloseButton = styled(ControlButton)`
  background: rgba(239, 68, 68, 0.9);
  color: white;
  
  &:hover {
    background: rgba(239, 68, 68, 1);
  }
`;

const ImageInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  white-space: nowrap;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function ImageModal({ 
  isOpen, 
  onClose, 
  src, 
  alt = "Изображение",
  title 
}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  // Сброс состояния при открытии/закрытии модала
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
    }
  }, [isOpen, src]);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageClick = () => {
    if (scale === 1) {
      handleZoomIn();
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <ModalContent
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Controls>
            <ControlButton 
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              title="Уменьшить"
            >
              <ZoomOut size={20} />
            </ControlButton>
            
            <ControlButton 
              onClick={handleZoomIn}
              disabled={scale >= 5}
              title="Увеличить"
            >
              <ZoomIn size={20} />
            </ControlButton>
            
            <ControlButton 
              onClick={handleRotate}
              title="Повернуть"
            >
              <RotateCw size={20} />
            </ControlButton>
            
            <ControlButton 
              onClick={handleDownload}
              title="Скачать"
            >
              <Download size={20} />
            </ControlButton>
            
            <CloseButton 
              onClick={onClose}
              title="Закрыть"
            >
              <X size={20} />
            </CloseButton>
          </Controls>

          <ImageContainer>
            {isLoading && <LoadingSpinner />}
            
            <ModalImage
              src={src}
              alt={alt}
              scale={scale}
              rotation={rotation}
              zoomable={scale === 1}
              onLoad={handleImageLoad}
              onClick={handleImageClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                display: isLoading ? 'none' : 'block'
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          </ImageContainer>

          {title && !isLoading && (
            <ImageInfo>
              {title}
            </ImageInfo>
          )}
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
}

export default ImageModal;
