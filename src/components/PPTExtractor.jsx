// src/components/PPTExtractor.jsx

import React, { useState } from 'react';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { FaFileAlt } from 'react-icons/fa'; // react-icons에서 파일 아이콘 가져오기
import './PPTExtractor.css';

const PPTExtractor = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileInfo, setFileInfo] = useState({ name: '', size: '', pageCount: 0 });
    const [isUploading, setIsUploading] = useState(false);
    const [isSplitting, setIsSplitting] = useState(false);
    const [downloadLink, setDownloadLink] = useState('');
    const [extractSettings, setExtractSettings] = useState({
        slideNumbersToKeep: '',
        extractionWords: '',
        caseSensitive: false,
    });
    const [isDropped, setIsDropped] = useState(false); // 드래그 앤 드롭 텍스트 표시 여부

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            setSelectedFile(file);
            setFileInfo({
                name: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                pageCount: 0, // 초기 페이지 수
            });
            setIsDropped(true); // 드롭 텍스트 숨기기
        } else {
            alert('PPTX 파일만 업로드 가능합니다.');
        }
    };

    // 드래그 앤 드롭 핸들러
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            setSelectedFile(file);
            setFileInfo({
                name: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                pageCount: 0,
            });
            setIsDropped(true);
        } else {
            alert('PPTX 파일만 업로드 가능합니다.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // 파일 업로드 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('파일을 선택해주세요.');
            return;
        }

        setIsUploading(true);
        setDownloadLink('');
        try {
            const zip = new JSZip();
            const fileData = await selectedFile.arrayBuffer();
            const zipContent = await zip.loadAsync(fileData);

            // 슬라이드 XML 파일 추출
            const slideFiles = Object.keys(zipContent.files).filter(fileName => fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml'));
            const pageCount = slideFiles.length;
            setFileInfo(prev => ({ ...prev, pageCount }));

            // 추가 설정 필요 시 여기에 로직 추가
        } catch (error) {
            console.error('파일 읽기 중 오류 발생:', error);
            alert('파일 읽기 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    // 설정 변경 핸들러
    const handleSettingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setExtractSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // PPT 추출 실행 핸들러
    const handleSplit = async () => {
        if (!selectedFile) {
            alert('파일을 선택해주세요.');
            return;
        }

        setIsSplitting(true);
        setDownloadLink('');
        try {
            const zip = new JSZip();
            const fileData = await selectedFile.arrayBuffer();
            const zipContent = await zip.loadAsync(fileData);

            // 슬라이드 XML 파일 추출
            const slideFiles = Object.keys(zipContent.files).filter(fileName => fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml'));

            // 유지할 슬라이드 번호 목록
            const slidesToKeep = extractSettings.slideNumbersToKeep
                .split(',')
                .map(num => parseInt(num.trim()))
                .filter(num => !isNaN(num));

            const extractionWords = extractSettings.extractionWords.split(',').map(word => word.trim()).filter(word => word !== '');

            const processedSlides = [];
            const parser = new XMLParser({ ignoreAttributes: false });

            for (let i = 0; i < slideFiles.length; i++) {
                const slideFile = slideFiles[i];
                const slideContent = await zipContent.files[slideFile].async('string');
                let parsedSlide = parser.parse(slideContent);

                // 슬라이드 번호가 유지 목록에 있는지 확인
                if (!slidesToKeep.includes(i + 1)) {
                    // 슬라이드 텍스트 추출
                    const slideText = extractTextFromSlide(parsedSlide);

                    // 추출 단어 매칭
                    let hasExtractionWord = false;
                    if (extractSettings.caseSensitive) {
                        hasExtractionWord = extractionWords.some(word => slideText.includes(word));
                    } else {
                        const lowerSlideText = slideText.toLowerCase();
                        hasExtractionWord = extractionWords.some(word => lowerSlideText.includes(word.toLowerCase()));
                    }

                    if (hasExtractionWord) {
                        processedSlides.push(slideContent);
                    }
                } else {
                    // 유지할 슬라이드인 경우
                    processedSlides.push(slideContent);
                }
            }

            // 새로운 ZIP 파일 생성
            const newZip = new JSZip();

            // 슬라이드 파일만 복사
            processedSlides.forEach((slideContent, index) => {
                const slidePath = `ppt/slides/slide${index + 1}.xml`;
                newZip.file(slidePath, slideContent);
            });

            // 다운로드용 Blob 생성
            const blob = await newZip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            setDownloadLink(url);
        } catch (error) {
            console.error('PPT 추출 중 오류 발생:', error);
            alert('PPT 추출 중 오류가 발생했습니다.');
        } finally {
            setIsSplitting(false);
        }
    };

    // 슬라이드에서 텍스트 추출하는 함수 (간단한 예시)
    const extractTextFromSlide = (slide) => {
        let text = '';
        // XML 구조에 따라 텍스트 추출 로직 작성
        // 예시: slide['p:sld']['p:cSld']['p:spTree']['p:sp']에서 텍스트 추출
        if (slide['p:sld'] && slide['p:sld']['p:cSld'] && slide['p:sld']['p:cSld']['p:spTree'] && slide['p:sld']['p:cSld']['p:spTree']['p:sp']) {
            const shapes = slide['p:sld']['p:cSld']['p:spTree']['p:sp'];
            shapes.forEach(shape => {
                if (shape['p:txBody'] && shape['p:txBody']['a:p']) {
                    const paragraphs = shape['p:txBody']['a:p'];
                    paragraphs.forEach(paragraph => {
                        if (paragraph['a:r']) {
                            const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']];
                            runs.forEach(run => {
                                if (run['a:t']) {
                                    text += run['a:t'] + ' ';
                                }
                            });
                        }
                    });
                }
            });
        }
        return text;
    };

    return (
        <main className="ppt-extractor-container">
            {/* 파일 업로드 섹션 */}
            <section className="upload-section">
                <h2>PPT 파일 업로드</h2>
                <form id="ppt-upload-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <div
                        id="drop-zone"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className={`drop-zone ${isDropped ? 'dropped' : ''}`}
                        onClick={() => document.getElementById('ppt-file').click()}
                    >
                        {!isDropped && (
                            <p id="file-description">
                                파일을 여기에 드래그 앤 드롭하거나 클릭하여 파일을 선택하세요.
                            </p>
                        )}
                        <input
                            type="file"
                            id="ppt-file"
                            name="ppt-file"
                            accept=".pptx"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            required
                        />
                        {selectedFile && (
                            <div id="file-info">
                                <FaFileAlt className="file-icon" />
                                <p>
                                    <span id="file-name">파일명: {fileInfo.name}</span>
                                    <br /><br />
                                    <span id="file-size">파일 크기: {fileInfo.size}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="button-container">
                        <button type="submit" className="action-button" disabled={isUploading || !selectedFile}>
                            {isUploading ? '파일 읽는 중...' : '파일 읽기'}
                        </button>
                    </div>
                </form>
            </section>

            {/* 로딩 섹션 */}
            {isUploading && (
                <section className="loading">
                    <div className="spinner"></div>
                    <p>파일을 처리 중입니다. 잠시만 기다려주세요...</p>
                </section>
            )}

            {/* PPT 추출 설정 섹션 */}
            {!isUploading && fileInfo.pageCount > 0 && (
                <section id="extract-settings-section">
                    <h2>
                        PPT 추출 설정
                        <span id="slide-count" className="badge">페이지 수: {fileInfo.pageCount}</span>
                    </h2>
                    <form id="extract-settings-form">
                        <div className="setting-group">
                            <label htmlFor="slideNumbersToKeep">유지할 슬라이드 번호 (쉼표 구분):</label>
                            <input
                                type="text"
                                id="slideNumbersToKeep"
                                name="slideNumbersToKeep"
                                value={extractSettings.slideNumbersToKeep}
                                onChange={handleSettingChange}
                                placeholder="예: 1,3,5"
                            />
                        </div>
                        <div className="setting-group">
                            <label htmlFor="extractionWords">추출 단어:</label>
                            <input
                                type="text"
                                id="extractionWords"
                                name="extractionWords"
                                value={extractSettings.extractionWords}
                                onChange={handleSettingChange}
                                placeholder="예: 단어1, 단어2"
                            />
                        </div>
                        <div className="setting-group checkbox-group">
                            <label htmlFor="caseSensitive">대소문자 구분:</label>
                            <input
                                type="checkbox"
                                id="caseSensitive"
                                name="caseSensitive"
                                checked={extractSettings.caseSensitive}
                                onChange={handleSettingChange}
                            />
                        </div>
                    </form>
                    <button
                        id="extract-button"
                        className="action-button"
                        onClick={handleSplit}
                        disabled={isSplitting}
                    >
                        {isSplitting ? 'PPT 추출 중...' : 'PPT 추출하기'}
                    </button>
                </section>
            )}

            {/* 분리 로딩 섹션 */}
            {isSplitting && (
                <section className="loading">
                    <div className="spinner"></div>
                    <p>PPT를 추출하는 중입니다. 잠시만 기다려주세요...</p>
                </section>
            )}

            {/* 다운로드 섹션 */}
            {downloadLink && (
                <section id="download-section">
                    <h2>파일 다운로드</h2>
                    <a
                        id="download-link"
                        href={downloadLink}
                        className="action-button download-button"
                        download="processed_presentation.pptx"
                    >
                        다운로드
                    </a>
                </section>
            )}
        </main>
    );

};

export default PPTExtractor;
