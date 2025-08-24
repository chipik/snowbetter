import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BookOpen, ExternalLink } from 'lucide-react';
import TrickImage from './TrickImage';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  max-width: 900px;
  max-height: 90vh;
  width: 100%;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const Header = styled.div`
  padding: 30px 30px 20px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TricksList = styled.div`
  padding: 20px 30px 30px;
`;

const TrickCard = styled(motion.div)`
  display: flex;
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const TrickImageContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20px;
`;

const TrickInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TrickName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const TrickMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 0.9rem;
`;

const CategoryBadge = styled.span`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const LearnedDate = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const categoryTranslations = {
  'spins': 'Вращения',
  'flips': 'Сальто',
  'off-axis': 'Off-Axis',
  'grabs': 'Грэбы',
  'jibbing': 'Джиббинг',
  'combo': 'Комбо'
};

function LearnedTricksModal({ isOpen, onClose, learnedTricks, onTrickClick }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>

            <Header>
              <Title>
                <BookOpen size={24} />
                Изученные трюки ({learnedTricks?.length || 0})
              </Title>
            </Header>

            <TricksList>
              {learnedTricks && learnedTricks.length > 0 ? (
                learnedTricks.map((item, index) => (
                  <TrickCard
                    key={item.trick.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => onTrickClick?.(item.trick)}
                  >
                    <TrickImageContainer>
                      <TrickImage trick={item.trick} />
                    </TrickImageContainer>
                    
                    <TrickInfo>
                      <TrickName>{item.trick.name}</TrickName>
                      <TrickMeta>
                        <CategoryBadge>
                          {categoryTranslations[item.trick.category] || item.trick.category}
                        </CategoryBadge>
                        <LearnedDate>
                          <Calendar size={14} />
                          Изучено {formatDate(item.learned_at)}
                        </LearnedDate>
                        {onTrickClick && (
                          <span style={{ marginLeft: 'auto', color: '#667eea' }}>
                            <ExternalLink size={14} />
                          </span>
                        )}
                      </TrickMeta>
                    </TrickInfo>
                  </TrickCard>
                ))
              ) : (
                <EmptyState>
                  <EmptyIcon>📚</EmptyIcon>
                  <h3 style={{ marginBottom: '10px', color: '#333' }}>
                    Пока нет изученных трюков
                  </h3>
                  <p>
                    Начните изучать трюки, чтобы они появились здесь!
                  </p>
                </EmptyState>
              )}
            </TricksList>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}

export default LearnedTricksModal;
