import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Star, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

const CardContainer = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-width: 400px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const AppLogo = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  opacity: 0.8;
  z-index: 2;
`;

const AchievementIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 20px;
  z-index: 2;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
`;

const AchievementName = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  z-index: 2;
`;

const AchievementDescription = styled.p`
  font-size: 1.3rem;
  margin: 0 0 30px 0;
  opacity: 0.9;
  line-height: 1.4;
  z-index: 2;
`;

const PointsBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  z-index: 2;
`;

const UserInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  opacity: 0.8;
  z-index: 2;
`;

const Username = styled.div`
  font-weight: 600;
`;

const Date = styled.div`
  font-size: 0.9rem;
`;

const DownloadButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 2;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const AchievementShareCard = ({ 
  achievement, 
  username, 
  earnedAt, 
  showDownload = true,
  onDownload 
}) => {
  const cardRef = useRef(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Высокое качество
        useCORS: true,
        allowTaint: true,
      });

      // Создаем ссылку для скачивания
      const link = document.createElement('a');
      link.download = `achievement-${achievement.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success('Изображение сохранено!');
      
      if (onDownload) {
        onDownload(canvas.toDataURL());
      }
    } catch (error) {
      toast.error('Ошибка при сохранении изображения');
      console.error('Error downloading image:', error);
    }
  };

  return (
    <PreviewContainer>
      <CardContainer
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AppLogo>🏂 Уже лучше</AppLogo>
        
        <AchievementIcon>
          {achievement.icon || '🏆'}
        </AchievementIcon>
        
        <AchievementName>
          {achievement.name}
        </AchievementName>
        
        <AchievementDescription>
          {achievement.description}
        </AchievementDescription>
        
        <PointsBadge>
          <Star size={24} />
          {achievement.points} очков
        </PointsBadge>
        
        <UserInfo>
          <Username>@{username}</Username>
          <Date>{formatDate(earnedAt)}</Date>
        </UserInfo>
      </CardContainer>
      
      {showDownload && (
        <DownloadButton onClick={downloadImage}>
          <Download size={18} />
          Скачать изображение
        </DownloadButton>
      )}
    </PreviewContainer>
  );
};

export default AchievementShareCard;
