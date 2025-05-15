import React from 'react';

const Header = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '50px',
        backgroundColor: '#000000',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* Left-aligned Brand */}
      <div
        style={{
          fontWeight: '700',
          fontSize: '1.5rem',
          letterSpacing: '0.5px',
        }}
      >
        EsyPharma
      </div>

      {/* Right-aligned Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
        }}
      >
        <div
          style={{
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Login
        </div>
        <div
          style={{
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Logout
        </div>
      </div>
    </div>
  );
};

export default Header;
