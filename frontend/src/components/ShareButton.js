import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Facebook, Instagram, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ShareContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }
`;

const ShareMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid #e0e0e0;
  min-width: 200px;
  z-index: 1000;
`;

const ShareOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: ${props => props.first ? '12px 12px 0 0' : props.last ? '0 0 12px 12px' : '0'};

  &:hover {
    background: #f8f9fa;
  }

  svg {
    color: ${props => props.color || '#666'};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`;

const ShareButtonComponent = ({ 
  title, 
  text, 
  url, 
  hashtags = [], 
  variant = "achievement" // "achievement", "progress", "trick"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const hashtagsString = hashtags.length > 0 ? ' ' + hashtags.map(tag => `#${tag}`).join(' ') : '';
    
    switch (variant) {
      case "achievement":
        return `🏆 ${text} в приложении "Уже лучше"! ${hashtagsString}`;
      case "progress":
        return `📈 ${text} в изучении трюков сноуборда! ${hashtagsString}`;
      case "trick":
        return `🏂 Изучил новый трюк: ${text}! ${hashtagsString}`;
      default:
        return `${text} ${hashtagsString}`;
    }
  };

  const shareUrl = url || window.location.href;
  const shareText = generateShareText();

  const copyToClipboard = async () => {
    try {
      const textToCopy = `${shareText}\n${shareUrl}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Скопировано в буфер обмена!');
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch (err) {
      toast.error('Ошибка при копировании');
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const shareToInstagram = () => {
    // Instagram не поддерживает прямой шеринг через URL, поэтому копируем текст
    copyToClipboard();
    toast('Текст скопирован! Вставьте его в Instagram Stories', {
      icon: '📷',
      duration: 4000,
    });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (err) {
        // Пользователь отменил шеринг
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      shareNative();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <ShareContainer>
      <ShareButton onClick={handleShare}>
        <Share2 size={16} />
        Поделиться
      </ShareButton>

      <AnimatePresence>
        {isOpen && (
          <>
            <Overlay onClick={() => setIsOpen(false)} />
            <ShareMenu
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ShareOption 
                first 
                onClick={copyToClipboard}
                color="#667eea"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Скопировано!' : 'Копировать ссылку'}
              </ShareOption>
              
              <ShareOption 
                onClick={shareToTwitter}
                color="#1DA1F2"
              >
                <Twitter size={18} />
                Twitter
              </ShareOption>
              
              <ShareOption 
                onClick={shareToFacebook}
                color="#1877F2"
              >
                <Facebook size={18} />
                Facebook
              </ShareOption>
              
              <ShareOption 
                last
                onClick={shareToInstagram}
                color="#E4405F"
              >
                <Instagram size={18} />
                Instagram Stories
              </ShareOption>
            </ShareMenu>
          </>
        )}
      </AnimatePresence>
    </ShareContainer>
  );
};

export default ShareButtonComponent;
