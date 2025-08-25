
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import './App.css';

// function App() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [uploadedModel, setUploadedModel] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [generatedCode, setGeneratedCode] = useState('');
//   const [models, setModels] = useState([]);
//   const [previewActive, setPreviewActive] = useState(false);
//   const [stream, setStream] = useState(null);

//   useEffect(() => {
//     fetchModels();
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [stream]);

//   const fetchModels = async () => {
//     try {
//       const response = await axios.get('/api/models');
//       setModels(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch models');
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const validTypes = ['glb', 'gltf', 'obj', 'fbx'];
//       const fileExtension = file.name.split('.').pop().toLowerCase();
      
//       if (validTypes.includes(fileExtension)) {
//         setSelectedFile(file);
//         toast.success('File selected successfully!');
//       } else {
//         toast.error('Please select a valid 3D model file (.glb, .gltf, .obj, .fbx)');
//       }
//     }
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       toast.error('Please select a file first');
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append('arModel', selectedFile);

//     try {
//       const response = await axios.post('/api/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       setUploadedModel(response.data.model);
//       toast.success('Model uploaded successfully!');
//       fetchModels();
//       generateCode(response.data.model.modelId);
//     } catch (error) {
//       toast.error('Failed to upload model');
//       console.error('Upload error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateCode = async (modelId) => {
//     try {
//       const response = await axios.get(`/api/generate-code/${modelId}`);
//       setGeneratedCode(response.data.code);
//     } catch (error) {
//       toast.error('Failed to generate code');
//     }
//   };

//   const startARPreview = async () => {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({ 
//         video: { facingMode: 'environment' }
//       });
//       setStream(mediaStream);
//       setPreviewActive(true);
      
//       const video = document.getElementById('ar-preview-video');
//       if (video) {
//         video.srcObject = mediaStream;
//       }
      
//       toast.success('AR Preview started!');
//     } catch (error) {
//       toast.error('Camera access denied or not available');
//     }
//   };

//   const stopARPreview = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
//     }
//     setPreviewActive(false);
//     toast.success('AR Preview stopped');
//   };

//   const copyCode = () => {
//     navigator.clipboard.writeText(generatedCode);
//     toast.success('Code copied to clipboard!');
//   };

//   const downloadCode = () => {
//     const element = document.createElement('a');
//     const file = new Blob([generatedCode], { type: 'text/html' });
//     element.href = URL.createObjectURL(file);
//     element.download = `ar-model-${uploadedModel?.modelId}.html`;
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
//   };

//   return (
//     <div className="App">
//       <header className="app-header">
//         <h1>🚀 AR Studio - MERN Stack</h1>
//         <p>Upload, Preview & Deploy AR Models with ease</p>
//       </header>

//       <div className="main-container">
//         <div className="upload-section">
//           <h2>📁 Upload AR Model</h2>
//           <div className="upload-area">
//             <div className="upload-icon">📦</div>
//             <h3>Select your 3D model</h3>
//             <p>Supported formats: GLB, GLTF, OBJ, FBX</p>
//             <input
//               type="file"
//               accept=".glb,.gltf,.obj,.fbx"
//               onChange={handleFileSelect}
//               className="file-input"
//             />
//             {selectedFile && (
//               <div className="file-preview">
//                 <p><strong>Selected:</strong> {selectedFile.name}</p>
//                 <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
//               </div>
//             )}
//             <button 
//               className="upload-btn"
//               onClick={handleUpload}
//               disabled={!selectedFile || loading}
//             >
//               {loading ? 'Uploading...' : 'Upload Model'}
//             </button>
//           </div>
//         </div>

//         <div className="preview-section">
//           <h2>📱 AR Preview</h2>
//           <div className="ar-preview">
//             {previewActive ? (
//               <video
//                 id="ar-preview-video"
//                 autoPlay
//                 playsInline
//                 muted
//               />
//             ) : (
//               <div className="camera-placeholder">
//                 <div className="camera-icon">📷</div>
//                 <p>Camera preview will appear here</p>
//               </div>
//             )}
//             {previewActive && uploadedModel && (
//               <div className="ar-overlay">
//                 <div className="model-indicator">
//                   <div className="model-preview">🪑</div>
//                   <p>{uploadedModel.originalName}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//           <div className="preview-controls">
//             <button
//               className="preview-btn"
//               onClick={previewActive ? stopARPreview : startARPreview}
//               disabled={!uploadedModel}
//             >
//               {previewActive ? '⏹️ Stop Preview' : '🎥 Start AR Preview'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {generatedCode && (
//         <div className="code-section">
//           <h2>💾 Generated AR Code</h2>
//           <div className="code-container">
//             <pre className="code-display">{generatedCode}</pre>
//           </div>
//           <div className="code-actions">
//             <button className="copy-btn" onClick={copyCode}>
//               📋 Copy Code
//             </button>
//             <button className="download-btn" onClick={downloadCode}>
//               💾 Download HTML
//             </button>
//           </div>
          
//           {uploadedModel && (
//             <div className="model-info">
//               <h3>📊 Model Information</h3>
//               <div className="info-grid">
//                 <div>
//                   <strong>File:</strong> {uploadedModel.originalName}
//                 </div>
//                 <div>
//                   <strong>Size:</strong> {(uploadedModel.fileSize / 1024 / 1024).toFixed(2)} MB
//                 </div>
//                 <div>
//                   <strong>Model ID:</strong> {uploadedModel.modelId}
//                 </div>
//                 <div>
//                   <strong>Upload Date:</strong> {new Date(uploadedModel.uploadDate).toLocaleString()}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       <div className="models-gallery">
//         <h2>📚 Your AR Models</h2>
//         <div className="models-grid">
//           {models.map((model) => (
//             <div key={model._id} className="model-card">
//               <div className="model-icon">📦</div>
//               <h4>{model.originalName}</h4>
//               <p>{(model.fileSize / 1024 / 1024).toFixed(2)} MB</p>
//               <p>Downloads: {model.downloadCount}</p>
//               <button 
//                 className="generate-code-btn"
//                 onClick={() => generateCode(model.modelId)}
//               >
//                 Generate Code
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import '@google/model-viewer';


function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedModel, setUploadedModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [models, setModels] = useState([]); // Initialize as empty array
  const [previewActive, setPreviewActive] = useState(false);
  const [stream, setStream] = useState(null);

  // Cleanup function
  useEffect(() => {
    fetchModels();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models');
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setModels(response.data);
      } else {
        console.warn('API response is not an array:', response.data);
        setModels([]); // Set empty array if response is not array
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setModels([]); // Set empty array on error
      // Don't show error toast if backend is not running
      if (error.code !== 'ERR_NETWORK') {
        toast.error('Failed to fetch models');
      }
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['glb', 'gltf', 'obj', 'fbx'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (validTypes.includes(fileExtension)) {
        setSelectedFile(file);
        toast.success('File selected successfully!');
      } else {
        toast.error('Please select a valid 3D model file (.glb, .gltf, .obj, .fbx)');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('arModel', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.model) {
        setUploadedModel(response.data.model);
        toast.success('Model uploaded successfully!');
        fetchModels();
        generateCode(response.data.model.modelId);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Backend server is not running. Please start your server on port 5000.');
      } else {
        toast.error('Failed to upload model: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (modelId) => {
    if (!modelId) {
      toast.error('Invalid model ID');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/generate-code/${modelId}`);
      if (response.data && response.data.code) {
        setGeneratedCode(response.data.code);
      } else {
        throw new Error('No code received from server');
      }
    } catch (error) {
      console.error('Generate code error:', error);
      toast.error('Failed to generate code: ' + (error.response?.data?.error || error.message));
    }
  };

  const startARPreview = async () => {
    if (!uploadedModel) {
      toast.error('Please upload a model first');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setPreviewActive(true);
      
      // const video = document.getElementById('ar-preview-video');
      // if (video) {
      //   video.srcObject = mediaStream;
      // }
      const video = document.getElementById('ar-preview-video');
        if (video) {
          video.srcObject = mediaStream;
          video.play().catch(err => console.error("Video play failed:", err));
      }
      
      toast.success('AR Preview started!');
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Camera access denied or not available');
    }
  };

  const stopARPreview = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setPreviewActive(false);
    toast.success('AR Preview stopped');
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
        .then(() => toast.success('Code copied to clipboard!'))
        .catch(() => toast.error('Failed to copy code'));
    } else {
      toast.error('No code to copy');
    }
  };

  const downloadCode = () => {
    if (!generatedCode || !uploadedModel) {
      toast.error('No code to download');
      return;
    }
    
    try {
      const element = document.createElement('a');
      const file = new Blob([generatedCode], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = `ar-model-${uploadedModel.modelId}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Code downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download code');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="top-app-header">
          <h1> AR Studio </h1>
          <p>Upload, Preview & Deploy AR Models with ease</p>
        </div>
      </header>

      <div className="main-container">
        {/* Upload Section */}
        <div className="upload-section">
          <h2>🗃️ Upload AR Model</h2>
          <div className="upload-area">
            <div className="upload-icon">📦</div>
            <h3>Select your 3D model</h3>
            <p>Supported formats: GLB, GLTF, OBJ, FBX</p>
            <input
              type="file"
              accept=".glb,.gltf,.obj,.fbx"
              onChange={handleFileSelect}
              className="file-input"
            />
            {selectedFile && (
              <div className="file-preview">
                <p><strong>Selected:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
            <button 
              className="upload-btn"
              onClick={handleUpload}
              disabled={!selectedFile || loading}
            >
              {loading ? 'Uploading...' : 'Upload Model'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="preview-section">
          <h2>▶️ AR Preview</h2>
          <div className="ar-preview">
            {previewActive ? (
              <video
                id="ar-preview-video"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="camera-placeholder">
                <div className="camera-icon">📷</div>
                <p>Camera preview will appear here</p>
                {!uploadedModel && (
                  <p style={{fontSize: '0.9rem', marginTop: '10px', opacity: 0.7}}>
                    Upload a model first to enable preview
                  </p>
                )}
              </div>
            )}
            {/* {previewActive && uploadedModel && (
              <div className="ar-overlay">
                <div className="model-indicator">
                  <div className="model-preview">🪑</div>
                  <p>{uploadedModel.originalName}</p>
                </div>
              </div>
            )} */
            // previewActive && uploadedModel && (
            //   <model-viewer
            //     src={`http://localhost:5000/uploads/${uploadedModel.fileName}`}
            //     ar
            //     auto-rotate
            //     camera-controls
            //     style={{ width: "100%", height: "400px" }}
            //   ></model-viewer>
            // )
            previewActive && generatedCode && (
              <iframe
                title="AR Preview"
                srcDoc={generatedCode}
                allow="camera; microphone; fullscreen; xr-spatial-tracking"
                style={{ width: "100%", height: "500px", border: "none", borderRadius: "15px" }}
              />
            )}
          </div>
          <div className="preview-controls">
            <button
              className="preview-btn"
              onClick={previewActive ? stopARPreview : startARPreview}
              disabled={!uploadedModel}
            >
              {previewActive ? '⏹️ Stop Preview' : '🎥 Start AR Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* Code Section - Only show if code exists */}
      {generatedCode && (
        <div className="code-section">
          <h2>💾 Generated AR Code</h2>
          <div className="code-container">
            <pre className="code-display">{generatedCode}</pre>
          </div>
          <div className="code-actions">
            <button className="copy-btn" onClick={copyCode}>
              📋 Copy Code
            </button>
            <button className="download-btn" onClick={downloadCode}>
              💾 Download HTML
            </button>
          </div>
          
          {uploadedModel && (
            <div className="model-info">
              <h3>📊 Model Information</h3>
              <div className="info-grid">
                <div>
                  <strong>File:</strong> {uploadedModel.originalName}
                </div>
                <div>
                  <strong>Size:</strong> {(uploadedModel.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
                <div>
                  <strong>Model ID:</strong> {uploadedModel.modelId}
                </div>
                <div>
                  <strong>Upload Date:</strong> {new Date(uploadedModel.uploadDate).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Models Gallery */}
      <div className="models-gallery">
        <h2>📚 Your AR Models</h2>
        <div className="models-grid">
          {Array.isArray(models) && models.length > 0 ? (
            models.map((model) => (
              <div key={model._id || model.modelId} className="model-card">
                <div className="model-icon">📦</div>
                <h4>{model.originalName || 'Unknown Model'}</h4>
                <p>{model.fileSize ? (model.fileSize / 1024 / 1024).toFixed(2) : '0'} MB</p>
                <p>Downloads: {model.downloadCount || 0}</p>
                <button 
                  className="generate-code-btn"
                  onClick={() => generateCode(model.modelId)}
                  disabled={!model.modelId}
                >
                  Generate Code
                </button>
              </div>
            ))
          ) : (
            <div style={{
              color: 'white', 
              textAlign: 'center', 
              gridColumn: '1 / -1',
              padding: '40px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '15px',
              border: '2px dashed rgba(255,255,255,0.3)'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '20px'}}>📦</div>
              <h3>No models uploaded yet</h3>
              <p>Upload your first AR model above to get started!</p>
              {models === null && (
                <p style={{fontSize: '0.9rem', marginTop: '10px', opacity: 0.7}}>
                  (Backend server might not be running)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;