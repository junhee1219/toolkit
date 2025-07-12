import React, {useEffect, useState} from 'react';
import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import Header from './components/Header';
import TextAreaSection from './components/TextAreaSection';
import PPTExtractor from './components/PPTExtractor';
import PDFEditor from './components/PDFEditor';
import PDFToJPG from './components/PDFToJPG';
import Inquiry from './components/Inquiry';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [showBanner, setShowBanner] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    const dismissedUntil = localStorage.getItem('domain_notice_dismissed_until');
    const now = Date.now();

    if (from === 'yourin' && (!dismissedUntil || now > parseInt(dismissedUntil, 10))) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
      const expireAt = Date.now() + FIVE_DAYS_MS;
      localStorage.setItem('domain_notice_dismissed_until', expireAt.toString());
    }
    setShowBanner(false);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const period = hours >= 12 ? '오후' : '오전';
      hours = hours % 12;
      hours = hours || 12;
      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');

      document.title = `${period} ${formattedHours}시 ${formattedMinutes}분 ${formattedSeconds}초`;
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Router>
      <div className="App">
        {showBanner && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff8dc',
            border: '1px solid #f0d680',
            borderRadius: '12px',
            padding: '18px 24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            fontFamily: 'sans-serif',
            color: '#333'
          }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
              ⚠️ your-in.site는 2025년 9월 1일 종료됩니다.
            </div>
            <div style={{ marginBottom: '16px' }}>
              앞으로는 <a href="https://kittly.xyz" target="_blank" rel="noreferrer">kittly.xyz</a>를 이용해주세요.
            </div>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={() => setDontShowAgain(!dontShowAgain)}
                style={{ marginRight: '8px' }}
              />
              5일간 다시 보지 않기
            </label>
            <button onClick={handleDismiss} style={{
              padding: '8px 16px',
              background: '#facc15',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              확인
            </button>
          </div>
        )}
        <Header/>
        <div className="header-separator"></div>
        <main>
          <Routes>
            <Route path="/" element={<TextAreaSection/>}/>
            <Route path="/ppt_extractor" element={<PPTExtractor/>}/>
            <Route path="/pdf_editor" element={<PDFEditor/>}/>
            <Route path="/pdf_to_jpg" element={<PDFToJPG/>}/>
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
