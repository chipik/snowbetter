import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';
import TrickImage from './TrickImage';
import { useAuth } from '../contexts/AuthContext';

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
  max-width: 800px;
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

const ImageSection = styled.div`
  position: relative;
  height: 300px;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
`;

const ContentSection = styled.div`
  padding: 30px;
`;

const Header = styled.div`
  margin-bottom: 25px;
`;

const TrickName = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const CategoryBadge = styled.span`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TechniqueList = styled.ol`
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
`;

const TechniqueStep = styled.li`
  counter-increment: step-counter;
  background: #f8f9fa;
  margin-bottom: 10px;
  padding: 15px 20px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  position: relative;

  &::before {
    content: counter(step-counter);
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    background: #667eea;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
  }

  padding-left: 30px;
`;

const VideoSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
`;

const VideoButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #ff0000;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: #cc0000;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
  }
`;

const NoVideoMessage = styled.p`
  color: #999;
  font-style: italic;
  margin: 0;
`;

const ActionSection = styled.div`
  border-top: 1px solid #eee;
  padding: 20px 30px;
  background: #f8f9fa;
  border-radius: 0 0 20px 20px;
  display: flex;
  justify-content: center;
`;

const LearnButton = styled.button`
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const categoryTranslations = {
  'spins': 'Вращения',
  'flips': 'Сальто',
  'off-axis': 'Off-Axis',
  'grabs': 'Грэбы',
  'jibbing': 'Джиббинг',
  'combo': 'Комбо'
};

function TrickDetailModal({ trick, isOpen, onClose, onMarkLearned }) {
  const { isAuthenticated } = useAuth();

  if (!trick) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleVideoClick = () => {
    if (trick.video_url) {
      window.open(trick.video_url, '_blank');
    }
  };

  const renderTechnique = () => {
    if (!trick.technique) {
      return <NoVideoMessage>Техника исполнения пока не добавлена</NoVideoMessage>;
    }

    const steps = trick.technique.split('\n').filter(step => step.trim());
    return (
      <TechniqueList>
        {steps.map((step, index) => (
          <TechniqueStep key={index}>
            {step.replace(/^\d+\.\s*/, '')}
          </TechniqueStep>
        ))}
      </TechniqueList>
    );
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

            <ImageSection>
              <TrickImage trick={trick} />
            </ImageSection>

            <ContentSection>
              <Header>
                <TrickName>{trick.name}</TrickName>
                <CategoryBadge>
                  {categoryTranslations[trick.category] || trick.category}
                </CategoryBadge>
              </Header>

              <Description>{trick.description}</Description>

              <Section>
                <SectionTitle>
                  <BookOpen size={20} />
                  Техника исполнения
                </SectionTitle>
                {renderTechnique()}
              </Section>

              <Section>
                <SectionTitle>
                  <Play size={20} />
                  Видео обучение
                </SectionTitle>
                <VideoSection>
                  {trick.video_url ? (
                    <VideoButton href={trick.video_url} target="_blank" rel="noopener noreferrer">
                      <Play size={18} />
                      Смотреть на YouTube
                      <ExternalLink size={16} />
                    </VideoButton>
                  ) : (
                    <NoVideoMessage>Видео пока не добавлено</NoVideoMessage>
                  )}
                </VideoSection>
              </Section>
            </ContentSection>

            {isAuthenticated() && (
              <ActionSection>
                <LearnButton onClick={() => onMarkLearned(trick.id)}>
                  <CheckCircle size={18} />
                  Отметить как изученное
                </LearnButton>
              </ActionSection>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}

export default TrickDetailModal;
