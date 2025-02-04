import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import Sortable from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';

import FileDropZone from './FileDropZone';
import './PDFEditor.css';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';

function PDFEditor() {
  const [allPages, setAllPages] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const thumbnailsContainerRef = useRef(null);
  const sortableRef = useRef(null);

  // 1) 파일 처리 (PDF 읽는 동안 버튼 비활성화)
  const handlePDFDrop = async (files) => {
    if (!files || files.length === 0) return;
    setButtonDisabled(true);
    const newPages = [];
    try {
      for (const file of files) {
        if (file.type !== 'application/pdf') {
          alert('PDF 파일만 업로드할 수 있습니다.');
          continue;
        }
        // 랜덤 색상
        const color = getRandomColor();

        // PDF.js 사용
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 0.2 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          const imgData = canvas.toDataURL('image/png');

          newPages.push({
            id: uuidv4(),
            file,
            pageNum,
            color,
            imgData,
          });
        }
      }
      // 기존 배열에 추가 (이어붙이기)
      setAllPages((prev) => [...prev, ...newPages]);
    } catch (error) {
      console.error(error);
      alert('파일 읽는 중 오류가 발생했습니다.');
    } finally {
      setButtonDisabled(false);
    }
  };

  // 랜덤 색상 생성 함수
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  useEffect(() => {
    if (thumbnailsContainerRef.current) {
      console.log('썸네일 컨테이너:', thumbnailsContainerRef.current);
    } else {
      console.log('썸네일 컨테이너가 아직 렌더링되지 않음');
    }
  }, [allPages]);
  
  useEffect(() => {
    if (thumbnailsContainerRef.current && !sortableRef.current && allPages.length > 0) {
      sortableRef.current = Sortable.create(thumbnailsContainerRef.current, {
        animation: 150,
        draggable: '.pdf-editor-thumbnail',
        forceFallback: true,
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          console.log('oldIndex:', oldIndex, 'newIndex:', newIndex);
          if (oldIndex === newIndex) return;
          setAllPages((prevPages) => {
            const updated = [...prevPages];
            const [moved] = updated.splice(oldIndex, 1);
            updated.splice(newIndex, 0, moved);
            console.log('새로운 배열:', updated);
            return updated;
          });
        }
      });
    }
  }, [allPages]);

  // 3) 썸네일 삭제
  const handleDelete = (pageId) => {
    setAllPages((prev) => prev.filter(pg => pg.id !== pageId));
  };

  // 4) PDF 병합
  const mergePDFs = async () => {
    if (allPages.length === 0) {
      alert('병합할 PDF 페이지가 없습니다.');
      return;
    }
    try {
      setButtonDisabled(true);
      const mergedPdf = await PDFDocument.create();
      for (const pageInfo of allPages) {
        const arrayBuffer = await pageInfo.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const [copiedPage] = await mergedPdf.copyPages(pdf, [pageInfo.pageNum - 1]);
        mergedPdf.addPage(copiedPage);
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = '합쳐진.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert('PDF 합치기가 완료되었습니다.');
    } catch (err) {
      console.error(err);
      alert('PDF 병합 중 오류가 발생했습니다.');
    } finally {
      setButtonDisabled(false);
    }
  };

  return (
    <section className="main-container">
      <FileDropZone
        title="PDF 파일 업로드"
        instructions="여기에 PDF 파일을 드래그하거나 클릭하여 업로드하세요"
        accept="application/pdf"
        multiple={true}
        onFilesChange={handlePDFDrop}
        buttonLabel="PDF 합치기"
        onButtonClick={mergePDFs}
        buttonDisabled={buttonDisabled}
      />
      {allPages.length > 0 && (
        <section id="thumbnails-section">
          <div className="pdf-editor-thumbnails" ref={thumbnailsContainerRef}>
            {allPages.map((page, index) => (
              <div
                className="pdf-editor-thumbnail"
                data-id={page.id}
                key={page.id}
                style={{ borderColor: page.color }}
              >
                <span className="pdf-editor-number-label">{index + 1}</span>
                <button
                  className="pdf-editor-delete-button"
                  onClick={() => handleDelete(page.id)}
                  draggable="false"
                >
                  &times;
                </button>
                <img src={page.imgData} alt={`Page ${page.pageNum}`} draggable="false" />
                <p className="pdf-editor-thumbnail-text">
                  {page.file.name.length > 20
                    ? page.file.name.substring(0, 17) + '...'
                    : page.file.name}
                  {' - '}
                  {`${page.pageNum} 페이지`}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

export default PDFEditor;
