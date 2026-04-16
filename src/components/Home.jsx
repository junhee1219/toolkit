import React from 'react';
import { Link } from 'react-router-dom';
import PageMeta from './PageMeta';
import './Home.css';

const tools = [
    { path: '/text_tool', name: '텍스트 도구', desc: '대소문자 변환, 찾기/바꾸기, 줄바꿈 변환', icon: '📝' },
    { path: '/image_compress', name: '이미지 압축', desc: '이미지 파일 용량 줄이기 (JPG, PNG, WebP)', icon: '🗜️' },
    { path: '/image_resize', name: '이미지 리사이즈', desc: '이미지 가로/세로 크기 변경', icon: '📐' },
    { path: '/pdf_editor', name: 'PDF 이어붙이기', desc: '여러 PDF 파일을 하나로 합치기', icon: '📄' },
    { path: '/pdf_to_jpg', name: 'PDF 이미지 변환', desc: 'PDF를 JPG 이미지로 변환', icon: '🖼️' },
    { path: '/ppt_extractor', name: 'PPT 텍스트 추출', desc: '파워포인트에서 텍스트 추출', icon: '📊' },
    { path: '/qr_generator', name: 'QR코드 생성', desc: 'URL, 텍스트를 QR코드로 변환', icon: '📱' },
    { path: '/json_formatter', name: 'JSON 포맷터', desc: 'JSON 데이터 정렬 및 압축', icon: '{ }' },
    { path: '/color_converter', name: '색상 변환', desc: 'HEX, RGB, HSL 상호 변환', icon: '🎨' },
    { path: '/password_generator', name: '비밀번호 생성', desc: '안전한 랜덤 비밀번호 생성', icon: '🔐' },
];

function Home() {
    return (
        <section className="home-container">
            <PageMeta
                title="무료 온라인 도구 모음"
                description="PDF 변환, 이미지 압축, QR코드 생성, JSON 포맷터 등 무료 온라인 도구 모음. 서버 업로드 없이 브라우저에서 처리."
            />

            <div className="home-header">
                <h1>kittly</h1>
                <p>무료 온라인 도구 모음</p>
                <p className="home-sub">모든 파일은 브라우저에서 처리됩니다. 서버에 업로드되지 않습니다.</p>
            </div>

            <div className="home-grid">
                {tools.map((tool) => (
                    <Link to={tool.path} key={tool.path} className="home-card">
                        <div className="home-card-icon">{tool.icon}</div>
                        <div className="home-card-name">{tool.name}</div>
                        <div className="home-card-desc">{tool.desc}</div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default Home;
