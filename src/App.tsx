import { useState, useEffect, useRef } from 'react';
import IOSPicker from './components/IOSPicker';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // --- Current Time (Dynamic Timezone) ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    // 抓取 IP 位置的時區
    fetch('https://ipapi.co/timezone/')
      .then(res => res.text())
      .then(tz => {
        if (tz && tz.length > 2) setTimeZone(tz);
      })
      .catch(err => console.error('Timezone fetch failed:', err));

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: timeZone
    });
  };

  // --- Timer State ---
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    console.log(`Starting timer with: ${hours}h ${minutes}m ${seconds}s = ${totalSeconds}s`);
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
      setIsPaused(false);
      setIsFinished(false);
    } else {
      alert('請先設定時間');
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, timeLeft]);

  const formatTimeLeft = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Picker Options ---
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  const secondOptions = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="app-container">
      <div className="current-time-display">
        {formatCurrentTime(currentTime)}
      </div>

      <div className="timer-section">
        <AnimatePresence mode="wait">
          {!isRunning && !isFinished ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pickers-group"
            >
              <IOSPicker label="Hours" options={hourOptions} value={hours} onChange={setHours} />
              <IOSPicker label="Minutes" options={minuteOptions} value={minutes} onChange={setMinutes} />
              <IOSPicker label="Seconds" options={secondOptions} value={seconds} onChange={setSeconds} />
            </motion.div>
          ) : isFinished ? (
            <motion.div
              key="times-up"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="countdown-display"
              style={{ color: '#ffffff' }}
            >
              TIMES UP!
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="countdown-display"
            >
              {formatTimeLeft(timeLeft)}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="controls-group">
          {!isRunning && !isFinished ? (
            <button className="control-btn btn-start" onClick={startTimer}>
              Start
            </button>
          ) : isFinished ? (
            <button className="control-btn btn-reset" onClick={resetTimer}>
              Reset
            </button>
          ) : (
            <>
              {isPaused ? (
                <button className="control-btn btn-resume" onClick={resumeTimer}>
                  Resume
                </button>
              ) : (
                <button className="control-btn btn-pause" onClick={pauseTimer}>
                  Pause
                </button>
              )}
              <button className="control-btn btn-reset" onClick={resetTimer}>
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
