import React from 'react';
import styles from '../styles/Home.module.css';

const BookSelection = ({ characters, onSelect }) => {
  return (
    <div className={styles.bookSelectionContainer}>
      <h2 className={styles.bookSelectionTitle}>Choose a Gothic Character</h2>
      <p className={styles.bookSelectionSubtitle}>
        Select a character from the literary classics to begin your conversation
      </p>
      
      <div className={styles.bookGrid}>
        {characters.map((character) => (
          <div
            key={character.id}
            className={styles.bookCard}
            style={{
              backgroundColor: character.backgroundColor || '#1a1a1a',
              borderColor: character.accent || '#444'
            }}
            onClick={() => onSelect(character)}
          >
            <div className={styles.bookCover}>
              {/* In production, this would display an image */}
              <div 
                className={styles.bookImagePlaceholder}
                style={{ backgroundColor: character.accent || '#444' }}
              >
                {character.name.charAt(0)}
              </div>
            </div>
            <div className={styles.bookInfo}>
              <h3 
                className={styles.bookTitle}
                style={{ color: character.textColor || '#fff' }}
              >
                {character.name}
              </h3>
              <p className={styles.bookAuthor}>{character.title}</p>
              <p className={styles.bookDescription}>{character.description}</p>
              <div className={styles.bookMetadata}>
                <span>{character.book} ({character.year})</span>
                <span>by {character.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookSelection;