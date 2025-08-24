import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { User, TrendingUp, Award, Target, BookOpen, LogIn, Share2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import LearnedTricksModal from '../components/LearnedTricksModal';
import TrickDetailModal from '../components/TrickDetailModal';
import ShareButton from '../components/ShareButton';

const Container = styled.div`
  max-width: 1000px;
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

const UserSetup = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
`;

const UserForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
`;

const Input = styled.input`
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 15px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'clickable'
})`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;

  &:hover {
    ${props => props.clickable && `
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    `}
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1rem;
`;

const ProgressSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CategoryProgress = styled.div`
  margin-bottom: 25px;
`;

const CategoryName = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 6px;
`;

const categoryNames = {
  spins: 'Вращения',
  flips: 'Сальто',
  'off-axis': 'Off-axis',
  grabs: 'Грэбы',
  jibbing: 'Джиббинг',
  combo: 'Комбо'
};

const GuestMessage = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const LoginButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 20px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }
`;

function ProgressPage() {
  const { user, isAuthenticated, isGuest } = useAuth();
  const [showLearnedTricks, setShowLearnedTricks] = useState(false);
  const [showTrickDetail, setShowTrickDetail] = useState(false);
  const [selectedTrick, setSelectedTrick] = useState(null);

  const { data: userStats, isLoading: statsLoading } = useQuery(
    ['userStats', user?.id],
    async () => {
      if (!user?.id) return null;
      const response = await api.get(`/api/users/${user.id}/stats`);
      return response.data;
    },
    {
      enabled: !!user?.id
    }
  );

  const { data: learnedTricks, isLoading: learnedTricksLoading } = useQuery(
    ['learnedTricks', user?.id],
    async () => {
      if (!user?.id) return [];
      const response = await api.get(`/api/users/${user.id}/learned-tricks`);
      return response.data;
    },
    {
      enabled: !!user?.id && showLearnedTricks
    }
  );

  const handleLearnedTricksClick = () => {
    setShowLearnedTricks(true);
  };

  const handleTrickClick = (trick) => {
    setSelectedTrick(trick);
    setShowTrickDetail(true);
    setShowLearnedTricks(false);
  };

  const handleCloseModals = () => {
    setShowLearnedTricks(false);
    setShowTrickDetail(false);
    setSelectedTrick(null);
  };

  // Гостевой режим - предлагаем войти или зарегистрироваться
  if (isGuest()) {
    return (
      <Container>
        <Header>
          <Title>Мой прогресс</Title>
          <Subtitle>Войдите в систему для отслеживания прогресса</Subtitle>
        </Header>
        <GuestMessage>
          <User size={60} color="#667eea" style={{ marginBottom: '20px' }} />
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Требуется вход в систему</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Чтобы отслеживать свой прогресс в изучении трюков, необходимо войти в систему или создать аккаунт.
          </p>
          <div>
            <LoginButton to="/login">
              <LogIn size={20} />
              Войти в систему
            </LoginButton>
            <LoginButton to="/register" style={{ marginLeft: '15px', background: 'transparent', border: '2px solid #667eea', color: '#667eea' }}>
              <User size={20} />
              Регистрация
            </LoginButton>
          </div>
        </GuestMessage>
      </Container>
    );
  }

  if (statsLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
          Загружаем статистику...
        </div>
      </Container>
    );
  }

  if (!userStats) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
          Ошибка при загрузке статистики
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Мой прогресс</Title>
        <Subtitle>Отслеживайте свои достижения в изучении трюков</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          clickable
          onClick={handleLearnedTricksClick}
        >
          <StatIcon>
            <BookOpen size={28} />
          </StatIcon>
          <StatValue>{userStats.learned_tricks}</StatValue>
          <StatLabel>Изучено трюков</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatIcon>
            <Target size={28} />
          </StatIcon>
          <StatValue>{userStats.total_tricks}</StatValue>
          <StatLabel>Всего трюков</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatIcon>
            <TrendingUp size={28} />
          </StatIcon>
          <StatValue>{userStats.progress_percentage}%</StatValue>
          <StatLabel>Прогресс</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatIcon>
            <Award size={28} />
          </StatIcon>
          <StatValue>
            {userStats.progress_percentage >= 80 ? 'Эксперт' : 
             userStats.progress_percentage >= 50 ? 'Продвинутый' :
             userStats.progress_percentage >= 25 ? 'Новичок' : 'Начинающий'}
          </StatValue>
          <StatLabel>Уровень</StatLabel>
        </StatCard>
      </StatsGrid>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <ShareButton
            title="Мой прогресс в изучении трюков"
            text={`Изучил ${userStats.learned_tricks} из ${userStats.total_tricks} трюков сноуборда (${userStats.progress_percentage}%)`}
            hashtags={['УжеЛучше', 'Сноуборд', 'Прогресс', 'Фристайл']}
            variant="progress"
          />
      </div>

      <ProgressSection>
        <SectionTitle>
          <TrendingUp size={24} />
          Прогресс по категориям
        </SectionTitle>
        
        {Object.entries(userStats.categories).map(([category, stats]) => (
          <CategoryProgress key={category}>
            <CategoryName>
              <span>{categoryNames[category] || category}</span>
              <span>{stats.learned}/{stats.total}</span>
            </CategoryName>
            <ProgressBar>
              <ProgressFill
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </ProgressBar>
          </CategoryProgress>
        ))}
      </ProgressSection>

      <LearnedTricksModal
        isOpen={showLearnedTricks}
        onClose={handleCloseModals}
        learnedTricks={learnedTricks}
        onTrickClick={handleTrickClick}
      />

      <TrickDetailModal
        trick={selectedTrick}
        isOpen={showTrickDetail}
        onClose={handleCloseModals}
        onMarkLearned={() => {}} // Уже изученный трюк
      />
    </Container>
  );
}

export default ProgressPage;
