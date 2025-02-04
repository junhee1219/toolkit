import React, { useRef, useState } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import './FileDropZone.css';

/**
 * @param {string} title           섹션 제목 (예: "PDF 파일 업로드")
 * @param {string} instructions    드래그앤드롭 안내 문구
 * @param {string} accept          input accept 값
 * @param {boolean} multiple       여러 파일 업로드 여부
 * @param {(files: FileList) => void} onFilesChange  파일 처리 콜백
 * @param {string} buttonLabel     버튼 텍스트
 * @param {() => void} onButtonClick 버튼 클릭 핸들러
 * @param {boolean} buttonDisabled 버튼 disabled
 */
function FileDropZone({
    title,
    instructions,
    accept,
    multiple = false,
    onFilesChange,
    buttonLabel,
    onButtonClick,
    buttonDisabled
}) {
    const fileInputRef = useRef(null);
    const [isDropped, setIsDropped] = useState(false);
    const [fileCount, setFileCount] = useState(0);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { files } = e.dataTransfer;
        handleFiles(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // 클릭 시 drop zone을 리셋해 다시 드래그 가능하도록 함
    const handleClick = () => {
        setIsDropped(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleFiles = (files) => {
        if (!files || files.length === 0) return;
        // 기존 파일 개수에 누적
        setFileCount(prev => prev + files.length);
        setIsDropped(true);
        onFilesChange(files);
    };

    const handleInputChange = (e) => {
        handleFiles(e.target.files);
    };

    return (
        <section className="upload-section">
            {title && <h2>{title}</h2>}
            <div
                className={`drop-zone ${isDropped ? 'dropped' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleClick}
            >
                {!isDropped && <p className="drop-instructions">{instructions}</p>}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept={accept}
                    multiple={multiple}
                    onChange={handleInputChange}
                    disabled={buttonDisabled}
                />
                {fileCount > 0 && (
                    <div className="file-info">
                        <FaFileAlt className="file-icon" />
                        <p>{`불러온 파일 개수: ${fileCount}`}</p>
                    </div>
                )}
            </div>
            {buttonLabel && onButtonClick && (
                <div className="button-container">
                    <button
                        type="button"
                        className="action-button"
                        onClick={onButtonClick}
                        disabled={buttonDisabled}
                    >
                        {buttonLabel}
                    </button>
                </div>
            )}
        </section>
    );
}

export default FileDropZone;
