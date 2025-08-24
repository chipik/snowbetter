import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
`;

const NotificationCard = styled(motion.div)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 10px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%);
    background-size: 20px 20px;
    animation: shine 2s linear infinite;
  }

  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const AchievementHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const AchievementIcon = styled.div`
  font-size: 2.5rem;
  margin-right: 15px;
`;

const AchievementInfo = styled.div`
  flex: 1;
`;

const AchievementTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: white;
`;

const AchievementSubtitle = styled.p`
  font-size: 0.9rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
`;

const AchievementDescription = styled.p`
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
`;

const AchievementFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PointsBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 5px 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ViewAllButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const AchievementNotification = ({ achievements, onClose, onViewAll }) => {
  const handleClose = (achievementIndex) => {
    onClose(achievementIndex);
  };

  const showToastNotification = (achievement) => {
    toast.success(
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>{achievement.icon || '🏆'}</span>
        <div>
          <div style={{ fontWeight: 'bold' }}>{achievement.name}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>+{achievement.points} очков</div>
        </div>
      </div>,
      {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
        }
      }
    );
  };

  // Показываем toast уведомления для каждого достижения
  React.useEffect(() => {
    achievements.forEach(achievement => {
      showToastNotification(achievement);
    });
  }, [achievements]);

  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <NotificationContainer>
      <AnimatePresence>
        {achievements.slice(0, 3).map((achievement, index) => (
          <NotificationCard
            key={`${achievement.name}-${index}`}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 500,
              delay: index * 0.1 
            }}
          >
            <CloseButton onClick={() => handleClose(index)}>
              <X size={16} />
            </CloseButton>

            <AchievementHeader>
              <AchievementIcon>
                {achievement.icon || '🏆'}
              </AchievementIcon>
              <AchievementInfo>
                <AchievementTitle>Новое достижение!</AchievementTitle>
                <AchievementSubtitle>{achievement.name}</AchievementSubtitle>
              </AchievementInfo>
            </AchievementHeader>

            <AchievementDescription>
              {achievement.description}
            </AchievementDescription>

            <AchievementFooter>
              <PointsBadge>
                <Star size={16} />
                +{achievement.points} очков
              </PointsBadge>
              {onViewAll && (
                <ViewAllButton onClick={onViewAll}>
                  Все достижения
                </ViewAllButton>
              )}
            </AchievementFooter>
          </NotificationCard>
        ))}
        
        {achievements.length > 3 && (
          <NotificationCard
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ delay: 0.3 }}
          >
            <AchievementHeader>
              <AchievementIcon>🎉</AchievementIcon>
              <AchievementInfo>
                <AchievementTitle>И еще {achievements.length - 3}!</AchievementTitle>
                <AchievementSubtitle>достижений получено</AchievementSubtitle>
              </AchievementInfo>
            </AchievementHeader>
            
            <AchievementFooter>
              <div></div>
              {onViewAll && (
                <ViewAllButton onClick={onViewAll}>
                  Посмотреть все
                </ViewAllButton>
              )}
            </AchievementFooter>
          </NotificationCard>
        )}
      </AnimatePresence>
    </NotificationContainer>
  );
};

export default AchievementNotification;
