# Focus Timer App - One-Shot Generation Prompt

Use this prompt to generate the complete Focus Timer web application from scratch on any machine.

---

## Prompt for AI Assistant

Create a **Focus Timer web application** with the following specifications:

### Overview
A beautiful, minimal focus/pomodoro timer app built with **Flask (Python backend)** and **React (frontend via CDN)**. The design follows **Anthropic's website aesthetic**: warm cream backgrounds, terracotta/coral accents, elegant serif + sans-serif typography (Newsreader + Inter), generous whitespace, and subtle shadows.

### Tech Stack
- **Backend**: Flask 3.0.0 + Flask-SQLAlchemy 3.1.1 + SQLite
- **Frontend**: React 18 via CDN + Babel in-browser transpilation
- **Audio**: Native Audio API (no external dependencies)
- **Fonts**: Google Fonts (Inter for UI, Newsreader for headings)
- **No build step required** - just `python app.py`

---

## Project Structure

```
focus-timer/
├── app.py                 # Flask API server
├── models.py              # SQLAlchemy Session model
├── focus.pyw              # Double-click launcher (starts server + opens browser)
├── requirements.txt       # Python dependencies (Flask, Flask-SQLAlchemy)
├── sessions.db            # SQLite database (auto-created)
├── static/
│   ├── style.css          # Anthropic-style CSS (~1380 lines)
│   └── app.jsx            # React SPA (~950 lines)
└── templates/
   └── index.html         # HTML shell for React app
```

---

## Design System (Anthropic-inspired)

### Color Palette
```css
--cream: #FEF7ED;           /* Main background */
--cream-dark: #F4E9DB;      /* Secondary background */
--beige: #E8DCD0;           /* Borders, dividers */
--terracotta: #CC785C;      /* Primary accent */
--terracotta-dark: #B8664A; /* Hover states */
--coral: #E07B67;           /* Secondary accent */
--text-primary: #1A1A1A;
--text-secondary: #4A4A4A;
--text-muted: #7A7A7A;
```

### Typography
- **Headings**: Newsreader (serif), weights 400-600
- **Body/UI**: Inter (sans-serif), weights 300-700
- **Large display numbers** use Inter with light weight (300)

### Visual Style
- Rounded corners (12-28px radius)
- Subtle card shadows
- Warm cream backgrounds
- Terracotta accents for buttons and active states
- Color-coded ratings: red (1-3), yellow (4-6), green (7-10)

---

## Features & Pages

### 1. Timer Page (Default View)
- **Hero Section**: "Deep work begins with intention" headline
- **Decorative SVG illustration**: Abstract warm-toned focus rings
- **Session Form Card**:
 - Text input: "What are you focusing on?"
 - **Duration Selector** (like iOS timer style):
   - Large MM:SS display at top (e.g., "25:00")
   - Subtle divider line
   - Increment buttons: `+0:30`, `+1:00`, `+5:00` (add to current)
   - Preset buttons: `5m`, `25m`, `45m`, `60m` (set exact value)
 - "Begin Focus Session" button (terracotta)
- **Inspirational quote footer**: Bruce Lee quote

### 2. Active Timer View
- Large countdown display (84px font)
- Session title above
- Progress bar (terracotta gradient)
- "Finish Early" and "Cancel" buttons
- Motivational messages that change based on progress %

### 3. Completion Modal
- Appears when timer ends or "Finish Early" clicked
- Browser notification (if permitted)
- **Rating selector**: 1-10 buttons, color-coded
- **Notes textarea**: "What did you accomplish?"
- **Learnings textarea**: "Any insights to remember?"
- "Save & Complete" button

### 4. Sessions Page
- **Compact Header** (~30% of viewport):
 - "Your Focus Journey" title
 - Subtitle text
 - Total stats: "X total sessions • Yh Zm of focused work"
 - Small SVG illustration (stacked cards with checkmark)
- **Date Cards List** (only dates with completed sessions):
 - Large day number (serif font)
 - Weekday + Month/Year
 - "TODAY" badge if applicable
 - Session count + total time per date
 - Click to navigate to dedicated date page

### 5. Date Sessions Page (Dedicated View)
- Back button "← All Sessions"
- **Large date header**:
 - Giant day number (72px, terracotta)
 - Weekday (h1) + Month/Year
 - Stats: Sessions count, Focus Time, Avg Rating
- **Sessions list**: Each session shows:
 - Color-coded rating indicator bar (left edge)
 - Title, start time, duration, rating badge
 - Notes and learnings (if any)
 - Delete button (appears on hover)

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------||
| GET | `/` | Serve React SPA |
| GET | `/api/dates` | Get dates with session counts & total minutes (only completed) |
| GET | `/api/sessions?date=YYYY-MM-DD` | Get sessions for a date (or all if no date) |
| POST | `/api/sessions` | Create session `{title, duration}` |
| GET | `/api/sessions/<id>` | Get single session |
| POST | `/api/sessions/<id>/complete` | Complete with `{rating, notes, learnings}` |
| DELETE | `/api/sessions/<id>` | Delete session |
| POST | `/api/shutdown` | Stop the server gracefully |

### `/api/dates` Response Format
```json
[
 {"date": "2026-01-05", "session_count": 4, "total_minutes": 125},
 {"date": "2026-01-04", "session_count": 2, "total_minutes": 50}
]
```

---

## Data Model (Session)

```python
class Session(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   date = db.Column(db.Date, nullable=False)
   title = db.Column(db.String(200), nullable=False)
   duration_minutes = db.Column(db.Integer, nullable=False)
   start_time = db.Column(db.DateTime, nullable=False)
   end_time = db.Column(db.DateTime, nullable=True)  # Set on completion
   rating = db.Column(db.Integer, nullable=True)     # 1-10
   notes = db.Column(db.Text, nullable=True)
   learnings = db.Column(db.Text, nullable=True)
```

---

## Key Implementation Details

### React Components Structure
```
App
├── Navbar (Timer | Sessions tabs)
├── TimerView
│   ├── NewSessionForm
│   │   └── DurationSelector
│   ├── ActiveTimer
│   └── CompletionModal
└── SessionsView
   ├── DateCard (list of dates)
   └── DateSessionsPage (dedicated date view)
       └── SessionItem (list of sessions)
```

### Duration Selector Logic
- Presets (1, 5, 25, 45, 60) set exact value
- Increments (+0:30, +1:00, +5:00) add to current value
- Display format: MM:SS (e.g., "25:00" for 25 minutes)
- Max duration: 480 minutes (8 hours)

### Timer Behavior
- **CRITICAL**: Timer uses real clock time (`endTime - Date.now()`) not `remaining - 1` decrements
 - This ensures accurate time even when browser tab is backgrounded (browsers throttle setInterval)
- Calculates `endTime` once from `start_time + duration`, then recalculates remaining on every tick
- Survives page refresh during session (recalculates from DB)
- **Alarm sound**: Uses native Audio API (no external dependencies) for reliable playback
- **Tab title flashing**: Alternates between "⏰ TIME IS UP!" and session title
- Browser notification on completion (requests permission)
- Warns before leaving page with active timer

### Responsive Breakpoints
- 900px: Stack sessions header, reduce padding
- 600px: Hide brand text, smaller fonts, stack session details

---

## SVG Illustrations (Inline)

### FocusIllustration (Timer Page)
- 400x200 viewBox
- Concentric circles with terracotta gradient
- Floating decorative dots
- Flowing curved lines

### SessionsIllustration (Sessions Header)
- 120x120 viewBox
- Stacked card shapes
- Green checkmark circle

### TimerActiveIllustration (Animated)
- Pulsing concentric circles
- Uses `<animate>` for subtle breathing effect

---

## Quick Start Commands

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install Flask==3.0.0 Flask-SQLAlchemy==3.1.1

# Run the app
python app.py

# Open browser to http://127.0.0.1:5000
```

---

## Optional: PowerShell Quick Launch (Windows)

Add to PowerShell profile (`$PROFILE`):

```powershell
function focus {
   $appPath = "C:\path\to\focus-timer"  # Update this path
   $venvPython = "$appPath\.venv\Scripts\python.exe"
   Start-Process -FilePath $venvPython -ArgumentList "$appPath\app.py" -WorkingDirectory $appPath -WindowStyle Hidden
   Start-Sleep -Seconds 2
   Start-Process "msedge" "http://127.0.0.1:5000"
   Write-Host "🎯 Focus Timer started!" -ForegroundColor Cyan
}
```

Then just type `focus` from any terminal.

---

## Generate All Files

When implementing, create these 5 files with the complete code:

1. **requirements.txt** (2 lines)
2. **models.py** (~55 lines) - SQLAlchemy model with `to_dict()` method
3. **app.py** (~115 lines) - Flask routes and API
4. **templates/index.html** (~35 lines) - HTML shell with React/Babel CDN
5. **static/style.css** (~1280 lines) - Complete Anthropic-style CSS
6. **static/app.jsx** (~824 lines) - Complete React SPA

The app should work immediately after running `python app.py` with no additional setup.

---

## Summary

This is a **production-quality focus timer** with:
- ✅ Beautiful Anthropic-inspired warm design
- ✅ Intuitive duration selection (presets + increments)
- ✅ Session tracking with ratings, notes, learnings
- ✅ Dedicated date pages for session history
- ✅ Alarm sound via Native Audio
- ✅ Browser notifications + tab title flashing
- ✅ Shutdown button to stop server from UI
- ✅ Double-click launcher (focus.pyw)
- ✅ Responsive design
- ✅ Zero build step (React via CDN)
- ✅ SQLite persistence
- ✅ Clean, maintainable code structure
