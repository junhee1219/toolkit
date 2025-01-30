import React, {useEffect} from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import TextAreaSection from './components/TextAreaSection';
import PPTExtractor from './components/PPTExtractor';
import PDFEditor from './components/PDFEditor';
import Footer from './components/Footer';


// 미구현


// import PDFToJPG from './pages/PDFToJPG';
// import FolderListToExcel from './pages/FolderListToExcel';

import './App.css';

function App() {

    // -----------------------------
    //  8. 제목에 시간 표시 (선택)
    // -----------------------------
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
          <Header />
          <div className="header-separator"></div>
          <main>
            <Routes>
              <Route path="/" element={<TextAreaSection />} />
              <Route path="/ppt_extractor" element={<PPTExtractor />} />
               <Route path="/pdf_editor" element={<PDFEditor />} />
                {/*<Route path="/pdf_to_jpg" element={<PDFToJPG />} />
              <Route path="/folder_list_to_excel" element={<FolderListToExcel />} /> */}
            </Routes>
          </main>
          <div className="header-separator"></div>
          <Footer />
        </div>
      </Router>
  );
}
export default App;
