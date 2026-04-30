import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function AdminTrucks() {
  const [trucks, setTrucks] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [formData, setFormData] = useState({ plate: '', model: '', capacity: '' });

  useEffect(() => { fetchTrucks(); }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTrucks(trucks);
    } else {
      setFilteredTrucks(trucks.filter(t =>
        t.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.model.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, trucks]);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trucks');
      setTrucks(response.data);
      setFilteredTrucks(response.data);
    } catch (err) {
      console.error('Error fetching trucks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/trucks', formData);
      } else {
        await api.put(`/trucks/${selectedTruck.id}`, formData);
      }
      setShowModal(false);
      fetchTrucks();
    } catch (err) {
      alert('Failed to save truck: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/trucks/${selectedTruck.id}`);
      setShowDeleteModal(false);
      fetchTrucks();
    } catch (err) {
      alert('Failed to delete truck: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    return status === 'In Use'
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
        <p style={{ color: 'var(--text-tertiary)' }}>Loading trucks...</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Trucks</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Manage delivery trucks</p>
          </div>
          <button onClick={() => { setModalMode('add'); setFormData({ plate: '', model: '', capacity: '' }); setShowModal(true); }}
            style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; e.currentTarget.style.color = 'var(--btn-hover-text)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; e.currentTarget.style.color = 'var(--btn-secondary-text)'; }}>
            + Add Truck
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Trucks',  value: trucks.length },
            { label: 'In Use',        value: trucks.filter(t => t.status === 'In Use').length },
            { label: 'Standby',       value: trucks.filter(t => t.status === 'Standby').length },
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
          <div style={{ marginBottom: '20px' }}>
            <input type="text" placeholder="🔍 Search by plate or model..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  {['Plate', 'Model', 'Capacity', 'Assigned Driver', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTrucks.length > 0 ? filteredTrucks.map(truck => {
                  const badge = getStatusBadge(truck.status);
                  return (
                    <tr key={truck.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{truck.plate}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{truck.model}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{truck.capacity} kg</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{truck.driver?.name || '—'}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600', backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {truck.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['Details', 'Edit', 'Delete'].map(action => (
                            <button key={action}
                              onClick={() => {
                                if (action === 'Details') { setSelectedTruck(truck); setShowDetailsModal(true); }
                                else if (action === 'Edit') { setModalMode('edit'); setSelectedTruck(truck); setFormData({ plate: truck.plate, model: truck.model, capacity: truck.capacity }); setShowModal(true); }
                                else { setSelectedTruck(truck); setShowDeleteModal(true); }
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
                    <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {searchTerm ? 'No trucks found' : 'No trucks yet'}
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
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>{modalMode === 'add' ? '+ Add Truck' : 'Edit Truck'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Plate Number *</label>
                <input type="text" required value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} style={inputStyle} placeholder="e.g. ABC-1234" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Model *</label>
                <input type="text" required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={inputStyle} placeholder="e.g. Mercedes Actros" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Capacity (kg) *</label>
                <input type="number" required min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} style={inputStyle} placeholder="e.g. 5000" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" style={btnPrimary}>{modalMode === 'add' ? 'Add Truck' : 'Update Truck'}</button>
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
              Are you sure you want to delete truck <strong>{selectedTruck?.plate}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={btnPrimary}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedTruck && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Truck Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { label: 'Truck ID',        value: `#${selectedTruck.id}` },
                { label: 'Status',          value: selectedTruck.status, badge: getStatusBadge(selectedTruck.status) },
                { label: 'Plate',           value: selectedTruck.plate },
                { label: 'Model',           value: selectedTruck.model },
                { label: 'Capacity',        value: `${selectedTruck.capacity} kg` },
                { label: 'Assigned Driver', value: selectedTruck.driver?.name || '—' },
              ].map(item => (
                <div key={item.label} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
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

export default AdminTrucks;