# app.py
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"     # keep TF quiet
os.environ["TF_XLA_FLAGS"] = "--tf_xla_auto_jit=0"  # disable XLA → avoids ImageProjectiveTransformV3 error

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image, UnidentifiedImageError
import io
import logging
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- CONFIG ----------
MODEL_PATH   = os.path.join(os.path.dirname(__file__), "best_tealeaf.keras")
IMG_SIZE     = (224, 224)        # must match training size
CLASS_NAMES  = [
    "Anthracnose",
    "algal leaf",
    "bird eye spot",
    "brown blight",
    "gray light",
    "healthy",
    "red leaf spot",
    "white spot",
]

# ---------- LOAD MODEL ----------
try:
    model = keras.models.load_model(MODEL_PATH, compile=False)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    raise
print("✓ Model loaded")

# ---------- FLASK ----------
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

@app.route("/", methods=["GET"])
def index():
    return """
    <h2>Tea-Leaf Disease Classifier</h2>
    <form action="/predict" method="post" enctype="multipart/form-data">
      <input type="file" name="image"><br><br>
      <input type="submit" value="Predict">
    </form>
    """

def preprocess_image(file) -> np.ndarray:
    """Read image bytes → resized float tensor (1, 224, 224, 3)."""
    img = Image.open(io.BytesIO(file)).convert("RGB").resize(IMG_SIZE)
    arr = np.array(img, dtype="float32")          # (224,224,3)
    arr = np.expand_dims(arr, 0)                  # (1,224,224,3)
    return arr                                    # model has Rescaling layer inside

@app.route("/predict", methods=["POST"])
def predict():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({"status": "preflight"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST")
        return response
        
    try:
        logger.info("Received prediction request")
        
        if "image" not in request.files:
            logger.error("No file part in request")
            return jsonify({
                "success": False,
                "error": "No file part in request",
                "received_files": list(request.files.keys())
            }), 400

        file = request.files["image"]
        logger.info(f"Processing file: {file.filename}")
        
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({
                "success": False,
                "error": "No selected file"
            }), 400
            
        try:
            # Read file content
            file_content = file.read()
            if not file_content:
                logger.error("Empty file content")
                return jsonify({
                    "success": False,
                    "error": "Empty file content"
                }), 400
                
            # Reset file pointer after reading
            file.seek(0)
            
            # Preprocess and make prediction
            img_array = preprocess_image(file_content)
            predictions = model.predict(img_array)
            predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
            confidence = float(np.max(predictions[0]))
            
            # Sort predictions by confidence
            sorted_indices = np.argsort(predictions[0])[::-1]
            
            # Prepare response
            response = {
                "success": True,
                "prediction": {
                    "class": predicted_class,
                    "confidence": confidence
                },
                "predictions": [
                    {
                        "name": CLASS_NAMES[i].lower().replace(' ', '_'),
                        "confidence": float(predictions[0][i]),
                        "class": CLASS_NAMES[i]
                    }
                    for i in sorted_indices
                    if predictions[0][i] > 0.01  # Only include predictions with >1% confidence
                ]
            }
            
            logger.info(f"Prediction successful: {predicted_class} ({confidence:.2f}%)")
            return jsonify(response)
            
        except UnidentifiedImageError as e:
            logger.error(f"Invalid image file: {str(e)}")
            return jsonify({
                "success": False,
                "error": "Invalid image file. Please upload a valid image."
            }), 400
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Error processing image: {str(e)}"
            }), 500
            
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

# ---------- MAIN ----------
if __name__ == "__main__":
    # Optional: run on all interfaces for Docker
    app.run(host="0.0.0.0", port=5000, debug=False)
