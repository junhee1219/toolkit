import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

function Inquiry() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    const templateParams = {
      subject,
      message,
    };

    try {
      await emailjs.send(
        'service_quat20f',         // ✅ Service ID
        'template_ay68ymh',        // ✅ Template ID
        templateParams,
        'heDp5XsplXGpRWaNn'        // ✅ Public Key
      );
      alert('메일이 성공적으로 전송되었습니다.');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return  (
    <form onSubmit={handleSubmit} style={{
      width: '60rem',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      color: '#fff'
    }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        문의나 제안은 항상 환영합니다!!
      </h2>

      <input
        type="text"
        placeholder="제목"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        style={{
          width: '100%',
          maxWidth: '50rem',
          marginBottom: '1rem',
          padding: '0.8rem',
          borderRadius: '6px',
          border: '1px solid #444',
          backgroundColor: '#1a1a1a',
          color: '#fff'
        }}
      />

      <textarea
        placeholder="내용"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={15}
        style={{
          width: '100%',
          maxWidth: '50rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid #444',
          backgroundColor: '#1a1a1a',
          color: '#fff',
          lineHeight: 1.5,
          resize: 'vertical'
        }}
      />

      <button
        type="submit"
        disabled={isSending}
        style={{
          padding: '0.8rem 2rem',
          fontSize: '1rem',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          opacity: isSending ? 0.6 : 1
        }}
      >
        {isSending ? '전송 중...' : '메일 보내기'}
      </button>
    </form>
  );
}

export default Inquiry;
