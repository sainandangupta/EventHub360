import { useState, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/employees';
const getHeaders = () => ({ Authorization: localStorage.getItem('token') });

export default function useEmployee() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { headers: getHeaders() });
      const list = res.data.data || res.data;
      setEmployees(list);
      return list;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmployee = async (id) => {
    const res = await axios.get(`${API}/${id}`, { headers: getHeaders() });
    return res.data;
  };

  const createEmployee = async (data) => {
    const res = await axios.post(API, data, { headers: getHeaders() });
    return res.data;
  };

  const updateEmployee = async (id, data) => {
    const res = await axios.put(`${API}/${id}`, data, { headers: getHeaders() });
    return res.data;
  };

  const deleteEmployee = async (id) => {
    const res = await axios.delete(`${API}/${id}`, { headers: getHeaders() });
    return res.data;
  };

  return { employees, loading, error, fetchEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
}
