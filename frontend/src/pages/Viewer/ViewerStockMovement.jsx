import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function ViewerStockMovement() {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const MOVEMENT_TYPES = ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'];

  const getTypeBadge = (type) => {
    switch (type) {
      case 'IN':         return { bg: 'var(--alert-success-bg)', color: 'var(--alert-success-text)', border: 'var(--alert-success-border)' };
      case 'OUT':        return { bg: 'var(--alert-error-bg)',   color: 'var(--alert-error-text)',   border: 'var(--alert-error-border)' };
      case 'TRANSFER':   return { bg: 'var(--alert-info-bg)',    color: 'var(--alert-info-text)',    border: 'var(--alert-info-border)' };
      case 'ADJUSTMENT': return { bg: 'var(--bg-tertiary)',      color: 'var(--text-secondary)',     border: 'var(--border-secondary)' };
      default:           return { bg: 'var(--bg-tertiary)',      color: 'var(--text-secondary)',     border: 'var(--border-secondary)' };
    }
  };

  useEffect(() => { fetchMovements(); }, []);

  useEffect(() => {
    let filtered = movements;
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(m =>
        m.stock?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.stock?.location?.warehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter.length > 0) {
      filtered = filtered.filter(m => typeFilter.includes(m.movement_type));
    }
    setFilteredMovements(filtered);
  }, [searchTerm, typeFilter, movements]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stocks/movements');
      setMovements(response.data);
      setFilteredMovements(response.data);
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeToggle = (type) => {
    setTypeFilter(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  if (loading) return (
    <div><Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading movements...</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Stock Movements</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>View stock movement history</p>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {MOVEMENT_TYPES.map(type => {
            const badge = getTypeBadge(type);
            return (
              <div key={type} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{type}</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: badge.color }}>
                  {movements.filter(m => m.movement_type === type).length}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <input type="text" placeholder="🔍 Search by product, user, reason, or warehouse..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '500' }}>Type:</span>
              {MOVEMENT_TYPES.map(type => {
                const isActive = typeFilter.includes(type);
                const badge = getTypeBadge(type);
                return (
                  <button key={type} onClick={() => handleTypeToggle(type)}
                    style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: `1px solid ${isActive ? badge.border : 'var(--btn-secondary-border)'}`, backgroundColor: isActive ? badge.bg : 'var(--btn-secondary-bg)', color: isActive ? badge.color : 'var(--btn-secondary-text)', transition: 'all 0.2s' }}>
                    {type}
                  </button>
                );
              })}
              {typeFilter.length > 0 && (
                <button onClick={() => setTypeFilter([])}
                  style={{ padding: '6px 10px', borderRadius: '50px', fontSize: '12px', cursor: 'pointer', border: '1px solid var(--btn-secondary-border)', backgroundColor: 'transparent', color: 'var(--text-tertiary)' }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  {['#', 'Type', 'Product', 'Qty', 'From', 'To', 'User', 'Reason', 'Timestamp', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length > 0 ? filteredMovements.map(m => {
                  const badge = getTypeBadge(m.movement_type);
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>#{m.id}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600', backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {m.movement_type}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{m.stock?.product?.name || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{m.quantity}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.fromLocation ? `${m.fromLocation.code} (${m.fromLocation.warehouse?.name})` : '—'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.toLocation ? `${m.toLocation.code} (${m.toLocation.warehouse?.name})` : '—'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.user?.fullname || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.reason || '—'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                        {m.timestamp ? new Date(m.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <button onClick={() => { setSelectedMovement(m); setShowDetailsModal(true); }}
                          style={{ padding: '6px 12px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; e.currentTarget.style.color = 'var(--btn-hover-text)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; e.currentTarget.style.color = 'var(--btn-secondary-text)'; }}>
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={10} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {searchTerm || typeFilter.length > 0 ? 'No movements found' : 'No movements yet'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedMovement && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Movement Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            {(() => {
              const badge = getTypeBadge(selectedMovement.movement_type);
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Movement ID', value: `#${selectedMovement.id}` },
                    { label: 'Quantity',    value: selectedMovement.quantity },
                    { label: 'Product',     value: selectedMovement.stock?.product?.name || 'N/A', full: true },
                    { label: 'User',        value: selectedMovement.user?.fullname || 'N/A' },
                    { label: 'From',        value: selectedMovement.fromLocation ? `${selectedMovement.fromLocation.code} (${selectedMovement.fromLocation.warehouse?.name})` : '—' },
                    { label: 'To',          value: selectedMovement.toLocation ? `${selectedMovement.toLocation.code} (${selectedMovement.toLocation.warehouse?.name})` : '—' },
                    { label: 'Reason',      value: selectedMovement.reason || '—', full: true },
                    { label: 'Timestamp',   value: selectedMovement.timestamp ? new Date(selectedMovement.timestamp).toLocaleString() : 'N/A', full: true },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: item.full ? '1 / -1' : 'auto' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{item.label}</div>
                      {item.label === 'Type' ? (
                        <span style={{ padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {selectedMovement.movement_type}
                        </span>
                      ) : (
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.value}</div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailsModal(false)} style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewerStockMovement;