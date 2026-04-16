import React, { useState, useCallback } from 'react';
import PageMeta from './PageMeta';
import './ImageCompress.css';

function JsonFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [indent, setIndent] = useState(2);

    const format = useCallback(() => {
        setError('');
        if (!input.trim()) {
            setError('JSON을 입력하세요.');
            return;
        }
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, indent));
        } catch (e) {
            setError(`JSON 파싱 오류: ${e.message}`);
            setOutput('');
        }
    }, [input, indent]);

    const minify = useCallback(() => {
        setError('');
        if (!input.trim()) {
            setError('JSON을 입력하세요.');
            return;
        }
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
        } catch (e) {
            setError(`JSON 파싱 오류: ${e.message}`);
            setOutput('');
        }
    }, [input]);

    const copy = useCallback(() => {
        if (output) navigator.clipboard.writeText(output).catch(() => {});
    }, [output]);

    return (
        <section className="main-container">
            <PageMeta
                title="무료 JSON 포맷터"
                description="JSON 데이터를 보기 좋게 정렬하거나 압축합니다. 무료 온라인 JSON 뷰어 및 포맷터."
            />

            <div className="compress-header">
                <h2>JSON 포맷터</h2>
                <p>JSON 데이터를 보기 좋게 정렬하거나 압축합니다.</p>
            </div>

            {error && <div className="compress-error">{error}</div>}

            <div style={{ display: 'flex', gap: 16, maxWidth: 900, margin: '0 auto', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 300 }}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='{"name": "value", ...}'
                        style={{
                            width: '100%',
                            minHeight: 300,
                            padding: 14,
                            background: '#1a1a24',
                            border: '1px solid #333',
                            borderRadius: 10,
                            color: '#e0e0e0',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            resize: 'vertical',
                        }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: 300 }}>
                    <textarea
                        value={output}
                        readOnly
                        placeholder="결과가 여기에 표시됩니다"
                        style={{
                            width: '100%',
                            minHeight: 300,
                            padding: 14,
                            background: '#1a1a24',
                            border: '1px solid #333',
                            borderRadius: 10,
                            color: '#a5d6a7',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            resize: 'vertical',
                        }}
                    />
                </div>
            </div>

            <div className="compress-controls" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label style={{ color: '#888', fontSize: '0.85rem' }}>들여쓰기:</label>
                    <select
                        value={indent}
                        onChange={(e) => setIndent(Number(e.target.value))}
                        style={{ padding: '6px 10px', background: '#1a1a24', border: '1px solid #333', borderRadius: 6, color: '#fff' }}
                    >
                        <option value={2}>2칸</option>
                        <option value={4}>4칸</option>
                        <option value={1}>탭</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="compress-btn" onClick={format}>포맷</button>
                    <button className="compress-btn" style={{ background: '#666' }} onClick={minify}>압축</button>
                    <button className="compress-btn download" onClick={copy}>복사</button>
                </div>
            </div>

            <div className="compress-faq">
                <h3>자주 묻는 질문</h3>
                <details>
                    <summary>JSON이 뭔가요?</summary>
                    <p>JSON(JavaScript Object Notation)은 데이터를 저장하고 전송하는 데 사용되는 경량 형식입니다. API 응답, 설정 파일 등에 널리 사용됩니다.</p>
                </details>
                <details>
                    <summary>데이터가 서버로 전송되나요?</summary>
                    <p>아닙니다. 모든 처리는 브라우저에서 이루어집니다.</p>
                </details>
            </div>
        </section>
    );
}

export default JsonFormatter;
