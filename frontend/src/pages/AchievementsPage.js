import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Star, Calendar, TrendingUp, Share2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import ShareButton from '../components/ShareButton';

const Container = styled.div`
  max-width: 1200px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
`;

const StatsCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #666;
  font-weight: 500;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 10px 20px;
  border: 2px solid #667eea;
  border-radius: 25px;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#667eea'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#667eea' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const AchievementCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.earned ? props.badgeColor : '#e0e0e0'};
  position: relative;
  transition: all 0.3s ease;
  opacity: ${props => props.earned ? 1 : 0.6};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }
`;

const AchievementIcon = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 15px;
  filter: ${props => props.earned ? 'none' : 'grayscale(100%)'};
`;

const AchievementName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
`;

const AchievementDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 15px;
`;

const AchievementFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const AchievementPoints = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #667eea;
  font-weight: 600;
`;

const EarnedDate = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #10B981;
  font-size: 0.8rem;
`;

const ShareButtonContainer = styled.div`
  margin-top: 10px;
`;

const LockedBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #6c757d;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px;
  color: #666;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const achievementTypes = {
  all: 'Все',
  learning: 'Обучение',
  category: 'Категории',
  streak: 'Серии',
  social: 'Социальные',
  special: 'Специальные'
};

function AchievementsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: allAchievements, isLoading: achievementsLoading } = useQuery(
    'achievements',
    async () => {
      const response = await api.get('/api/achievements');
      return response.data;
    }
  );

  const { data: userAchievements, isLoading: userAchievementsLoading } = useQuery(
    ['userAchievements', user?.id],
    async () => {
      if (!user?.id) return null;
      const response = await api.get(`/api/users/${user.id}/achievements`);
      return response.data;
    },
    {
      enabled: !!user?.id && isAuthenticated()
    }
  );

  const isLoading = achievementsLoading || (isAuthenticated() && userAchievementsLoading);

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>
            <Award size={40} />
            Достижения
          </Title>
        </Header>
        <LoadingState>Загружаем достижения...</LoadingState>
      </Container>
    );
  }

  const earnedAchievementIds = new Set(
    userAchievements?.achievements?.map(ua => ua.achievement.id) || []
  );

  const filteredAchievements = allAchievements?.filter(achievement => {
    if (activeFilter === 'all') return true;
    return achievement.type === activeFilter;
  }) || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getEarnedDate = (achievementId) => {
    const userAchievement = userAchievements?.achievements?.find(
      ua => ua.achievement.id === achievementId
    );
    return userAchievement?.earned_at;
  };

  return (
    <Container>
      <Header>
        <Title>
          <Award size={40} />
          Достижения
        </Title>
        <Subtitle>Ваши успехи в изучении трюков</Subtitle>
      </Header>

      {isAuthenticated() && userAchievements && (
        <StatsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatsGrid>
            <StatItem>
              <StatValue>{userAchievements.total_points}</StatValue>
              <StatLabel>Всего очков</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{userAchievements.achievements_count}</StatValue>
              <StatLabel>Получено достижений</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{allAchievements?.length || 0}</StatValue>
              <StatLabel>Всего достижений</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>
                {allAchievements?.length > 0 
                  ? Math.round((userAchievements.achievements_count / allAchievements.length) * 100)
                  : 0}%
              </StatValue>
              <StatLabel>Прогресс</StatLabel>
            </StatItem>
          </StatsGrid>
        </StatsCard>
      )}

      <FilterTabs>
        {Object.entries(achievementTypes).map(([key, label]) => (
          <FilterTab
            key={key}
            active={activeFilter === key}
            onClick={() => setActiveFilter(key)}
          >
            {label}
          </FilterTab>
        ))}
      </FilterTabs>

      <AchievementsGrid>
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => {
            const isEarned = earnedAchievementIds.has(achievement.id);
            const earnedDate = getEarnedDate(achievement.id);

            return (
              <AchievementCard
                key={achievement.id}
                earned={isEarned}
                badgeColor={achievement.badge_color}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {!isEarned && (
                  <LockedBadge>
                    <Lock size={16} />
                  </LockedBadge>
                )}

                <AchievementIcon earned={isEarned}>
                  {achievement.icon || '🏆'}
                </AchievementIcon>

                <AchievementName>{achievement.name}</AchievementName>
                <AchievementDescription>
                  {achievement.description}
                </AchievementDescription>

                <AchievementFooter>
                  <AchievementPoints>
                    <Star size={16} />
                    {achievement.points} очков
                  </AchievementPoints>

                  {isEarned && earnedDate && (
                    <EarnedDate>
                      <Calendar size={14} />
                      {formatDate(earnedDate)}
                    </EarnedDate>
                  )}
                </AchievementFooter>

                {isEarned && (
                  <ShareButtonContainer>
                    <ShareButton
                      title={`Достижение: ${achievement.name}`}
                      text={`Получил достижение "${achievement.name}" за ${achievement.points} очков`}
                      hashtags={['УжеЛучше', 'Сноуборд', 'Достижения', 'Фристайл']}
                      variant="achievement"
                    />
                  </ShareButtonContainer>
                )}
              </AchievementCard>
            );
          })}
        </AnimatePresence>
      </AchievementsGrid>

      {!isAuthenticated() && (
        <EmptyState>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
          <h3>Войдите в систему</h3>
          <p>Чтобы отслеживать свои достижения, необходимо войти в систему</p>
        </EmptyState>
      )}
    </Container>
  );
}

export default AchievementsPage;
