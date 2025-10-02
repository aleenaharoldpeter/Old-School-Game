'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type Difficulty = 'normal' | 'strict';
type ButtonCount = 4 | 7 | 10;

const SimonSaysLanding = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [buttonCount, setButtonCount] = useState<ButtonCount>(4);
  const router = useRouter();

  const startGame = () => {
    // Navigate to the game page with selected settings
    router.push(`/game/simon-says/play?difficulty=${difficulty}&buttons=${buttonCount}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Simon Says</h1>
        <p className={styles.subtitle}>Memory sequence game.</p>
      </div>

      {/* Game Setup */}
      <div className={styles.gameSetup}>
        <h2 className={styles.setupTitle}>Game Settings</h2>
        
        <div className={styles.setupSection}>
          <h3>Game Mode</h3>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.setupButton} ${difficulty === 'normal' ? styles.active : ''}`}
              onClick={() => setDifficulty('normal')}
            >
              Normal
              <span className={styles.modeDescription}>Retry on mistake</span>
            </button>
            <button
              className={`${styles.setupButton} ${difficulty === 'strict' ? styles.active : ''}`}
              onClick={() => setDifficulty('strict')}
            >
              Strict
              <span className={styles.modeDescription}>Game over on mistake</span>
            </button>
          </div>
        </div>

        <div className={styles.setupSection}>
          <h3>Difficulty Level</h3>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.setupButton} ${buttonCount === 4 ? styles.active : ''}`}
              onClick={() => setButtonCount(4)}
            >
              Easy
              <span className={styles.modeDescription}>4 Buttons</span>
            </button>
            <button
              className={`${styles.setupButton} ${buttonCount === 7 ? styles.active : ''}`}
              onClick={() => setButtonCount(7)}
            >
              Medium
              <span className={styles.modeDescription}>7 Buttons</span>
            </button>
            <button
              className={`${styles.setupButton} ${buttonCount === 10 ? styles.active : ''}`}
              onClick={() => setButtonCount(10)}
            >
              Hard
              <span className={styles.modeDescription}>10 Buttons</span>
            </button>
          </div>
        </div>

        <button className={styles.playButton} onClick={startGame}>
          Start Playing
        </button>
      </div>

      {/* Game Rules */}
      <div className={styles.rulesContainer}>
        <h2 className={styles.sectionTitle}>How to Play</h2>
        <div className={styles.rulesGrid}>
          <div className={styles.ruleCard}>
            <div className={styles.ruleNumber}>1</div>
            <h4>Watch</h4>
            <p>Computer shows button sequence.</p>
          </div>
          <div className={styles.ruleCard}>
            <div className={styles.ruleNumber}>2</div>
            <h4>Repeat</h4>
            <p>Click buttons in same order.</p>
          </div>
          <div className={styles.ruleCard}>
            <div className={styles.ruleNumber}>3</div>
            <h4>Level Up</h4>
            <p>Sequence gets longer each round.</p>
          </div>
          <div className={styles.ruleCard}>
            <div className={styles.ruleNumber}>4</div>
            <h4>Game Modes</h4>
            <p>Normal: retry on mistake. Strict: game over.</p>
          </div>
        </div>

        <div className={styles.controlsInfo}>
          <h3>Controls</h3>
          <div className={styles.controlsList}>
            <div className={styles.controlItem}>
              <span className={styles.controlKey}>Mouse</span>
              <span>Click buttons</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.controlKey}>Keyboard</span>
              <span>Number keys or WASD</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default SimonSaysLanding;