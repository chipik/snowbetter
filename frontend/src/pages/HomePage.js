import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BookOpen, CreditCard, HelpCircle, TrendingUp, Star, Users, Award, LogIn, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Hero = styled(motion.section)`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0 10px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const FeatureButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 500;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }
`;

const StatsSection = styled.section`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
`;

const StatItem = styled(motion.div)`
  color: white;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const features = [
  {
    icon: BookOpen,
    title: 'Каталог трюков',
    description: 'Изучите более 35 трюков с подробными описаниями и категоризацией по сложности.',
    link: '/tricks',
    buttonText: 'Смотреть трюки'
  },
  {
    icon: CreditCard,
    title: 'Флешкарты',
    description: 'Интерактивные карточки для быстрого запоминания названий и техники выполнения.',
    link: '/flashcards',
    buttonText: 'Начать изучение'
  },
  {
    icon: HelpCircle,
    title: 'Викторины',
    description: 'Проверьте свои знания с помощью увлекательных викторин и тестов.',
    link: '/quiz',
    buttonText: 'Пройти тест'
  },
  {
    icon: TrendingUp,
    title: 'Прогресс',
    description: 'Отслеживайте свой прогресс и достижения в изучении трюков.',
    link: '/progress',
    buttonText: 'Мой прогресс'
  }
];

function HomePage() {
  const { isAuthenticated, isAdmin, isGuest, user } = useAuth();

  const getFeatures = () => {
    const baseFeatures = [
      {
        icon: BookOpen,
        title: 'Каталог трюков',
        description: 'Изучите более 35 трюков с подробными описаниями и категоризацией по сложности.',
        link: '/tricks',
        buttonText: 'Смотреть трюки'
      }
    ];

    if (isGuest()) {
      return [
        ...baseFeatures,
        {
          icon: LogIn,
          title: 'Войти в систему',
          description: 'Создайте аккаунт для доступа к флешкартам, викторинам и отслеживанию прогресса.',
          link: '/login',
          buttonText: 'Войти / Регистрация'
        }
      ];
    }

    const userFeatures = [
      ...baseFeatures,
      {
        icon: CreditCard,
        title: 'Флешкарты',
        description: 'Интерактивные карточки для быстрого запоминания названий и техники выполнения.',
        link: '/flashcards',
        buttonText: 'Начать изучение'
      },
      {
        icon: HelpCircle,
        title: 'Викторины',
        description: 'Проверьте свои знания с помощью увлекательных викторин и тестов.',
        link: '/quiz',
        buttonText: 'Пройти тест'
      },
      {
        icon: TrendingUp,
        title: 'Прогресс',
        description: 'Отслеживайте свой прогресс и достижения в изучении трюков.',
        link: '/progress',
        buttonText: 'Мой прогресс'
      }
    ];

    if (isAdmin()) {
      userFeatures.push({
        icon: Settings,
        title: 'Админ панель',
        description: 'Управление трюками и пользователями системы.',
        link: '/admin',
        buttonText: 'Открыть панель'
      });
    }

    return userFeatures;
  };

  const features = getFeatures();

  return (
    <Container>
      <Hero
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Уже лучше! 🏂</Title>
        <Subtitle>
          {isAuthenticated() 
            ? `Добро пожаловать, ${user.username}! ${isAdmin() ? '(Администратор)' : ''}`
            : 'Изучайте трюки фристайла на сноуборде с помощью интерактивных карточек, викторин и подробного каталога техник'
          }
        </Subtitle>
      </Hero>

      <StatsSection>
        <StatsGrid>
          <StatItem
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatNumber>35+</StatNumber>
            <StatLabel>Трюков в каталоге</StatLabel>
          </StatItem>
          <StatItem
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatNumber>6</StatNumber>
            <StatLabel>Категорий</StatLabel>
          </StatItem>
          <StatItem
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StatNumber>∞</StatNumber>
            <StatLabel>Возможностей для роста</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsSection>

      <FeaturesGrid>
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <FeatureIcon>
                <IconComponent size={32} />
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <FeatureButton to={feature.link}>
                {feature.buttonText}
              </FeatureButton>
            </FeatureCard>
          );
        })}
      </FeaturesGrid>
    </Container>
  );
}

export default HomePage;
