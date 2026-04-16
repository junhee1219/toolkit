import React, { useState, useCallback } from 'react';
import PageMeta from './PageMeta';
import './ImageCompress.css';

function ImageCompress() {
    const [originalFile, setOriginalFile] = useState(null);
    const [originalPreview, setOriginalPreview] = useState('');
    const [compressedBlob, setCompressedBlob] = useState(null);
    const [compressedPreview, setCompressedPreview] = useState('');
    const [quality, setQuality] = useState(0.7);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);
    const [isCompressing, setIsCompressing] = useState(false);
    const [error, setError] = useState('');

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setCompressedBlob(null);
        setCompressedPreview('');
        setCompressedSize(0);

        if (file.size > MAX_FILE_SIZE) {
            setError('파일이 너무 큽니다. (최대 10MB)');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 지원합니다. (JPG, PNG, WebP)');
            return;
        }

        setOriginalFile(file);
        setOriginalSize(file.size);

        const reader = new FileReader();
        reader.onload = (ev) => setOriginalPreview(ev.target.result);
        reader.readAsDataURL(file);
    }, []);

    const compress = useCallback(() => {
        if (!originalFile) return;
        setIsCompressing(true);
        setError('');

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        setError('압축 중 문제가 발생했습니다. 다른 파일로 시도해주세요.');
                        setIsCompressing(false);
                        return;
                    }
                    setCompressedBlob(blob);
                    setCompressedSize(blob.size);
                    setCompressedPreview(URL.createObjectURL(blob));
                    setIsCompressing(false);
                },
                'image/jpeg',
                quality
            );
        };
        img.onerror = () => {
            setError('이미지를 읽을 수 없습니다. 다른 파일로 시도해주세요.');
            setIsCompressing(false);
        };
        img.src = originalPreview;
    }, [originalFile, originalPreview, quality]);

    const download = useCallback(() => {
        if (!compressedBlob) return;
        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        const baseName = originalFile.name.replace(/\.[^.]+$/, '');
        a.href = url;
        a.download = `${baseName}_compressed.jpg`;
        a.click();
        URL.revokeObjectURL(url);
    }, [compressedBlob, originalFile]);

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const reduction = originalSize && compressedSize
        ? Math.round((1 - compressedSize / originalSize) * 100)
        : 0;

    return (
        <section className="main-container">
            <PageMeta
                title="무료 이미지 압축"
                description="이미지 파일 용량을 줄여줍니다. JPG, PNG, WebP 지원. 무료, 서버 업로드 없이 브라우저에서 처리."
            />

            <div className="compress-header">
                <h2>이미지 압축</h2>
                <p>이미지 파일의 용량을 줄여줍니다. 파일은 서버에 업로드되지 않습니다.</p>
            </div>

            {error && <div className="compress-error">{error}</div>}

            <div className="compress-upload">
                <label className="compress-dropzone">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
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
                    <div className="compress-quality">
                        <label>품질: {Math.round(quality * 100)}%</label>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={quality}
                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                        />
                    </div>

                    <button
                        className="compress-btn"
                        onClick={compress}
                        disabled={isCompressing}
                    >
                        {isCompressing ? '압축 중...' : '압축하기'}
                    </button>
                </div>
            )}

            {compressedSize > 0 && (
                <div className="compress-result">
                    <div className="compress-stats">
                        <div className="compress-stat">
                            <span className="stat-label">원본</span>
                            <span className="stat-value">{formatSize(originalSize)}</span>
                        </div>
                        <div className="compress-stat">
                            <span className="stat-label">→</span>
                        </div>
                        <div className="compress-stat">
                            <span className="stat-label">압축</span>
                            <span className="stat-value">{formatSize(compressedSize)}</span>
                        </div>
                        <div className="compress-stat">
                            <span className="stat-label">감소</span>
                            <span className="stat-value reduction">{reduction > 0 ? `-${reduction}%` : `+${Math.abs(reduction)}%`}</span>
                        </div>
                    </div>

                    <button className="compress-btn download" onClick={download}>
                        다운로드
                    </button>
                </div>
            )}

            <div className="compress-faq">
                <h3>자주 묻는 질문</h3>
                <details>
                    <summary>파일이 서버에 업로드되나요?</summary>
                    <p>아닙니다. 모든 처리는 브라우저에서 이루어지며, 파일이 외부로 전송되지 않습니다.</p>
                </details>
                <details>
                    <summary>어떤 형식을 지원하나요?</summary>
                    <p>JPG, PNG, WebP 등 대부분의 이미지 형식을 지원합니다. 압축 결과는 JPG로 출력됩니다.</p>
                </details>
                <details>
                    <summary>최대 파일 크기는?</summary>
                    <p>10MB까지 지원합니다. 더 큰 파일은 먼저 리사이즈한 후 시도해주세요.</p>
                </details>
            </div>
        </section>
    );
}

export default ImageCompress;
