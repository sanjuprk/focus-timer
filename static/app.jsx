const { useState, useEffect, useRef, useMemo } = React;

// --- Illustrations ---

const FocusIllustration = () => (
    <svg viewBox="0 0 400 200" className="hero-illustration">
        <defs>
            <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'var(--terracotta)', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: 'var(--coral)', stopOpacity: 0.1 }} />
            </linearGradient>
        </defs>
        <circle cx="200" cy="100" r="80" fill="url(#warmGrad)" />
        <circle cx="200" cy="100" r="60" fill="white" fillOpacity="0.3" />
        <circle cx="200" cy="100" r="40" stroke="var(--terracotta)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        <circle cx="280" cy="60" r="8" fill="var(--terracotta)" fillOpacity="0.6" />
        <circle cx="120" cy="140" r="12" fill="var(--coral)" fillOpacity="0.4" />
    </svg>
);

const EmptyStateIllustration = () => (
    <svg viewBox="0 0 120 120" width="120" height="120" style={{ opacity: 0.5 }}>
        <rect x="30" y="40" width="60" height="40" rx="4" fill="var(--beige)" />
        <rect x="40" y="30" width="20" height="40" rx="2" fill="var(--cream-dark)" />
    </svg>
);

// --- Components ---

const DurationSelector = ({ duration, setDuration }) => {
    const presets = [1, 5, 25, 45, 60];
    const increments = [0.5, 1, 5];

    const formatDuration = (min) => {
        const totalSeconds = Math.round(min * 60);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const addDuration = (amount) => {
        setDuration(prev => Math.min(480, prev + amount));
    };

    return (
        <div className="duration-selector">
            <div className="time-display">{formatDuration(duration)}</div>

            <div className="divider"></div>

            <div className="control-section">
                <div className="section-label">ADD TIME</div>
                <div className="add-time-grid">
                    {increments.map(inc => (
                        <button
                            key={`+${inc}`}
                            className="control-btn increment"
                            onClick={() => addDuration(inc)}
                        >
                            +{inc === 0.5 ? '0:30' : `${inc}:00`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="control-section">
                <div className="section-label">PRESETS</div>
                <div className="presets-grid">
                    {presets.map(p => (
                        <button
                            key={p}
                            className="control-btn preset"
                            onClick={() => setDuration(p)}
                        >
                            {p}m
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... CompletionModal ...
const CompletionModal = React.memo(({ onSave, onCancel }) => {
    // ...
});

// ... inside TimerView ...
const handleComplete = useCallback(async (data) => {
    if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
    }
    try {
        await fetch(`/api/sessions/${activeSessionId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        onSessionComplete();
    } catch (e) { console.error(e); }

    setShowModal(false);
    resetTimer();
    setTitle('');
}, [activeSessionId, onSessionComplete]);

const handleCancel = useCallback(() => handleComplete({}), [handleComplete]);

// ... render ...
{ showModal && <CompletionModal onSave={handleComplete} onCancel={handleCancel} /> }


const TimerActiveIllustration = () => (
    <svg viewBox="0 0 200 200" width="120" height="120" style={{ marginBottom: '2rem' }}>
        <circle cx="100" cy="100" r="40" fill="var(--terracotta)" />
        <circle cx="100" cy="100" r="60" stroke="var(--terracotta)" strokeWidth="2" fill="none" opacity="0.5">
            <animate attributeName="r" from="40" to="80" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="100" r="80" stroke="var(--terracotta)" strokeWidth="1" fill="none" opacity="0.3">
            <animate attributeName="r" from="40" to="100" dur="2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
        </circle>
    </svg>
);

const TimerView = ({ onSessionComplete }) => {
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(25); // minutes
    const [title, setTitle] = useState('');
    const [endTime, setEndTime] = useState(null);
    const [remaining, setRemaining] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [totalDuration, setTotalDuration] = useState(0);
    const [placeholder, setPlaceholder] = useState("Project X, Reading, Writing...");

    const alarmRef = useRef(null);

    useEffect(() => {
        // Initialize Audio with Fallback
        const defaultAlarm = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
        const customAlarm = '/static/audio/my-alarm-sound.mp3';

        const audio = new Audio(customAlarm);
        audio.volume = 0.5;
        audio.loop = true;

        audio.onerror = () => {
            console.log('Custom alarm not found, using default.');
            const fallback = new Audio(defaultAlarm);
            fallback.volume = 0.5;
            fallback.loop = true;
            alarmRef.current = fallback;
        };

        alarmRef.current = audio;



        // Check for active session in localStorage on mount
        const savedSession = JSON.parse(localStorage.getItem('focus_session'));
        if (savedSession) {
            setTitle(savedSession.title);
            setEndTime(savedSession.endTime);
            setActiveSessionId(savedSession.id);
            setTotalDuration(savedSession.totalDuration);
            setIsActive(true);
        }

        // Randomize placeholder
        const Placeholders = [
            "Conquering the world, one task at a time...",
            "Writing the next great American novel...",
            "Debugging the universe...",
            "Deep work on Project Alpha...",
            "Learning Quantum Physics...",
            "Building something amazing...",
            "Crushing the backlog...",
            "Designing the future..."
        ];
        setPlaceholder(Placeholders[Math.floor(Math.random() * Placeholders.length)]);
    }, []);

    useEffect(() => {
        let interval;
        if (isActive && endTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = endTime - now;

                if (diff <= 0) {
                    setRemaining(0);
                    clearInterval(interval);
                    handleTimerDone();
                } else {
                    setRemaining(diff);
                    document.title = formatTime(diff) + " - " + (title || "Focus");
                }
            }, 100);
        } else {
            document.title = "Focus Timer";
            setRemaining(null);
        }
        return () => clearInterval(interval);
    }, [isActive, endTime, title]);


    const formatTime = (ms) => {
        const totalSecs = Math.ceil(ms / 1000);
        const m = Math.floor(totalSecs / 60);
        const s = totalSecs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const startSession = async () => {
        if (!title.trim()) return;

        // Create session on server
        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    duration_minutes: duration
                })
            });
            const data = await res.json();

            const end = Date.now() + duration * 60 * 1000;
            const sessionData = {
                id: data.id,
                title,
                endTime: end,
                totalDuration: duration * 60 * 1000
            };

            localStorage.setItem('focus_session', JSON.stringify(sessionData));

            setActiveSessionId(data.id);
            setEndTime(end);
            setTotalDuration(duration * 60 * 1000);
            setIsActive(true);

            // Request notification permission
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (err) {
            console.error('Failed to start session:', err);
        }
    };

    const handleTimerDone = (playSound = true) => {
        if (playSound) {
            alarmRef.current?.play().catch(e => console.warn("Audio autoplay blocked", e));
        }
        if (Notification.permission === 'granted') {
            const notif = new Notification("Time is up!", { body: `Great work on "${title}"` });
            notif.onclick = () => {
                window.focus();
                notif.close();
                if (alarmRef.current) {
                    alarmRef.current.pause();
                    alarmRef.current.currentTime = 0;
                }
            };
        }
        document.title = "⏰ TIME IS UP!";
        setShowModal(true);
    };

    const finishEarly = () => {
        setIsActive(false);
        handleTimerDone(false);
    };

    const cancelSession = async () => {
        if (confirm('Stop timer? This session won\'t be saved.')) {
            try {
                await fetch(`/api/sessions/${activeSessionId}`, { method: 'DELETE' });
            } catch (e) { console.error(e); }

            resetTimer();
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setEndTime(null);
        setRemaining(null);
        setActiveSessionId(null);
        localStorage.removeItem('focus_session');
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
        document.title = "Focus Timer";
    };

    const handleComplete = async (data) => {
        if (alarmRef.current) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
        }
        try {
            await fetch(`/api/sessions/${activeSessionId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            onSessionComplete();
        } catch (e) { console.error(e); }

        setShowModal(false);
        resetTimer();
        setTitle('');
    };

    // calculate progress
    const progress = remaining && totalDuration ? ((totalDuration - remaining) / totalDuration) * 100 : 0;

    return (
        <div className="timer-view">
            {showModal && <CompletionModal onSave={handleComplete} onCancel={() => handleComplete({})} />}

            {isActive ? (
                <div className="active-timer">
                    <TimerActiveIllustration />

                    <div className="countdown" style={{ fontSize: '6rem', color: 'var(--terracotta)', fontWeight: '400' }}>
                        {formatTime(remaining || 0)}
                    </div>

                    <div className="progress-container" style={{ maxWidth: '400px', margin: '0 auto 2rem', height: '4px', background: 'var(--beige)' }}>
                        <div className="progress-bar" style={{ width: `${progress}%`, background: 'var(--terracotta)', borderRadius: '4px' }}></div>
                    </div>

                    <p style={{ marginBottom: '3rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {progress < 25 ? "Time to focus." :
                            progress < 50 ? "Keep going, you're doing great." :
                                progress < 80 ? "Stay in the flow." : "Great progress! Keep going strong."}
                    </p>

                    <div className="timer-controls">
                        <button
                            className="secondary-btn"
                            onClick={finishEarly}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', borderColor: 'transparent', background: 'transparent', color: 'var(--text-muted)' }}
                        >
                            Done Early
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="hero-section">
                        <FocusIllustration />
                        <h1 className="hero-title">Deep work begins<br />with intention.</h1>
                    </div>

                    <div className="session-card">
                        <div className="group">
                            <label className="input-label">What are you focusing on?</label>
                            <input
                                type="text"
                                className="task-input"
                                placeholder={placeholder}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <DurationSelector duration={duration} setDuration={setDuration} />

                        <button
                            className="start-btn"
                            onClick={startSession}
                            disabled={!title}
                            style={{ opacity: title ? 1 : 0.7 }}
                        >
                            Begin Focus Session
                        </button>
                    </div>

                    <p className="quote-footer">"The successful warrior is the average man, with laser-like focus." — Bruce Lee</p>
                </>
            )}
        </div>
    );
};

// --- Sessions View ---

const SessionsView = ({ onBack }) => {
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDates();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchSessions(selectedDate);
        }
    }, [selectedDate]);

    const fetchDates = async () => {
        const res = await fetch('/api/dates');
        const data = await res.json();
        setDates(data);
        setLoading(false);
    };

    const fetchSessions = async (dateStr) => {
        const res = await fetch(`/api/sessions?date=${dateStr}`);
        const data = await res.json();
        setSessions(data);
    };

    const deleteSession = async (e, id) => {
        e.stopPropagation();
        if (confirm('Delete this session?')) {
            await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
            if (selectedDate) fetchSessions(selectedDate);
            fetchDates();
        }
    };

    const formatDate = (dateStr) => {
        // Appending T00:00:00 forces local time parsing in most environments for YYYY-MM-DD
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const getDayNumber = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.getDate();
    };

    const formatTotalTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    if (selectedDate) {
        // Detail View
        const dateObj = dates.find(d => d.date === selectedDate);

        return (
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <button onClick={() => setSelectedDate(null)} className="secondary-btn mb-4">← All Sessions</button>

                <div className="date-header">
                    <div className="giant-day">{getDayNumber(selectedDate)}</div>
                    <div>
                        <h1 style={{ fontSize: '2rem' }}>{formatDate(selectedDate)}</h1>
                        <div className="text-secondary mt-4">
                            {dateObj?.session_count} Sessions • {formatTotalTime(dateObj?.total_minutes)} Focus Time
                        </div>
                    </div>
                </div>

                <div className="session-list">
                    {sessions.map(s => (
                        <div key={s.id} className={`session-item rated-${s.rating <= 3 ? 'low' : s.rating <= 6 ? 'med' : 'high'}`}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{s.title}</strong>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {s.duration_minutes}m
                                    </span>
                                </div>
                                {(s.notes || s.learnings) && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        {s.notes && <p>📝 {s.notes}</p>}
                                        {s.learnings && <p style={{ marginTop: '0.25rem' }}>💡 {s.learnings}</p>}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
                                {s.rating && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'var(--cream-dark)', fontWeight: 'bold'
                                    }}>
                                        {s.rating}
                                    </div>
                                )}
                                <button
                                    className="delete-btn-icon"
                                    onClick={(e) => deleteSession(e, s.id)}
                                    title="Delete Session"
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        opacity: 0.6,
                                        transition: 'opacity 0.2s',
                                        padding: '4px'
                                    }}
                                    onMouseOver={(e) => e.target.style.opacity = 1}
                                    onMouseOut={(e) => e.target.style.opacity = 0.6}
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // List View
    const totalSessions = dates.reduce((acc, d) => acc + d.session_count, 0);
    const totalMinutes = dates.reduce((acc, d) => acc + d.total_minutes, 0);

    return (
        <div style={{ width: '100%' }}>
            <div className="sessions-header">
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your Focus Journey</h1>
                <div className="journey-stats">
                    ✨ {totalSessions} total sessions • {formatTotalTime(totalMinutes)} of focused work
                </div>
            </div>

            {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
                <div className="dates-grid">
                    {dates.map(d => (
                        <div key={d.date} className="date-card" onClick={() => setSelectedDate(d.date)}>
                            <div className="date-large">{getDayNumber(d.date)}</div>
                            <div className="date-content">
                                {d.date === new Date().toISOString().split('T')[0] && <span className="today-badge">Today</span>}
                                <h3>{new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })} - {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <span>⏱ {d.session_count} sessions</span>
                                    <span>⌛️ {formatTotalTime(d.total_minutes)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {dates.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <EmptyStateIllustration />
                            <p style={{ marginTop: '1rem' }}>No sessions yet. Time to focus!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main App ---

const App = () => {
    const [view, setView] = useState('timer'); // timer | sessions

    const shutdown = async () => {
        if (confirm('Stop the server?')) {
            await fetch('/api/shutdown', { method: 'POST' });
            window.close();
        }
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="brand">
                    <span>⏳</span>
                    <span>Focus</span>
                </div>

                <div className="nav-links">
                    <button
                        className={`nav-link ${view === 'timer' ? 'active' : ''}`}
                        onClick={() => setView('timer')}
                    >
                        Timer
                    </button>
                    <button
                        className={`nav-link ${view === 'sessions' ? 'active' : ''}`}
                        onClick={() => setView('sessions')}
                    >
                        Sessions
                    </button>
                </div>

                <button className="shutdown-btn" onClick={shutdown} title="Stop Server">
                    ⏻
                </button>
            </nav>

            {view === 'timer' ? (
                <TimerView onSessionComplete={() => setView('sessions')} />
            ) : (
                <SessionsView onBack={() => { }} />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
