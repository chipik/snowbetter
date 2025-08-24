import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Settings, Users, BookOpen, Plus, Edit, Trash2, Save, X, Clock, Check, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 1200px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 10px;
  flex-wrap: wrap;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)'};
  color: ${props => props.active ? '#667eea' : '#333'};
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
  }
`;

const ContentContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  background: #f5f5f5;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #ddd;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'approved': return '#d1fae5';
      case 'rejected': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#d97706';
      case 'approved': return '#059669';
      case 'rejected': return '#dc2626';
      default: return '#374151';
    }
  }};
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.variant === 'danger') return '#e74c3c';
    if (props.variant === 'success') return '#27ae60';
    return '#667eea';
  }};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 10px;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:last-child {
    margin-right: 0;
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  min-height: 100px;
  resize: vertical;

  &:focus {
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #667eea;
  }
`;

function AdminPanel() {
  const { isAdmin, isManager, isManagerOrAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tricks');
  const [tricks, setTricks] = useState([]);
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  


  // Проверяем права доступа
  useEffect(() => {
    if (!isManagerOrAdmin()) {
      navigate('/');
      toast.error('Доступ запрещен');
    }
  }, [isManagerOrAdmin, navigate]);

  // Для менеджеров принудительно устанавливаем вкладку трюков
  useEffect(() => {
    if (isManager() && activeTab !== 'tricks') {
      setActiveTab('tricks');
    }
  }, [isManager, activeTab]);

  // Загружаем данные
  useEffect(() => {
    if (activeTab === 'tricks') {
      loadTricks();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'suggestions') {
      loadSuggestions();
    }
  }, [activeTab]);

  const loadTricks = async () => {
    if (loading) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/api/admin/tricks');
      setTricks(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки трюков');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/suggestions/tricks');
      setSuggestions(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки предложений');
    } finally {
      setLoading(false);
    }
  };

  const handleModerateSuggestion = async (suggestionId, status, comment = '') => {
    try {
      await api.put(`/api/suggestions/tricks/${suggestionId}/moderate`, {
        status,
        comment
      });
      
      const statusText = status === 'approved' ? 'одобрено' : 'отклонено';
      toast.success(`Предложение ${statusText}`);
      loadSuggestions(); // Перезагружаем список
    } catch (error) {
      toast.error('Ошибка при модерации предложения');
    }
  };

  const handleViewSuggestion = (suggestion) => {
    setEditingItem(suggestion);
    setFormData({
      id: suggestion.id,
      name: suggestion.name,
      category: suggestion.category,
      description: suggestion.description,
      image_url: suggestion.image_url || '',
      technique: suggestion.technique || '',
      video_url: suggestion.video_url || '',
      suggested_by: suggestion.suggested_by,
      suggester: suggestion.suggester,
      status: suggestion.status
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    if (activeTab === 'tricks') {
      setFormData({
        name: '',
        category: 'spins',
        description: '',
        image_url: '',
        technique: '',
        video_url: ''
      });
    } else if (activeTab === 'users') {
      setFormData({
        username: '',
        email: '',
        role: 'user',
        is_active: true
      });
    }
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены?')) return;

    try {
      if (activeTab === 'tricks') {
        await api.delete(`/api/admin/tricks/${id}`);
        loadTricks();
        toast.success('Трюк удален');
      } else if (activeTab === 'users') {
        await api.delete(`/api/admin/users/${id}`);
        loadUsers();
        toast.success('Пользователь удален');
      }
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'tricks') {
        if (editingItem) {
          await api.put(`/api/admin/tricks/${editingItem.id}`, formData);
          toast.success('Трюк обновлен');
        } else {
          // Исключаем id из данных при создании нового трюка
          const { id, created_at, ...createData } = formData;
          await api.post('/api/admin/tricks', createData);
          toast.success('Трюк создан');
        }
        loadTricks();
      } else if (activeTab === 'users') {
        if (editingItem) {
          await api.put(`/api/admin/users/${editingItem.id}`, formData);
          toast.success('Пользователь обновлен');
        }
        loadUsers();
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const categoryNames = {
    spins: 'Вращения',
    flips: 'Сальто',
    'off-axis': 'Off-axis',
    grabs: 'Грэбы',
    jibbing: 'Джиббинг',
    combo: 'Комбо'
  };

  if (!isManagerOrAdmin()) {
    return null;
  }



  return (
    <Container>
      <Header>
        <Title>
          <Settings size={32} />
          {isAdmin() ? 'Админ панель' : 'Панель менеджера'}
        </Title>
      </Header>

      <TabsContainer>
        <Tab active={activeTab === 'tricks'} onClick={() => setActiveTab('tricks')}>
          <BookOpen size={18} />
          Управление трюками
        </Tab>
        <Tab active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')}>
          <Clock size={18} />
          Предложения трюков
        </Tab>
        {isAdmin() && (
          <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            <Users size={18} />
            Управление пользователями
          </Tab>
        )}
      </TabsContainer>

      <ContentContainer
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >

        {activeTab === 'tricks' && (
          <>
            <AddButton onClick={handleAdd}>
              <Plus size={18} />
              Добавить трюк
            </AddButton>

            {loading ? (
              <div>Загрузка...</div>
            ) : tricks.length === 0 ? (
              <div>Нет трюков для отображения</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Название</Th>
                    <Th>Категория</Th>
                    <Th>Описание</Th>
                    <Th>Техника</Th>
                    <Th>Видео</Th>
                    <Th>Действия</Th>
                  </tr>
                </thead>
                <tbody>
                  {tricks.map((trick) => (
                    <tr key={trick.id}>
                      <Td>{trick.id}</Td>
                      <Td>{trick.name}</Td>
                      <Td>{categoryNames[trick.category] || trick.category}</Td>
                      <Td>{trick.description.substring(0, 50)}...</Td>
                      <Td>{trick.technique ? '✓' : '—'}</Td>
                      <Td>{trick.video_url ? '✓' : '—'}</Td>
                      <Td>
                        <ActionButton onClick={() => handleEdit(trick)}>
                          <Edit size={14} />
                        </ActionButton>
                        <ActionButton variant="danger" onClick={() => handleDelete(trick.id)}>
                          <Trash2 size={14} />
                        </ActionButton>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            {loading ? (
              <div>Загрузка...</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Имя пользователя</Th>
                    <Th>Email</Th>
                    <Th>Роль</Th>
                    <Th>Активен</Th>
                    <Th>Действия</Th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <Td>{user.id}</Td>
                      <Td>{user.username}</Td>
                      <Td>{user.email}</Td>
                      <Td>{user.role}</Td>
                      <Td>{user.is_active ? 'Да' : 'Нет'}</Td>
                      <Td>
                        <ActionButton onClick={() => handleEdit(user)}>
                          <Edit size={14} />
                        </ActionButton>
                        <ActionButton variant="danger" onClick={() => handleDelete(user.id)}>
                          <Trash2 size={14} />
                        </ActionButton>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}

        {activeTab === 'suggestions' && (
          <>
            {loading ? (
              <div>Загрузка...</div>
            ) : suggestions.length === 0 ? (
              <div>Нет предложений для модерации</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Название</Th>
                    <Th>Категория</Th>
                    <Th>Автор</Th>
                    <Th>Дата</Th>
                    <Th>Статус</Th>
                    <Th>Действия</Th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.map((suggestion) => (
                    <tr key={suggestion.id}>
                      <Td>{suggestion.id}</Td>
                      <Td>{suggestion.name}</Td>
                      <Td>{suggestion.category}</Td>
                      <Td>{suggestion.suggester?.username || 'N/A'}</Td>
                      <Td>{new Date(suggestion.created_at).toLocaleDateString('ru-RU')}</Td>
                      <Td>
                        <StatusBadge status={suggestion.status}>
                          {suggestion.status === 'pending' && 'Ожидает'}
                          {suggestion.status === 'approved' && 'Одобрено'}
                          {suggestion.status === 'rejected' && 'Отклонено'}
                        </StatusBadge>
                      </Td>
                      <Td>
                        {suggestion.status === 'pending' && (
                          <>
                            <ActionButton 
                              variant="success" 
                              onClick={() => handleModerateSuggestion(suggestion.id, 'approved')}
                              title="Одобрить"
                            >
                              <Check size={14} />
                            </ActionButton>
                            <ActionButton 
                              variant="danger" 
                              onClick={() => handleModerateSuggestion(suggestion.id, 'rejected')}
                              title="Отклонить"
                            >
                              <XCircle size={14} />
                            </ActionButton>
                            <ActionButton onClick={() => handleViewSuggestion(suggestion)}>
                              <Edit size={14} />
                            </ActionButton>
                          </>
                        )}
                        {suggestion.status !== 'pending' && (
                          <span style={{ color: '#666', fontSize: '0.9rem' }}>
                            {suggestion.moderator?.username || 'N/A'}
                          </span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </ContentContainer>

      {showModal && (
        <Modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent>
            <h3>
              {activeTab === 'suggestions' ? 'Просмотр предложения' : 
               editingItem ? 'Редактировать' : 'Добавить'} {
               activeTab === 'tricks' ? 'трюк' : 
               activeTab === 'suggestions' ? 'трюка' : 'пользователя'}
            </h3>
            
            {activeTab === 'suggestions' && formData.suggester && (
              <div style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>Автор:</strong> {formData.suggester.username}</p>
                <p><strong>Email:</strong> {formData.suggester.email}</p>
                <p><strong>Статус:</strong> 
                  <StatusBadge status={formData.status} style={{ marginLeft: '10px' }}>
                    {formData.status === 'pending' && 'Ожидает модерации'}
                    {formData.status === 'approved' && 'Одобрено'}
                    {formData.status === 'rejected' && 'Отклонено'}
                  </StatusBadge>
                </p>
              </div>
            )}
            
            <Form onSubmit={handleSubmit}>
              {activeTab === 'tricks' && (
                <>
                  <Input
                    type="text"
                    placeholder="Название трюка"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <Select
                    value={formData.category || 'spins'}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="spins">Вращения</option>
                    <option value="flips">Сальто</option>
                    <option value="off-axis">Off-axis</option>
                    <option value="grabs">Грэбы</option>
                    <option value="jibbing">Джиббинг</option>
                    <option value="combo">Комбо</option>
                  </Select>
                  <TextArea
                    placeholder="Описание трюка"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                  <ImageUpload
                    value={formData.image_url || ''}
                    onChange={(url) => setFormData({...formData, image_url: url})}
                    label="Изображение трюка"
                    allowUrl={true}
                  />
                  <TextArea
                    placeholder="Техника исполнения (каждый шаг с новой строки)"
                    value={formData.technique || ''}
                    onChange={(e) => setFormData({...formData, technique: e.target.value})}
                    rows="6"
                  />
                  <Input
                    type="url"
                    placeholder="Ссылка на видео (YouTube, Vimeo и т.д.)"
                    value={formData.video_url || ''}
                    onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  />
                </>
              )}

              {activeTab === 'users' && (
                <>
                  <Input
                    type="text"
                    placeholder="Имя пользователя"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!!editingItem}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!!editingItem}
                    required
                  />
                  <Select
                    value={formData.role || 'user'}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="user">Пользователь</option>
                    <option value="manager">Менеджер</option>
                    <option value="admin">Администратор</option>
                  </Select>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active !== false}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Активный пользователь
                  </label>
                </>
              )}

              {activeTab === 'suggestions' && (
                <>
                  <Input
                    type="text"
                    placeholder="Название трюка"
                    value={formData.name || ''}
                    readOnly
                  />
                  <Select
                    value={formData.category || 'spins'}
                    disabled
                  >
                    <option value="spins">Вращения</option>
                    <option value="flips">Сальто</option>
                    <option value="off-axis">Off-axis</option>
                    <option value="grabs">Грэбы</option>
                    <option value="jibbing">Джиббинг</option>
                    <option value="combo">Комбо</option>
                  </Select>
                  <TextArea
                    placeholder="Описание трюка"
                    value={formData.description || ''}
                    readOnly
                  />
                  <Input
                    type="url"
                    placeholder="Ссылка на изображение"
                    value={formData.image_url || ''}
                    readOnly
                  />
                  <TextArea
                    placeholder="Техника исполнения"
                    value={formData.technique || ''}
                    readOnly
                  />
                  <Input
                    type="url"
                    placeholder="Ссылка на видео"
                    value={formData.video_url || ''}
                    readOnly
                  />
                  
                  {formData.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <ActionButton 
                        type="button" 
                        variant="success"
                        onClick={() => {
                          handleModerateSuggestion(formData.id, 'approved');
                          setShowModal(false);
                        }}
                      >
                        <Check size={16} />
                        Одобрить
                      </ActionButton>
                      <ActionButton 
                        type="button" 
                        variant="danger"
                        onClick={() => {
                          handleModerateSuggestion(formData.id, 'rejected');
                          setShowModal(false);
                        }}
                      >
                        <XCircle size={16} />
                        Отклонить
                      </ActionButton>
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <ActionButton type="button" onClick={() => setShowModal(false)}>
                  <X size={16} />
                  {activeTab === 'suggestions' ? 'Закрыть' : 'Отмена'}
                </ActionButton>
                {activeTab !== 'suggestions' && (
                  <ActionButton type="submit">
                    <Save size={16} />
                    Сохранить
                  </ActionButton>
                )}
              </div>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default AdminPanel;
