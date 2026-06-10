import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const LeaveContext = createContext(null);

export function LeaveProvider({ children }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myBalance, setMyBalance] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getHeaders = () => ({ Authorization: localStorage.getItem('token') });
  const API = 'http://localhost:5000/api/leave';

  const fetchLeaveTypes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/types`, { headers: getHeaders() });
      setLeaveTypes(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave types');
    }
  }, []);

  const fetchMyBalance = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/balance`, { headers: getHeaders() });
      setMyBalance(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance');
    }
  }, []);

  const fetchMyLeaves = useCallback(async (status = '') => {
    try {
      setLoading(true);
      const url = status ? `${API}/my-leaves?status=${status}` : `${API}/my-leaves`;
      const res = await axios.get(url, { headers: getHeaders() });
      const leaves = res.data.data || res.data;
      setMyLeaves(leaves);
      return leaves;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/pending`, { headers: getHeaders() });
      setPendingApprovals(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/dashboard-stats`, { headers: getHeaders() });
      setDashboardStats(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
    }
  }, []);

  const applyLeave = async (data) => {
    const res = await axios.post(`${API}/apply`, data, { headers: getHeaders() });
    return res.data;
  };

  const cancelLeave = async (leaveId) => {
    const res = await axios.put(`${API}/${leaveId}/cancel`, {}, { headers: getHeaders() });
    return res.data;
  };

  const approveLeave = async (leaveId, action, remarks) => {
    const res = await axios.put(`${API}/${leaveId}/approve`, { action, remarks }, { headers: getHeaders() });
    return res.data;
  };

  const getLeaveById = async (id) => {
    const res = await axios.get(`${API}/${id}`, { headers: getHeaders() });
    return res.data;
  };

  const getApprovalHistory = async (id) => {
    const res = await axios.get(`${API}/${id}/history`, { headers: getHeaders() });
    return res.data;
  };

  const getReports = async (type, year) => {
    const res = await axios.get(`${API}/reports/${type}?year=${year || new Date().getFullYear()}`, { headers: getHeaders() });
    return res.data;
  };

  return (
    <LeaveContext.Provider value={{
      leaveTypes, myBalance, myLeaves, pendingApprovals, dashboardStats, loading, error,
      fetchLeaveTypes, fetchMyBalance, fetchMyLeaves, fetchPendingApprovals, fetchDashboardStats,
      applyLeave, cancelLeave, approveLeave, getLeaveById, getApprovalHistory, getReports,
      setError
    }}>
      {children}
    </LeaveContext.Provider>
  );
}
