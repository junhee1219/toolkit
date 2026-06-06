import React from 'react';
import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import TextAreaSection from './components/TextAreaSection';
import PPTExtractor from './components/PPTExtractor';
import PDFEditor from './components/PDFEditor';
import PDFToJPG from './components/PDFToJPG';
import ImageCompress from './components/ImageCompress';
import ImageResize from './components/ImageResize';
import QRGenerator from './components/QRGenerator';
import JsonFormatter from './components/JsonFormatter';
import ColorConverter from './components/ColorConverter';
import PasswordGenerator from './components/PasswordGenerator';
import Inquiry from './components/Inquiry';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header/>
        <div className="header-separator"></div>
        <main>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/text_tool" element={<TextAreaSection/>}/>
            <Route path="/ppt_extractor" element={<PPTExtractor/>}/>
            <Route path="/pdf_editor" element={<PDFEditor/>}/>
            <Route path="/pdf_to_jpg" element={<PDFToJPG/>}/>
            <Route path="/image_compress" element={<ImageCompress/>}/>
            <Route path="/image_resize" element={<ImageResize/>}/>
            <Route path="/qr_generator" element={<QRGenerator/>}/>
            <Route path="/json_formatter" element={<JsonFormatter/>}/>
            <Route path="/color_converter" element={<ColorConverter/>}/>
            <Route path="/password_generator" element={<PasswordGenerator/>}/>
            <Route path="/inquiry" element={<Inquiry/>}/>
          </Routes>
        </main>
        <div className="header-separator"></div>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
