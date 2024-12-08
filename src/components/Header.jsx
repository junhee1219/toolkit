import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header>
            <nav className="button-container">
                <Link to="/ppt_extractor" className="action-button">PPT 추출</Link>
                <Link to="/pdf_editor" className="action-button">PDF 이어붙이기</Link>
                <Link to="/pdf_to_jpg" className="action-button">PDF 이미지 변환</Link>
                <Link to="/folder_list_to_excel" className="action-button new">폴더트리 정리</Link>
                <Link to="/inquiry" className="action-button inquiry-button">문의/제안하기</Link>
            </nav>
        </header>
    );
};

export default Header;
