import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
  padding: 15px 20px 15px 50px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 15px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkText = styled.p`
  text-align: center;
  color: #666;
  margin-top: 20px;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const GuestModeLink = styled(Link)`
  display: block;
  text-align: center;
  color: #667eea;
  text-decoration: none;
  margin-top: 15px;
  padding: 10px;
  border: 2px solid #667eea;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    setLoading(true);

    const result = await register(formData.username, formData.email, formData.password);
    if (result.success) {
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <Container>
      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>
          <UserPlus size={28} />
          Регистрация
        </Title>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <User size={20} />
            </InputIcon>
            <Input
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Подтвердите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            <UserPlus size={20} />
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </SubmitButton>
        </Form>

        <LinkText>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </LinkText>

        <GuestModeLink to="/">
          Продолжить как гость
        </GuestModeLink>
      </FormContainer>
    </Container>
  );
}

export default RegisterPage;
