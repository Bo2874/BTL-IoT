import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, updateUserRole, deleteUser } from '../api/users';
import '../styles/user-management.css';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (userToEdit) => {
    setSelectedUser(userToEdit);
    setNewRole(userToEdit.role);
    setShowEditModal(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !newRole) return;
    
    try {
      await updateUserRole(selectedUser._id, newRole);
      setShowEditModal(false);
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (err) {
      setError(err.message);
      console.error('Update role error:', err);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) {
      return;
    }
    
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.message);
      console.error('Delete user error:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (user?.role !== 'Admin') {
    return (
      <div className="user-management">
        <div className="access-denied">
          <h2>⛔ Không có quyền truy cập</h2>
          <p>Chỉ Admin mới có thể quản lý người dùng</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading">Đang tải danh sách người dùng...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h1>👥 Quản Lý Người Dùng</h1>
        <p className="subtitle">Quản lý tài khoản và phân quyền người dùng</p>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="role-filter">
          <label>Lọc theo role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="All">Tất cả</option>
            <option value="Admin">Admin</option>
            <option value="Worker">Worker</option>
          </select>
        </div>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Tổng người dùng</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <div className="stat-value">{users.filter(u => u.role === 'Admin').length}</div>
            <div className="stat-label">Admin</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👷</div>
          <div className="stat-info">
            <div className="stat-value">{users.filter(u => u.role === 'Worker').length}</div>
            <div className="stat-label">Worker</div>
          </div>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Số thiết bị</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td>
                  <div className="user-name">
                    {u.name}
                    {u._id === user._id && <span className="you-badge">Bạn</span>}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role.toLowerCase()}`}>
                    {u.role === 'Admin' ? '👑 Admin' : '👷 Worker'}
                  </span>
                </td>
                <td>
                  <span className="device-count">
                    {u.deviceCount !== undefined ? u.deviceCount : (u.devices?.length || 0)} thiết bị
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditRole(u)}
                      className="btn-edit"
                      disabled={u._id === user._id}
                      title={u._id === user._id ? 'Không thể thay đổi role của chính mình' : 'Chỉnh sửa role'}
                    >
                      ✏️ Role
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id, u.name)}
                      className="btn-delete"
                      disabled={u._id === user._id}
                      title={u._id === user._id ? 'Không thể xóa chính mình' : 'Xóa người dùng'}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chỉnh sửa Role</h2>
            <form onSubmit={handleUpdateRole}>
              <div className="form-group">
                <label>Người dùng:</label>
                <input type="text" value={selectedUser.name} disabled />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input type="text" value={selectedUser.email} disabled />
              </div>
              
              <div className="form-group">
                <label>Role hiện tại:</label>
                <span className={`role-badge ${selectedUser.role.toLowerCase()}`}>
                  {selectedUser.role}
                </span>
              </div>
              
              <div className="form-group">
                <label>Role mới: <span className="required">*</span></label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  required
                >
                  <option value="Admin">👑 Admin</option>
                  <option value="Worker">👷 Worker</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  💾 Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-cancel"
                >
                  ❌ Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
