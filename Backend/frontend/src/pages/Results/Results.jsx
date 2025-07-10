import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Results.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    // Check if we have result data from the location state
    if (location.state?.result) {
      setResult(location.state.result);
      // Use the image preview from the location state or a default message
      setImagePreview(location.state.imagePreview || '');
      setLoading(false);
    } else {
      // If no result data, redirect back to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleNewUpload = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Analyzing your tea leaf image...</p>
      </div>
    );
  }

  // Process the result from the backend
  const processResult = (resultData) => {
    if (!resultData) return { primaryDisease: null, otherDiseases: [] };

    // Assuming the backend returns a predictions array with name and confidence
    const predictions = resultData.predictions || [];
    
    // Sort predictions by confidence in descending order
    const sortedPredictions = [...predictions].sort((a, b) => b.confidence - a.confidence);
    
    // Get the primary disease (highest confidence)
    const primaryDisease = sortedPredictions[0] || { 
      name: 'Unknown', 
      confidence: 0, 
      description: 'Unable to determine the condition of the leaf.' 
    };
    
    // Get other diseases (if any)
    const otherDiseases = sortedPredictions.slice(1);
    
    return { primaryDisease, otherDiseases };
  };

  const { primaryDisease, otherDiseases } = processResult(result);
  
  // Default description based on the disease name if not provided by the backend
  const getDiseaseDescription = (disease) => {
    if (disease.description) return disease.description;
    
    const descriptions = {
      'healthy': 'Your tea leaf appears to be healthy with no signs of disease.',
      'red_leaf_spot': 'Red leaf spot is a fungal disease that causes small red or brown spots on the leaves.',
      'brown_blight': 'Brown blight causes irregular brown patches on the leaves and can affect plant health.',
      'algal_leaf_spot': 'Algal leaf spot appears as small, raised spots with a velvety texture.',
      'anthracnose': 'Anthracnose causes dark, sunken lesions on leaves and stems.'
    };
    
    return descriptions[disease.name.toLowerCase()] || `This appears to be a case of ${disease.name}.`;
  };

  return (
    <div className="results-container">
      <h1>Analysis Results</h1>
      
      <div className="results-content">
        <div className="image-section">
          <div className="image-container">
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Uploaded tea leaf" 
                className="result-image"
              />
            )}
            <div className="confidence-badge">
              {(primaryDisease.confidence * 100).toFixed(2)}% Confidence
            </div>
          </div>
        </div>
        
        <div className="results-details">
          <div className="primary-result">
            <h2>Diagnosis: {primaryDisease.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
            <p className="disease-description">{getDiseaseDescription(primaryDisease)}</p>
            
            <div className="confidence-meter">
              <div 
                className="confidence-level" 
                style={{ width: `${(primaryDisease.confidence * 100).toFixed(2)}%` }}
              >
                {/* <span className="confidence-percentage">
                  {(primaryDisease.confidence * 100).toFixed(2)}%
                </span> */}
              </div>
            </div>
            <div className="confidence-text">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          
          <div className="recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li>Monitor the plant for any changes in the coming days</li>
              <li>Ensure proper watering and drainage</li>
              <li>Maintain good air circulation around the plants</li>
              <li>Consider applying organic fungicide as a preventive measure</li>
            </ul>
          </div>
          
          {otherDiseases.length > 0 && (
            <div className="other-possibilities">
              <h3>Other Possibilities</h3>
              <div className="disease-list">
                {otherDiseases.map((disease, index) => (
                  <div key={index} className="disease-item">
                    <div className="disease-header">
                      <span className="disease-name">
                        {disease.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                      <span className="disease-confidence">
                        {typeof disease.confidence === 'number' 
                          ? `${(disease.confidence * 100).toFixed(2)}%` 
                          : disease.confidence}
                      </span>
                    </div>
                    <div className="disease-progress">
                      <div 
                        className="disease-progress-bar" 
                        style={{ width: `${disease.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            className="new-upload-btn"
            onClick={handleNewUpload}
          >
            <i className="fas fa-upload"></i> Analyze Another Image
          </button>
        </div>
      </div>
      
      <div className="additional-info">
        <div className="info-card">
          <i className="fas fa-info-circle"></i>
          <h3>About {primaryDisease.name}</h3>
          <p>
            {primaryDisease.name} is a common condition that affects tea plants. 
            It's important to monitor your plants regularly and take preventive measures 
            to ensure healthy growth and maximum yield.
          </p>
        </div>
        
        <div className="info-card">
          <i className="fas fa-calendar-alt"></i>
          <h3>Next Steps</h3>
          <ul>
            <li>Recheck the plant in 3-5 days</li>
            <li>Take photos to monitor progression</li>
            <li>Consult with an agricultural expert if condition worsens</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Results;
