
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const ARViewer = ({ modelId, onClose }) => {
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModel();
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [modelId]);

  const fetchModel = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/models/${modelId}`);
      setModel(response.data);
    } catch (err) {
      setError('Failed to load model');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  if (loading) {
    return (
      <div className="ar-viewer-loading">
        <div className="loading-spinner">Loading AR Viewer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ar-viewer-error">
        <p>{error}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="ar-viewer-container">
      <div className="ar-viewer-header">
        <h3>AR Preview: {model?.originalName}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="ar-viewer-content">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="ar-camera-feed"
        />
        
        <div className="ar-overlay">
          <div className="ar-crosshair">
            <div className="crosshair-center"></div>
            <div className="crosshair-lines"></div>
          </div>
          
          <div className="ar-model-placeholder">
            <div className="model-icon">📦</div>
            <p>Point at a flat surface</p>
          </div>
        </div>
        
        <div className="ar-controls">
          <button className="ar-control-btn">🔄 Reset Position</button>
          <button className="ar-control-btn">📏 Scale</button>
          <button className="ar-control-btn">🎨 Settings</button>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;
