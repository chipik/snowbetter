import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Plus, Send, ArrowLeft, Image, Video, BookOpen, FileText } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

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
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-3px);
  }
`;

const FormCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const HelpText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
  line-height: 1.4;
`;

const RequiredMark = styled.span`
  color: #e74c3c;
  margin-left: 3px;
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
`;

const InfoTitle = styled.h3`
  color: #495057;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
`;

const InfoText = styled.p`
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
`;

const categoryOptions = [
  { value: 'spins', label: 'Вращения (Spins)' },
  { value: 'flips', label: 'Сальто (Flips)' },
  { value: 'off-axis', label: 'Off-Axis' },
  { value: 'grabs', label: 'Грэбы (Grabs)' },
  { value: 'jibbing', label: 'Джиббинг (Jibbing)' },
  { value: 'combo', label: 'Комбо (Combo)' }
];

function SuggestTrickPage() {
  const { user, isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image_url: '',
    technique: '',
    video_url: ''
  });

  // Получаем предложения пользователя для отображения статистики
  const { data: userSuggestions } = useQuery(
    ['userSuggestions', user?.id],
    async () => {
      if (!user?.id) return [];
      const response = await api.get(`/api/users/${user.id}/suggestions`);
      return response.data;
    },
    {
      enabled: !!user?.id
    }
  );

  const suggestionMutation = useMutation(
    (suggestionData) => api.post('/api/suggestions/tricks', suggestionData),
    {
      onSuccess: () => {
        toast.success('Предложение отправлено на модерацию!');
        setFormData({
          name: '',
          category: '',
          description: '',
          image_url: '',
          technique: '',
          video_url: ''
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Ошибка при отправке предложения');
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category || !formData.description.trim()) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }
    suggestionMutation.mutate(formData);
  };

  if (isGuest()) {
    return (
      <Container>
        <Header>
          <Title>Предложить трюк</Title>
          <Subtitle>Войдите в систему, чтобы предложить новый трюк</Subtitle>
        </Header>
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InfoBox>
            <InfoTitle>Требуется авторизация</InfoTitle>
            <InfoText>
              Чтобы предложить новый трюк, необходимо войти в систему или создать аккаунт.
            </InfoText>
          </InfoBox>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                cursor: 'pointer'
              }}
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '10px',
                padding: '12px 24px',
                cursor: 'pointer'
              }}
            >
              Регистрация
            </button>
          </div>
        </FormCard>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Назад
      </BackButton>

      <Header>
        <Title>Предложить трюк</Title>
        <Subtitle>Поделитесь своими знаниями с сообществом</Subtitle>
        {userSuggestions && (
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem' }}>
            У вас {userSuggestions.length} предложени{userSuggestions.length === 1 ? 'е' : userSuggestions.length < 5 ? 'я' : 'й'}
          </p>
        )}
      </Header>

      <FormCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <InfoBox>
          <InfoTitle>Как это работает?</InfoTitle>
          <InfoText>
            Ваше предложение будет рассмотрено модераторами. После одобрения трюк появится в общем каталоге.
            Пожалуйста, предоставьте максимально подробную и точную информацию.
          </InfoText>
        </InfoBox>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <BookOpen size={18} />
              Название трюка<RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Например: Frontside 360"
              required
            />
            <HelpText>Укажите точное название трюка</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>
              <Plus size={18} />
              Категория<RequiredMark>*</RequiredMark>
            </Label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите категорию</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <HelpText>Выберите подходящую категорию для трюка</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>
              <FileText size={18} />
              Описание<RequiredMark>*</RequiredMark>
            </Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Подробное описание трюка, его особенностей и характеристик..."
              required
            />
            <HelpText>Опишите трюк максимально подробно</HelpText>
          </FormGroup>

          <ImageUpload
            value={formData.image_url}
            onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
            label="Изображение трюка"
            allowUrl={true}
          />

          <FormGroup>
            <Label>
              <BookOpen size={18} />
              Техника исполнения
            </Label>
            <TextArea
              name="technique"
              value={formData.technique}
              onChange={handleInputChange}
              placeholder="Пошаговое описание техники исполнения трюка..."
            />
            <HelpText>Подробная инструкция по выполнению трюка (необязательно)</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>
              <Video size={18} />
              Ссылка на видео
            </Label>
            <Input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              placeholder="https://youtube.com/watch?v=..."
            />
            <HelpText>Ссылка на видео с демонстрацией трюка (необязательно)</HelpText>
          </FormGroup>

          <SubmitButton
            type="submit"
            disabled={suggestionMutation.isLoading}
          >
            <Send size={20} />
            {suggestionMutation.isLoading ? 'Отправляем...' : 'Отправить предложение'}
          </SubmitButton>
        </Form>
      </FormCard>
    </Container>
  );
}

export default SuggestTrickPage;
