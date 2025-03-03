import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import BookSelection from '../components/BookSelection';
import ChatInterface from '../components/ChatInterface';
import { fetchCharacters } from '../utils/api';  // ✅ Import API call function
import { handleLogin, handleLogout, checkAuthStatus } from '../utils/auth'; // ✅ Import Auth functions

export default function Home() {
  const [characters, setCharacters] = useState([]); // Character list state
  const [selectedCharacter, setSelectedCharacter] = useState(null); // Selected character state
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [user, setUser] = useState(null); // User authentication state

  // ✅ Fetch characters from API on page load
  useEffect(() => {
    fetchCharacters(setCharacters, setIsLoading);
  }, []);

  // ✅ Check authentication status on page load
  useEffect(() => {
    setUser(checkAuthStatus());
  }, []);

  // ✅ Handle character selection
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  // ✅ Handle going back to book selection
  const handleBackToBooks = () => {
    setSelectedCharacter(null);
  };

  // ✅ Handle user login
  const loginUser = async (username, password) => {
    const loggedInUser = await handleLogin(username, password);
    if (loggedInUser) setUser(loggedInUser);
  };

  // ✅ Handle user logout
  const logoutUser = () => {
    handleLogout();
    setUser(null);
  };

  // ✅ Show loading screen if data is still loading
  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading the gothic library...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Narrator AI</h1>
        <div className={styles.userSection}>
          {user ? (
            <>
              <span>Welcome, {user.username}!</span>
              <button onClick={logoutUser} className={styles.logoutButton}>Vanish</button>
            </>
          ) : (
            <div className={styles.authButtons}>
              <button
                onClick={() => loginUser('mortal', 'password')}
                className={styles.loginButton}
              >
                Manifest
              </button>
            </div>
          )}
        </div>
      </div>

      <main className={styles.main}>
        {selectedCharacter ? (
          <ChatInterface
            character={selectedCharacter}
            onBack={handleBackToBooks}
            user={user}
          />
        ) : (
          <BookSelection
            characters={characters}
            onSelect={handleCharacterSelect}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>Narrator AI - A Gothic Literary Chatbot Experience</p>
      </footer>
    </div>
  );
}
