import React, { useState, useEffect } from 'react';
import './TextAreaSection.css';

const TextAreaSection = () => {
    const [textarea1, setTextarea1] = useState('');
    const [textarea2, setTextarea2] = useState('');
    const [counter1, setCounter1] = useState(0);
    const [counter2, setCounter2] = useState(0);
    const [replacePairs, setReplacePairs] = useState([{ find: '', replace: '' }]);
    const [buttonStates, setButtonStates] = useState({
        btn1: false,  // 대문자 변경
        btn2: false,  // 소문자 변경
        btn3: false,  // 줄바꿈 띄어쓰기
        btn5: false,  // 리스트 문자열
    });

    // 텍스트 변경 시 처리
    useEffect(() => {
        replaceText();
    }, [textarea1, replacePairs, buttonStates]);

    const replaceText = () => {
        let text = textarea1;
        replacePairs.forEach(pair => {
            if (pair.find) {
                try {
                    const regex = new RegExp(pair.find, 'gi');
                    text = text.replace(regex, pair.replace);
                } catch (e) {
                    console.error(`Invalid RegExp pattern: ${pair.find}`, e);
                }
            }
        });

        if (buttonStates.btn1) {
            text = text.toUpperCase();
        }
        if (buttonStates.btn2) {
            text = text.toLowerCase();
        }
        if (buttonStates.btn3) {
            text = text.replace(/\n/g, ' ');
        }
        if (buttonStates.btn5) {
            text = formatLines(text);
        }

        setTextarea2(text);
        setCounter1(textarea1.length);
        setCounter2(text.length);
    };

    const formatLines = (input) => {
        const lines = input.split('\n').filter(line => line.trim() !== '');
        let index = 0;
        const formattedLines = lines.map(line => {
            if (index === 0) {
                index++;
                return `'${line}'`;
            } else {
                return `, '${line}'`;
            }
        });
        return formattedLines.join('');
    };

    // 버튼 클릭 처리
    const handleButtonClick = (btnId) => {
        setButtonStates(prevState => {
            const newState = { ...prevState };
            if (btnId === 'btn1' && prevState.btn2) {
                newState.btn2 = false;
            }
            if (btnId === 'btn2' && prevState.btn1) {
                newState.btn1 = false;
            }
            newState[btnId] = !prevState[btnId];
            return newState;
        });
    };

    // 찾을/바꿀 단어 쌍 추가
    const addReplacePair = () => {
        setReplacePairs([...replacePairs, { find: '', replace: '' }]);
    };

    // 찾을/바꿀 단어 쌍 제거
    const removeReplacePair = (index) => {
        const newPairs = [...replacePairs];
        newPairs.splice(index, 1);
        setReplacePairs(newPairs);
    };

    // 찾을/바꿀 단어 쌍 변경
    const handleReplaceChange = (index, field, value) => {
        const newPairs = [...replacePairs];
        newPairs[index][field] = value;
        setReplacePairs(newPairs);
    };

    // 복사 기능
    const handleCopy = () => {
        navigator.clipboard.writeText(textarea2).then(() => {
            alert('복사되었습니다');
        }).catch(err => {
            console.error('복사 실패: ', err);
        });
    };

    return (
        <section className="main-container">
            {/* 상단 버튼 5개 */}
            <div className="top-button-bar">
                <button
                    className={`main-action-button ${buttonStates.btn1 ? 'active' : ''}`}
                    onClick={() => handleButtonClick('btn1')}
                >
                    대문자 변경
                </button>
                <button
                    className={`main-action-button ${buttonStates.btn2 ? 'active' : ''}`}
                    onClick={() => handleButtonClick('btn2')}
                >
                    소문자 변경
                </button>
                <button
                    className={`main-action-button ${buttonStates.btn3 ? 'active' : ''}`}
                    onClick={() => handleButtonClick('btn3')}
                >
                    줄바꿈 → 띄어쓰기
                </button>
                <button
                    className={`main-action-button ${buttonStates.btn5 ? 'active' : ''}`}
                    onClick={() => handleButtonClick('btn5')}
                >
                    리스트 문자열
                </button>
                <button
                    className="main-action-button copy-button"
                    onClick={handleCopy}
                >
                    복사
                </button>
            </div>

            {/* 세 부분으로 나뉜 메인 섹션 */}
            <div className="content-section">
                {/* 찾을 단어 & 바꿀 단어 추가 섹션 */}
                <div className="replace-section">
                    <div className="replace-header">
                        <label>찾을 단어 & 바꿀 단어:</label>
                        <button className="add-pair-button" onClick={addReplacePair}>+ 추가</button>
                    </div>
                    <div className="replace-container">
                        {replacePairs.map((pair, index) => (
                            <div className="replace-pair" key={index}>
                                <input
                                    type="text"
                                    className="find-word-input"
                                    placeholder="찾을 단어"
                                    value={pair.find}
                                    onChange={(e) => handleReplaceChange(index, 'find', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="replace-word-input"
                                    placeholder="바꿀 단어"
                                    value={pair.replace}
                                    onChange={(e) => handleReplaceChange(index, 'replace', e.target.value)}
                                />
                                {replacePairs.length > 1 && (
                                    <button
                                        className="remove-pair-button"
                                        onClick={() => removeReplacePair(index)}
                                    >
                                        -
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 첫 번째 텍스트 영역 */}
                <div className="textarea1-section">
                    <textarea
                        className="input-textarea"
                        value={textarea1}
                        onChange={(e) => setTextarea1(e.target.value)}
                        placeholder="입력 텍스트"
                    ></textarea>
                    <div className="counter">문자 수: {counter1}</div>
                </div>

                {/* 두 번째 텍스트 영역 */}
                <div className="textarea2-section">
                    <textarea
                        className="output-textarea"
                        value={textarea2}
                        readOnly
                        placeholder="결과 텍스트"
                    ></textarea>
                    <div className="counter">문자 수: {counter2}</div>
                </div>
            </div>
        </section>
    );

};

export default TextAreaSection;
