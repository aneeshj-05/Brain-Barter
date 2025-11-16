import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Clock, BookOpen } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SessionsCalendar = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    skill: '',
    type: 'teaching'
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#4b3b34';
    document.documentElement.style.backgroundColor = '#4b3b34';
    document.body.style.direction = 'ltr';
    document.documentElement.style.direction = 'ltr';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
      document.body.style.direction = '';
      document.documentElement.style.direction = '';
    };
  }, []);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/user-sessions');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await api.put(`/user-sessions/${editingSession._id}`, formData);
        toast.success('Session updated successfully');
      } else {
        await api.post('/user-sessions', formData);
        toast.success('Session created successfully');
      }
      
      fetchSessions();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    }
  };

  const handleDelete = (sessionId) => {
    setSessionToDelete(sessionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/user-sessions/${sessionToDelete}`);
      toast.success('Session deleted successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    } finally {
      setShowDeleteConfirm(false);
      setSessionToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      skill: '',
      type: 'teaching'
    });
    setEditingSession(null);
  };

  const openModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      // Parse date string directly to avoid timezone issues
      const sessionDateStr = session.date.split('T')[0];
      setFormData({
        title: session.title,
        description: session.description,
        date: sessionDateStr,
        startTime: session.startTime,
        endTime: session.endTime,
        skill: session.skill,
        type: session.type
      });
    } else {
      resetForm();
      const dateStr = selectedDate.getFullYear() + '-' + 
        String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(selectedDate.getDate()).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        date: dateStr
      }));
    }
    setShowModal(true);
  };

  const getSessionsForDate = (date) => {
    // Use local date formatting to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return sessions.filter(session => {
      // Parse session date string directly to avoid timezone conversion
      const sessionDateStr = session.date.split('T')[0];
      return sessionDateStr === dateStr;
    });
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const styles = {
    container: {
      height: '100vh',
      backgroundColor: '#f5ede6',
      color: '#4b3b34',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      direction: 'ltr'
    },
    navbar: {
      backgroundColor: '#4b3b34',
      color: '#f5ede6',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    backBtn: {
      backgroundColor: 'transparent',
      border: '2px solid #f5ede6',
      color: '#f5ede6',
      padding: '0.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    addBtn: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    main: {
      flex: 1,
      overflowY: 'auto',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      direction: 'ltr',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    monthNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    navBtn: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    monthYear: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      minWidth: '200px',
      textAlign: 'center'
    },
    calendar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1px',
      backgroundColor: '#e0d5cc',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '2rem'
    },
    dayHeader: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      padding: '1rem',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    dayCell: {
      backgroundColor: '#fff',
      minHeight: '80px',
      padding: '0.5rem',
      cursor: 'pointer',
      position: 'relative'
    },
    dayNumber: {
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    sessionItem: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      marginBottom: '0.25rem',
      cursor: 'pointer'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    input: {
      padding: '0.75rem',
      border: '2px solid #e0d5cc',
      borderRadius: '8px',
      fontSize: '1rem'
    },
    select: {
      padding: '0.75rem',
      border: '2px solid #e0d5cc',
      borderRadius: '8px',
      fontSize: '1rem'
    },
    textarea: {
      padding: '0.75rem',
      border: '2px solid #e0d5cc',
      borderRadius: '8px',
      fontSize: '1rem',
      minHeight: '80px',
      resize: 'vertical'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end'
    },
    saveBtn: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    cancelBtn: {
      backgroundColor: '#6b7280',
      color: '#fff',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    deleteBtn: {
      backgroundColor: '#ef4444',
      color: '#fff',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    confirmModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001
    },
    confirmContent: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      width: '90%',
      maxWidth: '400px',
      textAlign: 'center'
    },
    sessionsList: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '1.5rem'
    },
    sessionCard: {
      border: '1px solid #e0d5cc',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    sessionActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '4px'
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <style>
        {`
          .scrollable-main::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.navbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
            </button>
            <div style={styles.title}>My Sessions</div>
          </div>
          <button style={styles.addBtn} onClick={() => openModal()}>
            <Plus size={16} />
            Add Session
          </button>
        </div>

        <div style={styles.main} className="scrollable-main">
          <div style={styles.calendarHeader}>
            <div style={styles.monthNav}>
              <button 
                style={styles.navBtn}
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
              >
                ←
              </button>
              <div style={styles.monthYear}>
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </div>
              <button 
                style={styles.navBtn}
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
              >
                →
              </button>
            </div>
          </div>

          <div style={styles.calendar}>
            {dayNames.map(day => (
              <div key={day} style={styles.dayHeader}>{day}</div>
            ))}
            
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const daySessions = getSessionsForDate(day);
              
              return (
                <div
                  key={index}
                  style={{
                    ...styles.dayCell,
                    opacity: isCurrentMonth ? 1 : 0.3,
                    backgroundColor: isCurrentMonth ? '#fff' : '#f9f9f9'
                  }}
                  onClick={() => {
                    setSelectedDate(day);
                    openModal();
                  }}
                >
                  <div style={styles.dayNumber}>{day.getDate()}</div>
                  {daySessions.map(session => (
                    <div
                      key={session._id}
                      style={styles.sessionItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(session);
                      }}
                    >
                      {session.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={styles.sessionsList}>
            <h3>Current & Next Week Sessions</h3>
            {(() => {
              const today = new Date();
              const startOfWeek = new Date(today);
              startOfWeek.setDate(today.getDate() - today.getDay());
              const endOfNextWeek = new Date(startOfWeek);
              endOfNextWeek.setDate(startOfWeek.getDate() + 13);
              const upcomingSessions = sessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= startOfWeek && sessionDate <= endOfNextWeek;
              }).sort((a, b) => new Date(a.date) - new Date(b.date));
              
              return upcomingSessions.length > 0 ? upcomingSessions.map(session => (
                <div key={session._id} style={styles.sessionCard}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{session.title}</div>
                    <div style={{ color: '#6a5b53', fontSize: '0.9rem' }}>
                      {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                    </div>
                    <div style={{ color: '#8b6b5c', fontSize: '0.8rem' }}>
                      {session.skill} • {session.type}
                    </div>
                  </div>
                  <div style={styles.sessionActions}>
                    <button
                      style={{ ...styles.actionBtn, color: '#8b6b5c' }}
                      onClick={() => openModal(session)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      style={{ ...styles.actionBtn, color: '#ef4444' }}
                      onClick={() => handleDelete(session._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', color: '#6a5b53', padding: '2rem' }}>
                  No sessions scheduled for current and next week
                </div>
              );
            })()}
          </div>
        </div>

        {showModal && (
          <div style={styles.modal} onClick={() => setShowModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3>{editingSession ? 'Edit Session' : 'Add New Session'}</h3>
              <form style={styles.form} onSubmit={handleSubmit}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Session Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                
                <textarea
                  style={styles.textarea}
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                
                <input
                  style={styles.input}
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    style={styles.input}
                    type="time"
                    placeholder="Start Time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                  <input
                    style={styles.input}
                    type="time"
                    placeholder="End Time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
                
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Skill/Topic"
                  value={formData.skill}
                  onChange={(e) => setFormData({...formData, skill: e.target.value})}
                  required
                />
                
                <select
                  style={styles.select}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="teaching">Teaching Session</option>
                  <option value="learning">Learning Session</option>
                  <option value="meeting">Meeting/Discussion</option>
                </select>
                
                <div style={styles.buttonGroup}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  {editingSession && (
                    <button 
                      type="button" 
                      style={styles.deleteBtn} 
                      onClick={() => {
                        setShowModal(false);
                        handleDelete(editingSession._id);
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <button type="submit" style={styles.saveBtn}>
                    {editingSession ? 'Update' : 'Create'} Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div style={styles.confirmModal} onClick={() => setShowDeleteConfirm(false)}>
            <div style={styles.confirmContent} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: '#4b3b34', marginBottom: '1rem' }}>Delete Session</h3>
              <p style={{ color: '#6a5b53', marginBottom: '2rem' }}>
                Are you sure you want to delete this session? This action cannot be undone.
              </p>
              <div style={styles.buttonGroup}>
                <button 
                  style={styles.cancelBtn} 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  style={styles.deleteBtn} 
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SessionsCalendar;