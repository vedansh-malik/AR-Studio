import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/viewer/:id" element={<ViewerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
