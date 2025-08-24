from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from .models import Achievement, UserAchievement, User, UserProgress, Trick, AchievementType
from typing import List, Optional
import json
from datetime import datetime, timedelta

class AchievementsService:
    def __init__(self, db: Session):
        self.db = db

    def create_default_achievements(self):
        """Создает базовые достижения"""
        default_achievements = [
            # Достижения за изучение трюков
            {
                "name": "Первые шаги",
                "description": "Изучите свой первый трюк",
                "icon": "🎯",
                "type": AchievementType.LEARNING,
                "condition_type": "tricks_learned",
                "condition_value": 1,
                "points": 10,
                "badge_color": "#10B981"
            },
            {
                "name": "Новичок",
                "description": "Изучите 5 трюков",
                "icon": "🌟",
                "type": AchievementType.LEARNING,
                "condition_type": "tricks_learned",
                "condition_value": 5,
                "points": 50,
                "badge_color": "#3B82F6"
            },
            {
                "name": "Прогрессор",
                "description": "Изучите 10 трюков",
                "icon": "⚡",
                "type": AchievementType.LEARNING,
                "condition_type": "tricks_learned",
                "condition_value": 10,
                "points": 100,
                "badge_color": "#8B5CF6"
            },
            {
                "name": "Мастер",
                "description": "Изучите 25 трюков",
                "icon": "🔥",
                "type": AchievementType.LEARNING,
                "condition_type": "tricks_learned",
                "condition_value": 25,
                "points": 250,
                "badge_color": "#F59E0B"
            },
            {
                "name": "Легенда",
                "description": "Изучите 50 трюков",
                "icon": "👑",
                "type": AchievementType.LEARNING,
                "condition_type": "tricks_learned",
                "condition_value": 50,
                "points": 500,
                "badge_color": "#DC2626"
            },
            
            # Достижения по категориям
            {
                "name": "Спинер",
                "description": "Освойте все вращения",
                "icon": "🌀",
                "type": AchievementType.CATEGORY,
                "condition_type": "category_mastered",
                "condition_data": json.dumps({"category": "spins"}),
                "points": 200,
                "badge_color": "#06B6D4"
            },
            {
                "name": "Акробат",
                "description": "Освойте все сальто",
                "icon": "🤸",
                "type": AchievementType.CATEGORY,
                "condition_type": "category_mastered",
                "condition_data": json.dumps({"category": "flips"}),
                "points": 200,
                "badge_color": "#EF4444"
            },
            {
                "name": "Грэб Мастер",
                "description": "Освойте все грэбы",
                "icon": "✋",
                "type": AchievementType.CATEGORY,
                "condition_type": "category_mastered",
                "condition_data": json.dumps({"category": "grabs"}),
                "points": 200,
                "badge_color": "#84CC16"
            },
            {
                "name": "Джиббер",
                "description": "Освойте все трюки на рейлах",
                "icon": "🛤️",
                "type": AchievementType.CATEGORY,
                "condition_type": "category_mastered",
                "condition_data": json.dumps({"category": "jibbing"}),
                "points": 200,
                "badge_color": "#A855F7"
            },
            
            # Достижения за стрики
            {
                "name": "Мотиватор",
                "description": "Изучайте трюки 3 дня подряд",
                "icon": "📅",
                "type": AchievementType.STREAK,
                "condition_type": "daily_streak",
                "condition_value": 3,
                "points": 75,
                "badge_color": "#F97316"
            },
            {
                "name": "Постоянство",
                "description": "Изучайте трюки 7 дней подряд",
                "icon": "🔥",
                "type": AchievementType.STREAK,
                "condition_type": "daily_streak",
                "condition_value": 7,
                "points": 150,
                "badge_color": "#DC2626"
            },
            
            # Социальные достижения
            {
                "name": "Вкладчик",
                "description": "Предложите свой первый трюк",
                "icon": "💡",
                "type": AchievementType.SOCIAL,
                "condition_type": "tricks_suggested",
                "condition_value": 1,
                "points": 100,
                "badge_color": "#6366F1"
            },
            {
                "name": "Креатор",
                "description": "Предложите 5 трюков",
                "icon": "🚀",
                "type": AchievementType.SOCIAL,
                "condition_type": "tricks_suggested",
                "condition_value": 5,
                "points": 300,
                "badge_color": "#8B5CF6"
            }
        ]

        for ach_data in default_achievements:
            # Проверяем, существует ли уже такое достижение
            existing = self.db.query(Achievement).filter(Achievement.name == ach_data["name"]).first()
            if not existing:
                achievement = Achievement(**ach_data)
                self.db.add(achievement)
        
        self.db.commit()

    def check_user_achievements(self, user_id: int) -> List[Achievement]:
        """Проверяет и выдает новые достижения пользователю"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        new_achievements = []
        all_achievements = self.db.query(Achievement).filter(Achievement.is_active == True).all()
        
        # Получаем уже полученные достижения пользователя
        earned_achievement_ids = set(
            self.db.query(UserAchievement.achievement_id)
            .filter(UserAchievement.user_id == user_id)
            .scalar_subquery()
        )

        for achievement in all_achievements:
            if achievement.id in earned_achievement_ids:
                continue  # Уже получено

            if self._check_achievement_condition(user_id, achievement):
                # Выдаем достижение
                user_achievement = UserAchievement(
                    user_id=user_id,
                    achievement_id=achievement.id
                )
                self.db.add(user_achievement)
                new_achievements.append(achievement)

        if new_achievements:
            self.db.commit()

        return new_achievements

    def _check_achievement_condition(self, user_id: int, achievement: Achievement) -> bool:
        """Проверяет выполнение условия достижения"""
        condition_type = achievement.condition_type
        condition_value = achievement.condition_value
        condition_data = json.loads(achievement.condition_data) if achievement.condition_data else {}

        if condition_type == "tricks_learned":
            learned_count = self.db.query(UserProgress).filter(UserProgress.user_id == user_id).count()
            return learned_count >= condition_value

        elif condition_type == "category_mastered":
            category = condition_data.get("category")
            if not category:
                return False
            
            # Получаем все трюки в категории
            total_in_category = self.db.query(Trick).filter(Trick.category == category).count()
            if total_in_category == 0:
                return False
            
            # Получаем изученные трюки в категории
            learned_in_category = self.db.query(UserProgress).join(Trick).filter(
                UserProgress.user_id == user_id,
                Trick.category == category
            ).count()
            
            return learned_in_category == total_in_category

        elif condition_type == "daily_streak":
            # Проверяем количество дней подряд с изученными трюками
            streak_days = self._calculate_daily_streak(user_id)
            return streak_days >= condition_value

        elif condition_type == "tricks_suggested":
            from .models import TrickSuggestion
            suggested_count = self.db.query(TrickSuggestion).filter(
                TrickSuggestion.suggested_by == user_id
            ).count()
            return suggested_count >= condition_value

        return False

    def _calculate_daily_streak(self, user_id: int) -> int:
        """Вычисляет текущую серию дней с изученными трюками"""
        # Получаем даты изучения трюков, сгруппированные по дням
        progress_dates = self.db.query(
            func.date(UserProgress.learned_at).label('date')
        ).filter(
            UserProgress.user_id == user_id
        ).distinct().order_by(
            func.date(UserProgress.learned_at).desc()
        ).all()

        if not progress_dates:
            return 0

        streak = 0
        current_date = datetime.now().date()
        
        for date_row in progress_dates:
            date = date_row.date
            expected_date = current_date - timedelta(days=streak)
            
            if date == expected_date:
                streak += 1
            else:
                break
                
        return streak

    def get_user_achievements(self, user_id: int) -> dict:
        """Получает все достижения пользователя с статистикой"""
        user_achievements = self.db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).join(Achievement).order_by(UserAchievement.earned_at.desc()).all()

        total_points = sum(ua.achievement.points for ua in user_achievements)
        
        return {
            "total_points": total_points,
            "achievements_count": len(user_achievements),
            "achievements": user_achievements,
            "recent_achievements": user_achievements[:5]  # Последние 5
        }

    def get_leaderboard(self, limit: int = 10) -> List[dict]:
        """Получает топ пользователей по очкам"""
        # Подсчитываем очки для каждого пользователя
        user_points = self.db.query(
            User.id,
            User.username,
            func.coalesce(func.sum(Achievement.points), 0).label('total_points'),
            func.count(UserAchievement.id).label('achievements_count')
        ).outerjoin(
            UserAchievement, User.id == UserAchievement.user_id
        ).outerjoin(
            Achievement, UserAchievement.achievement_id == Achievement.id
        ).group_by(
            User.id, User.username
        ).order_by(
            func.coalesce(func.sum(Achievement.points), 0).desc()
        ).limit(limit).all()

        return [
            {
                "user_id": row.id,
                "username": row.username,
                "total_points": int(row.total_points),
                "achievements_count": row.achievements_count,
                "rank": idx + 1
            }
            for idx, row in enumerate(user_points)
        ]
