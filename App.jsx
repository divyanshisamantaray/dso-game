import React, { useState, useRef, useEffect } from 'react';
import { Activity, Zap, CheckCircle2, XCircle, RotateCcw, PlayCircle, Trophy, User, ArrowRight, GraduationCap, BrainCircuit, X, Timer, Sparkles, Heart, Volume2, VolumeX } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc, increment } from 'firebase/firestore';

// --- Firebase Setup ---
// ⚠️ IMPORTANT: PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
   apiKey: "AIzaSyC3CtiyOozEuEaed9YoXZS71ENfoqlCbW4",
  authDomain: "dso-game.firebaseapp.com",
  projectId: "dso-game",
  storageBucket: "dso-game.firebasestorage.app",
  messagingSenderId: "518459176048",
  appId: "1:518459176048:web:5e610541c686d41b1ef0b5"
};

// Initialize safely
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = 'default-app-id';

// --- Gemini API Setup ---
const apiKey = "AIzaSyBcXH5BElEWUBbhQGCL_obxD2Zc7SsVT8Q"; // ⚠️ PASTE YOUR GEMINI KEY HERE

// --- Assets & Constants ---
const IMAGE_PATH = '/dso.jpeg'; 
const MUSIC_PATH = '/game-music.mp3'; // Ensure this file is in 'public' folder

const GAME_DURATION = 120; 

const DEFAULT_ZONES = [
  {
    "id": "screen",
    "name": "LCD Display",
    "x": 13.73828125,
    "y": 18.15625,
    "w": 36.69921875,
    "h": 35.125,
    "color": "blue"
  },
  {
    "id": "power",
    "name": "Power Button",
    "x": 10.83203125,
    "y": 65.34375,
    "w": 8.14453125,
    "h": 8.125,
    "color": "red"
  },
  {
    "id": "softkeys",
    "name": "Menu Softkeys",
    "x": 13.25,
    "y": 55.625,
    "w": 38.75,
    "h": 6.59375,
    "color": "purple"
  },
  {
    "id": "ch1_input",
    "name": "CH1 Input",
    "x": 58.02734375,
    "y": 68.125,
    "w": 5,
    "h": 5.46875,
    "color": "yellow"
  },
  {
    "id": "ch2_input",
    "name": "CH2 Input",
    "x": 64.875,
    "y": 67.96875,
    "w": 5,
    "h": 5,
    "color": "cyan"
  },
  {
    "id": "horizontal",
    "name": "Horizontal Scale",
    "x": 77.765625,
    "y": 22.8125,
    "w": 7.8984375,
    "h": 11.375,
    "color": "green"
  },
  {
    "id": "vertical",
    "name": "Vertical Scale",
    "x": 57.34375,
    "y": 52.1875,
    "w": 13.953125,
    "h": 11.53125,
    "color": "orange"
  },
  {
    "id": "trigger",
    "name": "Trigger Level",
    "x": 85,
    "y": 35,
    "w": 5,
    "h": 7.9375,
    "color": "pink"
  }

];

// --- Pixel Art Components ---

const PixelCard = ({ children, className = "", color = "white" }) => {
  const bgColors = {
    white: "bg-white",
    blue: "bg-blue-100",
    red: "bg-rose-100",
    yellow: "bg-amber-100",
    green: "bg-emerald-100",
    purple: "bg-violet-100",
  };
  
  return (
    <div className={`relative border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] ${bgColors[color]} ${className}`}>
      {children}
    </div>
  );
};

const PixelButton = ({ onClick, children, className = "", variant = "primary", disabled = false }) => {
  const variants = {
    primary: "bg-blue-400 hover:bg-blue-300 text-white",
    success: "bg-emerald-400 hover:bg-emerald-300 text-white",
    danger: "bg-rose-400 hover:bg-rose-300 text-white",
    warning: "bg-amber-400 hover:bg-amber-300 text-slate-900",
    neutral: "bg-slate-200 hover:bg-white text-slate-900",
    purple: "bg-violet-400 text-white hover:bg-violet-300",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`
        px-4 py-3 font-bold text-xs uppercase tracking-widest
        border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
};

const PixelMascot = ({ mood }) => {
  const colors = {
    happy: "#4ade80", 
    thinking: "#60a5fa", 
    sad: "#fb7185", 
    neutral: "#fbbf24" 
  };

  return (
    <div className="w-16 h-16 relative animate-bounce-pixel">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="20" y="20" width="60" height="60" fill={colors[mood] || colors.neutral} stroke="#0f172a" strokeWidth="4" />
        <rect x="35" y="40" width="10" height="10" fill="#0f172a" />
        <rect x="55" y="40" width="10" height="10" fill="#0f172a" />
        {mood === 'happy' && <path d="M35 65 H65 V70 H35 Z" fill="#0f172a" />}
        {mood === 'sad' && <path d="M35 70 H65 V65 H35 Z" fill="#0f172a" />}
        {mood === 'thinking' && <rect x="45" y="65" width="10" height="5" fill="#0f172a" />}
        {mood === 'neutral' && <rect x="35" y="65" width="30" height="5" fill="#0f172a" />}
      </svg>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [prn, setPrn] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [imageSrc, setImageSrc] = useState(IMAGE_PATH);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [matches, setMatches] = useState({}); 
  const [wrongAttempts, setWrongAttempts] = useState({}); 
  const [draggedItem, setDraggedItem] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [timeUp, setTimeUp] = useState(false);
  
  const [explanation, setExplanation] = useState({ id: null, text: '', loading: false });
  const [quiz, setQuiz] = useState({ show: false, loading: false, data: null, selected: null, correct: false });
  const [gameLeaderboard, setGameLeaderboard] = useState([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('speed'); 
  
  const [mascotMood, setMascotMood] = useState('neutral');

  const containerRef = useRef(null);

  // Initialize Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; // Set volume to 40% so it's not too loud
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => { await signInAnonymously(auth); };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Sync Leaderboards
  useEffect(() => {
    if (!user || !db) return;
    const gameLeaderboardRef = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');
    const unsubGame = onSnapshot(gameLeaderboardRef, (snapshot) => {
      const scores = snapshot.docs.map(doc => doc.data());
      scores.sort((a, b) => a.timeTaken - b.timeTaken);
      setGameLeaderboard(scores);
    }, (e) => console.error("Game LB Error", e));
    
    const quizLeaderboardRef = collection(db, 'artifacts', appId, 'public', 'data', 'quiz_scores');
    const unsubQuiz = onSnapshot(quizLeaderboardRef, (snapshot) => {
      const scores = snapshot.docs.map(doc => doc.data());
      scores.sort((a, b) => b.score - a.score); 
      setQuizLeaderboard(scores);
    }, (e) => console.error("Quiz LB Error", e));
    
    return () => { unsubGame(); unsubQuiz(); };
  }, [user]);

  const saveGameScore = async (finalTimeTaken) => {
    if (!user || !prn || !db) return;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard'), {
        prn, timeTaken: finalTimeTaken, timestamp: Date.now()
        });
    } catch(e) { console.error("Save Score Error", e)}
  };

  const updateQuizScore = async () => {
    if (!user || !prn || !db) return;
    try {
        const userQuizRef = doc(db, 'artifacts', appId, 'public', 'data', 'quiz_scores', prn);
        await setDoc(userQuizRef, { prn, score: increment(1), lastUpdated: Date.now() }, { merge: true });
    } catch(e) { console.error("Update Quiz Error", e)}
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (prn.trim().length > 0) {
      setIsLoggedIn(true);
      // Try to play music on login (user interaction)
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play failed (browser blocked):", e));
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (!isMuted) audioRef.current.pause();
      else audioRef.current.play().catch(e => console.log(e));
    }
  };

  useEffect(() => {
    let interval;
    if (!completed && !timeUp && timeLeft > 0 && isLoggedIn) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { setTimeUp(true); setMascotMood('sad'); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [completed, timeUp, timeLeft, isLoggedIn]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchExplanation = async (componentName, componentId) => {
    if(!apiKey) return alert("API Key Missing!");
    if (explanation.loading) return;
    setExplanation({ id: componentId, text: '', loading: true });
    setMascotMood('thinking');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Explain the "${componentName}" on a DSO simply in <20 words.` }] }] })
        });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error generating text.";
      setExplanation({ id: componentId, text, loading: false });
      setMascotMood('happy');
    } catch (error) { 
      setExplanation({ id: componentId, text: "AI Error.", loading: false });
      setMascotMood('sad');
    }
  };

  const generateQuiz = async () => {
    if(!apiKey) return alert("API Key Missing!");
    setQuiz({ show: true, loading: true, data: null, selected: null, correct: false });
    setMascotMood('thinking');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Generate one multiple-choice question about using a Digital Storage Oscilloscope. Return ONLY a valid JSON object: { "question": "string", "options": ["string", "string", "string", "string"], "correctIndex": number }. Do NOT use markdown.` }] }], generationConfig: { responseMimeType: "application/json" } })
        });
      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const quizData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText);
      setQuiz({ show: true, loading: false, data: quizData, selected: null, correct: false });
      setMascotMood('neutral');
    } catch (error) { 
        console.error(error);
        setQuiz({ ...quiz, show: false, loading: false });
        alert("Quiz error. Check console.");
        setMascotMood('sad');
    }
  };

  const handleQuizAnswer = (index) => {
    if (quiz.selected !== null) return;
    const isCorrect = index === quiz.data.correctIndex;
    setQuiz(prev => ({ ...prev, selected: index, correct: isCorrect }));
    setMascotMood(isCorrect ? 'happy' : 'sad');
    if (isCorrect) updateQuizScore();
  };

  const handleDragStart = (e, zone) => {
    if (timeUp) return;
    setDraggedItem(zone);
    e.dataTransfer.setData('text/plain', zone.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, targetZoneId) => {
    e.preventDefault();
    if (timeUp) return;
    const droppedId = e.dataTransfer.getData('text/plain');
    if (droppedId === targetZoneId) {
      const newMatches = { ...matches, [droppedId]: true };
      setMatches(newMatches);
      setMascotMood('happy');
      setTimeout(() => setMascotMood('neutral'), 1500);
      
      if (Object.keys(newMatches).length === zones.length) {
        setCompleted(true);
        saveGameScore(GAME_DURATION - timeLeft);
        setLeaderboardTab('speed');
        setShowLeaderboard(true);
      }
    } else {
      setMascotMood('sad');
      setWrongAttempts(prev => ({...prev, [targetZoneId]: true}));
      setTimeout(() => { 
        setWrongAttempts(prev => { const next = {...prev}; delete next[targetZoneId]; return next; }); 
        setMascotMood('neutral');
      }, 1000);
    }
    setDraggedItem(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); if (!timeUp) e.dataTransfer.dropEffect = 'move'; };

  const resetGame = () => {
    setMatches({}); setCompleted(false); setTimeUp(false); setTimeLeft(GAME_DURATION); 
    setWrongAttempts({}); setExplanation({ id: null, text: '', loading: false }); 
    setShowLeaderboard(false); setMascotMood('neutral');
  };

  const unmatchedZones = zones.filter(z => !matches[z.id]);

  const PixelStyles = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      body { font-family: 'Press Start 2P', cursive; }
      .custom-scrollbar::-webkit-scrollbar { width: 8px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-left: 2px solid #334155; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border: 2px solid #0f172a; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ffffff; }
      @keyframes bounce-pixel { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      .animate-bounce-pixel { animation: bounce-pixel 2s infinite steps(2); }
    `}</style>
  );

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-amber-50 flex items-center justify-center text-slate-900 overflow-hidden">
        <PixelStyles />
        {/* Audio Element loaded but paused */}
        <audio ref={audioRef} src={MUSIC_PATH} loop />
        
        <PixelCard className="w-full max-w-md p-8 text-center bg-white m-4">
          <div className="flex justify-center mb-6">
            <div className="bg-rose-400 p-4 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl leading-relaxed mb-4 text-blue-600">DSO MASTER</h1>
          <p className="text-[10px] mb-8 uppercase tracking-widest">Pixel Edition v3.0</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left">
              <label className="block text-[10px] mb-2">ENTER STUDENT ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  placeholder="125B1E220"
                  className="w-full bg-slate-100 border-4 border-slate-900 py-3 pl-12 pr-4 text-xs focus:bg-white focus:border-blue-500 outline-none placeholder:text-slate-300"
                  autoFocus
                />
              </div>
            </div>
            <PixelButton variant="primary" className="w-full" disabled={!prn.trim()}>
              START GAME <ArrowRight size={16} />
            </PixelButton>
          </form>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden">
      <PixelStyles />
      {/* Keep Audio element mounted */}
      <audio ref={audioRef} src={MUSIC_PATH} loop />
      
      <header className="bg-white border-b-4 border-slate-900 p-4 sticky top-0 z-50 w-full">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <div className="bg-rose-400 p-2 border-4 border-slate-900">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg text-blue-600 leading-none mb-1">DSO MASTER</h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-2"><User size={10} /> {prn}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
             {/* Mute Toggle */}
             <button onClick={toggleMute} className="p-2 bg-slate-200 border-4 border-slate-900 hover:bg-white active:translate-y-1 transition-all">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
             </button>

             <div className={`flex items-center gap-2 px-3 py-2 border-4 border-slate-900 ${timeLeft < 10 ? 'bg-rose-200 text-rose-600 animate-pulse' : 'bg-slate-200'}`}>
                <Timer size={16} />
                <span className="text-xs">{formatTime(timeLeft)}</span>
             </div>
            
            <div className="h-8 w-1 bg-slate-300 mx-1 hidden md:block" />
            
            <div className="flex bg-slate-200 p-1 border-4 border-slate-900">
              <div className="px-3 py-1 text-[10px] font-bold uppercase bg-blue-500 text-white">Playing</div>
            </div>

            <div className="h-8 w-1 bg-slate-300 mx-1 hidden md:block" />

            <PixelButton variant="warning" onClick={() => setShowLeaderboard(true)}><Trophy size={14}/> RANK</PixelButton>
            <PixelButton variant="purple" onClick={generateQuiz}><BrainCircuit size={14}/> QUIZ</PixelButton>
            <button onClick={resetGame} className="p-2 bg-slate-200 border-4 border-slate-900 hover:bg-white active:translate-y-1 transition-all"><RotateCcw size={18} /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full p-4 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-100px)] relative">
        
        {showLeaderboard && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <PixelCard className="w-full max-w-lg flex flex-col max-h-[80vh] bg-white">
              <div className="bg-amber-100 p-4 border-b-4 border-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-3"><Trophy className="w-6 h-6 text-amber-600" /><h2 className="text-sm text-amber-900">LEADERBOARD</h2></div><button onClick={() => setShowLeaderboard(false)} className="hover:text-red-500"><X size={20} /></button>
              </div>
              <div className="flex border-b-4 border-slate-900">
                <button onClick={() => setLeaderboardTab('speed')} className={`flex-1 py-3 text-[10px] hover:bg-blue-50 ${leaderboardTab === 'speed' ? 'bg-blue-100 text-blue-800' : 'bg-white text-slate-400'}`}>SPEED RUN</button>
                <div className="w-1 bg-slate-900"></div>
                <button onClick={() => setLeaderboardTab('quiz')} className={`flex-1 py-3 text-[10px] hover:bg-violet-50 ${leaderboardTab === 'quiz' ? 'bg-violet-100 text-violet-800' : 'bg-white text-slate-400'}`}>QUIZ WHIZ</button>
              </div>
              <div className="overflow-y-auto p-4 custom-scrollbar flex-1 bg-slate-50">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-slate-400 border-b-4 border-slate-200"><th className="text-left pb-2 pl-2">#</th><th className="text-left pb-2">ID</th><th className="text-right pb-2 pr-2">SCORE</th></tr>
                  </thead>
                  <tbody>
                    {leaderboardTab === 'speed' ? 
                      gameLeaderboard.map((score, idx) => (
                        <tr key={idx} className={`border-b-2 border-slate-200 hover:bg-white ${score.prn === prn ? 'bg-blue-50' : ''}`}><td className="py-3 pl-2">{idx + 1}</td><td className="py-3">{score.prn}</td><td className="py-3 pr-2 text-right">{formatTime(score.timeTaken)}</td></tr>
                      )) :
                      quizLeaderboard.map((item, idx) => (
                        <tr key={idx} className={`border-b-2 border-slate-200 hover:bg-white ${item.prn === prn ? 'bg-violet-50' : ''}`}><td className="py-3 pl-2">{idx + 1}</td><td className="py-3">{item.prn}</td><td className="py-3 pr-2 text-right">{item.score} PTS</td></tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </PixelCard>
          </div>
        )}

        <div className="order-2 lg:order-1 flex flex-col h-full gap-4 overflow-hidden">
          <PixelCard className="p-4 flex items-center gap-4 bg-blue-50">
             <PixelMascot mood={mascotMood} />
             <div className="text-[10px] leading-tight text-blue-800">
               {mascotMood === 'happy' ? "GREAT JOB!" : mascotMood === 'thinking' ? "HMM..." : mascotMood === 'sad' ? "TRY AGAIN!" : "READY?"}
             </div>
          </PixelCard>

          <PixelCard className="flex-1 flex flex-col p-4 bg-white overflow-hidden">
            <div className="mb-4 pb-2 border-b-4 border-slate-100"><h2 className="text-xs text-slate-500 flex items-center gap-2"><Zap size={14} /> COMPONENTS</h2></div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {timeUp ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-rose-500"><XCircle size={32} className="mb-2" /><p className="text-xs">GAME OVER</p><PixelButton onClick={resetGame} variant="danger" className="mt-4">RETRY</PixelButton></div>
              ) : (
                  <>
                  {unmatchedZones.map((zone) => {
                    const isExplaining = explanation.id === zone.id;
                    return (
                        <div key={zone.id} draggable={!timeUp} onDragStart={(e) => handleDragStart(e, zone)} className={`group relative p-3 bg-slate-50 border-4 border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer active:translate-y-1 transition-all`}>
                            <div className="flex items-center justify-between"><span className="text-[10px] text-slate-700">{zone.name}</span><button onClick={(e) => { e.stopPropagation(); fetchExplanation(zone.name, zone.id); }} className="text-slate-300 hover:text-blue-500"><Sparkles size={12} /></button></div>
                            {isExplaining && (<div className="mt-2 text-[8px] bg-blue-100 p-2 border-2 border-blue-200 text-blue-900 leading-relaxed">{explanation.loading ? "LOADING..." : explanation.text}</div>)}
                        </div>
                    );
                  })}
                  {unmatchedZones.length === 0 && !completed && <div className="text-center py-10 text-[10px] text-slate-400">ALL MATCHED!</div>}
                  {completed && (<div className="p-4 bg-emerald-50 border-4 border-emerald-200 text-center"><CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" /><p className="text-xs text-emerald-800 mb-2">SUCCESS!</p><p className="text-[10px] text-emerald-600 mb-4">TIME: {formatTime(GAME_DURATION - timeLeft)}</p><PixelButton onClick={resetGame} variant="success">PLAY AGAIN</PixelButton></div>)}
                  </>
              )}
            </div>
          </PixelCard>
        </div>

        <div className="order-1 lg:order-2 flex-1 h-full">
          <PixelCard className="h-full flex flex-col bg-slate-800 p-1">
            <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-slate-700 flex items-center justify-center p-4 overflow-hidden">
              <div ref={containerRef} className="relative w-full max-w-5xl aspect-[16/10] bg-slate-800 border-4 border-slate-900 shadow-2xl">
                <img src={imageSrc} alt="DSO" className="w-full h-full object-contain pointer-events-none select-none opacity-90" />
                {zones.map((zone) => {
                  const isMatched = matches[zone.id]; const isWrong = wrongAttempts[zone.id];
                  let borderClass = isMatched ? 'border-4 border-emerald-400 bg-emerald-400/20' : isWrong ? 'border-4 border-rose-500 bg-rose-500/20' : 'border-4 border-transparent hover:border-white/50 hover:bg-white/10';
                  return (
                    <div key={zone.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, zone.id)} style={{ position: 'absolute', left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }} className={`flex items-center justify-center transition-all ${borderClass}`}>
                      {isMatched && (<div className="bg-emerald-400 text-slate-900 px-2 py-1 text-[8px] font-bold border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce-pixel">{zone.name}</div>)}
                      {isWrong && <XCircle className="text-rose-500 w-8 h-8 drop-shadow-md animate-bounce" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-8 bg-slate-900 flex items-center justify-between px-4 text-[8px] text-slate-500 uppercase"><span>SYSTEM: ONLINE</span><span>MODE: TRAINING</span></div>
          </PixelCard>
        </div>

        {quiz.show && (
        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <PixelCard className="w-full max-w-lg bg-white p-0 overflow-hidden">
            <div className="bg-violet-100 p-4 border-b-4 border-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-2 text-violet-900"><BrainCircuit size={20} /> AI QUIZ</div>
              {!quiz.loading && <button onClick={() => setQuiz({...quiz, show: false})}><X size={20}/></button>}
            </div>
            <div className="p-6">
              {quiz.loading ? (
                <div className="text-center py-8"><div className="w-12 h-12 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"/><p className="text-xs animate-pulse">GENERATING QUESTION...</p></div>
              ) : quiz.data ? (
                <div className="space-y-6">
                  <p className="text-xs leading-loose font-bold">{quiz.data.question}</p>
                  <div className="grid gap-3">{quiz.data.options.map((opt, i) => { let btnStyle = "bg-white hover:bg-slate-50"; if (quiz.selected !== null) { if (i === quiz.data.correctIndex) btnStyle = "bg-emerald-200 border-emerald-600"; else if (i === quiz.selected) btnStyle = "bg-rose-200 border-rose-600"; else btnStyle = "opacity-50"; } return (<button key={i} onClick={() => handleQuizAnswer(i)} disabled={quiz.selected !== null} className={`w-full text-left p-3 border-4 border-slate-200 text-[10px] hover:border-slate-400 transition-all ${btnStyle}`}><span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span> {opt}</button>); })}</div>
                  {quiz.selected !== null && (<div className="text-center mt-4"><p className="text-xs mb-2">{quiz.correct ? "CORRECT!" : "WRONG!"}</p><PixelButton onClick={generateQuiz}>NEXT QUESTION</PixelButton></div>)}
                </div>
              ) : null}
            </div>
          </PixelCard>
        </div>
        )}
      </main>
    </div>
  );
}