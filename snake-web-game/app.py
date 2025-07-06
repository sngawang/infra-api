from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# File to store high scores
HIGH_SCORES_FILE = 'high_scores.json'

def load_high_scores():
    """Load high scores from file"""
    if os.path.exists(HIGH_SCORES_FILE):
        try:
            with open(HIGH_SCORES_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_high_scores(scores):
    """Save high scores to file"""
    try:
        with open(HIGH_SCORES_FILE, 'w') as f:
            json.dump(scores, f, indent=2)
    except IOError:
        print("Error saving high scores")

def get_top_score():
    """Get the highest score from all saved scores"""
    scores = load_high_scores()
    if scores:
        return max(score['score'] for score in scores)
    return 0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/high-score', methods=['GET'])
def get_high_score():
    """Get the current high score"""
    high_score = get_top_score()
    return jsonify({'highScore': high_score})

@app.route('/api/high-score', methods=['POST'])
def save_high_score():
    """Save a new high score"""
    data = request.json
    score = data.get('score')
    player_name = data.get('playerName', 'Anonymous')
    
    if not isinstance(score, int) or score < 0:
        return jsonify({'error': 'Invalid score'}), 400
    
    # Load existing scores
    scores = load_high_scores()
    
    # Add new score
    new_score = {
        'score': score,
        'playerName': player_name,
        'timestamp': datetime.now().isoformat()
    }
    scores.append(new_score)
    
    # Keep only top 10 scores
    scores.sort(key=lambda x: x['score'], reverse=True)
    scores = scores[:10]
    
    # Save updated scores
    save_high_scores(scores)
    
    return jsonify({
        'success': True,
        'highScore': scores[0]['score'],
        'isNewRecord': score == scores[0]['score']
    })

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top 10 high scores"""
    scores = load_high_scores()
    scores.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(scores[:10])

if __name__ == '__main__':
    app.run(debug=True)