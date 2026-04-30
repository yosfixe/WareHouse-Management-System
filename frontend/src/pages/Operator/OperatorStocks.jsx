import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function OperatorStocks() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStock, setSelectedStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({ product_id: '', location_id: '', quantity: '' });

  useEffect(() => { fetchStocks(); fetchProducts(); fetchLocations(); }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStocks(stocks);
    } else {
      setFilteredStocks(stocks.filter(s =>
        s.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location?.code?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, stocks]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stocks');
      setStocks(response.data);
      setFilteredStocks(response.data);
    } catch (err) {
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/stocks', formData);
      } else {
        await api.put(`/stocks/${selectedStock.id}`, formData);
      }
      setShowModal(false);
      fetchStocks();
    } catch (err) {
      alert('Failed to save stock: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/stocks/${selectedStock.id}`);
      setShowDeleteModal(false);
      fetchStocks();
    } catch (err) {
      alert('Failed to delete stock: ' + (err.response?.data?.message || err.message));
    }
  };

  const btnSecondary = { padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' };
  const btnPrimary   = { padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
  const inputStyle   = { width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' };
  const labelStyle   = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' };

  if (loading) return (
    <div><Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading stocks...</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Stocks</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Manage stock in your assigned warehouse</p>
          </div>
          <button onClick={() => { setModalMode('add'); setFormData({ product_id: '', location_id: '', quantity: '' }); setShowModal(true); }}
            style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; e.currentTarget.style.color = 'var(--btn-hover-text)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; e.currentTarget.style.color = 'var(--btn-secondary-text)'; }}>
            + Add Stock
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
          <div style={{ marginBottom: '20px' }}>
            <input type="text" placeholder="🔍 Search by product or location..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  {['ID', 'Product', 'SKU', 'Location', 'Quantity', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStocks.length > 0 ? filteredStocks.map(stock => {
                  const isLow = stock.quantity < stock.product?.minimum_level;
                  return (
                    <tr key={stock.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>#{stock.id}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{stock.product?.name || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.product?.sku || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.location?.code || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: isLow ? 'var(--alert-warning-text)' : 'var(--text-primary)' }}>{stock.quantity}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: isLow ? 'var(--alert-warning-bg)' : 'var(--alert-success-bg)',
                          color: isLow ? 'var(--alert-warning-text)' : 'var(--alert-success-text)',
                          border: `1px solid ${isLow ? 'var(--alert-warning-border)' : 'var(--alert-success-border)'}` }}>
                          {isLow ? 'Low Stock' : 'OK'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['Details', 'Edit', 'Delete'].map(action => (
                            <button key={action}
                              onClick={() => {
                                if (action === 'Details') { setSelectedStock(stock); setShowDetailsModal(true); }
                                else if (action === 'Edit') { setModalMode('edit'); setSelectedStock(stock); setFormData({ product_id: stock.product_id, location_id: stock.location_id, quantity: stock.quantity }); setShowModal(true); }
                                else { setSelectedStock(stock); setShowDeleteModal(true); }
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
                    <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>No stocks found</div>
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
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>{modalMode === 'add' ? '+ Add Stock' : 'Edit Stock'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Product *</label>
                <select required value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} style={inputStyle}>
                  <option value="">Select a product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Location *</label>
                <select required value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} style={inputStyle}>
                  <option value="">Select a location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.code} — {l.warehouse?.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Quantity *</label>
                <input type="number" required min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} style={inputStyle} placeholder="e.g. 100" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" style={btnPrimary}>{modalMode === 'add' ? 'Add Stock' : 'Update Stock'}</button>
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
              Are you sure you want to delete stock <strong>#{selectedStock?.id}</strong> ({selectedStock?.product?.name})? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={btnPrimary}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedStock && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Stock Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { label: 'Stock ID',  value: `#${selectedStock.id}` },
                { label: 'Quantity',  value: selectedStock.quantity },
                { label: 'Product',   value: selectedStock.product?.name || 'N/A', full: true },
                { label: 'SKU',       value: selectedStock.product?.sku || 'N/A' },
                { label: 'Location',  value: selectedStock.location?.code || 'N/A' },
                { label: 'Warehouse', value: selectedStock.location?.warehouse?.name || 'N/A', full: true },
              ].map(item => (
                <div key={item.label} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: item.full ? '1 / -1' : 'auto' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.value}</div>
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

export default OperatorStocks;