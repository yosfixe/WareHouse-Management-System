import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection states
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    current_size: ''
  });

  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (err) { console.error(err); }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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
      if (newSelected.length === filteredWarehouses.length) {
        setSelectAll(true);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedWarehouses.length === 0) {
      alert('Please select warehouses to delete');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await Promise.all(
        selectedWarehouses.map(id => api.delete(`/warehouses/${id}`))
      );
      setShowBulkDeleteModal(false);
      setSelectedWarehouses([]);
      setSelectAll(false);
      fetchDashboard();
    } catch (err) {
      console.error('Error deleting warehouses:', err);
      alert('Failed to delete some warehouses');
    }
  };

  const handleAddWarehouse = () => {
    setModalMode('add');
    setFormData({ name: '', address: '', capacity: '', current_size: '0' });
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
      fetchDashboard();
    } catch (err) {
      console.error('Error saving warehouse:', err);
      alert('Failed to save warehouse: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/warehouses/${deleteWarehouseId}`);
      setShowDeleteModal(false);
      fetchDashboard();
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Products', value: stats?.counts?.products },
            { label: 'Warehouses', value: stats?.counts?.warehouses },
            { label: 'Locations', value: stats?.counts?.locations },
            { label: 'Stock Items', value: stats?.counts?.stocks },
          ].map((card) => (
            <div key={card.label} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{card.value ?? '-'}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 220px', gap: '16px' }}>
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

          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: '600' }}>Warehouse Overview</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedWarehouses.length > 0 && (
                  <button 
                    onClick={handleBulkDelete}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: 'var(--btn-secondary-bg)', 
                      color: 'var(--btn-secondary-text)', 
                      border: '1px solid var(--btn-secondary-border)', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '13px', 
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'var(--btn-hover-bg)';
                      e.target.style.color = 'var(--btn-hover-text)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'var(--btn-secondary-bg)';
                      e.target.style.color = 'var(--btn-secondary-text)';
                    }}
                  >
                    Delete ({selectedWarehouses.length})
                  </button>
                )}
                <button 
                  onClick={handleAddWarehouse}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: 'var(--btn-secondary-bg)', 
                    color: 'var(--btn-secondary-text)', 
                    border: '1px solid var(--btn-secondary-border)', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontSize: '13px', 
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'var(--btn-hover-bg)';
                    e.target.style.color = 'var(--btn-hover-text)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'var(--btn-secondary-bg)';
                    e.target.style.color = 'var(--btn-secondary-text)';
                  }}
                >
                  + Add Warehouse
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="🔍 Search warehouses by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
              />
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', zIndex: 1 }}>
                  <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>
                      <input type="checkbox" checked={selectAll} onChange={handleSelectAll} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                    </th>
                    {['Warehouse', 'Address', 'Current', 'Capacity', 'Utilization', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
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
                        <td style={{ padding: '12px' }}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleSelectWarehouse(w.id)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                        </td>
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
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => handleViewDetails(w)} 
                              style={{ 
                                padding: '6px 10px', 
                                backgroundColor: 'var(--btn-secondary-bg)', 
                                color: 'var(--btn-secondary-text)', 
                                border: '1px solid var(--btn-secondary-border)', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontSize: '11px', 
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = 'var(--btn-hover-bg)';
                                e.target.style.color = 'var(--btn-hover-text)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'var(--btn-secondary-bg)';
                                e.target.style.color = 'var(--btn-secondary-text)';
                              }}
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => handleEditWarehouse(w)} 
                              style={{ 
                                padding: '6px 10px', 
                                backgroundColor: 'var(--btn-secondary-bg)', 
                                color: 'var(--btn-secondary-text)', 
                                border: '1px solid var(--btn-secondary-border)', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontSize: '11px', 
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = 'var(--btn-hover-bg)';
                                e.target.style.color = 'var(--btn-hover-text)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'var(--btn-secondary-bg)';
                                e.target.style.color = 'var(--btn-secondary-text)';
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(w)} 
                              style={{ 
                                padding: '6px 10px', 
                                backgroundColor: 'var(--btn-secondary-bg)', 
                                color: 'var(--btn-secondary-text)', 
                                border: '1px solid var(--btn-secondary-border)', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontSize: '11px', 
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = 'var(--btn-hover-bg)';
                                e.target.style.color = 'var(--btn-hover-text)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'var(--btn-secondary-bg)';
                                e.target.style.color = 'var(--btn-secondary-text)';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>No warehouses found</div>
                        <div style={{ fontSize: '12px' }}>{searchTerm ? 'Try a different search term' : 'Click "Add Warehouse" to get started'}</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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

      {/* Add/Edit Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--modal-bg)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--modal-header-text)' }}>{modalMode === 'add' ? 'Add New Warehouse' : 'Edit Warehouse'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Warehouse Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} placeholder="Enter warehouse name" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Address *</label>
                <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} placeholder="Enter warehouse address" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Full Capacity *</label>
                <input type="number" required min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} placeholder="Enter full capacity" />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Current Size *</label>
                <input type="number" required min="0" value={formData.current_size} onChange={(e) => setFormData({...formData, current_size: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} placeholder="Enter current size" />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  {modalMode === 'add' ? 'Add Warehouse' : 'Update Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--modal-bg)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '400px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--modal-header-text)', marginBottom: '12px' }}>⚠️ Confirm Delete</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                Are you sure you want to delete <strong>{selectedWarehouse?.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' }}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div onClick={() => setShowBulkDeleteModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--modal-bg)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '450px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--modal-header-text)', marginBottom: '12px' }}>⚠️ Confirm Bulk Delete</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                You are about to delete <strong>{selectedWarehouses.length}</strong> warehouse{selectedWarehouses.length > 1 ? 's' : ''}. This action cannot be undone.
              </p>
              <div style={{ backgroundColor: 'var(--alert-error-bg)', border: '1px solid var(--alert-error-border)', borderRadius: '6px', padding: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--alert-error-text)', marginBottom: '8px' }}>Warehouses to be deleted:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {filteredWarehouses.filter(w => selectedWarehouses.includes(w.id)).map(w => (
                    <li key={w.id}>{w.name}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBulkDeleteModal(false)} style={{ padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' }}>Cancel</button>
              <button onClick={handleBulkDeleteConfirm} style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Delete {selectedWarehouses.length} Warehouse{selectedWarehouses.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedWarehouse && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--modal-bg)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--modal-header-text)' }}>Warehouse Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Warehouse ID</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>#{selectedWarehouse.id}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Warehouse Name</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedWarehouse.name}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Address</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedWarehouse.address}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Full Capacity</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{parseInt(selectedWarehouse.capacity).toLocaleString()}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Current Size</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{parseInt(selectedWarehouse.current_size).toLocaleString()}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Available Space</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--alert-success-text)' }}>{(selectedWarehouse.capacity - selectedWarehouse.current_size).toLocaleString()}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Utilization</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {selectedWarehouse.capacity > 0 ? ((selectedWarehouse.current_size / selectedWarehouse.capacity) * 100).toFixed(2) : 0}%
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Status</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {(() => {
                    const util = selectedWarehouse.capacity > 0 ? ((selectedWarehouse.current_size / selectedWarehouse.capacity) * 100).toFixed(1) : 0;
                    const status = getWarehouseStatus(util);
                    return (
                      <span style={{ padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                        {status.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Created At</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {selectedWarehouse.created_at ? new Date(selectedWarehouse.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowDetailsModal(false); handleEditWarehouse(selectedWarehouse); }} 
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: 'var(--btn-secondary-bg)', 
                  color: 'var(--btn-secondary-text)', 
                  border: '1px solid var(--btn-secondary-border)', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}
              >
                Edit Warehouse
              </button>
              <button onClick={() => setShowDetailsModal(false)} style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;