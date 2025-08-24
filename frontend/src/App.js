import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TricksPage from './pages/TricksPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import ProgressPage from './pages/ProgressPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import SuggestTrickPage from './pages/SuggestTrickPage';
import AchievementsPage from './pages/AchievementsPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Context
import { AuthProvider } from './contexts/AuthContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
`;

const MainContent = styled(motion.main)`
  padding-top: 80px;
  flex: 1;
`;

function App() {
  return (
    <AuthProvider>
      <AppContainer>
        <Header />
        <MainContent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tricks" element={<TricksPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/suggest" element={<SuggestTrickPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </AuthProvider>
  );
}

export default App;
