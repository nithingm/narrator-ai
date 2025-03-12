// frontend/pages/landing.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Landing.module.css';

const LandingPage = () => {
  const router = useRouter();
  const [showSignUp, setShowSignUp] = useState(false);
  const [dob, setDob] = useState('');

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Save the date of birth (for later use) in localStorage
    localStorage.setItem('dob', dob);
    // Also, simulate setting a demo user (or you could wait for an actual signup API)
    localStorage.setItem('user', JSON.stringify({ username: 'demo' }));
    // Navigate to the main character selection page
    router.push('/');
  };

  const handleLogin = () => {
    // Set demo user in localStorage
    localStorage.setItem('user', JSON.stringify({ username: 'demo' }));
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>Welcome to the Gothic Realm</h1>
        {!showSignUp ? (
          <div className={styles.buttons}>
            <button onClick={() => setShowSignUp(true)}>Sign Up</button>
            <button onClick={handleLogin}>Login</button>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className={styles.signupForm}>
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
