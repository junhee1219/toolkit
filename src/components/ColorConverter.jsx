import React, { useState, useCallback } from 'react';
import PageMeta from './PageMeta';
import './ImageCompress.css';

function ColorConverter() {
    const [hex, setHex] = useState('#6366f1');
    const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 });
    const [hsl, setHsl] = useState({ h: 239, s: 84, l: 67 });

    const hexToRgb = (h) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    };

    const rgbToHex = (r, g, b) => {
        return '#' + [r, g, b].map(x => {
            const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    };

    const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
                default: h = 0;
            }
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    const updateFromHex = useCallback((val) => {
        setHex(val);
        const rgbVal = hexToRgb(val);
        if (rgbVal) {
            setRgb(rgbVal);
            setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
        }
    }, []);

    const updateFromRgb = useCallback((key, val) => {
        const newRgb = { ...rgb, [key]: parseInt(val, 10) || 0 };
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    }, [rgb]);

    const copyText = (text) => navigator.clipboard.writeText(text).catch(() => {});

    const inputStyle = {
        width: 60, padding: '8px', background: '#1a1a24', border: '1px solid #333',
        borderRadius: 6, color: '#fff', textAlign: 'center', fontSize: '0.9rem',
    };

    return (
        <section className="main-container">
            <PageMeta
                title="무료 색상 코드 변환기"
                description="HEX, RGB, HSL 색상 코드를 상호 변환합니다. 무료 온라인 색상 변환 도구."
            />

            <div className="compress-header">
                <h2>색상 코드 변환기</h2>
                <p>HEX, RGB, HSL 색상 코드를 상호 변환합니다.</p>
            </div>

            <div style={{
                width: 120, height: 120, borderRadius: 16,
                background: hex, margin: '0 auto 24px',
                border: '2px solid #333',
            }} />

            <div style={{ maxWidth: 400, margin: '0 auto' }}>
                {/* HEX */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#888', width: 40, textAlign: 'right', fontSize: '0.85rem' }}>HEX</span>
                    <input
                        type="color"
                        value={hex}
                        onChange={(e) => updateFromHex(e.target.value)}
                        style={{ width: 40, height: 36, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <input
                        value={hex}
                        onChange={(e) => updateFromHex(e.target.value)}
                        style={{ ...inputStyle, width: 100 }}
                    />
                    <button onClick={() => copyText(hex)} style={{ padding: '6px 10px', background: '#333', border: 'none', borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: '0.8rem' }}>복사</button>
                </div>

                {/* RGB */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#888', width: 40, textAlign: 'right', fontSize: '0.85rem' }}>RGB</span>
                    <input type="number" min="0" max="255" value={rgb.r} onChange={(e) => updateFromRgb('r', e.target.value)} style={inputStyle} />
                    <input type="number" min="0" max="255" value={rgb.g} onChange={(e) => updateFromRgb('g', e.target.value)} style={inputStyle} />
                    <input type="number" min="0" max="255" value={rgb.b} onChange={(e) => updateFromRgb('b', e.target.value)} style={inputStyle} />
                    <button onClick={() => copyText(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} style={{ padding: '6px 10px', background: '#333', border: 'none', borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: '0.8rem' }}>복사</button>
                </div>

                {/* HSL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#888', width: 40, textAlign: 'right', fontSize: '0.85rem' }}>HSL</span>
                    <span style={{ color: '#aaa', fontSize: '0.9rem' }}>{hsl.h}°, {hsl.s}%, {hsl.l}%</span>
                    <button onClick={() => copyText(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} style={{ padding: '6px 10px', background: '#333', border: 'none', borderRadius: 6, color: '#aaa', cursor: 'pointer', fontSize: '0.8rem' }}>복사</button>
                </div>
            </div>

            <div className="compress-faq">
                <h3>자주 묻는 질문</h3>
                <details>
                    <summary>HEX, RGB, HSL의 차이는?</summary>
                    <p>HEX는 #RRGGBB 형태의 16진수 표기, RGB는 빨강/초록/파랑 값(0-255), HSL은 색상/채도/명도 값입니다. 모두 같은 색상을 다른 방식으로 표현합니다.</p>
                </details>
            </div>
        </section>
    );
}

export default ColorConverter;
