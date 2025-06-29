import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import DocumentsPage from './components/DocumentsPage';
import UploadPage from './components/UploadPage';
import LecturePage from './components/LecturePage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/lecture/:id" element={<LecturePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;