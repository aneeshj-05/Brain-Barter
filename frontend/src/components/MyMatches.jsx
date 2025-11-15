import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // 👈 your api helper
import { MessageSquare } from "lucide-react";
import toast from 'react-hot-toast';

const MyMatches = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get(`/matches/accepted/${user._id}`);
        setMatches(res.data);
      } catch (err) {
        console.error("Error fetching matches:", err);
      }
    };
    if (user) fetchMatches();
  }, [user]);

  const handleMessage = (match) => {
    navigate("/chat");
    toast('Open chat and select this user to message.', { icon: '💬' });
  };

  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#6a5b53', padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No matches yet.</p>
        <p style={{ fontSize: '0.9rem' }}>Once someone accepts your request, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#4b3b34" }}>My Matches</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {matches.map((match) => (
          <div key={match._id} style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#8b6b5c',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {`${match.firstName?.[0] || 'U'}${match.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div>
                <h3 style={{ color: '#4b3b34', margin: 0, fontWeight: '600' }}>
                  {match.firstName} {match.lastName}
                </h3>
                <p style={{ color: '#6a5b53', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  Rating: {(match.rating ?? 0).toFixed(1)} ⭐
                </p>
              </div>
            </div>
            
            <p style={{ color: '#6a5b53', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Skills:</strong> {match.skills?.join(', ') || '—'}
            </p>
            
            <p style={{ fontSize: '0.8rem', color: '#8b6b5c', marginBottom: '1rem' }}>
              Matched on {new Date(match.acceptedAt).toLocaleDateString()}
            </p>

            <button
              onClick={() => handleMessage(match)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#8b6b5c',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                width: '100%',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#6d5447";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8b6b5c";
              }}
            >
              <MessageSquare size={16} /> Message
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyMatches;
