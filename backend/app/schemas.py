from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from .models import UserRole, SuggestionStatus, AchievementType

# Схемы для трюков
class TrickBase(BaseModel):
    name: str
    category: str
    description: str
    image_url: Optional[str] = None
    technique: Optional[str] = None
    video_url: Optional[str] = None

class TrickCreate(TrickBase):
    pass

class TrickResponse(TrickBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Схемы для пользователей
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

# Схемы для аутентификации
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Схемы для прогресса пользователя
class UserProgressBase(BaseModel):
    user_id: int
    trick_id: int

class UserProgressResponse(UserProgressBase):
    id: int
    learned_at: datetime
    
    class Config:
        from_attributes = True

# Схемы для предложений трюков
class TrickSuggestionBase(BaseModel):
    name: str
    category: str
    description: str
    image_url: Optional[str] = None
    technique: Optional[str] = None
    video_url: Optional[str] = None

class TrickSuggestionCreate(TrickSuggestionBase):
    pass

class TrickSuggestionResponse(TrickSuggestionBase):
    id: int
    suggested_by: int
    status: SuggestionStatus
    moderated_by: Optional[int] = None
    moderation_comment: Optional[str] = None
    created_at: datetime
    moderated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TrickSuggestionWithUsers(TrickSuggestionResponse):
    suggester: UserResponse
    moderator: Optional[UserResponse] = None

class ModerationRequest(BaseModel):
    status: SuggestionStatus  # APPROVED или REJECTED
    comment: Optional[str] = None

# Схемы для достижений
class AchievementBase(BaseModel):
    name: str
    description: str
    icon: Optional[str] = None
    type: AchievementType
    condition_type: str
    condition_value: Optional[int] = None
    condition_data: Optional[str] = None
    points: int = 0
    badge_color: str = "#667eea"

class AchievementCreate(AchievementBase):
    pass

class AchievementResponse(AchievementBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class UserAchievementResponse(BaseModel):
    id: int
    user_id: int
    achievement_id: int
    earned_at: datetime
    achievement: AchievementResponse
    
    class Config:
        from_attributes = True

# Расширенная схема пользователя с достижениями
class UserWithAchievements(UserResponse):
    total_points: int = 0
    achievements_count: int = 0
    recent_achievements: list[UserAchievementResponse] = []
