import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import BookSelection from '../components/BookSelection';
import ChatInterface from '../components/ChatInterface';
import DEMO_CHARACTERS from '../data/demoCharacters';
import axios from 'axios';

export default function Home() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Fetch characters on page load
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/characters');
        console.log("API Response:", response.data);
        // Check if we got a valid response with data
        if (response.data && response.data.length > 0) {
          setCharacters(response.data);
          console.log("Updated Characters in FrontEnd:", response.data);
        } else {
          // Fall back to demo characters if API returns empty array
          console.log('No characters returned from API, using demo data');
          setCharacters(DEMO_CHARACTERS);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching characters:', error);
        // Fall back to demo characters on error
        console.log('Error fetching characters, using demo data');
        setCharacters(DEMO_CHARACTERS);
        console.log("📝 Using Demo Characters (Error Mode):", DEMO_CHARACTERS);
        setIsLoading(false);
      }
    };
    
    fetchCharacters();
  }, []);
  
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };
  
  const handleBackToBooks = () => {
    setSelectedCharacter(null);
  };
  
  const handleLogin = async (username, password) => {
      try {//Comment out this try catch block and bring in the below block- Only for mock login
        console.log("Mock login for", username);  // Debugging
        setUser({ username: username }); // Mock user login
    } catch (error) {
        console.error("Mock login failed:", error);
    }
  };
    /*try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      
      // Store andtoken  user info
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Demo mode - still log in even on error
      setUser({ username: username || 'Demo User' });
      return true;
    }
  };*/
  
  const handleLogout = () => {
    console.log("Mock logout");
    //localStorage.removeItem('token'); //Bring back in for real login
    setUser(null);
  };
  
  // Check for existing token on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd verify the token with the server
      // For demo, we'll just set the user as logged in
      setUser({ username: 'User' });
    }
  }, []);
  
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
              <button onClick={handleLogout} className={styles.logoutButton}>Vanish</button>
            </>
          ) : (
            <div className={styles.authButtons}>
              <button 
                onClick={() => {
                  // In a real app, show a login form
                  // For demo, we'll just log in as a demo user
                  handleLogin('mortal', 'password');
                }}
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