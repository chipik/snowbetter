import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../api/axios';
import TrickImage from '../components/TrickImage';
import TrickDetailModal from '../components/TrickDetailModal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
`;

const FilterSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CategoryFilter = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  background: white;
  cursor: pointer;

  &:focus {
    border-color: #667eea;
  }
`;

const TricksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TrickCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
`;

const TrickImageContainer = styled.div`
  height: 200px;
  position: relative;
  overflow: hidden;
`;

const TrickContent = styled.div`
  padding: 25px;
`;

const TrickName = styled.h3`
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const TrickCategory = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 15px;
`;

const TrickDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: white;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: white;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
`;

const categoryNames = {
  spins: 'Вращения',
  flips: 'Сальто',
  'off-axis': 'Off-axis',
  grabs: 'Грэбы',
  jibbing: 'Джиббинг',
  combo: 'Комбо'
};



function TricksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTrick, setSelectedTrick] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const { data: tricks, isLoading, error } = useQuery(
    ['tricks', selectedCategory],
    async () => {
      const url = selectedCategory 
        ? `/api/tricks?category=${selectedCategory}`
        : '/api/tricks';
      const response = await api.get(url);
      return response.data;
    }
  );

  const { data: categories } = useQuery('categories', async () => {
    const response = await api.get('/api/categories');
    return response.data;
  });

  const filteredTricks = tricks?.filter(trick =>
    trick.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trick.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleTrickClick = (trick) => {
    setSelectedTrick(trick);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrick(null);
  };

  const handleMarkLearned = async (trickId) => {
    if (!isAuthenticated()) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      await api.post(`/api/users/${user.id}/progress/${trickId}`);
      toast.success('Трюк отмечен как изученный!');
      handleCloseModal();
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка при отметке трюка';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner>Загружаем трюки...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          Ошибка при загрузке трюков. Попробуйте обновить страницу.
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Каталог трюков</Title>
        <Subtitle>
          Изучите все трюки фристайла на сноуборде с подробными описаниями
        </Subtitle>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Поиск трюков..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CategoryFilter
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {categories?.map(category => (
            <option key={category} value={category}>
              {categoryNames[category] || category}
            </option>
          ))}
        </CategoryFilter>
      </FilterSection>

      <TricksGrid>
        {filteredTricks.map((trick, index) => (
          <TrickCard
            key={trick.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => handleTrickClick(trick)}
          >
            <TrickImageContainer>
              <TrickImage trick={trick} />
            </TrickImageContainer>
            <TrickContent>
              <TrickName>{trick.name}</TrickName>
              <TrickCategory>
                {categoryNames[trick.category] || trick.category}
              </TrickCategory>
              <TrickDescription>{trick.description}</TrickDescription>
            </TrickContent>
          </TrickCard>
        ))}
      </TricksGrid>

      {filteredTricks.length === 0 && !isLoading && (
        <ErrorMessage>
          Трюки не найдены. Попробуйте изменить параметры поиска.
        </ErrorMessage>
      )}

      <TrickDetailModal
        trick={selectedTrick}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMarkLearned={handleMarkLearned}
      />
    </Container>
  );
}

export default TricksPage;
