import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';

function ViewerDashboard() {
  const [stats, setStats] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (err) { console.error(err); }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => { fetchDashboard(); }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWarehouses(warehouses);
    } else {
      setFilteredWarehouses(warehouses.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.address.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, warehouses]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard');
      setStats(response.data);
      if (response.data.warehouses) {
        setWarehouses(response.data.warehouses);
        setFilteredWarehouses(response.data.warehouses);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard');
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const getWarehouseStatus = (util) => {
    if (util >= 90) return { label: 'Critical', color: 'var(--status-critical-text)', bg: 'var(--status-critical-bg)', border: 'var(--status-critical-border)' };
    if (util >= 70) return { label: 'High',     color: 'var(--status-high-text)',     bg: 'var(--status-high-bg)',     border: 'var(--status-high-border)' };
    if (util >= 40) return { label: 'Moderate', color: 'var(--status-moderate-text)', bg: 'var(--status-moderate-bg)', border: 'var(--status-moderate-border)' };
    return              { label: 'Low',      color: 'var(--status-low-text)',      bg: 'var(--status-low-bg)',      border: 'var(--status-low-border)' };
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <p style={{ color: 'var(--text-tertiary)' }}>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Segoe UI, sans-serif', flexDirection: 'column', gap: '12px' }}>
      <p style={{ color: 'var(--alert-error-text)' }}>{error}</p>
      <button onClick={fetchDashboard} style={{ padding: '8px 20px', cursor: 'pointer' }}>Retry</button>
    </div>
  );

  const utilization = stats?.warehouse_utilization?.utilization_percentage || 0;

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '32px' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Products', value: stats?.counts?.products },
            { label: 'Warehouses',     value: stats?.counts?.warehouses },
            { label: 'Locations',      value: stats?.counts?.locations },
            { label: 'Stock Items',    value: stats?.counts?.stocks },
          ].map((card) => (
            <div key={card.label} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{card.value ?? '-'}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 220px', gap: '16px' }}>
          {/* Storage Capacity Circle */}
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', alignSelf: 'flex-start', fontWeight: '600' }}>Storage Capacity</div>
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '130px', height: '130px', transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border-light)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#grad)" strokeWidth="3.5"
                  strokeDasharray={`${utilization} ${100 - utilization}`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--status-high-text)" />
                    <stop offset="100%" stopColor="var(--status-critical-text)" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{utilization}%</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>of total storage used</div>
            <div style={{ width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Full Capacity</span>
                <span style={{ fontWeight: 'bold' }}>{stats?.warehouse_utilization?.total_capacity || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Current Used</span>
                <span style={{ fontWeight: 'bold' }}>{stats?.warehouse_utilization?.total_used || 0}</span>
              </div>
            </div>
          </div>

          {/* Warehouse Table — read only */}
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: '600' }}>Warehouse Overview</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <input type="text" placeholder="🔍 Search warehouses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '13px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', zIndex: 1 }}>
                  <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                    {['Warehouse', 'Address', 'Current', 'Capacity', 'Utilization', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWarehouses.length > 0 ? filteredWarehouses.map(w => {
                    const util = w.capacity > 0 ? ((w.current_size / w.capacity) * 100).toFixed(1) : 0;
                    const status = getWarehouseStatus(util);
                    return (
                      <tr key={w.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{w.name}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.address}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{parseInt(w.current_size).toLocaleString()}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{parseInt(w.capacity).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '10px', minWidth: '60px' }}>
                              <div style={{ width: `${util}%`, height: '100%', backgroundColor: status.color, borderRadius: '10px' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', minWidth: '36px' }}>{util}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600', backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                        No warehouses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts */}
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: '600' }}>Alerts</div>
            <div style={{ padding: '16px', backgroundColor: 'var(--alert-warning-bg)', borderRadius: '8px', border: '1px solid var(--alert-warning-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--alert-warning-text)', fontWeight: '600', marginBottom: '4px' }}>Low Stock</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats?.alerts?.low_stock_products || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>products below minimum</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--alert-error-bg)', borderRadius: '8px', border: '1px solid var(--alert-error-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--alert-error-text)', fontWeight: '600', marginBottom: '4px' }}>Expiring Soon</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats?.alerts?.expiring_stock || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>items expiring in 30 days</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--alert-success-bg)', borderRadius: '8px', border: '1px solid var(--alert-success-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--alert-success-text)', fontWeight: '600', marginBottom: '4px' }}>Total Users</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats?.counts?.users || 0}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>active system users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewerDashboard;