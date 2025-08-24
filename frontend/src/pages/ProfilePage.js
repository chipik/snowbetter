import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 600px;
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

const ProfileCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #333;
`;

const PasswordSection = styled.div`
  border-top: 1px solid #eee;
  padding-top: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
  }

  &.error {
    border-color: #ef4444;
  }
`;

const PasswordInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #667eea;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 5px;
`;

const Badge = styled.span`
  background: ${props => 
    props.variant === 'admin' ? '#667eea' : 
    props.variant === 'manager' ? '#f59e0b' : '#10B981'};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
`;

function ProfilePage() {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.current_password) {
      newErrors.current_password = 'Введите текущий пароль';
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'Введите новый пароль';
    } else if (passwordData.new_password.length < 6) {
      newErrors.new_password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!passwordData.confirm_password) {
      newErrors.confirm_password = 'Подтвердите новый пароль';
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Пароли не совпадают';
    }

    if (passwordData.current_password === passwordData.new_password) {
      newErrors.new_password = 'Новый пароль должен отличаться от текущего';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      toast.success('Пароль успешно изменен!');
      
      // Очищаем форму
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setErrors({});

    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка при смене пароля';
      toast.error(message);
      
      if (message.includes('Неверный текущий пароль')) {
        setErrors({ current_password: 'Неверный текущий пароль' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Header>
          <Title>Профиль пользователя</Title>
        </Header>
        <ProfileCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ textAlign: 'center', color: '#666' }}>
            Необходимо войти в систему
          </div>
        </ProfileCard>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <User size={28} />
          Профиль пользователя
        </Title>
      </Header>

      <ProfileCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle>
          <User size={20} />
          Информация о пользователе
        </SectionTitle>
        
        <UserInfo>
          <InfoItem>
            <Label>Имя пользователя</Label>
            <InfoValue>{user.username}</InfoValue>
          </InfoItem>
          <InfoItem>
            <Label>Email</Label>
            <InfoValue>{user.email}</InfoValue>
          </InfoItem>
          <InfoItem>
            <Label>Роль</Label>
            <InfoValue>
              <Badge variant={user.role === 'admin' ? 'admin' : user.role === 'manager' ? 'manager' : 'user'}>
                {user.role === 'admin' ? 'Администратор' : 
                 user.role === 'manager' ? 'Менеджер' : 'Пользователь'}
              </Badge>
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <Label>Дата регистрации</Label>
            <InfoValue>
              {new Date(user.created_at).toLocaleDateString('ru-RU')}
            </InfoValue>
          </InfoItem>
        </UserInfo>

        <PasswordSection>
          <SectionTitle>
            <Lock size={20} />
            Смена пароля
          </SectionTitle>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Текущий пароль</Label>
              <PasswordInput>
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className={errors.current_password ? 'error' : ''}
                  placeholder="Введите текущий пароль"
                />
                <ToggleButton
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </ToggleButton>
              </PasswordInput>
              {errors.current_password && (
                <ErrorMessage>{errors.current_password}</ErrorMessage>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Новый пароль</Label>
              <PasswordInput>
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className={errors.new_password ? 'error' : ''}
                  placeholder="Введите новый пароль"
                />
                <ToggleButton
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </ToggleButton>
              </PasswordInput>
              {errors.new_password && (
                <ErrorMessage>{errors.new_password}</ErrorMessage>
              )}
            </InputGroup>

            <InputGroup>
              <Label>Подтвердите новый пароль</Label>
              <PasswordInput>
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className={errors.confirm_password ? 'error' : ''}
                  placeholder="Подтвердите новый пароль"
                />
                <ToggleButton
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </ToggleButton>
              </PasswordInput>
              {errors.confirm_password && (
                <ErrorMessage>{errors.confirm_password}</ErrorMessage>
              )}
            </InputGroup>

            <SubmitButton type="submit" disabled={loading}>
              <Save size={18} />
              {loading ? 'Сохранение...' : 'Изменить пароль'}
            </SubmitButton>
          </Form>
        </PasswordSection>
      </ProfileCard>
    </Container>
  );
}

export default ProfilePage;
