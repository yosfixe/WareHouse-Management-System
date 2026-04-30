import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Warehouse, ClipboardList, Users, ArrowLeftRight, LogOut, Moon, Sun } from 'lucide-react';

function ViewerSideMenu({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName) => {
    const existingLink = document.getElementById('theme-stylesheet');
    if (existingLink) existingLink.remove();
    const link = document.createElement('link');
    link.id = 'theme-stylesheet';
    link.rel = 'stylesheet';
    link.href = `/themes/${themeName}-theme.css`;
    document.head.appendChild(link);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const menuItems = [
    { label: 'Dashboard',       icon: LayoutDashboard,  path: '/viewer/dashboard' },
    { label: 'Products',        icon: Package,          path: '/viewer/products' },
    { label: 'Warehouses',      icon: Warehouse,        path: '/viewer/warehouses' },
    { label: 'Stocks',          icon: ClipboardList,    path: '/viewer/stocks' },
    { label: 'Stock Movements', icon: ArrowLeftRight,   path: '/viewer/stockmovements' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
          backgroundColor: 'var(--sidebar-bg)',
          boxShadow: '4px 0 24px var(--card-shadow)',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          animation: 'slideInLeft 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>WMS Viewer</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ×
          </button>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                style={{
                  width: '100%', padding: '12px 16px', marginBottom: '8px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', textAlign: 'left',
                }}
                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-bg)'; }}
                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Theme Toggle */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '100%', padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: 'transparent', color: 'var(--sidebar-text)',
              border: '1px solid var(--sidebar-border)', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-bg)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
          </button>
        </div>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '12px',
              backgroundColor: 'transparent', color: 'var(--sidebar-text)',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '500', transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-bg)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}

export default ViewerSideMenu;