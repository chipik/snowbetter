import React, { useState } from 'react';
import styled from 'styled-components';
import ImageModal from './ImageModal';

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
`;

const Placeholder = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'show'
})`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  z-index: ${props => props.show ? 1 : 0};
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
  
  .emoji {
    margin-bottom: 10px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  .text {
    font-size: 0.4em;
    font-weight: 500;
    text-align: center;
    opacity: 0.8;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

const LoadingSpinner = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'show'
})`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 2;
  opacity: ${props => props.show ? 1 : 0};
  
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;



const categoryEmojis = {
  spins: '🌪️',
  flips: '🤸',
  'off-axis': '🔄',
  grabs: '✋',
  jibbing: '🛹',
  combo: '🎯'
};

function TrickImage({ trick, clickable = true, ...props }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    setLoading(false);
  };

  const handleImageClick = (e) => {
    if (clickable && imageLoaded && !imageError && trick.image_url) {
      e.stopPropagation();
      setShowModal(true);
    }
  };

  const shouldShowPlaceholder = !imageLoaded || imageError || !trick.image_url;
  const emoji = categoryEmojis[trick.category] || '🏂';

  return (
    <>
      <ImageContainer 
        {...props} 
        clickable={clickable && imageLoaded && !imageError && trick.image_url}
        onClick={handleImageClick}
      >
        {trick.image_url && !imageError && (
          <Image
            src={trick.image_url}
            alt={trick.name}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        )}
        
        <LoadingSpinner show={loading && trick.image_url && !imageError} />
        
        <Placeholder show={shouldShowPlaceholder}>
          <div className="emoji">{emoji}</div>
          <div className="text">{trick.name}</div>
        </Placeholder>


      </ImageContainer>

      <ImageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        src={trick.image_url}
        alt={trick.name}
        title={`${trick.name} - ${trick.category}`}
      />
    </>
  );
}

export default TrickImage;
