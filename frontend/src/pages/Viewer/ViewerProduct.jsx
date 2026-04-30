import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function ViewerProduct() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const warehouseMap = {};
    products.forEach(product => {
      product.stocks?.forEach(stock => {
        const warehouse = stock.location?.warehouse;
        if (warehouse && !warehouseMap[warehouse.id]) warehouseMap[warehouse.id] = warehouse;
      });
    });
    setWarehouses(Object.values(warehouseMap));
  }, [products]);

  useEffect(() => {
    let filtered = products;
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedWarehouses.length > 0) {
      filtered = filtered.filter(product => {
        const productWarehouseIds = [...new Set(product.stocks?.map(s => s.location?.warehouse?.id).filter(Boolean))];
        return selectedWarehouses.every(wId => productWarehouseIds.includes(wId));
      });
    }
    setFilteredProducts(filtered);
  }, [searchTerm, selectedWarehouses, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseToggle = (warehouseId) => {
    setSelectedWarehouses(prev =>
      prev.includes(warehouseId) ? prev.filter(id => id !== warehouseId) : [...prev, warehouseId]
    );
  };

  if (loading) return (
    <div><Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading products...</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Products</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Browse product inventory</p>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <input type="text" placeholder="🔍 Search products by name or SKU..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
            {warehouses.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '500' }}>Warehouse:</span>
                {warehouses.map(warehouse => {
                  const isActive = selectedWarehouses.includes(warehouse.id);
                  return (
                    <button key={warehouse.id} onClick={() => handleWarehouseToggle(warehouse.id)}
                      style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid var(--btn-secondary-border)', transition: 'all 0.2s', backgroundColor: isActive ? 'var(--btn-hover-bg)' : 'var(--btn-secondary-bg)', color: isActive ? 'var(--btn-hover-text)' : 'var(--btn-secondary-text)' }}>
                      {warehouse.name}
                    </button>
                  );
                })}
                {selectedWarehouses.length > 0 && (
                  <button onClick={() => setSelectedWarehouses([])}
                    style={{ padding: '6px 10px', borderRadius: '50px', fontSize: '12px', cursor: 'pointer', border: '1px solid var(--btn-secondary-border)', backgroundColor: 'transparent', color: 'var(--text-tertiary)' }}>
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
                  {['Name', 'SKU', 'Unit', 'Min Level', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                    <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{product.name}</td>
                    <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{product.sku}</td>
                    <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{product.unit}</td>
                    <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{product.minimum_level}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <button onClick={() => { setSelectedProduct(product); setShowDetailsModal(true); }}
                        style={{ padding: '6px 12px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; e.currentTarget.style.color = 'var(--btn-hover-text)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; e.currentTarget.style.color = 'var(--btn-secondary-text)'; }}>
                        Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {searchTerm || selectedWarehouses.length > 0 ? 'No products found' : 'No products yet'}
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
      {showDetailsModal && selectedProduct && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>Product Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { label: 'Name', value: selectedProduct.name, full: true },
                { label: 'SKU', value: selectedProduct.sku },
                { label: 'Unit', value: selectedProduct.unit },
                { label: 'Minimum Level', value: selectedProduct.minimum_level },
                { label: 'Description', value: selectedProduct.description || '—', full: true },
              ].map(item => (
                <div key={item.label} style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: item.full ? '1 / -1' : 'auto' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailsModal(false)} style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewerProduct;