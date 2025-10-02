'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

interface GameState {
  sequence: number[];
  playerSequence: number[];
  currentRound: number;
  isShowingSequence: boolean;
  isPlayerTurn: boolean;
  gameStatus: 'idle' | 'showing' | 'waiting' | 'success' | 'failure';
  score: number;
}

type Difficulty = 'normal' | 'strict';
type ButtonCount = 4 | 7 | 10;

interface Button {
  id: number;
  color: string;
  tone: number;
  label: string;
  keyBinding?: string;
}

const BUTTON_CONFIGS: Record<ButtonCount, Button[]> = {
  4: [
    { id: 0, color: '#FF4444', tone: 261.63, label: 'Red', keyBinding: '1' },
    { id: 1, color: '#4444FF', tone: 329.63, label: 'Blue', keyBinding: '2' },
    { id: 2, color: '#44FF44', tone: 392.00, label: 'Green', keyBinding: '3' },
    { id: 3, color: '#FFFF44', tone: 523.25, label: 'Yellow', keyBinding: '4' }
  ],
  7: [
    { id: 0, color: '#FF4444', tone: 261.63, label: 'Red', keyBinding: '1' },
    { id: 1, color: '#4444FF', tone: 329.63, label: 'Blue', keyBinding: '2' },
    { id: 2, color: '#44FF44', tone: 392.00, label: 'Green', keyBinding: '3' },
    { id: 3, color: '#FFFF44', tone: 523.25, label: 'Yellow', keyBinding: '4' },
    { id: 4, color: '#FF8800', tone: 349.23, label: 'Orange', keyBinding: '5' },
    { id: 5, color: '#8800FF', tone: 440.00, label: 'Purple', keyBinding: '6' },
    { id: 6, color: '#00FFFF', tone: 493.88, label: 'Cyan', keyBinding: '7' }
  ],
  10: [
    { id: 0, color: '#FF4444', tone: 261.63, label: 'Red', keyBinding: '1' },
    { id: 1, color: '#4444FF', tone: 329.63, label: 'Blue', keyBinding: '2' },
    { id: 2, color: '#44FF44', tone: 392.00, label: 'Green', keyBinding: '3' },
    { id: 3, color: '#FFFF44', tone: 523.25, label: 'Yellow', keyBinding: '4' },
    { id: 4, color: '#FF8800', tone: 349.23, label: 'Orange', keyBinding: '5' },
    { id: 5, color: '#8800FF', tone: 440.00, label: 'Purple', keyBinding: '6' },
    { id: 6, color: '#00FFFF', tone: 493.88, label: 'Cyan', keyBinding: '7' },
    { id: 7, color: '#FF00FF', tone: 587.33, label: 'Magenta', keyBinding: '8' },
    { id: 8, color: '#888888', tone: 659.25, label: 'Gray', keyBinding: '9' },
    { id: 9, color: '#8B4513', tone: 698.46, label: 'Brown', keyBinding: '0' }
  ]
};

const SimonSaysGame = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [gameState, setGameState] = useState<GameState>({
    sequence: [],
    playerSequence: [],
    currentRound: 0,
    isShowingSequence: false,
    isPlayerTurn: false,
    gameStatus: 'idle',
    score: 0
  });

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [buttonCount, setButtonCount] = useState<ButtonCount>(4);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buttons = BUTTON_CONFIGS[buttonCount];

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get URL parameters on component mount
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const difficultyParam = searchParams.get('difficulty') as Difficulty;
      const buttonsParam = searchParams.get('buttons');
      
      if (difficultyParam && ['normal', 'strict'].includes(difficultyParam)) {
        setDifficulty(difficultyParam);
      }
      
      if (buttonsParam && ['4', '7', '10'].includes(buttonsParam)) {
        setButtonCount(parseInt(buttonsParam) as ButtonCount);
      }
    } catch (error) {
      console.log('Error reading search params:', error);
    }
  }, [searchParams, mounted]);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && soundEnabled && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
  }, [soundEnabled]);

  // Play tone for button
  const playTone = useCallback((frequency: number, duration: number = 500) => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [soundEnabled]);

  // Load best score from localStorage
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      const savedScore = localStorage.getItem(`simonSays-${buttonCount}-${difficulty}`);
      if (savedScore) {
        setBestScore(parseInt(savedScore));
      } else {
        setBestScore(null);
      }
    } catch (error) {
      console.warn('Unable to load best score:', error);
    }
  }, [buttonCount, difficulty, mounted]);

  // Save best score to localStorage
  const saveBestScore = useCallback((score: number) => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      if (!bestScore || score > bestScore) {
        setBestScore(score);
        localStorage.setItem(`simonSays-${buttonCount}-${difficulty}`, score.toString());
      }
    } catch (error) {
      console.warn('Unable to save best score:', error);
    }
  }, [bestScore, buttonCount, difficulty, mounted]);

  // Generate next sequence step
  const generateNextStep = useCallback(() => {
    const nextStep = Math.floor(Math.random() * buttonCount);
    return nextStep;
  }, [buttonCount]);

  // Start new game
  const startNewGame = useCallback(() => {
    const firstStep = generateNextStep();
    setGameState({
      sequence: [firstStep],
      playerSequence: [],
      currentRound: 1,
      isShowingSequence: true,
      isPlayerTurn: false,
      gameStatus: 'showing',
      score: 0
    });
    initAudioContext();
  }, [generateNextStep, initAudioContext]);

  // Show sequence to player
  const showSequence = useCallback(async () => {
    if (gameState.gameStatus !== 'showing') return;

    setActiveButton(null);
    
    for (let i = 0; i < gameState.sequence.length; i++) {
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(() => {
          const buttonId = gameState.sequence[i];
          const button = buttons[buttonId];
          
          setActiveButton(buttonId);
          playTone(button.tone, 400);
          
          setTimeout(() => {
            setActiveButton(null);
            resolve(void 0);
          }, 400);
        }, i * 500 + 800);
      });
    }

    // Start player turn
    setTimeout(() => {
      setGameState((prev: GameState) => ({
        ...prev,
        isShowingSequence: false,
        isPlayerTurn: true,
        gameStatus: 'waiting',
        playerSequence: []
      }));
    }, 500);
  }, [gameState.sequence, gameState.gameStatus, buttons, playTone]);

  // Handle player button click
  const handleButtonClick = useCallback((buttonId: number) => {
    if (!gameState.isPlayerTurn || gameState.gameStatus !== 'waiting') return;

    const button = buttons[buttonId];
    playTone(button.tone, 300);
    setActiveButton(buttonId);
    setTimeout(() => setActiveButton(null), 300);

    const newPlayerSequence = [...gameState.playerSequence, buttonId];
    const currentIndex = gameState.playerSequence.length;
    const expectedButton = gameState.sequence[currentIndex];

    if (buttonId !== expectedButton) {
      // Wrong button pressed
      if (difficulty === 'strict') {
        // Game over in strict mode
        setGameState((prev: GameState) => ({
          ...prev,
          gameStatus: 'failure',
          isPlayerTurn: false
        }));
        saveBestScore(gameState.currentRound - 1);
      } else {
        // Retry current round in normal mode
        setGameState((prev: GameState) => ({
          ...prev,
          playerSequence: [],
          isShowingSequence: true,
          isPlayerTurn: false,
          gameStatus: 'showing'
        }));
      }
      return;
    }

    // Correct button pressed
    if (newPlayerSequence.length === gameState.sequence.length) {
      // Round completed successfully
      const newRound = gameState.currentRound + 1;
      const newScore = gameState.currentRound;
      const nextStep = generateNextStep();

      setGameState((prev: GameState) => ({
        ...prev,
        sequence: [...prev.sequence, nextStep],
        playerSequence: [],
        currentRound: newRound,
        score: newScore,
        isShowingSequence: true,
        isPlayerTurn: false,
        gameStatus: 'showing'
      }));
    } else {
      // Continue with current sequence
      setGameState((prev: GameState) => ({
        ...prev,
        playerSequence: newPlayerSequence
      }));
    }
  }, [gameState, buttons, playTone, difficulty, generateNextStep, saveBestScore]);

  // Keyboard controls
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameState.isPlayerTurn) return;

      const key = event.key.toLowerCase();
      let buttonId = -1;

      // Number key bindings
      if (key >= '1' && key <= '9') {
        buttonId = parseInt(key) - 1;
      } else if (key === '0') {
        buttonId = 9;
      }
      // Arrow key and WASD bindings for 4-button mode
      else if (buttonCount === 4) {
        switch (key) {
          case 'arrowup':
          case 'w':
            buttonId = 0;
            break;
          case 'arrowright':
          case 'd':
            buttonId = 1;
            break;
          case 'arrowdown':
          case 's':
            buttonId = 2;
            break;
          case 'arrowleft':
          case 'a':
            buttonId = 3;
            break;
        }
      }

      if (buttonId >= 0 && buttonId < buttonCount) {
        handleButtonClick(buttonId);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlayerTurn, buttonCount, handleButtonClick, mounted]);

  // Show sequence when status changes to 'showing'
  useEffect(() => {
    if (gameState.gameStatus === 'showing') {
      showSequence();
    }
  }, [gameState.gameStatus, showSequence]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'idle':
        return 'Press Start to begin.';
      case 'showing':
        return `Round ${gameState.currentRound} - Watch`;
      case 'waiting':
        return `Your turn (${gameState.playerSequence.length + 1}/${gameState.sequence.length})`;
      case 'failure':
        return difficulty === 'strict' 
          ? `Game Over. Score: ${gameState.currentRound - 1}` 
          : 'Wrong. Watch again.';
      default:
        return '';
    }
  };

  const goBack = () => {
    router.push('/game/simon-says');
  };

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Simon Says</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Back Button */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={goBack}>
          ← Back to Setup
        </button>
        <h1 className={styles.title}>Simon Says</h1>
        <div className={styles.gameMode}>
          {difficulty === 'strict' ? 'Strict Mode' : 'Normal Mode'} • {buttonCount} Buttons
        </div>
      </div>

      {/* Game Stats */}
      <div className={styles.gameStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Round:</span>
          <span className={styles.statValue}>{gameState.currentRound}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Score:</span>
          <span className={styles.statValue}>{gameState.score}</span>
        </div>
        {bestScore !== null && (
          <div className={styles.stat}>
            <span className={styles.statLabel}>Best:</span>
            <span className={styles.statValue}>{bestScore}</span>
          </div>
        )}
      </div>

      {/* Sound Control */}
      <div className={styles.soundControl}>
        <label className={styles.soundToggle}>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          <span>Sound Effects</span>
        </label>
      </div>

      {/* Status Message */}
      <div className={styles.statusMessage}>
        <p>{getStatusMessage()}</p>
      </div>

      {/* Game Board */}
      <div className={`${styles.gameBoard} ${styles[`grid${buttonCount}`]}`}>
        {buttons.map((button) => (
          <button
            key={button.id}
            className={`${styles.gameButton} ${
              activeButton === button.id ? styles.active : ''
            }`}
            style={{
              backgroundColor: button.color,
              boxShadow: activeButton === button.id 
                ? `0 0 30px ${button.color}` 
                : `0 4px 15px rgba(0, 0, 0, 0.2)`
            }}
            onClick={() => handleButtonClick(button.id)}
            disabled={!gameState.isPlayerTurn}
            aria-label={`${button.label} button - Press ${button.keyBinding}`}
          >
            <span className={styles.buttonLabel}>{button.label}</span>
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className={styles.actionButtons}>
        <button
          className={styles.startButton}
          onClick={startNewGame}
          disabled={gameState.gameStatus === 'showing'}
        >
          {gameState.gameStatus === 'idle' ? 'Start Game' : 'New Game'}
        </button>
      </div>

      {/* Keyboard Controls Info */}
      <div className={styles.keyboardInfo}>
        <h4>Controls</h4>
        <p>
          {buttonCount === 4 
            ? 'Arrow Keys, WASD, or 1-4'
            : `Number Keys 1-${buttonCount}`
          }
        </p>
      </div>
    </div>
  );
};

const SimonSaysGamePage = () => {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h1 style={{ margin: 0, color: '#9333EA' }}>Simon Says</h1>
        <p style={{ margin: 0, color: '#666' }}>Loading game...</p>
      </div>
    }>
      <SimonSaysGame />
    </Suspense>
  );
};

export default SimonSaysGamePage;