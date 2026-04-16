import React, { useState, useCallback } from 'react';
import PageMeta from './PageMeta';
import './ImageCompress.css';

function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [copied, setCopied] = useState(false);

    const generate = useCallback(() => {
        let chars = '';
        if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (options.numbers) chars += '0123456789';
        if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) {
            setPassword('옵션을 하나 이상 선택하세요');
            return;
        }

        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        const result = Array.from(array, (x) => chars[x % chars.length]).join('');
        setPassword(result);
        setCopied(false);
    }, [length, options]);

    const copy = useCallback(() => {
        if (password) {
            navigator.clipboard.writeText(password).then(() => setCopied(true)).catch(() => {});
        }
    }, [password]);

    const toggleOption = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const checkboxStyle = { display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: '0.9rem' };

    return (
        <section className="main-container">
            <PageMeta
                title="무료 비밀번호 생성기"
                description="안전한 랜덤 비밀번호를 생성합니다. 길이, 대소문자, 숫자, 특수문자 옵션 설정 가능."
            />

            <div className="compress-header">
                <h2>비밀번호 생성기</h2>
                <p>안전한 랜덤 비밀번호를 생성합니다. 모든 처리는 브라우저에서 이루어집니다.</p>
            </div>

            {password && (
                <div style={{
                    maxWidth: 500, margin: '0 auto 20px', padding: '16px 20px',
                    background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 12,
                    textAlign: 'center',
                }}>
                    <div style={{
                        fontFamily: 'monospace', fontSize: '1.2rem', color: '#e0e0e0',
                        wordBreak: 'break-all', marginBottom: 12, letterSpacing: '1px',
                    }}>
                        {password}
                    </div>
                    <button className="compress-btn download" onClick={copy} style={{ fontSize: '0.85rem', padding: '8px 20px' }}>
                        {copied ? '복사됨!' : '복사'}
                    </button>
                </div>
            )}

            <div className="compress-controls">
                <div className="compress-quality">
                    <label>길이: {length}자</label>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value, 10))}
                    />
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <label style={checkboxStyle}>
                        <input type="checkbox" checked={options.uppercase} onChange={() => toggleOption('uppercase')} /> 대문자 (A-Z)
                    </label>
                    <label style={checkboxStyle}>
                        <input type="checkbox" checked={options.lowercase} onChange={() => toggleOption('lowercase')} /> 소문자 (a-z)
                    </label>
                    <label style={checkboxStyle}>
                        <input type="checkbox" checked={options.numbers} onChange={() => toggleOption('numbers')} /> 숫자 (0-9)
                    </label>
                    <label style={checkboxStyle}>
                        <input type="checkbox" checked={options.symbols} onChange={() => toggleOption('symbols')} /> 특수문자
                    </label>
                </div>

                <button className="compress-btn" onClick={generate}>
                    생성하기
                </button>
            </div>

            <div className="compress-faq">
                <h3>자주 묻는 질문</h3>
                <details>
                    <summary>안전한가요?</summary>
                    <p>네. 브라우저의 crypto.getRandomValues()를 사용하여 암호학적으로 안전한 난수를 생성합니다. 비밀번호는 서버에 저장되거나 전송되지 않습니다.</p>
                </details>
                <details>
                    <summary>어떤 길이가 좋은가요?</summary>
                    <p>일반적으로 12자 이상을 권장합니다. 16자 이상이면 매우 안전합니다. 대소문자, 숫자, 특수문자를 모두 포함하는 것이 좋습니다.</p>
                </details>
            </div>
        </section>
    );
}

export default PasswordGenerator;
