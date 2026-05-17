import React, {useState, useEffect} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import './Header.css';

const NAV_ITEMS = [
  {to: '/', label: '홈', end: true},
  {to: '/text_tool', label: '텍스트 도구'},
  {to: '/ppt_extractor', label: 'PPT 추출'},
  {to: '/pdf_editor', label: 'PDF 이어붙이기'},
  {to: '/pdf_to_jpg', label: 'PDF 이미지 변환'},
  {to: '/image_compress', label: '이미지 압축'},
  {to: '/image_resize', label: '이미지 리사이즈'},
  {to: '/qr_generator', label: 'QR코드'},
  {to: '/json_formatter', label: 'JSON 포맷터'},
  {to: '/color_converter', label: '색상 변환'},
  {to: '/password_generator', label: '비밀번호'},
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const close = () => setMenuOpen(false);

  return (
    <header>
      <div className="header-bar">
        <NavLink to="/" className="header-brand" end onClick={close}>
          kittly
        </NavLink>
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          aria-label="메뉴 열기"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span/>
          <span/>
          <span/>
        </button>
        <nav className={`nav-button-container ${menuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map(({to, label, end}) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({isActive}) =>
                isActive ? 'action-button selected' : 'action-button'
              }
              onClick={close}
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/inquiry"
            className={({isActive}) =>
              isActive
                ? 'action-button inquiry-button selected'
                : 'action-button inquiry-button'
            }
            onClick={close}
          >
            문의/제안하기
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
