import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump! The five boxing wizards jump quickly.",
  "Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz.",
];

function TypingTest() {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [testDuration, setTestDuration] = useState(15);
  const [isTestActive, setIsTestActive] = useState(false);
  const [results, setResults] = useState(null);
  const [typingTimes, setTypingTimes] = useState([]);
  const [lastKeyTime, setLastKeyTime] = useState(null);

  const startTest = useCallback(() => {
    setText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]);
    setUserInput('');
    setTimeLeft(testDuration);
    setIsTestActive(true);
    setTypingTimes([]);
    setLastKeyTime(Date.now());
    setResults(null);
  }, [testDuration]);

  useEffect(() => {
    if (timeLeft > 0 && isTestActive) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isTestActive) {
      endTest();
    }
  }, [timeLeft, isTestActive]);

  const calculateResults = () => {
    const words = userInput.trim().split(' ').length;
    const characters = userInput.length;
    const wpm = Math.round((words / testDuration) * 60);
    
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / characters) * 100);

    return { wpm, accuracy, characters, correctChars };
  };

  const endTest = async () => {
    setIsTestActive(false);
    const results = calculateResults();
    setResults(results);

    try {
      await axios.post('http://localhost:5000/api/sessions', {
        wpm: results.wpm,
        accuracy: results.accuracy,
        totalErrors: results.characters - results.correctChars,
        typingDurations: typingTimes,
        duration: testDuration,
        text
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (!isTestActive) return;

    const currentTime = Date.now();
    if (lastKeyTime) {
      setTypingTimes(prev => [...prev, currentTime - lastKeyTime]);
    }
    setLastKeyTime(currentTime);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Typing Test</h1>
        
        <div className="space-x-4 mb-6">
          <button 
            className={`px-4 py-2 rounded ${testDuration === 15 ? 'bg-primary text-white' : 'bg-gray-200'}`}
            onClick={() => setTestDuration(15)}
            disabled={isTestActive}
          >
            15s
          </button>
          <button 
            className={`px-4 py-2 rounded ${testDuration === 30 ? 'bg-primary text-white' : 'bg-gray-200'}`}
            onClick={() => setTestDuration(30)}
            disabled={isTestActive}
          >
            30s
          </button>
        </div>

        {!isTestActive && !results && (
          <button 
            className="btn-primary"
            onClick={startTest}
          >
            Start Test
          </button>
        )}

        {isTestActive && (
          <div className="text-2xl font-bold text-primary mb-4">
            Time Left: {timeLeft}s
          </div>
        )}
      </div>

      {text && (
        <div className="bg-gray-100 p-6 rounded-lg mb-6 text-lg">
          {text.split('').map((char, index) => (
            <span
              key={index}
              className={
                userInput[index] === undefined
                  ? ''
                  : userInput[index] === char
                  ? 'text-green-600'
                  : 'text-red-600 bg-red-100'
              }
            >
              {char}
            </span>
          ))}
        </div>
      )}

      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!isTestActive}
        className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none resize-none"
        placeholder={isTestActive ? "Start typing..." : "Click 'Start Test' to begin"}
      />

      {results && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-lg font-semibold">WPM</div>
              <div className="text-3xl text-primary">{results.wpm}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-lg font-semibold">Accuracy</div>
              <div className="text-3xl text-primary">{results.accuracy}%</div>
            </div>
          </div>
          <button 
            className="btn-primary mt-6"
            onClick={startTest}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default TypingTest;