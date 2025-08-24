import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, BookOpen, CreditCard, HelpCircle, TrendingUp, User, LogIn, LogOut, Settings, Plus, Award, Trophy, ChevronDown, GraduationCap, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  padding: 0 20px;
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #764ba2;
  }

  @media (max-width: 1024px) {
    font-size: 22px;
    gap: 6px;
  }

  @media (max-width: 900px) {
    font-size: 20px;
    gap: 4px;
  }

  @media (max-width: 850px) {
    /* На очень маленьких экранах показываем только эмодзи */
    span {
      display: none;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  @media (max-width: 1200px) {
    gap: 15px;
  }

  @media (max-width: 1024px) {
    gap: 12px;
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 1024px) {
    gap: 10px;
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-weight: 500;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  @media (max-width: 1024px) {
    padding: 8px 12px;
    font-size: 0.9rem;
  }

  @media (max-width: 900px) {
    padding: 8px 10px;
    gap: 6px;
    
    /* Скрываем текст на очень маленьких экранах, оставляем только иконки */
    span {
      display: none;
    }
  }

  @media (max-width: 850px) {
    padding: 8px;
    min-width: 40px;
    justify-content: center;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  &.active {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 1024px) {
    padding: 8px 12px;
    font-size: 0.9rem;
  }

  @media (max-width: 900px) {
    padding: 8px 10px;
    gap: 6px;
    
    /* Скрываем текст на очень маленьких экранах, оставляем только иконки */
    span {
      display: none;
    }
  }

  @media (max-width: 850px) {
    padding: 8px;
    min-width: 40px;
    justify-content: center;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  &.active {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 1024px) {
    padding: 8px 12px;
    font-size: 0.9rem;
  }

  @media (max-width: 900px) {
    padding: 8px 10px;
    gap: 6px;
    
    /* Скрываем текст на очень маленьких экранах, оставляем только иконки */
    span {
      display: none;
    }
    
    /* Скрываем стрелку на маленьких экранах */
    svg:last-child {
      display: none;
    }
  }

  @media (max-width: 850px) {
    padding: 8px;
    min-width: 40px;
    justify-content: center;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid #e0e0e0;
  min-width: 200px;
  z-index: 1000;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: background 0.2s ease;
  border-radius: ${props => props.first ? '12px 12px 0 0' : props.last ? '0 0 12px 12px' : '0'};

  &:hover {
    background: #f8f9fa;
    color: #667eea;
  }

  &.active {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
`;

const DropdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #333;

  @media (max-width: 900px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  display: none;

  @media (max-width: 900px) {
    display: block;
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:last-child {
    border-bottom: none;
  }

  &.active {
    color: #667eea;
  }
`;

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin, isManagerOrAdmin, isGuest } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Главная', icon: Home },
      { path: '/tricks', label: 'Трюки', icon: BookOpen },
      { path: '/leaderboard', label: 'Рейтинг', icon: Trophy }, // Доступен всем
    ];

    if (isGuest()) {
      // Гостевой режим - базовый функционал + рейтинг
      return { simple: baseItems, grouped: [] };
    }

    // Для зарегистрированных пользователей - группируем меню
    const groupedItems = [
      {
        key: 'learning',
        label: 'Обучение',
        icon: GraduationCap,
        items: [
          { path: '/flashcards', label: 'Карточки', icon: CreditCard },
          { path: '/quiz', label: 'Викторина', icon: HelpCircle },
        ]
      },
      {
        key: 'progress',
        label: 'Прогресс',
        icon: BarChart3,
        items: [
          { path: '/progress', label: 'Мой прогресс', icon: TrendingUp },
          { path: '/achievements', label: 'Достижения', icon: Award },
        ]
      }
    ];

    const simpleItems = [
      ...baseItems,
      { path: '/suggest', label: 'Предложить трюк', icon: Plus },
    ];

    // Для админов и менеджеров добавляем админ панель
    if (isManagerOrAdmin()) {
      simpleItems.push({ path: '/admin', label: 'Админ панель', icon: Settings });
    }

    return { simple: simpleItems, grouped: groupedItems };
  };

  const { simple: navItems, grouped: groupedItems } = getNavItems();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const isActiveGroup = (items) => {
    return items.some(item => location.pathname === item.path);
  };

  // Закрываем выпадающие меню при клике вне области
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <>
      <HeaderContainer>
        <Nav>
          <Logo to="/">
            🏂 <span>Уже лучше</span>
          </Logo>
          
          <NavLinks>
            {/* Простые пункты меню */}
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {/* Группированные выпадающие меню */}
            {groupedItems.map((group) => {
              const IconComponent = group.icon;
              const isOpen = openDropdown === group.key;
              const isActive = isActiveGroup(group.items);
              
              return (
                <DropdownContainer key={group.key} className="dropdown-container">
                  <DropdownButton
                    onClick={() => toggleDropdown(group.key)}
                    className={isActive ? 'active' : ''}
                  >
                    <IconComponent size={18} />
                    <span>{group.label}</span>
                    <ChevronDown 
                      size={16} 
                      style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }} 
                    />
                  </DropdownButton>

                  <AnimatePresence>
                    {isOpen && (
                      <>
                        <DropdownOverlay onClick={closeDropdown} />
                        <DropdownMenu
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                        {group.items.map((item, index) => {
                          const ItemIcon = item.icon;
                          return (
                            <DropdownItem
                              key={item.path}
                              to={item.path}
                              first={index === 0}
                              last={index === group.items.length - 1}
                              className={location.pathname === item.path ? 'active' : ''}
                              onClick={closeDropdown}
                            >
                              <ItemIcon size={18} />
                              {item.label}
                            </DropdownItem>
                          );
                        })}
                        </DropdownMenu>
                      </>
                    )}
                  </AnimatePresence>
                </DropdownContainer>
              );
            })}
          </NavLinks>

          <UserSection>
            {isAuthenticated() ? (
              <>
                <NavLink to="/profile">
                  <User size={18} />
                  <span>{user.username}</span>
                  {isAdmin() && <span style={{ fontSize: '0.8rem', color: '#667eea' }}>(Админ)</span>}
                  {user.role === 'manager' && <span style={{ fontSize: '0.8rem', color: '#10B981' }}>(Менеджер)</span>}
                </NavLink>
                <LogoutButton onClick={logout}>
                  <LogOut size={18} />
                  <span>Выйти</span>
                </LogoutButton>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  <LogIn size={18} />
                  <span>Вход</span>
                </NavLink>
                <NavLink to="/register">
                  <User size={18} />
                  <span>Регистрация</span>
                </NavLink>
              </>
            )}
          </UserSection>

          <MobileMenuButton onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
        </Nav>
      </HeaderContainer>

      {mobileMenuOpen && (
        <MobileMenu
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Простые пункты меню */}
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <MobileNavLink
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                <IconComponent size={20} />
                {item.label}
              </MobileNavLink>
            );
          })}

          {/* Группированные пункты меню */}
          {groupedItems.map((group) => 
            group.items.map((item) => {
              const IconComponent = item.icon;
              return (
                <MobileNavLink
                  key={item.path}
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  onClick={closeMobileMenu}
                >
                  <IconComponent size={20} />
                  {item.label}
                </MobileNavLink>
              );
            })
          )}
          
          {isAuthenticated() && (
            <MobileNavLink
              to="/profile"
              className={location.pathname === '/profile' ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              <User size={20} />
              Профиль ({user.username})
            </MobileNavLink>
          )}
          
          {isAuthenticated() ? (
            <MobileNavLink
              to="#"
              onClick={(e) => {
                e.preventDefault();
                logout();
                closeMobileMenu();
              }}
            >
              <LogOut size={20} />
              Выйти
            </MobileNavLink>
          ) : (
            <>
              <MobileNavLink to="/login" onClick={closeMobileMenu}>
                <LogIn size={20} />
                Вход
              </MobileNavLink>
              <MobileNavLink to="/register" onClick={closeMobileMenu}>
                <User size={20} />
                Регистрация
              </MobileNavLink>
            </>
          )}
        </MobileMenu>
      )}
    </>
  );
}

export default Header;
