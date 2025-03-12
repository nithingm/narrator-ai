// frontend/components/BookSelection.tsx

import React, { FC } from 'react';
// If you haven't declared CSS modules, you might need a global.d.ts that says `declare module '*.module.css';`
import styles from '../styles/Home.module.css';

interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  backgroundColor?: string;
  hoverBackground?: string;
  shadowColor?: string;
  textColor?: string;
  accent?: string;
  book: string;
  author: string;
  year: number;
  systemPrompt?: string;
  defaultModel?: string;
}

interface BookSelectionProps {
  characters: Character[];
  onSelect: (character: Character) => void;
}

// We define a style interface for custom CSS properties
type CustomStyle = React.CSSProperties & {
  '--shadow-color'?: string;
  '--hover-bg'?: string;
};

const BookSelection: FC<BookSelectionProps> = ({ characters, onSelect }) => {
  return (
    <div className={styles.bookSelectionContainer}>
      <h2 className={styles.bookSelectionTitle}>Choose a Gothic Character</h2>
      <p className={styles.bookSelectionSubtitle}>
        Select a character from the literary classics to begin your conversation
      </p>

      <div className={styles.bookGrid}>
        {characters.map((character) => {
          // Define a typed style object
          const cardStyle: CustomStyle = {
            backgroundColor: character.backgroundColor || '#1a1a1a',
            '--shadow-color': character.shadowColor,
            '--hover-bg': character.hoverBackground
          };

          return (
            <div
              key={character.id}
              className={styles.bookCard}
              style={cardStyle}
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
                <p className={styles.bookMeta}>
                  {character.book} ({character.year})
                </p>
                <p className={styles.bookMeta}>by {character.author}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookSelection;
