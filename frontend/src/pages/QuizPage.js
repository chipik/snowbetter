import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Target } from 'lucide-react';
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

const QuizSetup = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CategorySelect = styled.select`
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  background: white;
  cursor: pointer;
  margin-bottom: 30px;
  min-width: 200px;

  &:focus {
    border-color: #667eea;
  }
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 15px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }
`;

const QuizContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const QuestionHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const QuestionNumber = styled.div`
  color: #667eea;
  font-weight: 500;
  margin-bottom: 10px;
`;

const Question = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 20px;
`;

const TrickImageContainer = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 15px;
  overflow: hidden;
  margin: 0 auto 30px;

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled.button`
  background: ${props => 
    props.selected 
      ? props.correct 
        ? '#10B981' 
        : '#EF4444'
      : 'white'
  };
  color: ${props => props.selected ? 'white' : '#333'};
  border: 2px solid ${props => 
    props.selected 
      ? props.correct 
        ? '#10B981' 
        : '#EF4444'
      : '#e0e0e0'
  };
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const NextButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 25px;
  font-weight: 500;
  cursor: pointer;
  margin: 0 auto;
  display: block;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ScoreDisplay = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 20px;
`;

const ScoreText = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
`;

const RestartButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 15px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
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



function QuizPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(10);
  const [quizFinished, setQuizFinished] = useState(false);

  const { data: categories } = useQuery('categories', async () => {
    const response = await api.get('/api/categories');
    return response.data;
  });

  const loadNextQuestion = async () => {
    try {
      const url = selectedCategory 
        ? `/api/quiz/random?category=${selectedCategory}`
        : '/api/quiz/random';
      const response = await api.get(url);
      setCurrentQuestion(response.data);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } catch (error) {
      toast.error('Ошибка при загрузке вопроса');
    }
  };

  const startQuiz = async () => {
    setQuizStarted(true);
    setQuestionNumber(1);
    setScore(0);
    setQuizFinished(false);
    await loadNextQuestion();
  };

  const handleAnswerSelect = (optionId) => {
    if (showAnswer) return;
    setSelectedAnswer(optionId);
    setShowAnswer(true);
    
    if (optionId === currentQuestion.correct_answer_id) {
      setScore(score + 1);
      toast.success('Правильно! 🎉');
    } else {
      toast.error('Неправильно 😔');
    }
  };

  const handleNext = async () => {
    if (questionNumber >= totalQuestions) {
      setQuizFinished(true);
    } else {
      setQuestionNumber(questionNumber + 1);
      await loadNextQuestion();
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentQuestion(null);
    setScore(0);
    setQuestionNumber(1);
  };

  if (quizFinished) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <Container>
        <Header>
          <Title>Результаты викторины</Title>
        </Header>
        <ResultsContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Trophy size={80} color="#667eea" style={{ marginBottom: '20px' }} />
          <ScoreDisplay>{score}/{totalQuestions}</ScoreDisplay>
          <ScoreText>
            Вы правильно ответили на {percentage}% вопросов!
            {percentage >= 80 && ' Отличный результат! 🏆'}
            {percentage >= 60 && percentage < 80 && ' Хорошо! Продолжайте изучать! 👍'}
            {percentage < 60 && ' Нужно больше практики! 💪'}
          </ScoreText>
          <RestartButton onClick={restartQuiz}>
            <RotateCcw size={20} />
            Пройти еще раз
          </RestartButton>
        </ResultsContainer>
      </Container>
    );
  }

  if (!quizStarted) {
    return (
      <Container>
        <Header>
          <Title>Викторина</Title>
          <Subtitle>Проверьте свои знания трюков сноуборда</Subtitle>
        </Header>
        <QuizSetup>
          <Target size={60} color="#667eea" style={{ marginBottom: '20px' }} />
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Выберите категорию</h3>
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
          <StartButton onClick={startQuiz}>
            <Play size={20} />
            Начать викторину
          </StartButton>
        </QuizSetup>
      </Container>
    );
  }

  if (!currentQuestion) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
          Загружаем вопрос...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Викторина</Title>
      </Header>
      <QuizContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
                  <QuestionHeader>
            <QuestionNumber>Вопрос {questionNumber} из {totalQuestions}</QuestionNumber>
            <Question>{currentQuestion.question}</Question>
            <TrickImageContainer>
              <TrickImage 
                trick={{ 
                  image_url: currentQuestion.image_url, 
                  category: currentQuestion.category || 'spins',
                  name: 'Угадайте трюк'
                }} 
                clickable={true}
              />
            </TrickImageContainer>
          </QuestionHeader>

        <OptionsGrid>
          {currentQuestion.options.map((option) => (
            <OptionButton
              key={option.id}
              selected={selectedAnswer === option.id}
              correct={option.id === currentQuestion.correct_answer_id}
              onClick={() => handleAnswerSelect(option.id)}
              disabled={showAnswer}
            >
              {option.name}
            </OptionButton>
          ))}
        </OptionsGrid>

        {showAnswer && (
          <NextButton onClick={handleNext}>
            {questionNumber >= totalQuestions ? 'Показать результаты' : 'Следующий вопрос'}
          </NextButton>
        )}
      </QuizContainer>
    </Container>
  );
}

export default QuizPage;
