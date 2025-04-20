import React, {useState, useRef, useEffect} from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {PDFDocument} from 'pdf-lib';
import Sortable from 'sortablejs';
import {v4 as uuidv4} from 'uuid';

import FileDropZone from './FileDropZone'; // 공통 컴포넌트
import './PDFEditor.css';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';

function PDFEditor() {
  const [allPages, setAllPages] = useState([]);
  const thumbnailsContainerRef = useRef(null);
  const sortableRef = useRef(null);

  // 1) 파일 처리
  const handlePDFDrop = async (files) => {
    // multiple=true 이므로 files 안에 여러 PDF가 있을 수 있음
    const newPages = [];

    for (const file of files) {
      if (file.type !== 'application/pdf') {
        alert('PDF 파일만 업로드할 수 있습니다.');
        continue;
      }
      // 랜덤색
      const color = getRandomColor();

      // PDF.js
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({scale: 0.2});

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({canvasContext: context, viewport}).promise;
        const imgData = canvas.toDataURL('image/png');

        newPages.push({
          id: uuidv4(), file, pageNum, color, imgData,
        });
      }
    }
    setAllPages((prev) => [...prev, ...newPages]);
  };

  // 랜덤 색상
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  useEffect(() => {
    // ① 컨테이너가 준비되면
    if (!thumbnailsContainerRef.current) return;

    // ② Sortable 생성
    sortableRef.current = Sortable.create(
      thumbnailsContainerRef.current,
      {
        animation: 150,
        onEnd: () => {
          // ③ 함수형 업데이트로 항상 최신 allPages 사용
          setAllPages(prevPages => {
            const thumbs = thumbnailsContainerRef.current
              .querySelectorAll('.pdf-editor-thumbnail');
            // ④ 썸네일 순서대로 재조합
            return Array.from(thumbs)
              .map(thumb => {
                const id = thumb.getAttribute('data-id');
                return prevPages.find(p => p.id === id);
              })
              .filter(Boolean);
          });
        }
      }
    );

    // ⑤ 정리함수: unmount 시 인스턴스 제거
    return () => sortableRef.current.destroy();
  }, [allPages]);  // 빈 배열: 마운트 때 딱 한 번만 초기화


  // 3) 썸네일 삭제
  const handleDelete = (pageId) => {
    setAllPages(prev => prev.filter(pg => pg.id !== pageId));
  };

  // 4) PDF 병합
  const mergePDFs = async () => {
    if (allPages.length === 0) {
      alert('병합할 PDF 페이지가 없습니다.');
      return;
    }
    try {
      const mergedPdf = await PDFDocument.create();
      for (const pageInfo of allPages) {
        const arrayBuffer = await pageInfo.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const [copiedPage] = await mergedPdf.copyPages(pdf, [pageInfo.pageNum - 1]);
        mergedPdf.addPage(copiedPage);
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], {type: 'application/pdf'});
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      a.download = `${yyyy}${mm}${dd}_merged.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert('PDF 합치기가 완료되었습니다.');
    } catch (err) {
      console.error(err);
      alert('PDF 병합 중 오류가 발생했습니다.');
    }
  };

  return (<section className="main-container">
    <FileDropZone
      title="PDF 파일 업로드"
      instructions="여기에 PDF 파일을 드래그하거나 클릭하여 업로드하세요"
      accept="application/pdf"
      multiple={true}
      onFilesChange={handlePDFDrop}
      buttonCilckHandler={mergePDFs}
      buttonText="PDF 합치기"
      buttonDisabled={allPages.length === 0}
    />
    {allPages.length > 0 && (<section id="thumbnails-section">
      <div
        className="pdf-editor-thumbnails"
        ref={thumbnailsContainerRef}
      >
        {allPages.map((page, index) => (<div
          className="pdf-editor-thumbnail"
          data-id={page.id}
          key={page.id}
          style={{borderColor: page.color}}
        >
          <span className="pdf-editor-number-label">{index + 1}</span>
          <button
            className="pdf-editor-delete-button"
            onClick={() => handleDelete(page.id)}
          >
            &times;
          </button>
          <img src={page.imgData} alt={`Page ${page.pageNum}`}/>
          <p className="pdf-editor-thumbnail-text">
            {page.file.name.length > 20 ? page.file.name.substring(0, 17) + '...' : page.file.name}
            {' - '}
            {`${page.pageNum} 페이지`}
          </p>
        </div>))}
      </div>
    </section>)}
  </section>);
}

export default PDFEditor;
