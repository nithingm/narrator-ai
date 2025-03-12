// frontend/pages/index.tsx
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import BookSelection from '../components/BookSelection';
import ChatInterface from '../components/ChatInterface';
import { fetchCharacters } from '../utils/api';
import { handleLogin, handleLogout, checkAuthStatus } from '../utils/auth';
import { Character } from '../types/Character';

interface User {
  username: string;
}

const Home: NextPage = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchCharacters(setCharacters, setIsLoading);
  }, []);

  useEffect(() => {
    // Retrieve user info from localStorage on mount
    const currentUser = checkAuthStatus();
    setUser(currentUser);
  }, []);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleBackToBooks = () => {
    setSelectedCharacter(null);
  };

  const loginUser = async (username: string, password: string) => {
    const loggedInUser = await handleLogin(username, password);
    if (loggedInUser) setUser(loggedInUser);
  };

  const logoutUser = () => {
    handleLogout();
    setUser(null);
  };

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
              <button onClick={logoutUser} className={styles.logoutButton}>
                Vanish
              </button>
            </>
          ) : (
            <div className={styles.authButtons}>
              <button onClick={() => loginUser('mortal', 'password')} className={styles.loginButton}>
                Manifest
              </button>
            </div>
          )}
        </div>
      </div>

      <main className={styles.main}>
        {selectedCharacter ? (
          <ChatInterface character={selectedCharacter} onBack={handleBackToBooks} user={user} />
        ) : (
          <BookSelection characters={characters} onSelect={handleCharacterSelect} />
        )}
      </main>

      <footer className={styles.footer}>
        <p>Narrator AI - A Gothic Literary Chatbot Experience</p>
      </footer>
    </div>
  );
};

export default Home;
