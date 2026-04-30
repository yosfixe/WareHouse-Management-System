import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminWareHouses from './pages/Admin/AdminWareHouses';
import AdminStocks from './pages/Admin/AdminStocks';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminStockMovements from './pages/Admin/AdminStockMovements';
import AdminTrucks from './pages/Admin/AdminTrucks';
import AdminDrivers from './pages/Admin/AdminDrivers';

import OperatorDashboard from './pages/Operator/OperatorDashboard';
import OperatorProducts from './pages/Operator/OperatorProducts';
import OperatorStockMovements from './pages/Operator/OperatorStockMovements';
import OperatorStocks from './pages/Operator/OperatorStocks';

import ViewerDashboard from './pages/Viewer/ViewerDashboard';
import ViewerProduct from './pages/Viewer/ViewerProduct';
import ViewerStock from './pages/Viewer/ViewerStock';
import ViewerStockMovements from './pages/Viewer/ViewerStockMovement';
import ViewerWarehouse from './pages/Viewer/ViewerWarehouse';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/" />;

  if (allowedRoles && user.role) {
    const roleName = user.role.name;
    const allowed = allowedRoles.some(r =>
      r === roleName || (r === 'Operator' && roleName.startsWith('Operator-'))
    );
    if (!allowed) return <Navigate to="/unauthorized" />;
  }

  return children;
}

function RoleDashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.role) return <Navigate to="/" />;

  const role = user.role.name;
  if (role === 'Admin') return <Navigate to="/admin/dashboard" />;
  if (role.startsWith('Operator-')) return <Navigate to="/operator/dashboard" />;
  if (role === 'Viewer') return <Navigate to="/viewer/dashboard" />;
  return <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<RoleDashboardRedirect />} />

        {/* Admin */}
        <Route path="/admin/dashboard"      element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products"       element={<ProtectedRoute allowedRoles={['Admin']}><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/stocks"         element={<ProtectedRoute allowedRoles={['Admin']}><AdminStocks /></ProtectedRoute>} />
        <Route path="/admin/warehouses"     element={<ProtectedRoute allowedRoles={['Admin']}><AdminWareHouses /></ProtectedRoute>} />
        <Route path="/admin/users"          element={<ProtectedRoute allowedRoles={['Admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/stockmovements" element={<ProtectedRoute allowedRoles={['Admin']}><AdminStockMovements /></ProtectedRoute>} />
        <Route path="/admin/trucks"         element={<ProtectedRoute allowedRoles={['Admin']}><AdminTrucks /></ProtectedRoute>} />
        <Route path="/admin/drivers"        element={<ProtectedRoute allowedRoles={['Admin']}><AdminDrivers /></ProtectedRoute>} />

        {/* Operator */}
        <Route path="/operator/dashboard"      element={<ProtectedRoute allowedRoles={['Operator']}><OperatorDashboard /></ProtectedRoute>} />
        <Route path="/operator/products"       element={<ProtectedRoute allowedRoles={['Operator']}><OperatorProducts /></ProtectedRoute>} />
        <Route path="/operator/stocks"         element={<ProtectedRoute allowedRoles={['Operator']}><OperatorStocks /></ProtectedRoute>} />
        <Route path="/operator/stockmovements" element={<ProtectedRoute allowedRoles={['Operator']}><OperatorStockMovements /></ProtectedRoute>} />

        {/* Viewer */}
        <Route path="/viewer/dashboard"      element={<ProtectedRoute allowedRoles={['Viewer']}><ViewerDashboard /></ProtectedRoute>} />
        <Route path="/viewer/products"       element={<ProtectedRoute allowedRoles={['Viewer']}><ViewerProduct /></ProtectedRoute>} />
        <Route path="/viewer/stocks"         element={<ProtectedRoute allowedRoles={['Viewer']}><ViewerStock /></ProtectedRoute>} />
        <Route path="/viewer/warehouses"     element={<ProtectedRoute allowedRoles={['Viewer']}><ViewerWarehouse /></ProtectedRoute>} />
        <Route path="/viewer/stockmovements" element={<ProtectedRoute allowedRoles={['Viewer']}><ViewerStockMovements /></ProtectedRoute>} />

        {/* Unauthorized */}
        <Route path="/unauthorized" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Unauthorized</h1>
            <p>You don't have permission to access this page.</p>
            <button onClick={() => window.location.href = '/dashboard'}>Go Back</button>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;