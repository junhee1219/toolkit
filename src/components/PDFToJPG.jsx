import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import FileDropZone from './FileDropZone'; // 공통 컴포넌트 (드래그 앤 드롭)
import './PDFToJPG.css';

// pdf.js 워커 설정 (버전 맞춰서 가져오기)
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

function PDFToJPG() {
    const [pdfFile, setPdfFile] = useState(null);
    const [originalFileName, setOriginalFileName] = useState('converted');
    const [fileInfo, setFileInfo] = useState(''); // 상태 메시지
    const [downloadURL, setDownloadURL] = useState('');
    const [isConverting, setIsConverting] = useState(false);

    // FileDropZone에서 전달받은 파일 처리
    const handleFileDrop = (files) => {
        if (!files || files.length === 0) return;
        if (files.length > 1) {
            alert('한 번에 하나의 PDF만 업로드 가능합니다.');
            return;
        }
        const file = files[0];
        if (file.type !== 'application/pdf') {
            alert('PDF 파일만 업로드할 수 있습니다.');
            return;
        }
        setPdfFile(file);
        const baseName = file.name.replace(/\.pdf$/i, '');
        setOriginalFileName(baseName || 'converted');
        setFileInfo(`선택된 파일: ${file.name}`);
        setDownloadURL('');
    };

    // PDF -> JPG 변환
    const handleConvert = async () => {
        if (!pdfFile) return;
        setIsConverting(true);
        setFileInfo('파일을 변환 중입니다...');
        setDownloadURL('');

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const totalPages = pdf.numPages;

            // JSZip 초기화
            const zip = new JSZip();

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                // 해상도 변경 가능 (e.g. 2, 3)
                const viewport = page.getViewport({ scale: 2 });

                // 캔버스
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport }).promise;

                // JPG 데이터 URL
                const imgData = canvas.toDataURL('image/jpeg');
                // Blob 변환
                const imgBlob = dataURLtoBlob(imgData);

                // ZIP에 추가
                const pageFileName = `${originalFileName}_페이지${pageNum}.jpg`;
                zip.file(pageFileName, imgBlob);
            }

            // ZIP 생성
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipURL = URL.createObjectURL(zipBlob);
            setDownloadURL(zipURL);

            setFileInfo(`변환 완료: 총 ${totalPages} 페이지`);
        } catch (error) {
            console.error('PDF 변환 중 오류:', error);
            alert('PDF를 변환하는 중 오류가 발생했습니다.');
            setFileInfo('파일 변환에 실패했습니다.');
        } finally {
            setIsConverting(false);
        }
    };

    // 리셋
    const handleReset = () => {
        setPdfFile(null);
        setOriginalFileName('converted');
        setFileInfo('');
        setDownloadURL('');
    };

    // dataURL -> Blob 변환 함수
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    return (
        <div className="pdf-to-jpg-container">
            <h1>PDF를 JPG로 변환</h1>
            <main>
                <div className="content">
                    {/* 공통 FileDropZone: multiple={false}, PDF만 */}
                    <FileDropZone
                        instructions="여기에 PDF 파일을 드래그하거나 클릭하여 업로드하세요"
                        accept="application/pdf"
                        multiple={false}
                        onFilesChange={handleFileDrop}
                    />

                    {/* 파일 정보 표시 */}
                    <div className="file-info">{fileInfo}</div>

                    {/* 변환 / 리셋 버튼 */}
                    <div className="button-container">
                        <button
                            className="action-button convert-button"
                            onClick={handleConvert}
                            disabled={!pdfFile || isConverting}
                        >
                            {isConverting ? '변환 중...' : '변환하기'}
                        </button>
                        <button
                            className="action-button reset-button"
                            onClick={handleReset}
                            disabled={!pdfFile || isConverting}
                        >
                            리셋
                        </button>
                    </div>

                    {/* 다운로드 링크 */}
                    {downloadURL && (
                        <a
                            href={downloadURL}
                            download={`${originalFileName}_JPG.zip`}
                            className="download-link"
                        >
                            {`${originalFileName}_JPG.zip 다운로드`}
                        </a>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PDFToJPG;
