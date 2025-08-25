
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ModelManager = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [modelSettings, setModelSettings] = useState({
    scale: '0.5 0.5 0.5',
    position: '0 0 0',
    rotation: '0 0 0'
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/models');
      setModels(response.data);
    } catch (error) {
      toast.error('Failed to fetch models');
    }
  };

  const deleteModel = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await axios.delete(`http://localhost:5000/api/models/${modelId}`);
        toast.success('Model deleted successfully');
        fetchModels();
      } catch (error) {
        toast.error('Failed to delete model');
      }
    }
  };

  const updateModelSettings = async (modelId) => {
    try {
      await axios.put(`http://localhost:5000/api/models/${modelId}`, modelSettings);
      toast.success('Model settings updated');
      setEditMode(false);
      fetchModels();
    } catch (error) {
      toast.error('Failed to update model settings');
    }
  };

  const openEditModal = (model) => {
    setSelectedModel(model);
    setModelSettings({
      scale: model.metadata.scale,
      position: model.metadata.position,
      rotation: model.metadata.rotation
    });
    setEditMode(true);
  };

  return (
    <div className="model-manager">
      <h2>📋 Model Manager</h2>
      
      <div className="models-table">
        <table>
          <thead>
            <tr>
              <th>Model Name</th>
              <th>File Size</th>
              <th>Upload Date</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map(model => (
              <tr key={model._id}>
                <td>
                  <div className="model-cell">
                    <span className="model-icon">📦</span>
                    {model.originalName}
                  </div>
                </td>
                <td>{(model.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                <td>{new Date(model.uploadDate).toLocaleDateString()}</td>
                <td>{model.downloadCount}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => openEditModal(model)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteModel(model.modelId)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editMode && selectedModel && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Model Settings</h3>
            <div className="settings-form">
              <div className="form-group">
                <label>Scale (x y z):</label>
                <input
                  type="text"
                  value={modelSettings.scale}
                  onChange={(e) => setModelSettings({
                    ...modelSettings,
                    scale: e.target.value
                  })}
                />
              </div>
              <div className="form-group">
                <label>Position (x y z):</label>
                <input
                  type="text"
                  value={modelSettings.position}
                  onChange={(e) => setModelSettings({
                    ...modelSettings,
                    position: e.target.value
                  })}
                />
              </div>
              <div className="form-group">
                <label>Rotation (x y z):</label>
                <input
                  type="text"
                  value={modelSettings.rotation}
                  onChange={(e) => setModelSettings({
                    ...modelSettings,
                    rotation: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="save-btn"
                onClick={() => updateModelSettings(selectedModel.modelId)}
              >
                Save Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelManager;