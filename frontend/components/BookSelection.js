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
              '--shadow-color': character.shadowColor,
              '--hover-bg': character.hoverBackground,
            }}
            onClick={() => onSelect(character)}
          >
            {/* Image Section */}
            <div className={styles.bookCardTop}>
              <img
                src={`/images/characters/${character.id}.webp`}
                alt={character.name}
                className={styles.characterImage}
              />

              {/* Overlay Description */}
              <div className={styles.bookOverlay}>
                <p className={styles.overlayText}>{character.description}</p>
              </div>
            </div>

            {/* Character Details */}
            <div className={styles.bookInfo}>
              <h3 className={styles.bookTitle}>{character.name}</h3>
              <p className={styles.bookSubtitle}>{character.title}</p>
              <p className={styles.bookMeta}>{character.book} ({character.year})</p>
              <p className={styles.bookMeta}>by {character.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookSelection;
