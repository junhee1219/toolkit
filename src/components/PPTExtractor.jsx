// src/components/PPTExtractor.jsx

import React, {useState} from 'react';
import JSZip from 'jszip';
import './PPTExtractor.css';
import FileDropZone from './FileDropZone'; // 공통 컴포넌트

const PPTExtractor = () => {
  const pptFileType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState({name: '', size: '', pageCount: 0});
  const [isUploading, setIsUploading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [extractSettings, setExtractSettings] = useState({
    slideNumbersToKeep: '',
    extractionWords: '',
    capitalYn: false,
  });

  // 파일 업로드 제출 핸들러
  const handleSubmit = async (files) => {
    setSelectedFile(files[0]);
    if (!files[0]) {
      alert('파일을 선택해주세요.');
      return;
    }
    setIsUploading(true);
    setDownloadLink('');
    try {
      const zip = new JSZip();
      const fileData = await files[0].arrayBuffer();
      const zipContent = await zip.loadAsync(fileData);

      // 슬라이드 XML 파일 추출
      const slideFiles = Object.keys(zipContent.files)
        .filter(fileName => fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml'));
      const pageCount = slideFiles.length;
      setFileInfo(prev => ({...prev, pageCount}));

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
    const {name, value, type, checked} = e.target;
    console.log(name, value, type, checked);
    console.log(setExtractSettings);
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
      const slideFiles = Object.keys(zipContent.files)
        .filter(fileName => fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml'));

      // 유지할 슬라이드 번호 목록
      const slidesToKeep = new Set();
      const slideNumList = extractSettings.slideNumbersToKeep.split(',')
      const pageCount = slideFiles.length;

      for (let i = 0; i < slideNumList.length; i++) {
        if (!slideNumList[i] || slideNumList[i].trim() === '') {
          continue;
        }
        let slideNo = parseInt(slideNumList[i].trim());
        if (isNaN(slideNo) || slideNo > pageCount || slideNo < 1) {
          alert(`전체 슬라이드 수는 ${pageCount}입니다. 유지할 슬라이드를 다시 설정해주세요.`);
          return;
        }
        slidesToKeep.add(slideNo);
      }

      const extractionWords = extractSettings.extractionWords.trim();

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFile = slideFiles[i];
        let match = slideFile.match(/ppt\/slides\/slide(\d+)\.xml/);
        if (!match) continue;
        let slideNumber = parseInt(match[1]);

        let slideContent = await zipContent.file(slideFile).async("text");

        if (slidesToKeep.has(slideNumber)) {
          continue;
        }
        let containsKeyword = false;
        if (extractionWords) {
          let searchKeyword = extractionWords;
          let contentToSearch = slideContent;
          if (!extractSettings.capitalYn) {
            searchKeyword = searchKeyword.toLowerCase();
            contentToSearch = contentToSearch.toLowerCase();
          }
          if (contentToSearch.includes(searchKeyword)) {
            containsKeyword = true;
          }
        }

        if (containsKeyword) {
          slidesToKeep.add(slideNumber);
        }

      }
      let slidesDeleted = 0;
      for (let slideFile of slideFiles) {
        let match = slideFile.match(/ppt\/slides\/slide(\d+)\.xml/);
        if (!match) continue;
        let slideNumber = parseInt(match[1]);

        if (!slidesToKeep.has(slideNumber)) {
          // Delete the slide file
          zipContent.remove(slideFile);
          slidesDeleted++;

          // Remove the slide's relationships
          let relsFileName = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
          if (zipContent.file(relsFileName)) {
            zipContent.remove(relsFileName);
          }
        }
      }
      // Update 'ppt/presentation.xml' and 'ppt/_rels/presentation.xml.rels'
      await updatePresentationRelationships(zipContent, slidesToKeep);
      // 다운로드용 Blob 생성
      const blob = await zipContent.generateAsync({type: 'blob'});
      const url = URL.createObjectURL(blob);
      alert(`슬라이드 삭제가 완료되었습니다. 총 ${slidesDeleted}개의 슬라이드가 삭제되었습니다.`);
      setDownloadLink(url);
    } catch (error) {
      console.error('PPT 추출 중 오류 발생:', error);
      alert('PPT 추출 중 오류가 발생했습니다.');
    } finally {
      setIsSplitting(false);
    }
  };

  const updatePresentationRelationships = async (pptxZip, slidesToKeep) => {
    // Read 'ppt/presentation.xml'
    let presentationXmlContent = await pptxZip.file("ppt/presentation.xml").async("text");

    // Parse the XML content
    let parser = new DOMParser();
    let presentationXmlDoc = parser.parseFromString(presentationXmlContent, "application/xml");

    // Read 'ppt/_rels/presentation.xml.rels'
    let presRelsXmlContent = await pptxZip.file("ppt/_rels/presentation.xml.rels").async("text");
    let presRelsXmlDoc = parser.parseFromString(presRelsXmlContent, "application/xml");

    // Build a map from rId to slide number
    let relationshipElems = presRelsXmlDoc.getElementsByTagName("Relationship");
    let rIdToSlideNo = {};
    for (let i = 0; i < relationshipElems.length; i++) {
      let relElem = relationshipElems[i];
      let rId = relElem.getAttribute("Id");
      let target = relElem.getAttribute("Target");
      if (target.startsWith("slides/slide")) {
        let match = target.match(/slides\/slide(\d+)\.xml/);
        if (match) {
          rIdToSlideNo[rId] = parseInt(match[1]);
        }
      }
    }

    let sldIdElems = presentationXmlDoc.getElementsByTagName("p:sldId");
    for (let i = sldIdElems.length - 1; i >= 0; i--) {
      let sldIdElem = sldIdElems[i];
      let rId = sldIdElem.getAttribute("r:id");
      let slideNo = rIdToSlideNo[rId];

      if (!slidesToKeep.has(slideNo)) {
        // Remove this sldId element
        sldIdElem.parentNode.removeChild(sldIdElem);

        // Remove the relationship from presentation.xml.rels
        for (let j = relationshipElems.length - 1; j >= 0; j--) {
          let relElem = relationshipElems[j];
          if (relElem.getAttribute("Id") === rId) {
            relElem.parentNode.removeChild(relElem);
          }
        }
      }
    }

    // Serialize the updated XML and update the files in pptxZip
    let serializer = new XMLSerializer();
    let updatedPresentationXmlContent = serializer.serializeToString(presentationXmlDoc);
    pptxZip.file("ppt/presentation.xml", updatedPresentationXmlContent);

    let updatedPresRelsXmlContent = serializer.serializeToString(presRelsXmlDoc);
    pptxZip.file("ppt/_rels/presentation.xml.rels", updatedPresRelsXmlContent);
  }

  function handleFileChange() {

  }


  return (
    <section className="main-container">

      <FileDropZone
        title="PPT 파일 업로드"
        instructions="여기에 PPT 파일을 드래그하거나 클릭하여 업로드하세요"
        accept=".pptx"
        multiple={false}
        onFilesChange={handleSubmit}
        buttonText="파일 읽기"
        buttonDisabled={isUploading || !selectedFile}
      />

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
                id="capitalYn"
                name="capitalYn"
                checked={extractSettings.capitalYn}
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
            download={fileInfo.name.split(".")[0] + "_" + extractSettings.extractionWords.trim() + ".pptx"}
          >
            다운로드
          </a>
        </section>
      )}
    </section>
  );

};

export default PPTExtractor;
