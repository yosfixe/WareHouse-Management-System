import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../Header';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    role_id: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setSelectedUsers([]);
    setSelectAll(false);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
      setSelectAll(true);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedUsers, userId];
      setSelectedUsers(newSelected);
      if (newSelected.length === filteredUsers.length) {
        setSelectAll(true);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to delete');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await Promise.all(
        selectedUsers.map(id => api.delete(`/users/${id}`))
      );
      setShowBulkDeleteModal(false);
      setSelectedUsers([]);
      setSelectAll(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting users:', err);
      alert('Failed to delete some users');
    }
  };

  const handleAddUser = () => {
    setModalMode('add');
    setFormData({
      username: '',
      password: '',
      fullname: '',
      role_id: ''
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '••••••••••',
      fullname: user.fullname,
      role_id: user.role_id
    });
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setDeleteUserId(user.id);
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleOpenPasswordModal = () => {
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      await api.put(`/users/${selectedUser.id}`, {
        password: passwordData.newPassword
      });
      
      setShowPasswordModal(false);
      alert('Password changed successfully!');
      
      // Update the form data to show new password (masked)
      setFormData({...formData, password: '••••••••••'});
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Failed to change password: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        username: formData.username,
        fullname: formData.fullname,
        role_id: formData.role_id
      };

      // Only include password for new users
      if (modalMode === 'add') {
        submitData.password = formData.password;
      }

      if (modalMode === 'add') {
        await api.post('/users', submitData);
      } else {
        await api.put(`/users/${selectedUser.id}`, submitData);
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Failed to save user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/users/${deleteUserId}`);
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  const getRoleBadgeStyle = (roleName) => {
    switch(roleName?.toLowerCase()) {
      case 'admin':
        return { bg: 'var(--role-admin-bg)', color: 'var(--role-admin-text)', border: 'var(--role-admin-border)' };
      case 'operator':
        return { bg: 'var(--role-operator-bg)', color: 'var(--role-operator-text)', border: 'var(--role-operator-border)' };
      case 'viewer':
        return { bg: 'var(--role-viewer-bg)', color: 'var(--role-viewer-text)', border: 'var(--role-viewer-border)' };
      default:
        return { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'var(--border-secondary)' };
    }
  };

  const roleStats = {
    total: users.length,
    admins: users.filter(u => u.role?.name === 'Admin').length,
    operators: users.filter(u => u.role?.name === 'Operator').length,
    viewers: users.filter(u => u.role?.name === 'Viewer').length
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', fontFamily: 'Segoe UI, sans-serif' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ padding: '32px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)' }}>User Management</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>Manage system users and role assignments</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedUsers.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: 'var(--btn-secondary-bg)', 
                  color: 'var(--btn-secondary-text)', 
                  border: '1px solid var(--btn-secondary-border)', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontSize: '14px', 
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
                Delete ({selectedUsers.length})
              </button>
            )}
            <button 
              onClick={handleAddUser}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: 'var(--btn-secondary-bg)', 
                color: 'var(--btn-secondary-text)', 
                border: '1px solid var(--btn-secondary-border)', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '14px', 
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
              + Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Users', value: roleStats.total },
            { label: 'Admins', value: roleStats.admins },
            { label: 'Operators', value: roleStats.operators },
            { label: 'Viewers', value: roleStats.viewers }
          ].map(card => (
            <div key={card.label} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '20px 24px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--card-border)' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="🔍 Search by username, full name, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--input-border)',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--input-text)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
            />
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--table-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>Full Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>Username</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>Created At</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: 'var(--table-header-text)', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(user => {
                  const isSelected = selectedUsers.includes(user.id);
                  const roleStyle = getRoleBadgeStyle(user.role?.name);
                  
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-divider)', backgroundColor: isSelected ? 'var(--bg-selected)' : 'transparent' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectUser(user.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>#{user.id}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.fullname}</td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{user.username}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '3px 10px', 
                          borderRadius: '50px', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          backgroundColor: roleStyle.bg,
                          color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`
                        }}>
                          {user.role?.name || 'No Role'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleViewDetails(user)} 
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: 'var(--btn-secondary-bg)', 
                              color: 'var(--btn-secondary-text)', 
                              border: '1px solid var(--btn-secondary-border)', 
                              borderRadius: '4px', 
                              cursor: 'pointer', 
                              fontSize: '12px', 
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
                            onClick={() => handleEditUser(user)} 
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: 'var(--btn-secondary-bg)', 
                              color: 'var(--btn-secondary-text)', 
                              border: '1px solid var(--btn-secondary-border)', 
                              borderRadius: '4px', 
                              cursor: 'pointer', 
                              fontSize: '12px', 
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
                            onClick={() => handleDeleteClick(user)} 
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: 'var(--btn-secondary-bg)', 
                              color: 'var(--btn-secondary-text)', 
                              border: '1px solid var(--btn-secondary-border)', 
                              borderRadius: '4px', 
                              cursor: 'pointer', 
                              fontSize: '12px', 
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
                    <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {searchTerm ? 'No users found' : 'No users yet'}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
                        {searchTerm ? 'Try a different search term' : 'Click "Add User" to create your first user'}
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
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.fullname} 
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} 
                  placeholder="Enter full name" 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Username (Email) *</label>
                <input 
                  type="email" 
                  required 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} 
                  placeholder="Enter email address" 
                />
              </div>

              {/* Password Field - Different for Add vs Edit */}
              {modalMode === 'add' ? (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Password *</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} 
                    placeholder="Enter password" 
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Password</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="password"
                      value="••••••••••"
                      readOnly
                      style={{ 
                        flex: 1,
                        padding: '10px 12px', 
                        border: '1px solid var(--input-border)', 
                        borderRadius: '6px', 
                        fontSize: '14px', 
                        outline: 'none', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        color: 'var(--text-primary)',
                        cursor: 'not-allowed'
                      }} 
                    />
                    <button 
                      type="button"
                      onClick={handleOpenPasswordModal}
                      style={{ 
                        padding: '10px 20px', 
                        backgroundColor: 'var(--btn-secondary-bg)', 
                        color: 'var(--btn-secondary-text)', 
                        border: '1px solid var(--btn-secondary-border)', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Role *</label>
                <select 
                  required 
                  value={formData.role_id} 
                  onChange={(e) => setFormData({...formData, role_id: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
                >
                  <option value="">Select a role</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  {modalMode === 'add' ? 'Add User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div onClick={() => setShowPasswordModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>🔒 Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--alert-info-bg)', border: '1px solid var(--alert-info-border)', borderRadius: '6px' }}>
              <div style={{ fontSize: '13px', color: 'var(--alert-info-text)' }}>
                Changing password for: <strong>{selectedUser?.fullname}</strong>
              </div>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>New Password *</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} 
                  placeholder="Enter new password (min 6 characters)" 
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Confirm New Password *</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }} 
                  placeholder="Re-enter new password" 
                />
              </div>

              {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--alert-error-bg)', border: '1px solid var(--alert-error-border)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--alert-error-text)' }}>
                    ⚠️ Passwords do not match!
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={{ padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Change Password
                </button>
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
                Are you sure you want to delete <strong>{selectedUser?.fullname}</strong>? This action cannot be undone.
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
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '450px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>⚠️ Confirm Bulk Delete</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                You are about to delete <strong>{selectedUsers.length}</strong> user{selectedUsers.length > 1 ? 's' : ''}. This action cannot be undone.
              </p>
              <div style={{ backgroundColor: 'var(--alert-error-bg)', border: '1px solid var(--alert-error-border)', borderRadius: '6px', padding: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--alert-error-text)', marginBottom: '8px' }}>Users to be deleted:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {filteredUsers.filter(u => selectedUsers.includes(u.id)).map(u => (
                    <li key={u.id}>{u.fullname} ({u.username})</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBulkDeleteModal(false)} style={{ padding: '10px 20px', border: '1px solid var(--btn-secondary-border)', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'var(--btn-secondary-bg)', fontSize: '14px', fontWeight: '600', color: 'var(--btn-secondary-text)' }}>Cancel</button>
              <button onClick={handleBulkDeleteConfirm} style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                Delete {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedUser && (
        <div onClick={() => setShowDetailsModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)' }}>User Details</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>User ID</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>#{selectedUser.id}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Role</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {(() => {
                    const roleStyle = getRoleBadgeStyle(selectedUser.role?.name);
                    return (
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '50px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        backgroundColor: roleStyle.bg,
                        color: roleStyle.color,
                        border: `1px solid ${roleStyle.border}`
                      }}>
                        {selectedUser.role?.name || 'No Role'}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedUser.fullname}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Username (Email)</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedUser.username}</div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Created At</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Last Updated</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowDetailsModal(false); handleEditUser(selectedUser); }} 
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
                Edit User
              </button>
              <button onClick={() => setShowDetailsModal(false)} style={{ padding: '10px 20px', backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;