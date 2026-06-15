'use client';

import React, { useState, useEffect } from 'react';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Client-side authentication check
    const auth = localStorage.getItem('ptex_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('ptex_auth', 'true');
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Mật khẩu không chính xác');
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent layout shifts during SSR / Initial load
  if (isAuthenticated === null) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999999
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid rgba(59, 130, 246, 0.15)',
          borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Render Premium Password Lock Screen
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'radial-gradient(circle at center, #0f172a, #020617)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px',
        padding: '3.5rem 2.5rem', width: '90%', maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center'
      }}>
        {/* Logo/Icon */}
        <div style={{
          fontSize: '3.5rem', marginBottom: '1.25rem', filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.35))'
        }}>
          📐
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.025em',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa, #f472b6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem', lineHeight: 1.2
        }}>
          PTex Mô Phỏng Toán
        </h1>

        <p style={{
          fontSize: '0.875rem', color: '#94a3b8', marginBottom: '2.5rem', fontWeight: 500
        }}>
          Ths. Võ Thanh Phong · Trang cá nhân
        </p>

        {/* Password Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            type="password"
            placeholder="Nhập mật khẩu truy cập"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%', background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px',
              padding: '0.875rem 1rem', fontSize: '1rem', color: '#ffffff',
              outline: 'none', textAlign: 'center', transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
          />

          {/* Error Message */}
          <div style={{
            color: '#f87171', fontSize: '0.85rem', marginTop: '0.75rem',
            minHeight: '1.25rem', fontWeight: '500'
          }}>
            {error}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', marginTop: '1rem',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none', borderRadius: '12px', padding: '0.875rem',
              fontSize: '1rem', fontWeight: '700', color: '#ffffff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            {isLoading ? 'Đang xác minh...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
