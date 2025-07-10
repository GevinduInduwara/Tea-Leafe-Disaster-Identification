from flask_cors import CORS

def init_cors(app):
    """Initialize CORS for the Flask app"""
    CORS(app, resources={
        r"/predict": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["POST", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": True
        }
    })
