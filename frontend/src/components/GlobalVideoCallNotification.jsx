import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const styles = {
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  videoCallHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  videoCallTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#4b3b34',
    marginBottom: '0.5rem',
  },
  videoCallSubtitle: {
    fontSize: '1rem',
    color: '#6a5b53',
    marginBottom: '0.5rem',
  },
  roleInfo: {
    fontSize: '0.9rem',
    color: '#8b6b5c',
    fontWeight: '600',
    backgroundColor: '#f5ede6',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    textAlign: 'center',
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  modalBtn: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  cancelBtn: {
    backgroundColor: '#8b6b5c',
    color: '#fff',
  },
  confirmBtn: {
    backgroundColor: '#8b6b5c',
    color: '#fff',
  },
};

export default function GlobalVideoCallNotification() {
  const { socket, user } = useContext(AuthContext);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!socket || !user) {
      console.log('Socket or user not available:', { socket: !!socket, user: !!user });
      return;
    }

    const handleIncomingVideoCall = (data) => {
      console.log('Global incoming video call received:', data);
      setIncomingCallData(data);
      setShowIncomingCallModal(true);
    };

    console.log('Setting up global video call listener');
    socket.on('videoCallInvitation', handleIncomingVideoCall);

    return () => {
      console.log('Cleaning up global video call listener');
      socket.off('videoCallInvitation', handleIncomingVideoCall);
    };
  }, [socket, user]);

  const handleAccept = () => {
    const isLearner = incomingCallData.senderRole === 'teacher';
    if (isLearner && user.credits < 1) {
      toast.error('You need at least 1 credit to accept a video call session.');
      return;
    }

    socket.emit('videoCallResponse', {
      sessionId: incomingCallData.sessionId,
      accepted: true,
      userId: user._id,
      acceptedBy: user._id,
      senderRole: incomingCallData.senderRole,
      teacherId: incomingCallData.senderRole === 'teacher' ? incomingCallData.from : user._id,
      learnerId: incomingCallData.senderRole === 'teacher' ? user._id : incomingCallData.from
    });

    setShowIncomingCallModal(false);
    setIncomingCallData(null);

    // Always navigate to chat with the caller
    navigate('/chat', {
      state: { selectedUserId: incomingCallData.from }
    });
  };

  const handleDecline = () => {
    socket.emit('videoCallResponse', {
      sessionId: incomingCallData.sessionId,
      accepted: false,
      userId: user._id,
      senderRole: incomingCallData.senderRole
    });
    setShowIncomingCallModal(false);
    setIncomingCallData(null);
  };

  if (!showIncomingCallModal || !incomingCallData) return null;

  const myRole = incomingCallData.senderRole === 'teacher' ? 'learner' : 'teacher';

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.videoCallHeader}>
          <h2 style={styles.videoCallTitle}>📞 Incoming Video Call</h2>
          <p style={styles.videoCallSubtitle}>
            {incomingCallData.fromName} wants to start a learning session with you
          </p>
          <div style={styles.roleInfo}>
            You will be the <strong>{myRole}</strong> in this session
            {myRole === 'learner' && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}>
                ⚠️ 1 credit will be deducted
              </div>
            )}
          </div>
        </div>
        <div style={styles.modalButtons}>
          <button 
            style={{...styles.modalBtn, ...styles.cancelBtn}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#6d5447'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
            onClick={handleDecline}
          >
            Decline
          </button>
          <button 
            style={{...styles.modalBtn, ...styles.confirmBtn}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#6d5447'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8b6b5c'}
            onClick={handleAccept}
          >
            Accept Call
          </button>
        </div>
      </div>
    </div>
  );
}