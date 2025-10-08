import React, { useState, useEffect } from 'react'; // Consolidated React imports
import axios from 'axios';
import { Search, Users, Book, Zap } from "lucide-react";
import Navbar from '../components/Navbar';

export default function Dashboard() {
  // State to hold the dynamic stats from the backend
  const [stats, setStats] = useState({
    knowledgeShared: 0,
    activeLearners: 0,
    topicsAvailable: 0,
    exchangesToday: 0
  });

  // useEffect to fetch stats when the component mounts
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await axios.get('http://localhost:5000/api/stats', {
          headers: { 'x-auth-token': token }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []); // Empty array means this runs once on load

  // Your original styles object
  const styles = {
    body: {
      minHeight: "100vh",
      backgroundColor: "#f5ede6",
      color: "#4b3b34",
      fontFamily: "Arial, sans-serif",
    },
    main: { padding: "2rem" },
    heading: { fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" },
    subHeading: { color: "#6a5b53", marginBottom: "1.5rem" },
    searchBox: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #ddd",
      padding: "0.5rem 1rem",
      maxWidth: "600px",
      marginBottom: "2rem",
    },
    searchInput: {
      flex: 1,
      border: "none",
      outline: "none",
      fontSize: "0.9rem",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1.5rem",
      marginBottom: "2.5rem",
    },
    statCard: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      textAlign: "center",
      padding: "1.5rem",
    },
    quickTitle: { fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" },
    quickGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1.5rem",
      marginBottom: "3rem",
    },
    actionCard: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    actionIcon: { color: "#8b6b5c", marginBottom: "1rem" },
    actionBtn: {
      backgroundColor: "#8b6b5c",
      color: "#fff",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      marginTop: "auto",
    },
    recentTitle: { fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" },
    recentBox: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      padding: "2.5rem",
      textAlign: "center",
    },
    recentIcon: { width: "40px", height: "40px", margin: "0 auto 1rem", color: "#8b6b5c" },
    recentHeading: { fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" },
    recentText: { fontSize: "0.9rem", color: "#6a5b53", marginBottom: "1rem" },
    recentBtn: {
      backgroundColor: "#8b6b5c",
      color: "#fff",
      padding: "0.5rem 1.5rem",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.body}>
      <Navbar />
      <main style={styles.main}>
        <h1 style={styles.heading}>Welcome to Brain Barter</h1>
        <p style={styles.subHeading}>
          Exchange knowledge, discover expertise, and grow together in our learning community
        </p>

        <div style={styles.searchBox}>
          <Search size={18} style={{ marginRight: "0.5rem", color: "#666" }} />
          <input
            type="text"
            placeholder="Search for knowledge, ideas, or expertise..."
            style={styles.searchInput}
          />
        </div>

        {/* This section now uses the dynamic 'stats' state */}
        <div style={styles.statsGrid}>
          <StatCard title="Knowledge Shared" value={stats.knowledgeShared} change="+12%" />
          <StatCard title="Active Learners" value={stats.activeLearners} change="+8%" />
          <StatCard title="Topics Available" value={stats.topicsAvailable} change="+3%" />
          <StatCard title="Exchanges Today" value={stats.exchangesToday} change="+24%" />
        </div>

        <h2 style={styles.quickTitle}>Quick Actions</h2>
        <div style={styles.quickGrid}>
          <ActionCard
            icon={<Book size={24} />}
            title="Share Knowledge"
            desc="Upload and share your expertise"
            button="Share Now"
          />
          <ActionCard
            icon={<Users size={24} />}
            title="Find Experts"
            desc="Connect with knowledgeable peers"
            button="Browse"
          />
          <ActionCard
            icon={<Zap size={24} />}
            title="Quick Exchange"
            desc="Start an instant knowledge trade"
            button="Start"
          />
        </div>

        <h2 style={styles.recentTitle}>Recent Activity</h2>
        <div style={styles.recentBox}>
          <Book style={styles.recentIcon} />
          <h3 style={styles.recentHeading}>Start Your Knowledge Journey</h3>
          <p style={styles.recentText}>
            Begin by searching for topics you're interested in or sharing your own expertise
          </p>
          <button style={styles.recentBtn}>Explore Topics</button>
        </div>
      </main>
    </div>
  );

  // --- Helper Functions ---
  function StatCard({ title, value, change }) {
    return (
      <div style={styles.statCard}>
        <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{value}</p>
        <p style={{ fontSize: "0.9rem", color: "#6a5b53" }}>{title}</p>
        <p style={{ color: "green", fontSize: "0.85rem", marginTop: "0.25rem" }}>{change}</p>
      </div>
    );
  }

  function ActionCard({ icon, title, desc, button }) {
    return (
      <div style={styles.actionCard}>
        <div style={styles.actionIcon}>{icon}</div>
        <h3 style={{ fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.25rem" }}>{title}</h3>
        <p style={{ fontSize: "0.9rem", color: "#6a5b53", marginBottom: "1rem" }}>{desc}</p>
        <button style={styles.actionBtn}>{button}</button>
      </div>
    );
  }
}