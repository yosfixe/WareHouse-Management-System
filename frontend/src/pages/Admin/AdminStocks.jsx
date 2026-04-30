import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function AdminStocks() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Warehouse filter
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);

  // Selection states
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStock, setSelectedStock] = useState(null);
  const [deleteStockId, setDeleteStockId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    product_id: '',
    location_id: '',
    quantity: ''
  });

  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchStocks();
    fetchProducts();
    fetchLocations();
  }, []);

  // Derive warehouse list from stocks
  useEffect(() => {
    const warehouseMap = {};
    stocks.forEach(stock => {
      const warehouse = stock.location?.warehouse;
      if (warehouse && !warehouseMap[warehouse.id]) {
        warehouseMap[warehouse.id] = warehouse;
      }
    });
    setWarehouses(Object.values(warehouseMap));
  }, [stocks]);

  // Apply search + warehouse filters together
  useEffect(() => {
    let filtered = stocks;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(s =>
        s.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location?.warehouse?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedWarehouses.length > 0) {
      filtered = filtered.filter(s =>
        selectedWarehouses.includes(s.location?.warehouse?.id)
      );
    }

    setFilteredStocks(filtered);
    setSelectedStocks([]);
    setSelectAll(false);
  }, [searchTerm, selectedWarehouses, stocks]);

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

  const handleWarehouseToggle = (warehouseId) => {
    setSelectedWarehouses(prev =>
      prev.includes(warehouseId)
        ? prev.filter(id => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStocks([]);
      setSelectAll(false);
    } else {
      setSelectedStocks(filteredStocks.map(s => s.id));
      setSelectAll(true);
    }
  };

  const handleSelectStock = (stockId) => {
    if (selectedStocks.includes(stockId)) {
      setSelectedStocks(selectedStocks.filter(id => id !== stockId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedStocks, stockId];
      setSelectedStocks(newSelected);
      if (newSelected.length === filteredStocks.length) setSelectAll(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedStocks.length === 0) { alert('Please select stocks to delete'); return; }
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await Promise.all(selectedStocks.map(id => api.delete(`/stocks/${id}`)));
      setShowBulkDeleteModal(false);
      setSelectedStocks([]);
      setSelectAll(false);
      fetchStocks();
    } catch (err) {
      console.error('Error deleting stocks:', err);
      alert('Failed to delete some stocks');
    }
  };

  const handleAddStock = () => {
    setModalMode('add');
    setFormData({ product_id: '', location_id: '', quantity: '' });
    setShowModal(true);
  };

  const handleEditStock = (stock) => {
    setModalMode('edit');
    setSelectedStock(stock);
    setFormData({ product_id: stock.product_id, location_id: stock.location_id, quantity: stock.quantity });
    setShowModal(true);
  };

  const handleDeleteClick = (stock) => {
    setDeleteStockId(stock.id);
    setSelectedStock(stock);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (stock) => {
    setSelectedStock(stock);
    setShowDetailsModal(true);
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
      console.error('Error saving stock:', err);
      alert('Failed to save stock: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/stocks/${deleteStockId}`);
      setShowDeleteModal(false);
      fetchStocks();
    } catch (err) {
      console.error('Error deleting stock:', err);
      alert('Failed to delete stock: ' + (err.response?.data?.message || err.message));
    }
  };

  const btnSecondary = { padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' };
  const btnPrimary = { padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', fontFamily: 'Segoe UI, sans-serif' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Loading stocks...</p>
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
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Stocks</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Manage stock inventory across all locations</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedStocks.length > 0 && (
              <button onClick={handleBulkDelete}
                style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--btn-hover-bg)'; e.target.style.color = 'var(--btn-hover-text)'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = 'var(--btn-secondary-bg)'; e.target.style.color = 'var(--btn-secondary-text)'; }}>
                Delete ({selectedStocks.length})
              </button>
            )}
            <button onClick={handleAddStock}
              style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--btn-hover-bg)'; e.target.style.color = 'var(--btn-hover-text)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'var(--btn-secondary-bg)'; e.target.style.color = 'var(--btn-secondary-text)'; }}>
              + Add Stock
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>

          {/* Search + Warehouse Filter Row */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <input
              type="text"
              placeholder="🔍 Search by product, location, or warehouse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
            />

            {warehouses.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '500' }}>Warehouse:</span>
                {warehouses.map(warehouse => {
                  const isActive = selectedWarehouses.includes(warehouse.id);
                  return (
                    <button
                      key={warehouse.id}
                      onClick={() => handleWarehouseToggle(warehouse.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '50px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: '1px solid var(--btn-secondary-border)',
                        transition: 'all 0.2s',
                        backgroundColor: isActive ? 'var(--btn-hover-bg)' : 'var(--btn-secondary-bg)',
                        color: isActive ? 'var(--btn-hover-text)' : 'var(--btn-secondary-text)',
                      }}
                    >
                      {warehouse.name}
                    </button>
                  );
                })}
                {selectedWarehouses.length > 0 && (
                  <button
                    onClick={() => setSelectedWarehouses([])}
                    style={{ padding: '6px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: '1px solid var(--btn-secondary-border)', backgroundColor: 'transparent', color: 'var(--text-tertiary)' }}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                  </th>
                  {['ID', 'Product', 'SKU', 'Location', 'Warehouse', 'Quantity', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStocks.length > 0 ? filteredStocks.map(stock => {
                  const isSelected = selectedStocks.includes(stock.id);
                  return (
                    <tr key={stock.id} style={{ borderBottom: '1px solid var(--border-divider)', backgroundColor: isSelected ? 'var(--bg-selected)' : 'transparent' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectStock(stock.id)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>#{stock.id}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{stock.product?.name || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.product?.sku || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.location?.code || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.location?.warehouse?.name || 'N/A'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{stock.quantity}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['Details', 'Edit', 'Delete'].map(action => (
                            <button key={action}
                              onClick={() => {
                                if (action === 'Details') handleViewDetails(stock);
                                else if (action === 'Edit') handleEditStock(stock);
                                else handleDeleteClick(stock);
                              }}
                              style={{ padding: '6px 12px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'all 0.2s' }}
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
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {searchTerm || selectedWarehouses.length > 0 ? 'No stocks found' : 'No stocks yet'}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                        {searchTerm || selectedWarehouses.length > 0 ? 'Try a different search term or warehouse filter' : 'Click "Add Stock" to create your first stock entry'}
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
                  {locations.map(l => <option key={l.id} value={l.id}>{l.code} — {l.warehouse?.name || 'Unknown'}</option>)}
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
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>⚠️ Confirm Delete</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                Are you sure you want to delete stock <strong>#{selectedStock?.id}</strong> ({selectedStock?.product?.name})? This action cannot be undone.
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
                You are about to delete <strong>{selectedStocks.length}</strong> stock{selectedStocks.length > 1 ? 's' : ''}. This action cannot be undone.
              </p>
              <div style={{ backgroundColor: 'var(--alert-error-bg)', border: '1px solid var(--alert-error-border)', borderRadius: '6px', padding: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--alert-error-text)', marginBottom: '8px' }}>Stocks to be deleted:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {filteredStocks.filter(s => selectedStocks.includes(s.id)).map(s => (
                    <li key={s.id}>#{s.id} — {s.product?.name} @ {s.location?.code}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBulkDeleteModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleBulkDeleteConfirm} style={btnPrimary}>Delete {selectedStocks.length} Stock{selectedStocks.length > 1 ? 's' : ''}</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedStock && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Stock Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Stock ID</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>#{selectedStock.id}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Quantity</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStock.quantity}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Product</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStock.product?.name || 'N/A'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>SKU: {selectedStock.product?.sku || 'N/A'}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Location</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStock.location?.code || 'N/A'}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Warehouse</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStock.location?.warehouse?.name || 'N/A'}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Created At</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {selectedStock.created_at ? new Date(selectedStock.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Last Updated</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {selectedStock.updated_at ? new Date(selectedStock.updated_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowDetailsModal(false); handleEditStock(selectedStock); }} style={btnSecondary}>Edit Stock</button>
              <button onClick={() => setShowDetailsModal(false)} style={btnPrimary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStocks;