import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { showToast, StatCard } from '../components/ui';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AttendanceDashboard() {
  const [todayStatus, setTodayStatus] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: token };

  const fetchData = useCallback(async () => {
    try {
      const [todayRes, attendanceRes, statsRes, historyRes] = await Promise.all([
        api.get('/api/attendance/today', { headers }),
        api.get(`/api/attendance/my-attendance?month=${selectedMonth}&year=${selectedYear}`, { headers }),
        api.get(`/api/attendance/stats?month=${selectedMonth}&year=${selectedYear}`, { headers }),
        api.get('/api/attendance/history?limit=50', { headers }),
      ]);
      setTodayStatus(todayRes.data);
      setAttendance(attendanceRes.data);
      setStats(statsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/api/attendance/check-in', {}, { headers });
      showToast({ message: 'Checked in successfully! ☀️', type: 'success' });
      fetchData();
    } catch (err) {
      showToast({ message: err.response?.data?.message || 'Check-in failed', type: 'error' });
    }
    setActionLoading(false);
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/api/attendance/check-out', {}, { headers });
      showToast({ message: 'Checked out successfully! 🌙', type: 'success' });
      fetchData();
    } catch (err) {
      showToast({ message: err.response?.data?.message || 'Check-out failed', type: 'error' });
    }
    setActionLoading(false);
  };

  const filteredHistory = history.filter(h => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      h.date?.includes(s) ||
      h.status?.toLowerCase().includes(s)
    );
  });

  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month - 1, 1).getDay();

  const attendanceMap = {};
  attendance.forEach(a => { attendanceMap[a.date?.split('T')[0]] = a; });

  const monthlyStats = stats?.monthly || {};
  const overallStats = stats?.overall || {};
  const percentage = parseFloat(overallStats.attendance_percentage || 0);

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div className="auth-spinner" style={{ width: 32, height: 32, margin: '0 auto 12px', borderColor: 'var(--border-color)', borderTopColor: 'var(--color-primary)' }} />
        Loading attendance data...
      </div>
    );
  }

  return (
    <div className="page-container attendance-page" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>📋 Attendance Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your daily attendance, check-in/out times, and monthly reports</p>
      </div>

      {/* Check-in / Check-out Action Card */}
      <div className="attendance-action-card">
        <div className="attendance-status-indicator">
          <div className={`attendance-status-dot ${todayStatus?.check_in ? 'checked-in' : 'not-checked-in'}`} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              {todayStatus?.check_in
                ? (todayStatus?.check_out ? '✅ Completed for today' : '🟢 Currently checked in')
                : '⏳ Not checked in yet'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {todayStatus?.check_in && `Check-in: ${new Date(todayStatus.check_in).toLocaleTimeString()}`}
              {todayStatus?.check_out && ` • Check-out: ${new Date(todayStatus.check_out).toLocaleTimeString()}`}
              {todayStatus?.work_hours > 0 && ` • ${todayStatus.work_hours}h worked`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="attendance-btn attendance-btn-checkin"
            onClick={handleCheckIn}
            disabled={actionLoading || todayStatus?.check_in}
          >
            ☀️ Check In
          </button>
          <button
            className="attendance-btn attendance-btn-checkout"
            onClick={handleCheckOut}
            disabled={actionLoading || !todayStatus?.check_in || todayStatus?.check_out}
          >
            🌙 Check Out
          </button>
        </div>
      </div>

      {/* Stats KPIs */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          📊 {MONTHS[selectedMonth - 1]} {selectedYear} Summary
        </h2>
        <div className="attendance-summary-grid">
          <StatCard icon="✅" title="Present Days" value={monthlyStats.present_days || 0} color="#10b981" />
          <StatCard icon="❌" title="Absent Days" value={monthlyStats.absent_days || 0} color="#ef4444" />
          <StatCard icon="⏰" title="Late Days" value={monthlyStats.late_days || 0} color="#f59e0b" />
          <StatCard icon="⏱️" title="Avg Hours" value={`${monthlyStats.avg_work_hours || 0}h`} color="#3b82f6" />
          <StatCard icon="📈" title="Overall %" value={`${percentage}%`} color="#6366f1" />
        </div>
      </div>

      {/* Month/Year Selector + Calendar */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>📅 Monthly Calendar</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="master-filter-select">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="master-filter-select">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="attendance-calendar" style={{ marginBottom: 4 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', padding: '8px 0' }}>{d}</div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="attendance-calendar">
          {Array.from({ length: getFirstDayOfMonth(selectedMonth, selectedYear) }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendanceMap[dateStr];
            const dayOfWeek = new Date(selectedYear, selectedMonth - 1, day).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const status = record?.status || (isWeekend ? 'weekend' : '');

            return (
              <div
                key={day}
                className={`attendance-calendar-day ${status} ${isToday ? 'today' : ''}`}
                title={record ? `${record.status} - ${record.work_hours || 0}h` : isWeekend ? 'Weekend' : ''}
              >
                <span>{day}</span>
                {record && <span style={{ fontSize: '0.6rem' }}>{record.status === 'present' ? '✅' : record.status === 'absent' ? '❌' : '⏰'}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance History Table */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>📜 Attendance History</h3>
          <input
            type="text"
            placeholder="Search by date or status..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="master-filter-input"
            style={{ minWidth: 220 }}
          />
        </div>

        <div className="master-table-container" style={{ border: 'none' }}>
          <table className="master-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>No attendance records found</td></tr>
              ) : (
                filteredHistory.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>{h.check_in ? new Date(h.check_in).toLocaleTimeString() : '—'}</td>
                    <td>{h.check_out ? new Date(h.check_out).toLocaleTimeString() : '—'}</td>
                    <td>{h.work_hours ? `${h.work_hours}h` : '—'}</td>
                    <td>
                      <span className={`work-mode-badge ${h.status === 'present' ? 'work-mode-online' : h.status === 'absent' ? 'status-inactive' : 'work-mode-hybrid'}`}>
                        {h.status === 'present' ? '✅ Present' : h.status === 'absent' ? '❌ Absent' : h.status === 'late' ? '⏰ Late' : h.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
