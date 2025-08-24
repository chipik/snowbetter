from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, UniqueConstraint, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(enum.Enum):
    GUEST = "guest"
    USER = "user"
    MANAGER = "manager"
    ADMIN = "admin"

class SuggestionStatus(enum.Enum):
    PENDING = "pending"      # Ожидает модерации
    APPROVED = "approved"    # Одобрено
    REJECTED = "rejected"    # Отклонено

class AchievementType(enum.Enum):
    LEARNING = "learning"        # За изучение трюков
    CATEGORY = "category"        # За освоение категорий
    STREAK = "streak"           # За серии изучения
    SOCIAL = "social"           # За социальную активность
    SPECIAL = "special"         # Специальные достижения

class Trick(Base):
    __tablename__ = "tricks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    image_url = Column(String(500))
    technique = Column(Text)  # Техника исполнения
    video_url = Column(String(500))  # Ссылка на видео
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связь с прогрессом пользователей
    user_progress = relationship("UserProgress", back_populates="trick")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Связь с прогрессом
    progress = relationship("UserProgress", back_populates="user")

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trick_id = Column(Integer, ForeignKey("tricks.id"), nullable=False)
    learned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    user = relationship("User", back_populates="progress")
    trick = relationship("Trick", back_populates="user_progress")
    
    # Уникальность: один пользователь может изучить один трюк только один раз
    __table_args__ = (
        UniqueConstraint('user_id', 'trick_id', name='unique_user_trick'),
    )

class TrickSuggestion(Base):
    __tablename__ = "trick_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    image_url = Column(String(500))
    technique = Column(Text)  # Техника исполнения
    video_url = Column(String(500))  # Ссылка на видео
    
    # Информация о предложении
    suggested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(SuggestionStatus), default=SuggestionStatus.PENDING, nullable=False, index=True)
    moderated_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Кто модерировал
    moderation_comment = Column(Text)  # Комментарий модератора
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    moderated_at = Column(DateTime(timezone=True))
    
    # Связи
    suggester = relationship("User", foreign_keys=[suggested_by])
    moderator = relationship("User", foreign_keys=[moderated_by])

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # Название достижения
    description = Column(Text, nullable=False)  # Описание
    icon = Column(String(100))  # Иконка (emoji или название)
    type = Column(Enum(AchievementType), nullable=False, index=True)
    
    # Условия получения
    condition_type = Column(String(50), nullable=False)  # "tricks_learned", "category_mastered", etc.
    condition_value = Column(Integer)  # Количество для условия
    condition_data = Column(Text)  # JSON с дополнительными данными
    
    # Награды
    points = Column(Integer, default=0)  # Очки опыта
    badge_color = Column(String(20), default="#667eea")  # Цвет бейджа
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    user = relationship("User")
    achievement = relationship("Achievement")
    
    # Уникальность: пользователь может получить достижение только один раз
    __table_args__ = (
        UniqueConstraint('user_id', 'achievement_id', name='unique_user_achievement'),
    )
