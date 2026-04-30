import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', truck_id: '' });

  useEffect(() => { fetchDrivers(); fetchTrucks(); }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDrivers(drivers);
    } else {
      setFilteredDrivers(drivers.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.truck?.plate?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, drivers]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drivers');
      setDrivers(response.data);
      setFilteredDrivers(response.data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await api.get('/trucks');
      setTrucks(response.data);
    } catch (err) {
      console.error('Error fetching trucks:', err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, truck_id: formData.truck_id || null };
      if (modalMode === 'add') {
        await api.post('/drivers', payload);
      } else {
        await api.put(`/drivers/${selectedDriver.id}`, payload);
      }
      setShowModal(false);
      fetchDrivers();
      fetchTrucks(); // refresh truck statuses
    } catch (err) {
      alert('Failed to save driver: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/drivers/${selectedDriver.id}`);
      setShowDeleteModal(false);
      fetchDrivers();
      fetchTrucks();
    } catch (err) {
      alert('Failed to delete driver: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    return status === 'On Duty'
      ? { bg: 'var(--alert-success-bg)', color: 'var(--alert-success-text)', border: 'var(--alert-success-border)' }
      : { bg: 'var(--bg-tertiary)',      color: 'var(--text-secondary)',     border: 'var(--border-secondary)' };
  };

  const btnSecondary = { padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' };
  const btnPrimary   = { padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
  const inputStyle   = { width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' };
  const labelStyle   = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' };

  if (loading) return (
    <div><Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading drivers...</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Drivers</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Manage delivery drivers and truck assignments</p>
          </div>
          <button onClick={() => { setModalMode('add'); setFormData({ name: '', phone: '', truck_id: '' }); setShowModal(true); }}
            style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; e.currentTarget.style.color = 'var(--btn-hover-text)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; e.currentTarget.style.color = 'var(--btn-secondary-text)'; }}>
            + Add Driver
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Drivers', value: drivers.length },
            { label: 'On Duty',       value: drivers.filter(d => d.status === 'On Duty').length },
            { label: 'Standby',       value: drivers.filter(d => d.status === 'Standby').length },
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
          <div style={{ marginBottom: '20px' }}>
            <input type="text" placeholder="🔍 Search by name, phone, or truck plate..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  {['Name', 'Phone', 'Assigned Truck', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.length > 0 ? filteredDrivers.map(driver => {
                  const badge = getStatusBadge(driver.status);
                  return (
                    <tr key={driver.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{driver.name}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{driver.phone}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {driver.truck ? `${driver.truck.plate} — ${driver.truck.model}` : '—'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600', backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {driver.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['Details', 'Edit', 'Delete'].map(action => (
                            <button key={action}
                              onClick={() => {
                                if (action === 'Details') { setSelectedDriver(driver); setShowDetailsModal(true); }
                                else if (action === 'Edit') { setModalMode('edit'); setSelectedDriver(driver); setFormData({ name: driver.name, phone: driver.phone, truck_id: driver.truck_id || '' }); setShowModal(true); }
                                else { setSelectedDriver(driver); setShowDeleteModal(true); }
                              }}
                              style={{ padding: '6px 12px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; e.currentTarget.style.color = 'var(--btn-hover-text)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; e.currentTarget.style.color = 'var(--btn-secondary-text)'; }}>
                              {action}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧑‍✈️</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {searchTerm ? 'No drivers found' : 'No drivers yet'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>{modalMode === 'add' ? '+ Add Driver' : 'Edit Driver'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder="e.g. John Smith" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Phone *</label>
                <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} placeholder="e.g. +212 6XX XXX XXX" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Assign Truck</label>
                <select value={formData.truck_id} onChange={(e) => setFormData({ ...formData, truck_id: e.target.value })} style={inputStyle}>
                  <option value="">No truck (Standby)</option>
                  {trucks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.plate} — {t.model} {t.status === 'In Use' && t.driver?.id !== selectedDriver?.id ? '(currently assigned)' : ''}
                    </option>
                  ))}
                </select>
                {formData.truck_id && trucks.find(t => t.id == formData.truck_id)?.status === 'In Use' && trucks.find(t => t.id == formData.truck_id)?.driver?.id !== selectedDriver?.id && (
                  <div style={{ fontSize: '12px', color: 'var(--alert-warning-text)', marginTop: '6px' }}>
                    ⚠️ This truck already has a driver — they will be unassigned automatically.
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" style={btnPrimary}>{modalMode === 'add' ? 'Add Driver' : 'Update Driver'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '20px', color: 'var(--text-primary)' }}>⚠️ Confirm Delete</h3>
            <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Are you sure you want to delete driver <strong>{selectedDriver?.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={btnPrimary}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDriver && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Driver Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { label: 'Driver ID', value: `#${selectedDriver.id}` },
                { label: 'Status',    value: selectedDriver.status, badge: getStatusBadge(selectedDriver.status) },
                { label: 'Name',      value: selectedDriver.name, full: true },
                { label: 'Phone',     value: selectedDriver.phone },
                { label: 'Truck',     value: selectedDriver.truck ? `${selectedDriver.truck.plate} — ${selectedDriver.truck.model}` : '—' },
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
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailsModal(false)} style={btnPrimary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDrivers;