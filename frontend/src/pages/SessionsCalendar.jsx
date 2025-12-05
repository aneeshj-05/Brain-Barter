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
  const [sessionFilter, setSessionFilter] = useState('upcoming');
  const [showTimePicker, setShowTimePicker] = useState(null);
  const [tempTime, setTempTime] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [showFilterOptions, setShowFilterOptions] = useState(false);

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
      direction: 'ltr',
      fontFamily: 'Arial, sans-serif'
    },
    navbar: {
      backgroundColor: '#4b3b34',
      color: '#f5ede6',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      top: 0,
      left: 0,
      right: 0,
      height: '50px'
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
      padding: '1rem 2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      direction: 'ltr',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      display: 'flex',
      gap: '1.5rem',
      height: 'calc(100vh - 82px)'
    },
    leftPanel: {
      flex: '0 0 65%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    rightPanel: {
      flex: '0 0 32%',
      display: 'flex',
      flexDirection: 'column'
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
      flex: 1,
      height: 'calc(100% - 80px)'
    },
    dayHeader: {
      backgroundColor: '#8b6b5c',
      color: '#fff',
      padding: '0.75rem',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '0.9rem'
    },
    dayCell: {
      backgroundColor: '#fff',
      minHeight: '100px',
      padding: '0.4rem',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dayNumber: {
      fontWeight: 'bold',
      fontSize: '1.2rem',
      color: '#4b3b34'
    },
    sessionItem: {
      position: 'absolute',
      bottom: '4px',
      right: '4px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #8b6b5c, #6d5447)',
      boxShadow: '0 2px 4px rgba(139, 107, 92, 0.4)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '8px',
      color: '#fff',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
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
      background: 'linear-gradient(135deg, #fff 0%, #f8f5f2 100%)',
      borderRadius: '16px',
      padding: '1.5rem',
      height: 'fit-content',
      maxHeight: '600px',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(139, 107, 92, 0.15)',
      border: '1px solid rgba(139, 107, 92, 0.1)'
    },
    sessionCard: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,245,242,0.7) 100%)',
      border: '1px solid rgba(139, 107, 92, 0.15)',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(139, 107, 92, 0.08)',
      position: 'relative',
      overflow: 'hidden'
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
    },
    timePickerOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    clockContainer: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      animation: 'clockAppear 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      minWidth: '320px',
      fontFamily: 'Arial, sans-serif'
    },
    clockFace: {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      border: '3px solid #8b6b5c',
      position: 'relative',
      margin: '0 auto 1.5rem',
      backgroundColor: '#f5ede6'
    },
    clockCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#8b6b5c',
      zIndex: 3
    },
    clockHand: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transformOrigin: '0 0',
      backgroundColor: '#8b6b5c',
      borderRadius: '2px',
      transition: 'transform 0.3s ease'
    },
    timeDisplay: {
      textAlign: 'center',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#4b3b34',
      marginBottom: '1.5rem',
      fontFamily: 'Arial, sans-serif'
    },
    timeControls: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    },
    timeInput: {
      width: '60px',
      padding: '0.5rem',
      textAlign: 'center',
      border: '2px solid #e0d5cc',
      borderRadius: '8px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif'
    },
    clockButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    },
    clockBtn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      fontFamily: 'Arial, sans-serif'
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
          @keyframes clockAppear {
            0% {
              opacity: 0;
              transform: scale(0.8) rotate(-10deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }
          @keyframes tickAnimation {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @keyframes sessionPulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
            }
            50% { 
              transform: scale(1.15);
              box-shadow: 0 4px 12px rgba(245, 158, 11, 0.6);
            }
          }
          @keyframes sessionSlideIn {
            0% {
              opacity: 0;
              transform: translateX(20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.navbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
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
          <div style={styles.leftPanel}>
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
                      backgroundColor: daySessions.length > 0 && isCurrentMonth 
                        ? '#f4ede4' 
                        : isCurrentMonth 
                        ? '#fff' 
                        : '#f9f9f9'
                    }}
                    onClick={() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (day >= today) {
                        setSelectedDate(day);
                        openModal();
                      }
                    }}
                  >
                    {daySessions.length > 0 ? (
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#8b6b5c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(daySessions[0]);
                        }}
                      >
                        {day.getDate()}
                      </div>
                    ) : (
                      <div style={styles.dayNumber}>{day.getDate()}</div>
                    )}
                    {daySessions.length > 0 && (() => {
                      const today = new Date();
                      today.setHours(23, 59, 59, 999);
                      const sessionDate = new Date(day);
                      sessionDate.setHours(23, 59, 59, 999);
                      const isCompleted = sessionDate < today;
                      const isToday = sessionDate.toDateString() === new Date().toDateString();
                      
                      return (
                        <div
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: isCompleted 
                              ? 'linear-gradient(135deg, #8b6b5c, #6d5447)'
                              : isToday
                              ? 'linear-gradient(135deg, #d4a574, #8b6b5c)'
                              : 'linear-gradient(135deg, #8b6b5c, #6d5447)',
                            boxShadow: isCompleted
                              ? '0 3px 8px rgba(139, 107, 92, 0.6)'
                              : isToday
                              ? '0 3px 8px rgba(212, 165, 116, 0.6)'
                              : '0 3px 8px rgba(139, 107, 92, 0.4)',
                            border: isCompleted ? '2px solid #f5ede6' : '2px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#fff',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease',
                            animation: isToday ? 'sessionPulse 2s ease-in-out infinite' : 'none'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (daySessions.length === 1) {
                              openModal(daySessions[0]);
                            } else {
                              openModal(daySessions[0]);
                            }
                          }}
                          title={isCompleted 
                            ? `Completed: ${daySessions.length === 1 ? daySessions[0].title : `${daySessions.length} sessions`}`
                            : isToday
                            ? `Today: ${daySessions.length === 1 ? daySessions[0].title : `${daySessions.length} sessions`}`
                            : `Upcoming: ${daySessions.length === 1 ? daySessions[0].title : `${daySessions.length} sessions`}`}
                        >
                          {isCompleted ? '✓' : daySessions.length > 1 ? daySessions.length : ''}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.sessionsList}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.3rem', 
                  fontWeight: 'bold', 
                  color: '#4b3b34',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar size={20} style={{ color: '#8b6b5c' }} />
                  Sessions
                </h3>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowFilterOptions(!showFilterOptions)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #e0d5cc',
                      backgroundColor: '#fff',
                      color: '#4b3b34',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '160px',
                      transition: 'all 0.3s ease',
                      boxShadow: showFilterOptions ? '0 4px 12px rgba(139, 107, 92, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span>{sessionFilter === 'upcoming' ? 'Upcoming Sessions' : 'Previous Sessions'}</span>
                    <div style={{
                      transform: showFilterOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      fontSize: '0.8rem'
                    }}>
                      ▼
                    </div>
                  </button>
                  
                  {showFilterOptions && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      right: '0',
                      backgroundColor: '#fff',
                      borderRadius: '10px',
                      border: '2px solid #e0d5cc',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      marginTop: '0.5rem',
                      overflow: 'hidden',
                      animation: 'filterDropdown 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }}>
                      {[
                        { value: 'upcoming', label: 'Upcoming Sessions' },
                        { value: 'previous', label: 'Previous Sessions' }
                      ].map((option, index) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSessionFilter(option.value);
                            setShowFilterOptions(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: 'none',
                            backgroundColor: sessionFilter === option.value ? '#8b6b5c' : 'transparent',
                            color: sessionFilter === option.value ? '#fff' : '#4b3b34',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderBottom: index < 1 ? '1px solid #f0f0f0' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            animation: `filterSlideIn 0.2s ease ${index * 0.05}s both`
                          }}
                          onMouseEnter={(e) => {
                            if (sessionFilter !== option.value) {
                              e.target.style.backgroundColor = '#f5ede6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (sessionFilter !== option.value) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {(() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const filteredSessions = sessions.filter(session => {
                  const sessionDate = new Date(session.date);
                  sessionDate.setHours(0, 0, 0, 0);
                  
                  if (sessionFilter === 'upcoming') {
                    return sessionDate >= today;
                  } else {
                    return sessionDate < today;
                  }
                }).sort((a, b) => {
                  if (sessionFilter === 'upcoming') {
                    return new Date(a.date) - new Date(b.date);
                  } else {
                    return new Date(b.date) - new Date(a.date);
                  }
                });
                
                return filteredSessions.length > 0 ? filteredSessions.map((session, index) => (
                  <div 
                    key={session._id} 
                    style={{
                      ...styles.sessionCard,
                      animation: `sessionSlideIn 0.4s ease ${index * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 107, 92, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 107, 92, 0.08)';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: '#4b3b34',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: (() => {
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            const sessionDate = new Date(session.date);
                            sessionDate.setHours(23, 59, 59, 999);
                            const isCompleted = sessionDate < today;
                            const isToday = sessionDate.toDateString() === new Date().toDateString();
                            
                            if (isCompleted) {
                              return 'linear-gradient(135deg, #22c55e, #16a34a)';
                            } else if (isToday) {
                              return 'linear-gradient(135deg, #f59e0b, #d97706)';
                            } else if (session.type === 'teaching') {
                              return 'linear-gradient(135deg, #8b6b5c, #6d5447)';
                            } else if (session.type === 'learning') {
                              return 'linear-gradient(135deg, #d4a574, #8b6b5c)';
                            } else {
                              return 'linear-gradient(135deg, #6d5447, #5a4239)';
                            }
                          })(),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '6px',
                          color: '#fff',
                          fontWeight: 'bold'
                        }}>
                          {(() => {
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            const sessionDate = new Date(session.date);
                            sessionDate.setHours(23, 59, 59, 999);
                            return sessionDate < today ? '✓' : '';
                          })()
                        }</div>
                        {session.title}
                      </div>
                      <div style={{ 
                        color: '#6a5b53', 
                        fontSize: '0.9rem',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Clock size={14} />
                        {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                      </div>
                      <div style={{ 
                        color: '#8b6b5c', 
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <BookOpen size={14} />
                        {session.skill} • {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                      </div>
                    </div>
                    <div style={styles.sessionActions}>
                      <button
                        style={{ 
                          ...styles.actionBtn, 
                          color: '#8b6b5c',
                          backgroundColor: 'rgba(139, 107, 92, 0.1)',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => openModal(session)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#8b6b5c';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(139, 107, 92, 0.1)';
                          e.currentTarget.style.color = '#8b6b5c';
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        style={{ 
                          ...styles.actionBtn, 
                          color: '#ef4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => handleDelete(session._id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#6a5b53', 
                    padding: '3rem 2rem',
                    background: 'linear-gradient(135deg, rgba(139, 107, 92, 0.05) 0%, transparent 100%)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(139, 107, 92, 0.2)'
                  }}>
                    <Calendar size={32} style={{ color: '#8b6b5c', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No sessions found</div>
                    <div>No {sessionFilter.toLowerCase()} sessions available</div>
                  </div>
                );
              })()}
            </div>
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
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4b3b34' }}>Start Time</label>
                    <div
                      style={{
                        ...styles.input,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: '#f8f5f2'
                      }}
                      onClick={() => {
                        const [hour, minute] = (formData.startTime || '09:00').split(':');
                        const hour12 = parseInt(hour) === 0 ? 12 : parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
                        const period = parseInt(hour) >= 12 ? 'PM' : 'AM';
                        setTempTime({ hour: hour12.toString().padStart(2, '0'), minute, period });
                        setShowTimePicker('start');
                      }}
                    >
                      <span style={{ fontFamily: 'Arial, sans-serif' }}>{formData.startTime || 'Select time'}</span>
                      <Clock size={20} style={{ color: '#8b6b5c' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4b3b34' }}>End Time</label>
                    <div
                      style={{
                        ...styles.input,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: '#f8f5f2'
                      }}
                      onClick={() => {
                        const [hour, minute] = (formData.endTime || '10:00').split(':');
                        const hour12 = parseInt(hour) === 0 ? 12 : parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
                        const period = parseInt(hour) >= 12 ? 'PM' : 'AM';
                        setTempTime({ hour: hour12.toString().padStart(2, '0'), minute, period });
                        setShowTimePicker('end');
                      }}
                    >
                      <span style={{ fontFamily: 'Arial, sans-serif' }}>{formData.endTime || 'Select time'}</span>
                      <Clock size={20} style={{ color: '#8b6b5c' }} />
                    </div>
                  </div>
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

        {showTimePicker && (
          <div style={styles.timePickerOverlay} onClick={() => setShowTimePicker(null)}>
            <div style={styles.clockContainer} onClick={(e) => e.stopPropagation()}>
              <div style={styles.timeDisplay}>
                {tempTime.hour}:{tempTime.minute} {tempTime.period}
              </div>
              
              <div style={styles.clockFace}>
                <div style={styles.clockCenter}></div>
                
                {/* Hour markers */}
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = i === 0 ? 12 : i;
                  const angle = (i * 30) - 90;
                  const x = 85 * Math.cos(angle * Math.PI / 180);
                  const y = 85 * Math.sin(angle * Math.PI / 180);
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px)`,
                        transform: 'translate(-50%, -50%)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: parseInt(tempTime.hour) % 12 === hour % 12 ? '#8b6b5c' : '#e0d5cc',
                        color: parseInt(tempTime.hour) % 12 === hour % 12 ? '#fff' : '#4b3b34',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setTempTime(prev => ({ ...prev, hour: hour.toString().padStart(2, '0') }))}
                    >
                      {hour}
                    </div>
                  );
                })}
                
                {/* Hour hand */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '4px',
                    height: '50px',
                    backgroundColor: '#8b6b5c',
                    borderRadius: '2px',
                    transformOrigin: '50% 100%',
                    transform: `translate(-50%, -100%) rotate(${((parseInt(tempTime.hour) % 12) * 30) + (parseInt(tempTime.minute) * 0.5)}deg)`,
                    transition: 'transform 0.3s ease',
                    zIndex: 2
                  }}
                ></div>
                
                {/* Minute hand */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '2px',
                    height: '70px',
                    backgroundColor: '#6d5447',
                    borderRadius: '1px',
                    transformOrigin: '50% 100%',
                    transform: `translate(-50%, -100%) rotate(${parseInt(tempTime.minute) * 6}deg)`,
                    transition: 'transform 0.3s ease',
                    zIndex: 2
                  }}
                ></div>
              </div>
              
              <div style={styles.timeControls}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', textAlign: 'center', fontWeight: '600' }}>Hour</label>
                  <input
                    style={styles.timeInput}
                    type="number"
                    min="1"
                    max="12"
                    value={tempTime.hour}
                    onChange={(e) => setTempTime(prev => ({ ...prev, hour: e.target.value.padStart(2, '0') }))}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>:</div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', textAlign: 'center', fontWeight: '600' }}>Minute</label>
                  <input
                    style={styles.timeInput}
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={tempTime.minute}
                    onChange={(e) => setTempTime(prev => ({ ...prev, minute: e.target.value.padStart(2, '0') }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', textAlign: 'center', fontWeight: '600' }}>Period</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <button
                      type="button"
                      style={{
                        ...styles.timeInput,
                        width: '50px',
                        height: '30px',
                        padding: '0.25rem',
                        fontSize: '0.9rem',
                        backgroundColor: tempTime.period === 'AM' ? '#8b6b5c' : '#f5ede6',
                        color: tempTime.period === 'AM' ? '#fff' : '#4b3b34',
                        border: tempTime.period === 'AM' ? '2px solid #8b6b5c' : '2px solid #e0d5cc'
                      }}
                      onClick={() => setTempTime(prev => ({ ...prev, period: 'AM' }))}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      style={{
                        ...styles.timeInput,
                        width: '50px',
                        height: '30px',
                        padding: '0.25rem',
                        fontSize: '0.9rem',
                        backgroundColor: tempTime.period === 'PM' ? '#8b6b5c' : '#f5ede6',
                        color: tempTime.period === 'PM' ? '#fff' : '#4b3b34',
                        border: tempTime.period === 'PM' ? '2px solid #8b6b5c' : '2px solid #e0d5cc'
                      }}
                      onClick={() => setTempTime(prev => ({ ...prev, period: 'PM' }))}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={styles.clockButtons}>
                <button
                  style={{
                    ...styles.clockBtn,
                    backgroundColor: '#6b7280',
                    color: '#fff'
                  }}
                  onClick={() => setShowTimePicker(null)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...styles.clockBtn,
                    backgroundColor: '#8b6b5c',
                    color: '#fff'
                  }}
                  onClick={() => {
                    let hour24 = parseInt(tempTime.hour);
                    if (tempTime.period === 'PM' && hour24 !== 12) hour24 += 12;
                    if (tempTime.period === 'AM' && hour24 === 12) hour24 = 0;
                    const timeString = `${hour24.toString().padStart(2, '0')}:${tempTime.minute}`;
                    if (showTimePicker === 'start') {
                      setFormData(prev => ({ ...prev, startTime: timeString }));
                    } else {
                      setFormData(prev => ({ ...prev, endTime: timeString }));
                    }
                    setShowTimePicker(null);
                  }}
                >
                  Set Time
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