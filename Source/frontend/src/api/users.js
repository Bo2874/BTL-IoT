import { API_BASE_URL } from '../config';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch users');
  }
  
  return response.json();
};

export const getUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user');
  }
  
  return response.json();
};

export const updateUserRole = async (id, role) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify({ role })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user role');
  }
  
  return response.json();
};

export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  
  return response.json();
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }
  
  return response.json();
};
