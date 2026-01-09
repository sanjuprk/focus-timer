# Focus Timer - Agent Guidelines

This file provides context for AI coding assistants (Claude, Gemini, etc.) working on this project.

## Project Overview

A focus/pomodoro timer web application with session tracking, built with Flask + React (via CDN).

## Tech Stack

- **Backend**: Python 3.8+, Flask 3.0.0, Flask-SQLAlchemy 3.1.1, SQLite
- **Frontend**: React 18 via CDN with Babel in-browser transpilation
- **No build step** - just `python app.py`

## Project Structure

```
focus-timer/
├── app.py              # Flask server + API endpoints
├── models.py           # SQLAlchemy Session model
├── focus.pyw           # Windows launcher
├── run.sh / run.bat    # Cross-platform run scripts
├── requirements.txt    # Python dependencies
├── sessions.db         # SQLite database (auto-created)
├── wallpapers/         # Background images for timer view
├── static/
│   ├── style.css       # Anthropic-inspired CSS
│   └── app.jsx         # React SPA (single file)
└── templates/
    └── index.html      # HTML shell
```

## Key Files

| File | Purpose |
|------|---------|
| `app.py` | Flask routes, API endpoints, serves wallpapers |
| `static/app.jsx` | Complete React app (~700 lines) |
| `static/style.css` | All styling (~700 lines) |
| `models.py` | SQLAlchemy Session model |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Serve React SPA |
| GET | `/api/dates` | Dates with session stats |
| GET | `/api/sessions?date=YYYY-MM-DD` | Sessions for a date |
| POST | `/api/sessions` | Create session |
| POST | `/api/sessions/<id>/complete` | Complete session |
| DELETE | `/api/sessions/<id>` | Delete session |
| GET | `/api/wallpapers` | List available wallpapers |
| GET | `/wallpapers/<filename>` | Serve wallpaper image |
| POST | `/api/shutdown` | Stop server |

## Design System

Uses Anthropic-inspired aesthetic:
- **Colors**: Cream backgrounds (#FEF7ED), terracotta accents (#CC785C)
- **Fonts**: Newsreader (headings), Inter (UI)
- **Style**: Rounded corners, subtle shadows, warm palette

## Development

```bash
# Create and activate venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run (port 5001)
python app.py
```

## Key Features

- Timer with customizable duration (presets + increments)
- Session title displayed during timer
- Wallpaper cycling (🖼️ button, bottom-right during timer)
- Session completion with ratings, notes, learnings
- History view grouped by date
- Browser notifications + audio alarm
- Wallpaper preference persisted in localStorage

## Adding Wallpapers

Drop image files (PNG, JPG, JPEG, WebP, GIF) into the `wallpapers/` directory. They'll automatically appear in the wallpaper cycle on the timer page.

## Notes for Agents

- React components are in a single `app.jsx` file, not split
- CSS is vanilla (no Tailwind/preprocessors)
- Timer uses real clock time (`endTime - Date.now()`) for accuracy
- Wallpaper index persists via `localStorage.focus_wallpaper_index`
- Session state persists via `localStorage.focus_session`
