import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function AdminWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    current_size: ''
  });

  useEffect(() => { fetchWarehouses(); }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWarehouses(warehouses);
    } else {
      const filtered = warehouses.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWarehouses(filtered);
    }
    setSelectedWarehouses([]);
    setSelectAll(false);
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWarehouses([]);
      setSelectAll(false);
    } else {
      setSelectedWarehouses(filteredWarehouses.map(w => w.id));
      setSelectAll(true);
    }
  };

  const handleSelectWarehouse = (warehouseId) => {
    if (selectedWarehouses.includes(warehouseId)) {
      setSelectedWarehouses(selectedWarehouses.filter(id => id !== warehouseId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedWarehouses, warehouseId];
      setSelectedWarehouses(newSelected);
      if (newSelected.length === filteredWarehouses.length) setSelectAll(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedWarehouses.length === 0) { alert('Please select warehouses to delete'); return; }
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await Promise.all(selectedWarehouses.map(id => api.delete(`/warehouses/${id}`)));
      setShowBulkDeleteModal(false);
      setSelectedWarehouses([]);
      setSelectAll(false);
      fetchWarehouses();
    } catch (err) {
      console.error('Error deleting warehouses:', err);
      alert('Failed to delete some warehouses');
    }
  };

  const handleAddWarehouse = () => {
    setModalMode('add');
    // current_size intentionally omitted — backend defaults to '0'
    setFormData({ name: '', address: '', capacity: '' });
    setShowModal(true);
  };

  const handleEditWarehouse = (warehouse) => {
    setModalMode('edit');
    setSelectedWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      address: warehouse.address,
      capacity: warehouse.capacity,
      current_size: warehouse.current_size
    });
    setShowModal(true);
  };

  const handleDeleteClick = (warehouse) => {
    setDeleteWarehouseId(warehouse.id);
    setSelectedWarehouse(warehouse);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetailsModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/warehouses', formData);
      } else {
        await api.put(`/warehouses/${selectedWarehouse.id}`, formData);
      }
      setShowModal(false);
      fetchWarehouses();
    } catch (err) {
      console.error('Error saving warehouse:', err);
      alert('Failed to save warehouse: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/warehouses/${deleteWarehouseId}`);
      setShowDeleteModal(false);
      fetchWarehouses();
    } catch (err) {
      console.error('Error deleting warehouse:', err);
      alert('Failed to delete warehouse: ' + (err.response?.data?.message || err.message));
    }
  };

  const getWarehouseStatus = (util) => {
    if (util >= 90) return { label: 'Critical', color: 'var(--status-critical-text)', bg: 'var(--status-critical-bg)', border: 'var(--status-critical-border)' };
    if (util >= 70) return { label: 'High', color: 'var(--status-high-text)', bg: 'var(--status-high-bg)', border: 'var(--status-high-border)' };
    if (util >= 40) return { label: 'Moderate', color: 'var(--status-moderate-text)', bg: 'var(--status-moderate-bg)', border: 'var(--status-moderate-border)' };
    return { label: 'Low', color: 'var(--status-low-text)', bg: 'var(--status-low-bg)', border: 'var(--status-low-border)' };
  };

  const totalCapacity = warehouses.reduce((sum, w) => sum + parseInt(w.capacity || 0), 0);
  const totalUsed = warehouses.reduce((sum, w) => sum + parseInt(w.current_size || 0), 0);
  const avgUtilization = warehouses.length > 0 ? ((totalUsed / totalCapacity) * 100).toFixed(1) : 0;

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' };
  const btnSecondary = { padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' };
  const btnPrimary = { padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', fontFamily: 'Segoe UI, sans-serif' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Loading warehouses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />

      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Warehouses</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Manage your warehouse locations</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedWarehouses.length > 0 && (
              <button onClick={handleBulkDelete}
                style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--btn-hover-bg)'; e.target.style.color = 'var(--btn-hover-text)'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = 'var(--btn-secondary-bg)'; e.target.style.color = 'var(--btn-secondary-text)'; }}>
                Delete ({selectedWarehouses.length})
              </button>
            )}
            <button onClick={handleAddWarehouse}
              style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--btn-hover-bg)'; e.target.style.color = 'var(--btn-hover-text)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'var(--btn-secondary-bg)'; e.target.style.color = 'var(--btn-secondary-text)'; }}>
              + Add Warehouse
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Warehouses', value: warehouses.length },
            { label: 'Total Capacity', value: totalCapacity.toLocaleString() },
            { label: 'Total Used', value: totalUsed.toLocaleString() },
            { label: 'Avg Utilization', value: `${avgUtilization}%` }
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
          <div style={{ marginBottom: '20px' }}>
            <input type="text" placeholder="🔍 Search warehouses by name or address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'} onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                  </th>
                  {['Warehouse', 'Address', 'Capacity', 'Used', 'Utilization', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.length > 0 ? filteredWarehouses.map(w => {
                  const util = w.capacity > 0 ? ((w.current_size / w.capacity) * 100).toFixed(1) : 0;
                  const status = getWarehouseStatus(util);
                  const isSelected = selectedWarehouses.includes(w.id);
                  return (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border-divider)', backgroundColor: isSelected ? 'var(--bg-selected)' : 'transparent' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectWarehouse(w.id)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                      </td>
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['Details', 'Edit', 'Delete'].map(action => (
                            <button key={action} onClick={() => {
                              if (action === 'Details') handleViewDetails(w);
                              else if (action === 'Edit') handleEditWarehouse(w);
                              else handleDeleteClick(w);
                            }}
                              style={{ padding: '6px 12px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                              onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--btn-hover-bg)'; e.target.style.color = 'var(--btn-hover-text)'; }}
                              onMouseOut={(e) => { e.target.style.backgroundColor = 'var(--btn-secondary-bg)'; e.target.style.color = 'var(--btn-secondary-text)'; }}>
                              {action}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {searchTerm ? 'No warehouses found' : 'No warehouses yet'}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                        {searchTerm ? 'Try a different search term' : 'Click "Add Warehouse" to create your first warehouse'}
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
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>{modalMode === 'add' ? '+ Add Warehouse' : 'Edit Warehouse'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder="e.g. North Warehouse" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Address *</label>
                <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={inputStyle} placeholder="e.g. 123 Industrial Zone, Casablanca" />
              </div>

              <div style={{ marginBottom: modalMode === 'edit' ? '20px' : '24px' }}>
                <label style={labelStyle}>Capacity *</label>
                <input type="number" required min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} style={inputStyle} placeholder="e.g. 5000" />
              </div>

              {/* current_size only shown in edit mode */}
              {modalMode === 'edit' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Current Size</label>
                  <input type="number" min="0" value={formData.current_size} onChange={(e) => setFormData({ ...formData, current_size: e.target.value })} style={inputStyle} placeholder="e.g. 1200" />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" style={btnPrimary}>{modalMode === 'add' ? 'Add Warehouse' : 'Update Warehouse'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '400px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>⚠️ Confirm Delete</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                Are you sure you want to delete <strong>{selectedWarehouse?.name}</strong>? This will also delete its associated Operator role and assigned users.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={btnPrimary}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div onClick={() => setShowBulkDeleteModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '450px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>⚠️ Confirm Bulk Delete</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                You are about to delete <strong>{selectedWarehouses.length}</strong> warehouse{selectedWarehouses.length > 1 ? 's' : ''}. This will also delete their Operator roles and assigned users.
              </p>
              <div style={{ backgroundColor: 'var(--alert-error-bg)', border: '1px solid var(--alert-error-border)', borderRadius: '6px', padding: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--alert-error-text)', marginBottom: '8px' }}>Warehouses to be deleted:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {filteredWarehouses.filter(w => selectedWarehouses.includes(w.id)).map(w => (
                    <li key={w.id}>{w.name} — {w.address}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBulkDeleteModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleBulkDeleteConfirm} style={btnPrimary}>Delete {selectedWarehouses.length} Warehouse{selectedWarehouses.length > 1 ? 's' : ''}</button>
            </div>
          </div>
        </div>
      )}

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
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Warehouse ID</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>#{selectedWarehouse.id}</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Status</div>
                    <span style={{ padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                      {status.label}
                    </span>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Name</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedWarehouse.name}</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Address</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedWarehouse.address}</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Capacity</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{parseInt(selectedWarehouse.capacity).toLocaleString()}</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Current Size</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{parseInt(selectedWarehouse.current_size).toLocaleString()}</div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Utilization</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '10px' }}>
                        <div style={{ width: `${util}%`, height: '100%', backgroundColor: status.color, borderRadius: '10px' }} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', minWidth: '40px' }}>{util}%</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Created At</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedWarehouse.created_at ? new Date(selectedWarehouse.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Last Updated</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedWarehouse.updated_at ? new Date(selectedWarehouse.updated_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowDetailsModal(false); handleEditWarehouse(selectedWarehouse); }} style={btnSecondary}>Edit Warehouse</button>
              <button onClick={() => setShowDetailsModal(false)} style={btnPrimary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWarehouses;