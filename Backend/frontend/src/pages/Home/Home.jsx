import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      setIsLoading(true);
      console.log('Sending request to backend...');
      
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Response from backend:', response.data);
      
      // Navigate to results page with the response data and the image preview
      navigate('/results', { 
        state: { 
          result: response.data,
          imagePreview: preview
        } 
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Error processing image. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check if the backend is running.';
      } else {
        // Something happened in setting up the request
        console.error('Error message:', error.message);
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home">
      <h1>Welcome to Tea Leaf Disease Detection</h1>
      <p>Upload an image of a tea leaf to detect potential diseases and get recommendations.</p>
      
      <form onSubmit={handleSubmit} className="upload-container">
        <div className="image-upload-section">
          <div className="preview-container">
            {preview ? (
              <img src={preview} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-prompt">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop an image here or click to select</p>
              </div>
            )}
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              required
            />
          </div>
          
          <div className="upload-controls">
            <button
              type="button"
              className="select-btn"
              onClick={() => document.getElementById('image-upload').click()}
            >
              {selectedImage ? 'Change Image' : 'Select Image'}
            </button>
            
            <button
              type="submit"
              className="upload-btn"
              disabled={!selectedImage || isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Analyzing...
                </>
              ) : (
                'Analyze Image'
              )}
            </button>
          </div>
        </div>
      </form>
      
      <div className="info-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">1</div>
            <h3>Upload Image</h3>
            <p>Take a clear photo of a tea leaf and upload it to our system.</p>
          </div>
          <div className="step">
            <div className="step-icon">2</div>
            <h3>AI Analysis</h3>
            <p>Our advanced AI analyzes the image for signs of diseases.</p>
          </div>
          <div className="step">
            <div className="step-icon">3</div>
            <h3>Get Results</h3>
            <p>Receive instant diagnosis and treatment recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
