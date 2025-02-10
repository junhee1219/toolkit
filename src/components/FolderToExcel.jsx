import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import FileDropZone from './FileDropZone';
import './FolderToExcel.css';

const FolderToExcel = () => {
  const [treeData, setTreeData] = useState({});
  const [flattenData, setFlattenData] = useState([]);

  const handleFilesChange = (files) => {
    const fileArray = Array.from(files);
    const paths = fileArray.map((file) => file.webkitRelativePath);
    const tree = buildTree(paths);
    setTreeData(tree);
    setFlattenData(flattenTree(tree));
  };

  const buildTree = (paths) => {
    const root = {};
    paths.forEach((path) => {
      const parts = path.split('/');
      let current = root;
      parts.forEach((part) => {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      });
    });
    return root;
  };

  const flattenTree = (node, path = [], result = []) => {
    Object.keys(node).forEach((key) => {
      const currentPath = [...path, key];
      result.push({ path: currentPath.join('/') });
      flattenTree(node[key], currentPath, result);
    });
    return result;
  };

  const exportToExcel = () => {
    const wsData = flattenData.map((item) => [item.path]);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '폴더구조');
    XLSX.writeFile(wb, '폴더구조.xlsx');
  };

  const renderTree = (node) =>
    Object.entries(node).map(([key, value]) => {
      const isFolder = Object.keys(value).length > 0;
      return (
        <li key={key} className={isFolder ? 'folder' : 'file'}>
          {key}
          {isFolder && <ul>{renderTree(value)}</ul>}
        </li>
      );
    });

  return (
    <div className="folder-to-excel">
      <h1>폴더 트리 내보내기</h1>
      <FileDropZone
        title="폴더 선택"
        instructions="폴더를 드래그앤드롭하거나 클릭하여 선택하세요."
        accept="*/*"
        multiple={true}
        onFilesChange={handleFilesChange}
        buttonLabel=""
        onButtonClick={() => {}}
        buttonDisabled={false}
      />
      {Object.keys(treeData).length > 0 && (
        <>
          <ul id="fileList">{renderTree(treeData)}</ul>
          <button id="exportBtn" className="action-button" onClick={exportToExcel}>
            엑셀로 내보내기
          </button>
        </>
      )}
    </div>
  );
};

export default FolderToExcel;
