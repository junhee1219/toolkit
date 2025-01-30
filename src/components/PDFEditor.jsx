import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import Sortable from 'sortablejs';
import './PDFEditor.css'; // 아래에 첨부된 CSS

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';

function PDFEditor() {
    // 업로드된 PDF의 각 페이지 정보를 담을 상태
    const [allPages, setAllPages] = useState([]);

    // 파일 선택용 input ref
    const fileInputRef = useRef(null);

    // 썸네일을 담는 div ref (Sortable.js 적용 대상)
    const thumbnailsContainerRef = useRef(null);

    // Sortable 인스턴스를 저장할 ref
    const sortableRef = useRef(null);

    // -----------------------------
    //  1. 랜덤 색상 생성 함수
    // -----------------------------
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // -----------------------------
    //  2. 파일 핸들 함수
    // -----------------------------
    const handleFiles = async (files) => {
        const newPages = [];

        for (const file of files) {
            if (file.type !== 'application/pdf') {
                alert('PDF 파일만 업로드할 수 있습니다.');
                continue;
            }

            // 파일마다 랜덤색 지정
            const color = getRandomColor();

            // PDF.js로 페이지별 썸네일 추출
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 0.2 });

                // Canvas에 그리기
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;

                // 이미지 데이터 추출
                const imgData = canvas.toDataURL('image/png');

                // allPages에 들어갈 새 객체 생성
                newPages.push({
                    file,
                    pageNum,
                    color,
                    imgData,
                });
            }
        }

        // 기존 allPages에 새 페이지들 추가
        setAllPages((prev) => [...prev, ...newPages]);
    };

    // -----------------------------
    //  3. 썸네일 정렬(Sortable) 처리
    // -----------------------------
    useEffect(() => {
        if (thumbnailsContainerRef.current && !sortableRef.current) {
            // Sortable 초기화
            sortableRef.current = Sortable.create(thumbnailsContainerRef.current, {
                animation: 150,
                onEnd: (evt) => {
                    // 드래그 종료 시 순서에 맞춰 allPages도 재배치
                    const newOrder = [];
                    const thumbnails = thumbnailsContainerRef.current.querySelectorAll(
                        '.pdf-editor-thumbnail'
                    );

                    thumbnails.forEach((thumb) => {
                        const index = parseInt(thumb.getAttribute('data-index'), 10);
                        newOrder.push(allPages[index]);
                    });

                    setAllPages(newOrder);
                },
            });
        }
    }, [allPages]);

    // -----------------------------
    //  4. 썸네일에서 삭제 누르면
    // -----------------------------
    const handleDelete = (index) => {
        setAllPages((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    // -----------------------------
    //  5. PDF 병합
    // -----------------------------
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
                const [copiedPage] = await mergedPdf.copyPages(pdf, [
                    pageInfo.pageNum - 1,
                ]);
                mergedPdf.addPage(copiedPage);
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // 다운로드 처리
            const a = document.createElement('a');
            a.href = url;
            a.download = '합쳐진.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            alert('PDF 합치기가 완료되었습니다.');
        } catch (error) {
            console.error(error);
            alert('PDF 병합 중 오류가 발생했습니다.');
        }
    };

    // -----------------------------
    //  6. reset (전체 리셋)
    // -----------------------------
    const handleReset = () => {
        setAllPages([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // -----------------------------
    //  7. 드래그앤드롭 관련 함수
    // -----------------------------
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    };

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
        <div className="pdf-editor-container">
            <h1 className="pdf-editor-title">PDF 편집기</h1>

            {/* 드래그 앤 드롭 영역 */}
            <div
                className="pdf-editor-droparea"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <p>여기에 PDF 파일을 드래그하거나 클릭하여 업로드하세요</p>
                <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <button
                    className="pdf-editor-button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                    파일 선택
                </button>
            </div>

            {/* 썸네일 영역 */}
            <div className="pdf-editor-thumbnails" ref={thumbnailsContainerRef}>
                {allPages.map((page, index) => (
                    <div
                        className="pdf-editor-thumbnail"
                        data-index={index}
                        key={index}
                        style={{ borderColor: page.color }}
                    >
                        <span className="pdf-editor-number-label">{index + 1}</span>
                        <button
                            className="pdf-editor-delete-button"
                            onClick={() => handleDelete(index)}
                        >
                            &times;
                        </button>
                        <img src={page.imgData} alt={`Page ${page.pageNum}`} />
                        <p
                            className="pdf-editor-thumbnail-text"
                            title={`${page.file.name} - 페이지 ${page.pageNum}`}
                        >
                            {page.file.name.length > 20
                                ? page.file.name.substring(0, 17) + '...'
                                : page.file.name}
                            {' - '}
                            {page.pageNum}페이지
                        </p>
                    </div>
                ))}
            </div>

            {/* 병합 버튼 */}
            <button className="pdf-editor-button" onClick={mergePDFs}>
                PDF 합치기
            </button>

            {/* 초기화 버튼 */}
            <button className="pdf-editor-button reset" onClick={handleReset}>
                초기화
            </button>
        </div>
    );
}

export default PDFEditor;
