# Focus Timer

A beautiful, minimal focus timer application built with **Flask** and **React**, featuring an Anthropic-inspired aesthetic.

![Focus Timer UI](assets/focus-timer-ui.png)
*Note: Add a screenshot of your app here if you like!*

## ✨ Features

- **Deep Work Timer**: Set custom durations or use quick presets (5m, 25m, 45m, 60m).
- **Minimalist Design**: A clean, distraction-free interface with pulsing animations and terracotta accents.
- **Interactive Notifications**: Click the "Time's Up" notification to instantly focus the window and silence the alarm.
- **Session Tracking**: Rate your focus quality, add notes, and record key learnings after each session.
- **History & Analytics**: View your "Focus Journey" with detailed stats and session history grouped by date.
- **Dynamic Inspirations**: Intelligent placeholders that spark creativity (e.g., "Debugging the universe...").
- **Local Persistence**: All data is securely stored locally in a SQLite database.

## 🛠️ Tech Stack

- **Backend**: Python, Flask, SQLAlchemy
- **Frontend**: React (served via CDN with Babel), standard CSS
- **Database**: SQLite

## 🚀 Getting Started

### Prerequisites

- Python 3.8+

### Quick Start

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sanjuprk/focus-timer.git
    cd focus-timer
    ```

2.  **Run the App**

    **macOS / Linux:**
    ```bash
    ./run.sh
    ```

    **Windows:**
    Double-click `run.bat` or run in terminal:
    ```cmd
    run.bat
    ```

    *(This script will automatically create a virtual environment, install dependencies, and launch the app)*

3.  **Open in Browser**
    The app should open automatically. If not, visit [http://127.0.0.1:5001](http://127.0.0.1:5001).

## 📝 Usage

1.  **Set an Intention**: Type what you are focusing on (e.g., "Reading System Design").
2.  **Choose Duration**: Select a preset or add time in increments.
3.  **Focus**: The timer will count down. If you finish early, click "Done Early".
4.  **Reflect**: When the timer ends, rate your session and jot down any insights.
5.  **Review**: Check the "Sessions" tab to see your progress over time.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
