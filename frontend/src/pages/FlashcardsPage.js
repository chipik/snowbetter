import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X, Shuffle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import TrickImage from '../components/TrickImage';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CategorySelect = styled.select`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 500;
  outline: none;

  &:focus {
    background: white;
  }
`;

const FlashcardContainer = styled.div`
  perspective: 1000px;
  margin-bottom: 30px;
`;

const Flashcard = styled(motion.div)`
  width: 100%;
  height: 400px;
  position: relative;
  transform-style: preserve-3d;
  cursor: pointer;

  @media (max-width: 768px) {
    height: 350px;
  }
`;

const CardSide = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CardBack = styled(CardSide)`
  transform: rotateY(180deg);
`;

const CardContent = styled.div`
  text-align: center;
  width: 100%;
`;

const TrickName = styled.h2`
  font-size: 2.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const TrickCategory = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 25px;
`;

const TrickDescription = styled.p`
  color: #666;
  line-height: 1.6;
  font-size: 1.1rem;
  max-width: 500px;
  margin: 0 auto;
`;

const TrickImageContainer = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  border-radius: 15px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const NavButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Progress = styled.div`
  text-align: center;
  color: white;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'correct' ? '#10B981' : props.variant === 'incorrect' ? '#EF4444' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.variant === 'correct' || props.variant === 'incorrect' ? 'white' : '#333'};
  border: none;
  border-radius: 15px;
  padding: 15px 25px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const categoryNames = {
  spins: 'Вращения',
  flips: 'Сальто',
  'off-axis': 'Off-axis',
  grabs: 'Грэбы',
  jibbing: 'Джиббинг',
  combo: 'Комбо'
};

const categoryEmojis = {
  spins: '🌪️',
  flips: '🤸',
  'off-axis': '🔄',
  grabs: '✋',
  jibbing: '🛹',
  combo: '🎯'
};

function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledTricks, setShuffledTricks] = useState([]);

  const { data: tricks, isLoading } = useQuery(
    ['tricks', selectedCategory],
    async () => {
      const url = selectedCategory 
        ? `/api/tricks?category=${selectedCategory}`
        : '/api/tricks';
      const response = await api.get(url);
      return response.data;
    },
    {
      onSuccess: (data) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setShuffledTricks(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    }
  );

  const { data: categories } = useQuery('categories', async () => {
    const response = await api.get('/api/categories');
    return response.data;
  });

  const currentTrick = shuffledTricks[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < shuffledTricks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    if (tricks) {
      const shuffled = [...tricks].sort(() => Math.random() - 0.5);
      setShuffledTricks(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
      toast.success('Карточки перемешаны!');
    }
  };

  const handleCorrect = () => {
    toast.success('Правильно! 🎉');
    handleNext();
  };

  const handleIncorrect = () => {
    toast.error('Попробуйте еще раз! 💪');
    handleNext();
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
          Загружаем карточки...
        </div>
      </Container>
    );
  }

  if (!currentTrick) {
    return (
      <Container>
        <Header>
          <Title>Флешкарты</Title>
          <Subtitle>Выберите категорию для начала изучения</Subtitle>
        </Header>
        <Controls>
          <CategorySelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Все категории</option>
            {categories?.map(category => (
              <option key={category} value={category}>
                {categoryNames[category] || category}
              </option>
            ))}
          </CategorySelect>
        </Controls>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Флешкарты</Title>
        <Subtitle>Изучайте трюки с помощью интерактивных карточек</Subtitle>
      </Header>

      <Controls>
        <CategorySelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {categories?.map(category => (
            <option key={category} value={category}>
              {categoryNames[category] || category}
            </option>
          ))}
        </CategorySelect>
        <ControlButton onClick={handleShuffle}>
          <Shuffle size={18} />
          Перемешать
        </ControlButton>
      </Controls>

      <Navigation>
        <NavButton 
          onClick={handlePrevious} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} />
        </NavButton>
        <Progress>
          {currentIndex + 1} из {shuffledTricks.length}
        </Progress>
        <NavButton 
          onClick={handleNext} 
          disabled={currentIndex === shuffledTricks.length - 1}
        >
          <ChevronRight size={24} />
        </NavButton>
      </Navigation>

      <FlashcardContainer>
        <Flashcard
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          onClick={handleFlip}
        >
          <CardSide>
            <CardContent>
              <TrickImageContainer>
                <TrickImage trick={currentTrick} clickable={false} />
              </TrickImageContainer>
              <TrickName>{currentTrick.name}</TrickName>
              <TrickCategory>
                {categoryNames[currentTrick.category] || currentTrick.category}
              </TrickCategory>
              <div style={{ color: '#999', fontSize: '0.9rem' }}>
                Нажмите для просмотра описания
              </div>
            </CardContent>
          </CardSide>
          
          <CardBack>
            <CardContent>
              <TrickName>{currentTrick.name}</TrickName>
              <TrickCategory>
                {categoryNames[currentTrick.category] || currentTrick.category}
              </TrickCategory>
              <TrickDescription>{currentTrick.description}</TrickDescription>
            </CardContent>
          </CardBack>
        </Flashcard>
      </FlashcardContainer>

      {isFlipped && (
        <ActionButtons>
          <ActionButton variant="incorrect" onClick={handleIncorrect}>
            <X size={20} />
            Не знал
          </ActionButton>
          <ActionButton variant="correct" onClick={handleCorrect}>
            <Check size={20} />
            Знал!
          </ActionButton>
        </ActionButtons>
      )}
    </Container>
  );
}

export default FlashcardsPage;
