import React, { useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
} from 'reactstrap';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  
  return (
    <Navbar 
      dark 
      expand="md" 
      fixed="top"
      style={{
        backgroundColor: '#2c3e50',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '0.5rem 2rem', // Reduced padding
        zIndex: 1100,
        height: '50px', // Reduced height
        alignItems: 'center' // Ensure all items align vertically
      }}
    >
      {/* Left-aligned PharmacyShop - now inline with other elements */}
      <NavbarBrand 
        style={{
          fontWeight: '700',
          fontSize: '1.5rem', // Slightly smaller font
          color: 'white',
          cursor: 'default',
          marginRight: 'auto',
          letterSpacing: '0.5px',
          padding: '0', // Remove padding
          lineHeight: '1' // Tighten line height
        }}
      >
        PharmacyShop
      </NavbarBrand>

      {/* Navigation items - now inline with brand */}
      <div 
        style={{
          display: 'flex',
          gap: '2rem', // Reduced gap
          alignItems: 'center',
          height: '100%'
        }}
      >
        <div 
          className="nav-item"
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '600',
            fontSize: '1rem', // Smaller font
            cursor: 'default',
            padding: '0',
            borderBottom: '2px solid transparent',
            transition: 'all 0.3s ease',
            lineHeight: '1'
          }}
        >
          Medicines
        </div>
        <div 
          className="nav-item"
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '600',
            fontSize: '1rem', // Smaller font
            cursor: 'default',
            padding: '0',
            borderBottom: '2px solid transparent',
            transition: 'all 3s ease',
            lineHeight: '1'
          }}
        >
          Dashboard
        </div>
      </div>
    </Navbar>
  );
};

export default Header;