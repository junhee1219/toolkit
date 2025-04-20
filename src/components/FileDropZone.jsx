import React, {useRef, useState} from 'react';
import {FaFileAlt} from 'react-icons/fa'; // 선택사항
import './FileDropZone.css'; // 아래 예시 CSS


function FileDropZone({
                        title,
                        instructions,
                        accept,
                        multiple = false,
                        onFilesChange,
                        buttonText,
                        buttonDisabled,
                        buttonCilckHandler
                      }) {
  const fileInputRef = useRef(null);
  const [isDropped, setIsDropped] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  // 드래그 & 드롭
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const {files} = e.dataTransfer;
    handleFiles(files);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 파일 input 클릭
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // 매번 파일 선택 가능하도록 초기화
      fileInputRef.current.click();
    }
  };

  // 실제 파일 처리 (공통)
  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    setFileCount(files.length);
    setIsDropped(true);
    // 부모 콜백
    onFilesChange(files);
  };

  // input change
  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  return (
    <section className="upload-section">
      <h2>{title}</h2>
      <div
        className={`drop-zone ${isDropped ? 'dropped' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        {!isDropped && (
          <p className="drop-instructions">{instructions}</p>
        )}
        <input
          type="file"
          ref={fileInputRef}
          style={{display: 'none'}}
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
        />
        {fileCount > 0 && (
          <div className="file-info">
            <FaFileAlt className="file-icon"/>
            <p>{`불러온 파일 개수: ${fileCount}`}</p>
          </div>
        )}
      </div>
      <div className="button-container">
        <button className="action-button" disabled={buttonDisabled} onClick={buttonCilckHandler}>
          {buttonText}
        </button>
      </div>
    </section>
  );
}

export default FileDropZone;
