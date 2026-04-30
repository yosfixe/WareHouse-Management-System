import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function AdminStockMovements() {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const [stocks, setStocks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [formData, setFormData] = useState({
    stock_id: '', movement_type: 'IN',
    from_location_id: '', to_location_id: '',
    reason: '', quantity: '', driver_id: '',
  });

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

  const showToLocation  = ['IN', 'TRANSFER'].includes(formData.movement_type);
  const selectedStock   = stocks.find(s => s.id == formData.stock_id);

  useEffect(() => {
    fetchMovements();
    fetchStocks();
    fetchLocations();
    fetchDrivers();
  }, []);

  useEffect(() => {
    let filtered = movements;
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(m =>
        m.stock?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.stock?.location?.warehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const fetchStocks = async () => {
    try {
      const response = await api.get('/stocks');
      setStocks(response.data);
    } catch (err) {
      console.error('Error fetching stocks:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      setLocations(response.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const handleTypeToggle = (type) => {
    setTypeFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleOpenModal = () => {
    setFormData({
      stock_id: '', movement_type: 'IN',
      from_location_id: '', to_location_id: '',
      reason: '', quantity: '', driver_id: '',
    });
    setShowModal(true);
  };

  const handleTypeChange = (type) => {
    const stock = stocks.find(s => s.id == formData.stock_id);
    setFormData(prev => ({
      ...prev,
      movement_type:    type,
      from_location_id: stock?.location_id || '',
      to_location_id:   '',
      driver_id:        type === 'ADJUSTMENT' ? '' : prev.driver_id,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        stock_id:         formData.stock_id,
        movement_type:    formData.movement_type,
        quantity:         formData.quantity,
        reason:           formData.reason,
        driver_id:        formData.movement_type !== 'ADJUSTMENT' ? (formData.driver_id || null) : null,
        from_location_id: ['OUT', 'TRANSFER'].includes(formData.movement_type) ? formData.from_location_id : null,
        to_location_id:   showToLocation ? formData.to_location_id : null,
      };
      await api.post('/stocks/movements', payload);
      setShowModal(false);
      fetchMovements();
    } catch (err) {
      console.error('Error saving movement:', err);
      alert('Failed to save movement: ' + (err.response?.data?.message || err.message));
    }
  };

  const btnSecondary = { padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' };
  const btnPrimary   = { padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
  const inputStyle   = { width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' };
  const labelStyle   = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', fontFamily: 'Segoe UI, sans-serif' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Loading movements...</p>
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
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Stock Movements</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Immutable audit log of all stock movements</p>
          </div>
          <button onClick={handleOpenModal}
            style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; e.currentTarget.style.color = 'var(--btn-hover-text)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; e.currentTarget.style.color = 'var(--btn-secondary-text)'; }}>
            + Add Movement
          </button>
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

          {/* Search + Type Filter */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <input type="text" placeholder="🔍 Search by product, user, driver, reason, or warehouse..."
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
                    style={{
                      padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      border: `1px solid ${isActive ? badge.border : 'var(--btn-secondary-border)'}`,
                      backgroundColor: isActive ? badge.bg : 'var(--btn-secondary-bg)',
                      color: isActive ? badge.color : 'var(--btn-secondary-text)',
                      transition: 'all 0.2s'
                    }}>
                    {type}
                  </button>
                );
              })}
              {typeFilter.length > 0 && (
                <button onClick={() => setTypeFilter([])}
                  style={{ padding: '6px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: '1px solid var(--btn-secondary-border)', backgroundColor: 'transparent', color: 'var(--text-tertiary)' }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  {['#', 'Type', 'Product', 'Qty', 'From', 'To', 'Driver', 'User', 'Reason', 'Timestamp', 'Actions'].map(h => (
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
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {m.from_location ? `${m.from_location.code} (${m.from_location.warehouse?.name})` : '—'}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {m.to_location ? `${m.to_location.code} (${m.to_location.warehouse?.name})` : '—'}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {m.driver ? `${m.driver.name} (${m.driver.truck?.plate || '—'})` : '—'}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.user?.fullname || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{m.reason || '—'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                        {m.timestamp ? new Date(m.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <button
                          onClick={() => { setSelectedMovement(m); setShowDetailsModal(true); }}
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
                    <td colSpan={11} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {searchTerm || typeFilter.length > 0 ? 'No movements found' : 'No movements yet'}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                        {searchTerm || typeFilter.length > 0 ? 'Try a different search or filter' : 'Movements are auto-generated when stocks change'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Movement Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>+ Add Movement</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Stock */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Stock *</label>
                <select required value={formData.stock_id}
                  onChange={(e) => {
                    const stock = stocks.find(s => s.id == e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      stock_id:         e.target.value,
                      from_location_id: stock?.location_id || '',
                      to_location_id:   '',
                    }));
                  }}
                  style={inputStyle}>
                  <option value="">Select a stock</option>
                  {stocks.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.product?.name} — {s.location?.code} (qty: {s.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Movement Type */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Movement Type *</label>
                <select required value={formData.movement_type} onChange={(e) => handleTypeChange(e.target.value)} style={inputStyle}>
                  {MOVEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                  {formData.movement_type === 'IN'         && 'Stock arriving at a location — requires To Location'}
                  {formData.movement_type === 'OUT'        && 'Stock leaving a location — requires From Location'}
                  {formData.movement_type === 'TRANSFER'   && 'Stock moving between locations — requires both From and To'}
                  {formData.movement_type === 'ADJUSTMENT' && 'Manual quantity correction — no location change, no driver'}
                </div>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Quantity *</label>
                <input type="number" required min="1" value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  style={inputStyle} placeholder="e.g. 50" />
              </div>

              {/* From Location — read-only, auto-filled for OUT and TRANSFER */}
              {['OUT', 'TRANSFER'].includes(formData.movement_type) && formData.stock_id && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>From Location</label>
                  <div style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {selectedStock?.location?.code
                      ? `${selectedStock.location.code} — ${selectedStock.location.warehouse?.name}`
                      : 'Auto-filled from selected stock'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Auto-filled from the selected stock's current location
                  </div>
                </div>
              )}

              {/* To Location — IN and TRANSFER only */}
              {showToLocation && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>To Location *</label>
                  <select required value={formData.to_location_id}
                    onChange={(e) => setFormData({ ...formData, to_location_id: e.target.value })}
                    style={inputStyle}>
                    <option value="">Select location</option>
                    {locations
                      .filter(l => l.id !== selectedStock?.location_id)
                      .map(l => (
                        <option key={l.id} value={l.id}>{l.code} — {l.warehouse?.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Reason */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Reason</label>
                <input type="text" value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={inputStyle} placeholder="e.g. Monthly restock" />
              </div>

              {/* Driver — hidden for ADJUSTMENT */}
              {formData.movement_type !== 'ADJUSTMENT' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Driver (optional)</label>
                  <select value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                    style={inputStyle}>
                    <option value="">No driver</option>
                    {drivers.filter(d => d.status === 'On Duty').map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.truck?.plate}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" style={btnPrimary}>Add Movement</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Movement ID</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>#{selectedMovement.id}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Type</div>
                    <span style={{ padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                      {selectedMovement.movement_type}
                    </span>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Product</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedMovement.stock?.product?.name || 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>SKU: {selectedMovement.stock?.product?.sku || 'N/A'}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Quantity</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedMovement.quantity}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>User</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedMovement.user?.fullname || 'N/A'}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>From Location</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedMovement.from_location ? `${selectedMovement.from_location.code} (${selectedMovement.from_location.warehouse?.name})` : '—'}
                    </div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>To Location</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedMovement.to_location ? `${selectedMovement.to_location.code} (${selectedMovement.to_location.warehouse?.name})` : '—'}
                    </div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Driver</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedMovement.driver
                        ? `${selectedMovement.driver.name} (${selectedMovement.driver.truck?.plate || '—'})`
                        : '—'}
                    </div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Reason</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedMovement.reason || '—'}</div>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Timestamp</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedMovement.timestamp ? new Date(selectedMovement.timestamp).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailsModal(false)} style={btnPrimary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStockMovements;