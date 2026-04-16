import React, { useState, useCallback } from 'react';
import PageMeta from './PageMeta';
import './ImageCompress.css';

function ImageResize() {
    const [originalFile, setOriginalFile] = useState(null);
    const [originalPreview, setOriginalPreview] = useState('');
    const [resizedBlob, setResizedBlob] = useState(null);
    const [originalWidth, setOriginalWidth] = useState(0);
    const [originalHeight, setOriginalHeight] = useState(0);
    const [targetWidth, setTargetWidth] = useState('');
    const [targetHeight, setTargetHeight] = useState('');
    const [keepRatio, setKeepRatio] = useState(true);
    const [isResizing, setIsResizing] = useState(false);
    const [error, setError] = useState('');
    const [resultInfo, setResultInfo] = useState(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setResizedBlob(null);
        setResultInfo(null);

        if (file.size > MAX_FILE_SIZE) {
            setError('파일이 너무 큽니다. (최대 10MB)');
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 지원합니다.');
            return;
        }

        setOriginalFile(file);

        const reader = new FileReader();
        reader.onload = (ev) => {
            setOriginalPreview(ev.target.result);
            const img = new Image();
            img.onload = () => {
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setTargetWidth(String(img.width));
                setTargetHeight(String(img.height));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }, []);

    const handleWidthChange = (val) => {
        setTargetWidth(val);
        if (keepRatio && originalWidth && val) {
            const ratio = originalHeight / originalWidth;
            setTargetHeight(String(Math.round(Number(val) * ratio)));
        }
    };

    const handleHeightChange = (val) => {
        setTargetHeight(val);
        if (keepRatio && originalHeight && val) {
            const ratio = originalWidth / originalHeight;
            setTargetWidth(String(Math.round(Number(val) * ratio)));
        }
    };

    const resize = useCallback(() => {
        if (!originalPreview || !targetWidth || !targetHeight) return;
        setIsResizing(true);
        setError('');

        const w = parseInt(targetWidth, 10);
        const h = parseInt(targetHeight, 10);
        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            setError('올바른 크기를 입력하세요.');
            setIsResizing(false);
            return;
        }
        if (w > 10000 || h > 10000) {
            setError('최대 10000px까지 지원합니다.');
            setIsResizing(false);
            return;
        }

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            canvas.toBlob((blob) => {
                if (!blob) {
                    setError('리사이즈 중 문제가 발생했습니다.');
                    setIsResizing(false);
                    return;
                }
                setResizedBlob(blob);
                setResultInfo({ width: w, height: h, size: blob.size });
                setIsResizing(false);
            }, 'image/png');
        };
        img.onerror = () => {
            setError('이미지를 읽을 수 없습니다.');
            setIsResizing(false);
        };
        img.src = originalPreview;
    }, [originalPreview, targetWidth, targetHeight]);

    const download = useCallback(() => {
        if (!resizedBlob) return;
        const url = URL.createObjectURL(resizedBlob);
        const a = document.createElement('a');
        const baseName = originalFile.name.replace(/\.[^.]+$/, '');
        a.href = url;
        a.download = `${baseName}_${targetWidth}x${targetHeight}.png`;
        a.click();
        URL.revokeObjectURL(url);
    }, [resizedBlob, originalFile, targetWidth, targetHeight]);

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <section className="main-container">
            <PageMeta
                title="무료 이미지 리사이즈"
                description="이미지 크기를 변경합니다. 가로/세로 픽셀 지정. 무료, 서버 업로드 없이 브라우저에서 처리."
            />

            <div className="compress-header">
                <h2>이미지 리사이즈</h2>
                <p>이미지의 가로/세로 크기를 변경합니다. 파일은 서버에 업로드되지 않습니다.</p>
            </div>

            {error && <div className="compress-error">{error}</div>}

            <div className="compress-upload">
                <label className="compress-dropzone">
                    <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                    {originalPreview ? (
                        <img src={originalPreview} alt="원본" className="compress-preview-img" />
                    ) : (
                        <div className="compress-placeholder">
                            <span>이미지를 선택하세요</span>
                            <span className="compress-hint">JPG, PNG, WebP (최대 10MB)</span>
                        </div>
                    )}
                </label>
            </div>

            {originalFile && (
                <div className="compress-controls">
                    <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: 8 }}>
                        원본: {originalWidth} x {originalHeight}px
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="number"
                            value={targetWidth}
                            onChange={(e) => handleWidthChange(e.target.value)}
                            style={{ width: 80, padding: '8px', background: '#1a1a24', border: '1px solid #333', borderRadius: 6, color: '#fff', textAlign: 'center' }}
                        />
                        <span style={{ color: '#888' }}>x</span>
                        <input
                            type="number"
                            value={targetHeight}
                            onChange={(e) => handleHeightChange(e.target.value)}
                            style={{ width: 80, padding: '8px', background: '#1a1a24', border: '1px solid #333', borderRadius: 6, color: '#fff', textAlign: 'center' }}
                        />
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>px</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={keepRatio} onChange={() => setKeepRatio(!keepRatio)} />
                        비율 유지
                    </label>
                    <button className="compress-btn" onClick={resize} disabled={isResizing}>
                        {isResizing ? '리사이즈 중...' : '리사이즈'}
                    </button>
                </div>
            )}

            {resultInfo && (
                <div className="compress-result">
                    <div className="compress-stats">
                        <div className="compress-stat">
                            <span className="stat-label">결과 크기</span>
                            <span className="stat-value">{resultInfo.width} x {resultInfo.height}px</span>
                        </div>
                        <div className="compress-stat">
                            <span className="stat-label">파일 크기</span>
                            <span className="stat-value">{formatSize(resultInfo.size)}</span>
                        </div>
                    </div>
                    <button className="compress-btn download" onClick={download}>다운로드</button>
                </div>
            )}

            <div className="compress-faq">
                <h3>자주 묻는 질문</h3>
                <details>
                    <summary>파일이 서버에 업로드되나요?</summary>
                    <p>아닙니다. 모든 처리는 브라우저에서 이루어지며, 파일이 외부로 전송되지 않습니다.</p>
                </details>
                <details>
                    <summary>최대 크기는?</summary>
                    <p>가로/세로 각 최대 10000px, 파일 크기 최대 10MB까지 지원합니다.</p>
                </details>
            </div>
        </section>
    );
}

export default ImageResize;
