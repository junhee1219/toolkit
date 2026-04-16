import React from 'react';
import {NavLink} from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header>
      <nav className="nav-button-container">
        <NavLink
          to="/"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
          end
        >
          텍스트 도구
        </NavLink>
        <NavLink
          to="/ppt_extractor"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          PPT 추출
        </NavLink>
        <NavLink
          to="/pdf_editor"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          PDF 이어붙이기
        </NavLink>
        <NavLink
          to="/pdf_to_jpg"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          PDF 이미지 변환
        </NavLink>
        <NavLink
          to="/image_compress"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          이미지 압축
        </NavLink>
        <NavLink
          to="/image_resize"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          이미지 리사이즈
        </NavLink>
        <NavLink
          to="/qr_generator"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          QR코드
        </NavLink>
        <NavLink
          to="/json_formatter"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          JSON 포맷터
        </NavLink>
        <NavLink
          to="/color_converter"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          색상 변환
        </NavLink>
        <NavLink
          to="/password_generator"
          className={({isActive}) =>
            isActive ? 'action-button selected' : 'action-button'
          }
        >
          비밀번호
        </NavLink>
        {/*<NavLink*/}
        {/*    to="/folder_list_to_excel"*/}
        {/*    className={({ isActive }) =>*/}
        {/*        isActive ? 'action-button new selected' : 'action-button new'*/}
        {/*    }*/}
        {/*>*/}
        {/*    폴더트리 정리*/}
        {/*</NavLink>*/}
        <NavLink
          to="/inquiry"
          className={({isActive}) =>
            isActive ? 'action-button inquiry-button selected' : 'action-button inquiry-button'
          }
        >
          문의/제안하기
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
