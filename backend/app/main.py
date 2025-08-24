from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from datetime import timedelta, datetime
import json
import os
import uuid
import shutil
from PIL import Image
import aiofiles

from .database import SessionLocal, engine, get_db
from .models import Base, Trick, User, UserProgress, UserRole, TrickSuggestion, SuggestionStatus, Achievement, UserAchievement, AchievementType
from .schemas import (
    TrickCreate, TrickResponse, UserCreate, UserResponse, UserProgressResponse,
    UserLogin, Token, UserUpdate, PasswordChange, TrickSuggestionCreate,
    TrickSuggestionResponse, TrickSuggestionWithUsers, ModerationRequest,
    AchievementCreate, AchievementResponse, UserAchievementResponse, UserWithAchievements
)
from .auth import (
    authenticate_user, create_access_token, get_current_user, 
    get_current_active_user, get_admin_user, get_manager_or_admin_user,
    get_password_hash, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES
)
from .achievements_service import AchievementsService

# Функции для работы с изображениями
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image_file(file: UploadFile) -> bool:
    """Валидация загружаемого файла изображения"""
    # Проверка расширения файла
    file_extension = os.path.splitext(file.filename.lower())[1] if file.filename else ''
    if file_extension not in ALLOWED_EXTENSIONS:
        return False
    
    # Проверка MIME типа
    if not file.content_type or not file.content_type.startswith('image/'):
        return False
    
    return True

def resize_image(image_path: str, max_size: tuple = (800, 600)) -> None:
    """Изменение размера изображения для оптимизации"""
    try:
        with Image.open(image_path) as img:
            # Конвертируем в RGB если нужно (для JPEG)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Изменяем размер с сохранением пропорций
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Сохраняем оптимизированное изображение
            img.save(image_path, optimize=True, quality=85)
    except Exception as e:
        print(f"Ошибка при обработке изображения: {e}")

async def save_uploaded_image(file: UploadFile) -> str:
    """Сохранение загруженного изображения"""
    # Генерируем уникальное имя файла
    file_extension = os.path.splitext(file.filename.lower())[1] if file.filename else '.jpg'
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Сохраняем файл
    async with aiofiles.open(file_path, 'wb') as buffer:
        content = await file.read()
        await buffer.write(content)
    
    # Оптимизируем изображение
    resize_image(file_path)
    
    # Возвращаем URL для доступа к файлу
    return f"/uploads/images/{unique_filename}"

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Уже лучше - Snowboard Tricks Learning App", version="1.0.0")

# Создание папки для загруженных изображений
UPLOAD_DIR = "uploads/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Настройка статических файлов
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS настройки для работы с frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Загрузка трюков из JSON файла при запуске
def load_tricks_from_json():
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже трюки в базе
        existing_tricks = db.query(Trick).count()
        if existing_tricks > 0:
            return
            
        # Загружаем из JSON файла
        # Пробуем разные возможные пути
        possible_paths = [
            "/app/tricks.json",  # Путь в Docker контейнере
            os.path.join(os.path.dirname(__file__), "..", "..", "tricks.json"),  # Относительный путь
            "tricks.json",  # Текущая директория
        ]
        
        json_path = None
        for path in possible_paths:
            if os.path.exists(path):
                json_path = path
                break
        
        if not json_path:
            print("Файл tricks.json не найден ни в одном из путей:", possible_paths)
            return
            
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for trick_data in data["tricks"]:
            # Не устанавливаем id явно - пусть PostgreSQL генерирует автоматически
            trick = Trick(
                name=trick_data["name"],
                category=trick_data["category"],
                description=trick_data["description"],
                image_url=trick_data.get("image"),
                technique=trick_data.get("technique"),
                video_url=trick_data.get("video_url")
            )
            db.add(trick)
        
        db.commit()
        
        # Исправляем sequence для автогенерации ID
        try:
            db.execute("SELECT setval('tricks_id_seq', (SELECT MAX(id) FROM tricks));")
            db.commit()
            print("Sequence для tricks исправлен")
        except Exception as seq_error:
            print(f"Ошибка при исправлении sequence: {seq_error}")
        
        print(f"Загружено {len(data['tricks'])} трюков в базу данных")
    except Exception as e:
        print(f"Ошибка при загрузке трюков: {e}")
        db.rollback()
    finally:
        db.close()

# Создание админа по умолчанию
def create_default_admin():
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже админ
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin_user:
            return
            
        # Создаем админа по умолчанию
        admin_password = get_password_hash("admin123")  # В продакшене изменить!
        admin = User(
            username="admin",
            email="admin@example.com",
            password_hash=admin_password,
            role=UserRole.ADMIN
        )
        db.add(admin)
        db.commit()
        print("Создан админ по умолчанию: admin / admin123")
    except Exception as e:
        print(f"Ошибка при создании админа: {e}")
        db.rollback()
    finally:
        db.close()

def create_default_achievements():
    db = SessionLocal()
    try:
        achievements_service = AchievementsService(db)
        achievements_service.create_default_achievements()
        print("Созданы базовые достижения")
    except Exception as e:
        print(f"Ошибка при создании достижений: {e}")
        db.rollback()
    finally:
        db.close()

# Загружаем трюки при старте приложения
@app.on_event("startup")
async def startup_event():
    load_tricks_from_json()
    create_default_admin()
    create_default_achievements()

@app.get("/")
async def root():
    return {"message": "Уже лучше - API для изучения трюков сноуборда"}

# API для трюков
@app.get("/api/tricks", response_model=List[TrickResponse])
async def get_tricks(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Trick)
    if category:
        query = query.filter(Trick.category == category)
    tricks = query.all()
    return tricks

@app.get("/api/tricks/{trick_id}", response_model=TrickResponse)
async def get_trick(trick_id: int, db: Session = Depends(get_db)):
    trick = db.query(Trick).filter(Trick.id == trick_id).first()
    if not trick:
        raise HTTPException(status_code=404, detail="Трюк не найден")
    return trick

@app.get("/api/categories")
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Trick.category).distinct().all()
    return [cat[0] for cat in categories]

# API для аутентификации
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, существует ли уже пользователь
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким именем или email уже существует")
    
    # Создаем нового пользователя
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username, 
        email=user.email,
        password_hash=hashed_password,
        role=UserRole.USER
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.post("/api/auth/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Проверяем текущий пароль
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль"
        )
    
    # Проверяем, что новый пароль отличается от текущего
    if verify_password(password_data.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Новый пароль должен отличаться от текущего"
        )
    
    # Обновляем пароль
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Пароль успешно изменен"}

# API для пользователей (старый эндпоинт для совместимости)
@app.post("/api/users", response_model=UserResponse)
async def create_user_legacy(user: UserCreate, db: Session = Depends(get_db)):
    return await register(user, db)

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

# Админские эндпоинты для управления трюками
@app.get("/api/admin/tricks", response_model=List[TrickResponse])
async def get_tricks_for_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_manager_or_admin_user)
):
    tricks = db.query(Trick).all()
    return tricks

@app.post("/api/admin/tricks", response_model=TrickResponse)
async def create_trick(
    trick: TrickCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_manager_or_admin_user)
):
    # Исключаем id из данных при создании нового трюка
    trick_data = trick.dict()
    trick_data.pop('id', None)  # Удаляем id если он есть
    
    db_trick = Trick(**trick_data)
    db.add(db_trick)
    db.commit()
    db.refresh(db_trick)
    return db_trick

@app.put("/api/admin/tricks/{trick_id}", response_model=TrickResponse)
async def update_trick(
    trick_id: int,
    trick: TrickCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_manager_or_admin_user)
):
    db_trick = db.query(Trick).filter(Trick.id == trick_id).first()
    if not db_trick:
        raise HTTPException(status_code=404, detail="Трюк не найден")
    
    for field, value in trick.dict().items():
        setattr(db_trick, field, value)
    
    db.commit()
    db.refresh(db_trick)
    return db_trick

@app.delete("/api/admin/tricks/{trick_id}")
async def delete_trick(
    trick_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_manager_or_admin_user)
):
    db_trick = db.query(Trick).filter(Trick.id == trick_id).first()
    if not db_trick:
        raise HTTPException(status_code=404, detail="Трюк не найден")
    
    db.delete(db_trick)
    db.commit()
    return {"message": "Трюк удален"}

@app.post("/api/admin/fix-sequence")
async def fix_tricks_sequence(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Исправляет sequence для таблицы tricks (только для админов)"""
    try:
        # Исправляем sequence для автогенерации ID
        db.execute("SELECT setval('tricks_id_seq', (SELECT MAX(id) FROM tricks) + 1);")
        db.commit()
        return {"message": "Sequence для tricks успешно исправлен"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при исправлении sequence: {str(e)}")

# Админские эндпоинты для управления пользователями
@app.get("/api/admin/users", response_model=List[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    users = db.query(User).all()
    return users

@app.put("/api/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    db.delete(db_user)
    db.commit()
    return {"message": "Пользователь удален"}

# API для прогресса пользователя (только для авторизованных)
@app.post("/api/users/{user_id}/progress/{trick_id}")
async def mark_trick_learned(
    user_id: int, 
    trick_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Проверяем существование пользователя и трюка
    user = db.query(User).filter(User.id == user_id).first()
    trick = db.query(Trick).filter(Trick.id == trick_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if not trick:
        raise HTTPException(status_code=404, detail="Трюк не найден")
    
    # Проверяем, не отмечен ли уже трюк как изученный
    existing_progress = db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.trick_id == trick_id
    ).first()
    
    if existing_progress:
        return {"message": "Трюк уже отмечен как изученный"}
    
    progress = UserProgress(user_id=user_id, trick_id=trick_id)
    db.add(progress)
    db.commit()
    
    # Проверяем новые достижения
    achievements_service = AchievementsService(db)
    new_achievements = achievements_service.check_user_achievements(user_id)
    
    response = {"message": "Трюк отмечен как изученный"}
    if new_achievements:
        response["new_achievements"] = [
            {
                "name": ach.name,
                "description": ach.description,
                "icon": ach.icon,
                "points": ach.points
            }
            for ach in new_achievements
        ]
    
    return response

@app.get("/api/users/{user_id}/progress", response_model=List[UserProgressResponse])
async def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).all()
    return progress

@app.get("/api/users/{user_id}/stats")
async def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    total_tricks = db.query(Trick).count()
    learned_tricks = db.query(UserProgress).filter(UserProgress.user_id == user_id).count()
    
    # Статистика по категориям
    categories_stats = {}
    categories = db.query(Trick.category).distinct().all()
    
    for cat in categories:
        category = cat[0]
        total_in_category = db.query(Trick).filter(Trick.category == category).count()
        learned_in_category = db.query(UserProgress).join(Trick).filter(
            UserProgress.user_id == user_id,
            Trick.category == category
        ).count()
        
        categories_stats[category] = {
            "total": total_in_category,
            "learned": learned_in_category,
            "percentage": round((learned_in_category / total_in_category) * 100, 1) if total_in_category > 0 else 0
        }
    
    return {
        "total_tricks": total_tricks,
        "learned_tricks": learned_tricks,
        "progress_percentage": round((learned_tricks / total_tricks) * 100, 1) if total_tricks > 0 else 0,
        "categories": categories_stats
    }

@app.get("/api/users/{user_id}/learned-tricks")
async def get_user_learned_tricks(user_id: int, db: Session = Depends(get_db)):
    """Получить список изученных трюков пользователя"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Получаем изученные трюки с информацией о трюке и дате изучения
    learned_tricks = db.query(UserProgress, Trick).join(
        Trick, UserProgress.trick_id == Trick.id
    ).filter(
        UserProgress.user_id == user_id
    ).order_by(UserProgress.learned_at.desc()).all()
    
    result = []
    for progress, trick in learned_tricks:
        result.append({
            "learned_at": progress.learned_at,
            "trick": {
                "id": trick.id,
                "name": trick.name,
                "category": trick.category,
                "description": trick.description,
                "image_url": trick.image_url,
                "technique": trick.technique,
                "video_url": trick.video_url
            }
        })
    
    return result

# API для викторин
@app.get("/api/quiz/random")
async def get_random_quiz_question(
    category: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Получить случайный вопрос для викторины"""
    import random
    
    query = db.query(Trick)
    if category:
        query = query.filter(Trick.category == category)
    
    tricks = query.all()
    if not tricks:
        raise HTTPException(status_code=404, detail="Трюки не найдены")
    
    # Выбираем случайный трюк для вопроса
    correct_trick = random.choice(tricks)
    
    # Создаем варианты ответов (правильный + 3 неправильных)
    all_tricks = db.query(Trick).filter(Trick.id != correct_trick.id).all()
    wrong_answers = random.sample(all_tricks, min(3, len(all_tricks)))
    
    options = [correct_trick] + wrong_answers
    random.shuffle(options)
    
    return {
        "question": "Как называется этот трюк?",
        "image_url": correct_trick.image_url,
        "category": correct_trick.category,
        "options": [{"id": trick.id, "name": trick.name} for trick in options],
        "correct_answer_id": correct_trick.id
    }

# API для предложений трюков
@app.post("/api/suggestions/tricks", response_model=TrickSuggestionResponse)
async def suggest_trick(
    suggestion: TrickSuggestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Предложить новый трюк (для авторизованных пользователей)"""
    db_suggestion = TrickSuggestion(
        **suggestion.dict(),
        suggested_by=current_user.id
    )
    db.add(db_suggestion)
    db.commit()
    db.refresh(db_suggestion)
    return db_suggestion

@app.get("/api/suggestions/tricks", response_model=List[TrickSuggestionWithUsers])
async def get_trick_suggestions(
    status: Optional[SuggestionStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Получить список предложений трюков (для модераторов)"""
    query = db.query(TrickSuggestion)
    if status:
        query = query.filter(TrickSuggestion.status == status)
    
    suggestions = query.order_by(TrickSuggestion.created_at.desc()).all()
    
    # Добавляем информацию о пользователях
    result = []
    for suggestion in suggestions:
        suggestion_dict = {
            "id": suggestion.id,
            "name": suggestion.name,
            "category": suggestion.category,
            "description": suggestion.description,
            "image_url": suggestion.image_url,
            "technique": suggestion.technique,
            "video_url": suggestion.video_url,
            "suggested_by": suggestion.suggested_by,
            "status": suggestion.status,
            "moderated_by": suggestion.moderated_by,
            "moderation_comment": suggestion.moderation_comment,
            "created_at": suggestion.created_at,
            "moderated_at": suggestion.moderated_at,
            "suggester": suggestion.suggester,
            "moderator": suggestion.moderator
        }
        result.append(suggestion_dict)
    
    return result

@app.get("/api/users/{user_id}/suggestions", response_model=List[TrickSuggestionResponse])
async def get_user_suggestions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить предложения конкретного пользователя"""
    # Пользователь может видеть только свои предложения, админы/менеджеры - любые
    if current_user.id != user_id and current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    suggestions = db.query(TrickSuggestion).filter(
        TrickSuggestion.suggested_by == user_id
    ).order_by(TrickSuggestion.created_at.desc()).all()
    
    return suggestions

@app.put("/api/suggestions/tricks/{suggestion_id}/moderate")
async def moderate_suggestion(
    suggestion_id: int,
    moderation: ModerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Модерировать предложение трюка"""
    suggestion = db.query(TrickSuggestion).filter(TrickSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Предложение не найдено")
    
    if suggestion.status != SuggestionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Предложение уже было модерировано")
    
    # Обновляем статус предложения
    suggestion.status = moderation.status
    suggestion.moderated_by = current_user.id
    suggestion.moderation_comment = moderation.comment
    suggestion.moderated_at = datetime.utcnow()
    
    # Если предложение одобрено, создаем трюк
    if moderation.status == SuggestionStatus.APPROVED:
        new_trick = Trick(
            name=suggestion.name,
            category=suggestion.category,
            description=suggestion.description,
            image_url=suggestion.image_url,
            technique=suggestion.technique,
            video_url=suggestion.video_url
        )
        db.add(new_trick)
    
    db.commit()
    db.refresh(suggestion)
    
    return {
        "message": "Предложение успешно модерировано",
        "status": suggestion.status.value
    }

@app.delete("/api/suggestions/tricks/{suggestion_id}")
async def delete_suggestion(
    suggestion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удалить предложение трюка (только автор или админ)"""
    suggestion = db.query(TrickSuggestion).filter(TrickSuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Предложение не найдено")
    
    # Проверяем права: автор может удалить только свое предложение, админы - любое
    if suggestion.suggested_by != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    db.delete(suggestion)
    db.commit()
    return {"message": "Предложение удалено"}

# API для достижений
@app.get("/api/achievements", response_model=List[AchievementResponse])
async def get_achievements(db: Session = Depends(get_db)):
    """Получить все активные достижения"""
    achievements = db.query(Achievement).filter(Achievement.is_active == True).all()
    return achievements

@app.get("/api/users/{user_id}/achievements")
async def get_user_achievements(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить достижения пользователя"""
    # Пользователь может видеть только свои достижения, админы - любые
    if current_user.id != user_id and current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    achievements_service = AchievementsService(db)
    return achievements_service.get_user_achievements(user_id)

@app.get("/api/leaderboard")
async def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Получить лидерборд по очкам"""
    achievements_service = AchievementsService(db)
    return achievements_service.get_leaderboard(limit)

@app.post("/api/users/{user_id}/check-achievements")
async def check_user_achievements(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Принудительная проверка достижений пользователя"""
    if current_user.id != user_id and current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    achievements_service = AchievementsService(db)
    new_achievements = achievements_service.check_user_achievements(user_id)
    
    return {
        "new_achievements": [
            {
                "name": ach.name,
                "description": ach.description,
                "icon": ach.icon,
                "points": ach.points
            }
            for ach in new_achievements
        ]
    }

# Админские эндпоинты для достижений
@app.post("/api/admin/achievements", response_model=AchievementResponse)
async def create_achievement(
    achievement: AchievementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Создать новое достижение (только админы)"""
    db_achievement = Achievement(**achievement.dict())
    db.add(db_achievement)
    db.commit()
    db.refresh(db_achievement)
    return db_achievement

# Endpoint для загрузки изображений
@app.post("/api/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Загрузка изображения на сервер"""
    
    # Проверка размера файла
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"Файл слишком большой. Максимальный размер: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Сбрасываем указатель файла
    await file.seek(0)
    
    # Валидация файла
    if not validate_image_file(file):
        raise HTTPException(
            status_code=400,
            detail="Неподдерживаемый формат файла. Разрешены: JPG, PNG, GIF, WebP"
        )
    
    try:
        # Сохраняем изображение
        image_url = await save_uploaded_image(file)
        
        return {
            "success": True,
            "image_url": image_url,
            "message": "Изображение успешно загружено"
        }
    
    except Exception as e:
        print(f"Ошибка при загрузке изображения: {e}")
        raise HTTPException(
            status_code=500,
            detail="Ошибка при загрузке изображения"
        )
