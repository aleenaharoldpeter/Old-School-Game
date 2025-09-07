'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

type Difficulty = 'amateur' | 'normal' | 'veteran'
type Op = '+' | '-' | '×' | '÷'

type Equation = {
  a: number
  b: number
  op: Op
  correct: number
}

const OPS: Op[] = ['+', '-', '×', '÷']

function randint(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function pick<T>(arr: T[]): T {
  return arr[randint(0, arr.length - 1)]
}

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return Math.trunc(a / b)
    default: {
      const _exhaustive: never = op
      return _exhaustive
    }
  }
}

// Ensure division problems are clean
function makeDivisible(aMin: number, aMax: number, bMin: number, bMax: number) {
  let b = randint(bMin, bMax)
  if (b === 0) b = 1
  const k = randint(Math.max(1, Math.ceil(aMin / b)), Math.max(1, Math.floor(aMax / b)))
  const a = b * k
  return { a, b }
}

// Dynamic equation generator
function generateEquation(diff: Difficulty): Equation {
  const op = pick(OPS)
  let a = 0, b = 0

  if (diff === 'amateur') {
    if (op === '÷') {
      const { a: aa, b: bb } = makeDivisible(1, 81, 1, 9)
      a = aa; b = bb
    } else if (op === '×') {
      a = randint(1, 9); b = randint(1, 9)
    } else {
      a = randint(1, 20); b = randint(1, 20)
    }
  } else if (diff === 'normal') {
    if (op === '÷') {
      const { a: aa, b: bb } = makeDivisible(10, 196, 2, 14)
      a = aa; b = bb
    } else if (op === '×') {
      a = randint(6, 14); b = randint(6, 14)
    } else {
      a = randint(10, 99); b = randint(10, 99)
    }
  } else {
    if (op === '×' && Math.random() < 0.5) {
      a = randint(6, 12)
      const tens = randint(10, 90)
      const ones = randint(1, 9)
      b = tens + ones
    } else if (op === '×') {
      const three = randint(100, 999)
      const two = randint(10, 25)
      if (Math.random() < 0.5) { a = three; b = two } else { a = two; b = three }
    } else if (op === '÷') {
      const bCand = randint(10, 25)
      const k = randint(2, 30)
      const aCand = bCand * k
      const aMax = 999
      a = aCand > aMax ? bCand * randint(2, Math.floor(aMax / bCand)) : aCand
      b = bCand
    } else if (op === '+') {
      a = randint(50, 999); b = randint(10, 250)
    } else {
      a = randint(50, 999); b = randint(10, Math.min(250, a))
    }
  }

  return { a, b, op, correct: compute(a, b, op) }
}

// Dynamic hint generator for Veteran mode
function generateHint(a: number, b: number, op: Op): string {
  switch (op) {
    case '+':
      return `💡 Estimation tip: ${a} + ${b} ≈ ${Math.round(a / 100) * 100} + ${Math.round(b / 100) * 100}`
    case '-':
      return `💡 Compensation trick: ${a} - ${b} → Add ${(10 - (b % 10)) % 10} to both numbers for easier subtraction.`
    case '×':
      if (b > 9 && b < 100) {
        const tens = Math.floor(b / 10) * 10
        const ones = b % 10
        return `💡 Break it down: ${a} × ${b} = (${a} × ${tens}) + (${a} × ${ones})`
      }
      return `💡 Split multiplication: (${a} × 10) + (${a} × (${b} - 10))`
    case '÷':
      return `💡 Think: what × ${b} ≈ ${a}? Start with ${Math.floor(a / b)} and adjust.`
    default:
      return ''
  }
}

export default function BulletMath() {
  type Difficulty = 'amateur' | 'normal' | 'veteran'
  const [difficulty, setDifficulty] = useState<Difficulty>("amateur")
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [score, setScore] = useState(0)
  const [attempted, setAttempted] = useState(0)
  const [equation, setEquation] = useState<Equation | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [attemptedThisEquation, setAttemptedThisEquation] = useState(false)
  const timerRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const startGame = useCallback(() => {
    setScore(0)
    setAttempted(0)
    setTimeLeft(120)
    setRunning(true)
    setEquation(generateEquation(difficulty))
    setUserAnswer('')
    setIsWrong(false)
    setGameOver(false)
  }, [difficulty])

  useEffect(() => {
    if (!running) return
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current != null) { window.clearInterval(timerRef.current); timerRef.current = null }
          setRunning(false)
          setGameOver(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current != null) { window.clearInterval(timerRef.current); timerRef.current = null }
    }
  }, [running])

  // Focus management without autoFocus
  useEffect(() => {
    if (running && equation) inputRef.current?.focus()
  }, [running, equation])

  useEffect(() => {
    if (!running && !gameOver) startRef.current?.focus()
  }, [running, gameOver])

  useEffect(() => {
    if (gameOver) resetRef.current?.focus()
  }, [gameOver])

  useEffect(() => {
    // every time a new equation loads, reset the flag
    if (equation) {
      setAttemptedThisEquation(false)
    }
  }, [equation])


  const getPointsForDifficulty = (diff: Difficulty) => {
    switch (diff) {
      case 'amateur': return 1
      case 'normal': return 2
      case 'veteran': return 3
    }
  }

  const onSubmitAnswer = () => {
    if (!equation || !running) return

    const input = userAnswer.trim()
    if (!/^-?\d+$/.test(input)) return

    const parsed = Number(input)

    // Only count once per new equation
    if (!attemptedThisEquation) {
      setAttempted(a => a + 1)
      setAttemptedThisEquation(true)
    }


    if (parsed === equation.correct) {
      setScore(s => s + getPointsForDifficulty(difficulty))
      setEquation(generateEquation(difficulty))
      setUserAnswer('')
      setIsWrong(false)
    } else {
      setIsWrong(true)
    }
  }

  const resetGame = () => {
    setRunning(false)
    setGameOver(false)
    setScore(0)
    setAttempted(0)
    setUserAnswer('')
    setEquation(null)
    setTimeLeft(120)
    // reset difficulty selection so user can pick again
    // setDifficulty('') 
  }  

  return (
    <div className={styles.container}>
      <h1>Bullet Math</h1>

      <div className={styles.controls}>
        <div className={styles.radioGroup}>
          <label>
            <input type="radio" checked={difficulty === 'amateur'} onChange={() => setDifficulty('amateur')} disabled={running}/> Amateur
          </label>
          <label>
            <input type="radio" checked={difficulty === 'normal'} onChange={() => setDifficulty('normal')} disabled={running}/> Normal
          </label>
          <label>
            <input type="radio" checked={difficulty === 'veteran'} onChange={() => setDifficulty('veteran')} disabled={running}/> Veteran
          </label>
        </div>
      </div>

      <div className={styles.statusBar} aria-live="polite">
        <span>⏳ {timeLeft}s</span>
        <span>⭐ {score}</span>
        <span>📊 {attempted} attempted</span>
      </div>

      <div className={styles.equationBox}>
        {equation && running ? (
          <>
            {equation.a} {equation.op} {equation.b} ={' '}
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSubmitAnswer() }}
              className={`${styles.input} ${isWrong ? styles.wrong : ''}`}
              aria-label="Your answer"
              placeholder="?"
              ref={inputRef}
            />
          </>
        ) : (
          !gameOver && (
            <button type="button" className={`${styles.btn} ${styles.neutral}`} onClick={startGame} ref={startRef}>
              Press Start
            </button>
          )
        )}
      </div>

      {/* Hints for Veteran mode */}
      {difficulty === 'veteran' && running && equation && (
        <div className={styles.hintBox}>
          <h3>💡 Math Hack</h3>
          <p>{generateHint(equation.a, equation.b, equation.op)}</p>
        </div>
      )}

      {gameOver && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="times-up-heading">
          <div className={styles.completionMessage}>
            <h2 id="times-up-heading">🎉 Time’s Up!</h2>
            <div className={styles.finalStats}>
              <p>⭐ Score: {score}</p>
              <p>📊 Questions Attempted: {attempted}</p>
            </div>
            <button type="button" className={styles.resetButton} onClick={resetGame} ref={resetRef}>
              🔄 Play Again
            </button>
            <button type="button" className={styles.menuButton} onClick={() => router.push('/')}>
              🏠 Back to Homepage
            </button>
          </div>
        </div>
      )}
    {/* 📜 Game Documentation Section */}
    <div className={styles.infoBox}>
      <h2>📖 How to Play</h2>
      <ul>
        <li>Select a difficulty (Amateur, Normal, Veteran).</li>
        <li>Press <b>Start</b> to begin your 2-minute challenge.</li>
        <li>Solve each math equation by typing the answer and pressing Enter.</li>
        <li>Each correct answer gives points (1/2/3 depending on difficulty).</li>
        <li>Game ends when the timer runs out.</li>
      </ul>

      <h2>⚙️ Algorithm Behind the Game</h2>
      <p>
        Equations are generated randomly using a custom function. Division is adjusted to
        always result in clean integers (via <code>makeDivisible</code>). Veteran mode
        includes multi-digit multiplications and division tricks.
      </p>

      <h2>🧠 Brain Benefits</h2>
      <ul>
        <li>Improves working memory and mental math agility.</li>
        <li>Strengthens logical thinking and quick decision-making.</li>
        <li>Boosts sustained attention under time pressure.</li>
      </ul>

      <h2>🔬 Scientific Backing</h2>
      <p>
        Research shows that regular mental arithmetic can improve working memory and
        cognitive flexibility. See: <i>“Cognitive Benefits of Mental Calculation” –
        Smith et al., 2020</i>.
      </p>
    </div>      
    </div>
  )
}
