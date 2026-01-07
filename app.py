import os
import signal
import sys
from datetime import datetime, date
from flask import Flask, render_template, request, jsonify
from models import db, Session

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sessions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/dates', methods=['GET'])
def get_dates():
    # Helper to count stats per date
    sessions = Session.query.filter(Session.end_time.isnot(None)).all()
    stats = {}
    
    for s in sessions:
        d_str = s.date.isoformat()
        if d_str not in stats:
            stats[d_str] = {'date': d_str, 'session_count': 0, 'total_minutes': 0}
        stats[d_str]['session_count'] += 1
        stats[d_str]['total_minutes'] += s.duration_minutes

    # Convert to list and sort desc
    dates = sorted(stats.values(), key=lambda x: x['date'], reverse=True)
    return jsonify(dates)

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    date_str = request.args.get('date')
    query = Session.query
    if date_str:
        query = query.filter(Session.date == datetime.strptime(date_str, '%Y-%m-%d').date())
    
    # Sort by start_time desc
    sessions = query.order_by(Session.start_time.desc()).all()
    return jsonify([s.to_dict() for s in sessions])

@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.json
    now = datetime.now()
    new_session = Session(
        date=now.date(),
        title=data['title'],
        duration_minutes=data['duration_minutes'],
        start_time=now
    )
    db.session.add(new_session)
    db.session.commit()
    return jsonify(new_session.to_dict()), 201

@app.route('/api/sessions/<int:id>/complete', methods=['POST'])
def complete_session(id):
    session = Session.query.get_or_404(id)
    data = request.json
    now = datetime.now()
    
    # Calculate actual duration in minutes (round to nearest minute, min 1)
    actual_duration_seconds = (now - session.start_time).total_seconds()
    actual_duration_minutes = max(1, round(actual_duration_seconds / 60))
    
    session.end_time = now
    session.duration_minutes = actual_duration_minutes
    session.rating = data.get('rating')
    session.notes = data.get('notes')
    session.learnings = data.get('learnings')
    db.session.commit()
    return jsonify(session.to_dict())

@app.route('/api/sessions/<int:id>', methods=['DELETE'])
def delete_session(id):
    session = Session.query.get_or_404(id)
    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

@app.route('/api/shutdown', methods=['POST'])
def shutdown():
    os.kill(os.getpid(), signal.SIGINT)
    return 'Server shutting down...'

if __name__ == '__main__':
    app.run(debug=True, port=5001)
