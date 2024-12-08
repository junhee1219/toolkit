import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import TextAreaSection from './components/TextAreaSection';
import Footer from './components/Footer';
import PPTExtractor from './pages/PPTExtractor';
import PDFEditor from './pages/PDFEditor';
import PDFToJPG from './pages/PDFToJPG';
import FolderListToExcel from './pages/FolderListToExcel';
import './App.css';

function App() {
  return (
      <Router>
        <div className="App">
          <Header />
          <div className="header-separator"></div>
          <main>
            <Routes>
              <Route path="/" element={<TextAreaSection />} />
              <Route path="/ppt_extractor" element={<PPTExtractor />} />
              <Route path="/pdf_editor" element={<PDFEditor />} />
              <Route path="/pdf_to_jpg" element={<PDFToJPG />} />
              <Route path="/folder_list_to_excel" element={<FolderListToExcel />} />
            </Routes>
          </main>
          <div className="header-separator"></div>
          <Footer />
        </div>
      </Router>
  );
}
export default App;
