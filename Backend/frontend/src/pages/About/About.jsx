import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <h1>About Tea Leaf Disease Detection</h1>
      <div className="content">
        <section>
          <h2>Our Mission</h2>
          <p>
            Our goal is to help tea farmers quickly identify and respond to potential diseases affecting their crops 
            through advanced image recognition technology.
          </p>
        </section>
        
        <section>
          <h2>How It Works</h2>
          <ol className="steps">
            <li>Upload a clear photo of a tea leaf</li>
            <li>Our AI analyzes the image for signs of common tea plant diseases</li>
            <li>Receive instant results with disease identification and treatment recommendations</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default About;
