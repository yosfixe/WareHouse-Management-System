import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdminSideMenu from './Menus/AdminSideMenu';
import ViewerSideMenu from './Menus/ViewerSideMenu';
import OperatorSideMenu from './Menus/OperatorSideMenu';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roleName = user?.role?.name;

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (err) { console.error(err); }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderSideMenu = () => {
    if (roleName === 'Viewer') {
      return <ViewerSideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />;
    }
    if (roleName?.startsWith('Operator-')) {
      return <OperatorSideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />;
    }
    return <AdminSideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />;
  };

  return (
    <>
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-primary)', fontFamily: 'Segoe UI, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'end', gap: '16px' }}>
          <button onClick={() => setMenuOpen(true)}
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-primary)', backgroundColor: 'var(--btn-secondary-bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; }}>
            <span style={{ display: 'block', width: '16px', height: '2px', backgroundColor: 'var(--text-primary)', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '16px', height: '2px', backgroundColor: 'var(--text-primary)', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '16px', height: '2px', backgroundColor: 'var(--text-primary)', borderRadius: '2px' }} />
          </button>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary)' }}>{user?.fullname}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{roleName}</div>
          </div>

          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {user?.fullname?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      {renderSideMenu()}
    </>
  );
}

export default Header;