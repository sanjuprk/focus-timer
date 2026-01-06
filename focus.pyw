import webbrowser
import subprocess
import time
import os
import sys

def main():
    # Start the Flask app
    if sys.platform == 'win32':
        python_exe = os.path.join('.venv', 'Scripts', 'python.exe')
    else:
        python_exe = os.path.join('.venv', 'bin', 'python')
        
    if not os.path.exists(python_exe):
        # Fallback to system python if venv not found (for dev/testing)
        python_exe = sys.executable

    app_process = subprocess.Popen([python_exe, 'app.py'])
    
    # Give it a moment to start
    time.sleep(2)
    
    # Open browser
    webbrowser.open('http://127.0.0.1:5001')
    
    try:
        app_process.wait()
    except KeyboardInterrupt:
        app_process.terminate()

if __name__ == '__main__':
    main()
