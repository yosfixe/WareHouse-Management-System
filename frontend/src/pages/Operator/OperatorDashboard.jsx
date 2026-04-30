import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../Header';

function OperatorDashboard() {
  const [stats, setStats] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const warehouseName = user?.role?.name?.replace('Operator-', '') || 'Your Warehouse';

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (err) { console.error(err); }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => { fetchData(); }, []);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, stockRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/stocks'),
      ]);
      setStats(dashRes.data);
      setStocks(stockRes.data);
      setFilteredStocks(stockRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard');
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = stocks.filter(s => s.quantity < s.product?.minimum_level);

  if (loading) return (
    <div><Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div><Header />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', flexDirection: 'column', gap: '12px' }}>
        <p style={{ color: 'var(--alert-error-text)' }}>{error}</p>
        <button onClick={fetchData} style={{ padding: '8px 20px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Operator Dashboard</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Managing: <strong>{warehouseName}</strong></p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Stock Items',    value: stocks.length },
            { label: 'Low Stock',      value: lowStockItems.length },
            { label: 'Total Quantity', value: stocks.reduce((sum, s) => sum + s.quantity, 0).toLocaleString() },
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: card.label === 'Low Stock' && card.value > 0 ? 'var(--alert-warning-text)' : 'var(--text-primary)' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>

          {/* Stock Table */}
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-tertiary)' }}>Warehouse Stock</div>
              <button onClick={() => navigate('/operator/stocks')}
                style={{ padding: '6px 14px', backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)'; e.currentTarget.style.color = 'var(--btn-hover-text)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; e.currentTarget.style.color = 'var(--btn-secondary-text)'; }}>
                Manage Stocks →
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input type="text" placeholder="🔍 Search by product or location..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '13px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'} />
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', zIndex: 1 }}>
                  <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                    {['Product', 'SKU', 'Location', 'Qty', 'Min Level', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.length > 0 ? filteredStocks.map(stock => {
                    const isLow = stock.quantity < stock.product?.minimum_level;
                    return (
                      <tr key={stock.id} style={{ borderBottom: '1px solid var(--border-divider)' }}>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{stock.product?.name || 'N/A'}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.product?.sku || 'N/A'}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.location?.code || 'N/A'}</td>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: isLow ? 'var(--alert-warning-text)' : 'var(--text-primary)' }}>{stock.quantity}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{stock.product?.minimum_level}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600',
                            backgroundColor: isLow ? 'var(--alert-warning-bg)' : 'var(--alert-success-bg)',
                            color: isLow ? 'var(--alert-warning-text)' : 'var(--alert-success-text)',
                            border: `1px solid ${isLow ? 'var(--alert-warning-border)' : 'var(--alert-success-border)'}` }}>
                            {isLow ? 'Low Stock' : 'OK'}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>No stocks found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Alerts</div>

              <div style={{ padding: '16px', backgroundColor: 'var(--alert-warning-bg)', borderRadius: '8px', border: '1px solid var(--alert-warning-border)', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--alert-warning-text)', fontWeight: '600', marginBottom: '4px' }}>Low Stock Items</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{lowStockItems.length}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>items below minimum level</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--alert-info-bg)', borderRadius: '8px', border: '1px solid var(--alert-info-border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--alert-info-text)', fontWeight: '600', marginBottom: '4px' }}>Warehouse</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{warehouseName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>your assigned warehouse</div>
              </div>
            </div>

            {/* Low stock list */}
            {lowStockItems.length > 0 && (
              <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '12px' }}>⚠️ Low Stock Items</div>
                {lowStockItems.map(stock => (
                  <div key={stock.id} style={{ padding: '10px', borderRadius: '6px', backgroundColor: 'var(--alert-warning-bg)', border: '1px solid var(--alert-warning-border)', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{stock.product?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {stock.quantity} / {stock.product?.minimum_level} min — {stock.location?.code}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperatorDashboard;