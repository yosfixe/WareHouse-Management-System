import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Warehouse filter
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);

  // Selection states
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    unit: '',
    minimum_level: '',
    expiry_required: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Derive warehouse list from products
  useEffect(() => {
    const warehouseMap = {};
    products.forEach(product => {
      product.stocks?.forEach(stock => {
        const warehouse = stock.location?.warehouse;
        if (warehouse && !warehouseMap[warehouse.id]) {
          warehouseMap[warehouse.id] = warehouse;
        }
      });
    });
    setWarehouses(Object.values(warehouseMap));
  }, [products]);

  // Apply search + warehouse filters together
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Warehouse filter — product must exist in ALL selected warehouses
    if (selectedWarehouses.length > 0) {
      filtered = filtered.filter(product => {
        const productWarehouseIds = [
          ...new Set(
            product.stocks
              ?.map(stock => stock.location?.warehouse?.id)
              .filter(Boolean)
          )
        ];
        return selectedWarehouses.every(wId => productWarehouseIds.includes(wId));
      });
    }

    setFilteredProducts(filtered);
    setSelectedProducts([]);
    setSelectAll(false);
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
      prev.includes(warehouseId)
        ? prev.filter(id => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
      setSelectAll(true);
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedProducts, productId];
      setSelectedProducts(newSelected);
      if (newSelected.length === filteredProducts.length) setSelectAll(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to delete');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await Promise.all(selectedProducts.map(id => api.delete(`/products/${id}`)));
      setShowBulkDeleteModal(false);
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting products:', err);
      alert('Failed to delete some products');
    }
  };

  const handleAddProduct = () => {
    setModalMode('add');
    setFormData({ name: '', sku: '', description: '', unit: '', minimum_level: '', expiry_required: false });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      unit: product.unit,
      minimum_level: product.minimum_level,
      expiry_required: product.expiry_required || false
    });
    setShowModal(true);
  };

  const handleDeleteClick = (product) => {
    setDeleteProductId(product.id);
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/products', formData);
      } else {
        await api.put(`/products/${selectedProduct.id}`, formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/products/${deleteProductId}`);
      setShowDeleteModal(false);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', fontFamily: 'Segoe UI, sans-serif' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Loading products...</p>
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
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Products</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Manage your product inventory</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--btn-hover-bg)'; e.target.style.color = 'var(--btn-hover-text)'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = 'var(--btn-secondary-bg)'; e.target.style.color = 'var(--btn-secondary-text)'; }}
              >
                Delete ({selectedProducts.length})
              </button>
            )}
            <button
              onClick={handleAddProduct}
              style={{ padding: '10px 20px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--btn-hover-bg)'; e.target.style.color = 'var(--btn-hover-text)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'var(--btn-secondary-bg)'; e.target.style.color = 'var(--btn-secondary-text)'; }}
            >
              + Add Product
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>

          {/* Search + Warehouse Filter Row */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <input
              type="text"
              placeholder="🔍 Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px 16px', border: '1px solid var(--input-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
            />

            {/* Warehouse filter chips */}
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
                  {['Name', 'SKU', 'Unit', 'Min Level', 'Expiry Req?', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map(product => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border-divider)', backgroundColor: isSelected ? 'var(--bg-selected)' : 'transparent' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectProduct(product.id)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{product.name}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{product.sku}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{product.unit}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{product.minimum_level}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: product.expiry_required ? 'var(--alert-success-bg)' : 'var(--bg-tertiary)',
                          color: product.expiry_required ? 'var(--alert-success-text)' : 'var(--text-tertiary)',
                          border: `1px solid ${product.expiry_required ? 'var(--alert-success-border)' : 'var(--border-secondary)'}`
                        }}>
                          {product.expiry_required ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['Details', 'Edit', 'Delete'].map(action => (
                            <button key={action}
                              onClick={() => {
                                if (action === 'Details') handleViewDetails(product);
                                else if (action === 'Edit') handleEditProduct(product);
                                else handleDeleteClick(product);
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
                    <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {searchTerm || selectedWarehouses.length > 0 ? 'No products found' : 'No products yet'}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                        {searchTerm || selectedWarehouses.length > 0 ? 'Try a different search term or warehouse filter' : 'Click "Add Product" to create your first product'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modals would go here - same pattern as AdminUsers */}
    </div>
  );
}

export default AdminProducts;