import React, { useState, useRef, useCallback } from 'react';
import PageMeta from './PageMeta';
import './ImageCompress.css';

function QRGenerator() {
    const [text, setText] = useState('');
    const [size, setSize] = useState(256);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [error, setError] = useState('');
    const canvasRef = useRef(null);

    const generate = useCallback(() => {
        if (!text.trim()) {
            setError('QR코드에 담을 내용을 입력하세요.');
            return;
        }
        setError('');

        // QR 코드 생성 (Canvas API 기반 간단 구현 대신 동적 import 사용)
        // qrcode 라이브러리가 없으므로 Google Charts API 활용
        const encoded = encodeURIComponent(text);
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png`;
        setQrDataUrl(url);
    }, [text, size]);

    const download = useCallback(() => {
        if (!qrDataUrl) return;
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = 'qrcode.png';
        a.target = '_blank';
        a.click();
    }, [qrDataUrl]);

    const copyUrl = useCallback(() => {
        if (!qrDataUrl) return;
        navigator.clipboard.writeText(qrDataUrl).catch(() => {});
    }, [qrDataUrl]);

    return (
        <section className="main-container">
            <PageMeta
                title="무료 QR코드 만들기"
                description="URL, 텍스트, 연락처 등을 QR코드로 변환합니다. 무료 QR코드 생성기."
            />

            <div className="compress-header">
                <h2>QR코드 생성기</h2>
                <p>URL, 텍스트, 연락처 등을 QR코드로 변환합니다.</p>
            </div>

            {error && <div className="compress-error">{error}</div>}

            <div style={{ maxWidth: 500, margin: '0 auto 20px' }}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="URL 또는 텍스트를 입력하세요 (예: https://example.com)"
                    style={{
                        width: '100%',
                        minHeight: 100,
                        padding: 14,
                        background: '#1a1a24',
                        border: '1px solid #333',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                    }}
                />
            </div>

            <div className="compress-controls">
                <div className="compress-quality">
                    <label>크기: {size}px</label>
                    <input
                        type="range"
                        min="128"
                        max="512"
                        step="64"
                        value={size}
                        onChange={(e) => setSize(parseInt(e.target.value, 10))}
                    />
                </div>
                <button className="compress-btn" onClick={generate}>
                    QR코드 생성
                </button>
            </div>

            {qrDataUrl && (
                <div className="compress-result">
                    <div style={{
                        background: '#fff',
                        padding: 16,
                        borderRadius: 12,
                        display: 'inline-block',
                    }}>
                        <img
                            ref={canvasRef}
                            src={qrDataUrl}
                            alt="QR코드"
                            style={{ display: 'block', width: size, height: size }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="compress-btn download" onClick={download}>
                            다운로드
                        </button>
                        <button className="compress-btn" onClick={copyUrl}>
                            이미지 URL 복사
                        </button>
                    </div>
                </div>
            )}

            <div className="compress-faq">
                <h3>자주 묻는 질문</h3>
                <details>
                    <summary>QR코드에 무엇을 담을 수 있나요?</summary>
                    <p>URL, 일반 텍스트, 이메일 주소, 전화번호, Wi-Fi 정보 등 다양한 내용을 담을 수 있습니다.</p>
                </details>
                <details>
                    <summary>생성된 QR코드는 영구적인가요?</summary>
                    <p>네, 생성된 QR코드는 이미지 파일로 다운로드하면 영구적으로 사용할 수 있습니다. QR코드 안에 담긴 내용이 직접 인코딩되어 있으므로 별도 서버가 필요 없습니다.</p>
                </details>
                <details>
                    <summary>무료인가요?</summary>
                    <p>네, 완전 무료입니다. 횟수 제한 없이 사용할 수 있습니다.</p>
                </details>
            </div>
        </section>
    );
}

export default QRGenerator;
