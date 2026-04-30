import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function ViewerWarehouse() {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  useEffect(() => { fetchWarehouses(); }, []);

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

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
      setFilteredWarehouses(response.data);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
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

  const totalCapacity = warehouses.reduce((sum, w) => sum + parseInt(w.capacity || 0), 0);
  const totalUsed     = warehouses.reduce((sum, w) => sum + parseInt(w.current_size || 0), 0);
  const avgUtil       = warehouses.length > 0 ? ((totalUsed / totalCapacity) * 100).toFixed(1) : 0;

  if (loading) return (
    <div><Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading warehouses...</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Warehouses</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Browse warehouse locations and utilization</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Warehouses', value: warehouses.length },
            { label: 'Total Capacity',   value: totalCapacity.toLocaleString() },
            { label: 'Total Used',       value: totalUsed.toLocaleString() },
            { label: 'Avg Utilization',  value: `${avgUtil}%` },
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
          <div style={{ marginBottom: '20px' }}>
            <input type="text" placeholder="🔍 Search warehouses by name or address..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  {['Warehouse', 'Address', 'Capacity', 'Used', 'Utilization', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.length > 0 ? filteredWarehouses.map(w => {
                  const util = w.capacity > 0 ? ((w.current_size / w.capacity) * 100).toFixed(1) : 0;
                  const status = getWarehouseStatus(util);
                  return (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{w.name}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.address}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{parseInt(w.capacity).toLocaleString()}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{parseInt(w.current_size).toLocaleString()}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '10px', minWidth: '60px' }}>
                            <div style={{ width: `${util}%`, height: '100%', backgroundColor: status.color, borderRadius: '10px' }} />
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', minWidth: '36px' }}>{util}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600', backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <button onClick={() => { setSelectedWarehouse(w); setShowDetailsModal(true); }}
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
                    <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>No warehouses found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedWarehouse && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Warehouse Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            {(() => {
              const util = selectedWarehouse.capacity > 0 ? ((selectedWarehouse.current_size / selectedWarehouse.capacity) * 100).toFixed(1) : 0;
              const status = getWarehouseStatus(util);
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'ID',             value: `#${selectedWarehouse.id}` },
                    { label: 'Status',         value: status.label, badge: status },
                    { label: 'Name',           value: selectedWarehouse.name, full: true },
                    { label: 'Address',        value: selectedWarehouse.address, full: true },
                    { label: 'Capacity',       value: parseInt(selectedWarehouse.capacity).toLocaleString() },
                    { label: 'Current Size',   value: parseInt(selectedWarehouse.current_size).toLocaleString() },
                    { label: 'Available',      value: (selectedWarehouse.capacity - selectedWarehouse.current_size).toLocaleString() },
                    { label: 'Utilization',    value: `${util}%` },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: item.full ? '1 / -1' : 'auto' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{item.label}</div>
                      {item.badge ? (
                        <span style={{ padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', backgroundColor: item.badge.bg, color: item.badge.color, border: `1px solid ${item.badge.border}` }}>
                          {item.value}
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

export default ViewerWarehouse;