import React from 'react';
import styled from 'styled-components';
import { MessageCircle, Heart, Github } from 'lucide-react';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: white;
  padding: 40px 20px 20px;
  margin-top: auto;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #667eea, transparent);
  }
  
  @media (max-width: 480px) {
    padding: 30px 15px 15px;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 25px;
    text-align: center;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FooterText = styled.p`
  margin: 0;
  line-height: 1.6;
  color: #b8c5d6;
  font-size: 0.95rem;
`;

const FooterLink = styled.a`
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  transition: all 0.3s ease;
  border-radius: 6px;
  
  &:hover {
    color: #8b9fff;
    transform: translateX(5px);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: scale(1.1);
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }
`;

const BottomBar = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #8b9fff;
  font-size: 0.9rem;
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const MadeWithLove = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  
  .heart {
    color: #ff6b6b;
    animation: heartbeat 2s ease-in-out infinite;
  }
  
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Уже лучше</FooterTitle>
          <FooterText>
            Приложение для изучения трюков сноубординга. 
            Изучай, практикуйся и становись лучше вместе с нами!
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Контакты</FooterTitle>
          <FooterText>
            Есть вопросы или предложения? Свяжись с нами!
          </FooterText>
          <FooterLink href="https://t.me/Chpkk" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} />
            Написать в Telegram
          </FooterLink>
          <FooterText>
            Мы всегда рады помочь и ответить на ваши вопросы
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Сообщество</FooterTitle>
          <FooterText>
            Присоединяйся к сообществу райдеров, 
            делись прогрессом и вдохновляй других!
          </FooterText>
          <SocialLinks>
            <SocialButton href="https://t.me/Chpkk" target="_blank" rel="noopener noreferrer" title="Telegram">
              <MessageCircle size={20} />
            </SocialButton>
          </SocialLinks>
        </FooterSection>
      </FooterContent>
      
      <BottomBar>
        <MadeWithLove>
          Сделано с <span className="heart">❤️</span> для сообщества сноубордистов
        </MadeWithLove>
      </BottomBar>
    </FooterContainer>
  );
}

export default Footer;
