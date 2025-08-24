import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, TrendingUp, Users, Star, UserPlus } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

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

const LeaderboardCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const TopThree = styled.div`
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PodiumPlace = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  
  ${props => props.rank === 1 && `
    order: 2;
    transform: scale(1.1);
    z-index: 3;
  `}
  
  ${props => props.rank === 2 && `
    order: 1;
    z-index: 2;
  `}
  
  ${props => props.rank === 3 && `
    order: 3;
    z-index: 1;
  `}

  @media (max-width: 768px) {
    order: ${props => props.rank} !important;
    transform: none !important;
  }
`;

const PodiumIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-size: 2rem;
  
  ${props => {
    if (props.rank === 1) return `
      background: linear-gradient(135deg, #FFD700, #FFA500);
      box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
    `;
    if (props.rank === 2) return `
      background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
      box-shadow: 0 8px 25px rgba(192, 192, 192, 0.3);
    `;
    if (props.rank === 3) return `
      background: linear-gradient(135deg, #CD7F32, #B8860B);
      box-shadow: 0 6px 20px rgba(205, 127, 50, 0.3);
    `;
  }}
`;

const PodiumName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const PodiumPoints = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
`;

const PodiumAchievements = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RestOfLeaderboard = styled.div`
  margin-top: 30px;
`;

const LeaderboardItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Rank = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  min-width: 50px;
  text-align: center;
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const Username = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const UserStats = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Points = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
  text-align: right;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const GuestCallToAction = styled(motion.div)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 15px;
  padding: 25px;
  margin-top: 30px;
  text-align: center;
  color: white;
`;

const CallToActionTitle = styled.h3`
  color: white;
  margin: 0 0 15px 0;
  font-size: 1.4rem;
`;

const CallToActionText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
  font-size: 1rem;
  line-height: 1.5;
`;

const CallToActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

function LeaderboardPage() {
  const { isGuest } = useAuth();
  const { data: leaderboard, isLoading, error } = useQuery(
    'leaderboard',
    async () => {
      const response = await api.get('/api/leaderboard?limit=50');
      return response.data;
    },
    {
      refetchInterval: 30000, // Обновляем каждые 30 секунд
    }
  );

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown color="white" size={32} />;
      case 2: return <Medal color="white" size={28} />;
      case 3: return <Award color="white" size={24} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>
            <Trophy size={40} />
            Лидерборд
          </Title>
        </Header>
        <LeaderboardCard>
          <LoadingState>Загружаем рейтинг...</LoadingState>
        </LeaderboardCard>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>
            <Trophy size={40} />
            Лидерборд
          </Title>
        </Header>
        <LeaderboardCard>
          <EmptyState>
            <EmptyIcon>⚠️</EmptyIcon>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить рейтинг. Попробуйте позже.</p>
          </EmptyState>
        </LeaderboardCard>
      </Container>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Container>
        <Header>
          <Title>
            <Trophy size={40} />
            Лидерборд
          </Title>
        </Header>
        <LeaderboardCard>
          <EmptyState>
            <EmptyIcon>🏆</EmptyIcon>
            <h3>Рейтинг пуст</h3>
            <p>Станьте первым! Изучайте трюки и получайте достижения.</p>
          </EmptyState>
        </LeaderboardCard>
      </Container>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <Container>
      <Header>
        <Title>
          <Trophy size={40} />
          Лидерборд
        </Title>
        <Subtitle>Топ райдеров по очкам достижений</Subtitle>
      </Header>

      <LeaderboardCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {topThree.length > 0 && (
          <TopThree>
            {topThree.map((user, index) => (
              <PodiumPlace
                key={user.user_id}
                rank={user.rank}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PodiumIcon rank={user.rank}>
                  {getRankIcon(user.rank)}
                </PodiumIcon>
                <PodiumName>{user.username}</PodiumName>
                <PodiumPoints>{user.total_points} очков</PodiumPoints>
                <PodiumAchievements>
                  <Star size={14} />
                  {user.achievements_count} достижений
                </PodiumAchievements>
              </PodiumPlace>
            ))}
          </TopThree>
        )}

        {restOfLeaderboard.length > 0 && (
          <RestOfLeaderboard>
            {restOfLeaderboard.map((user, index) => (
              <LeaderboardItem
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (index + 3) * 0.05 }}
              >
                <Rank>#{user.rank}</Rank>
                <UserInfo>
                  <Username>{user.username}</Username>
                  <UserStats>
                    <span>
                      <Star size={14} style={{ marginRight: '5px' }} />
                      {user.achievements_count} достижений
                    </span>
                  </UserStats>
                </UserInfo>
                <Points>{user.total_points} очков</Points>
              </LeaderboardItem>
            ))}
          </RestOfLeaderboard>
        )}

        {/* Призыв к действию для гостей */}
        {isGuest() && leaderboard && leaderboard.length > 0 && (
          <GuestCallToAction
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CallToActionTitle>Хочешь попасть в рейтинг?</CallToActionTitle>
            <CallToActionText>
              Регистрируйся, изучай трюки, получай достижения и соревнуйся с другими райдерами!
            </CallToActionText>
            <CallToActionButton to="/register">
              <UserPlus size={20} />
              Присоединиться
            </CallToActionButton>
          </GuestCallToAction>
        )}
      </LeaderboardCard>
    </Container>
  );
}

export default LeaderboardPage;
