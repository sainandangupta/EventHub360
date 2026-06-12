import React, { useState, useEffect } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';
import FormTable from '../components/ui/FormTable';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';
import { showToast } from '../components/ui';

export default function ReportsDashboard() {
  const [reportType, setReportType] = useState('employees'); // employees, leaves, assets
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Global search, sorting, filtering, pagination states
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [departments, setDepartments] = useState([]);

  // Sorting
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Pagination (Frontend paging for report view details, or backend if desired)
  const [page, setPage] = useState(1);
  const limit = 10;

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch departments for filtering dropdown
    api.get('/api/departments', { headers: { Authorization: token } })
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));
  }, [token]);

  const fetchData = () => {
    setLoading(true);
    setError('');
    
    let endpoint = '';
    if (reportType === 'employees') {
      endpoint = '/api/employees';
    } else if (reportType === 'leaves') {
      // Fetch leave balances or summary
      endpoint = '/api/leave/reports/leave-balance';
    } else if (reportType === 'assets') {
      endpoint = '/api/assets/report';
    }

    api.get(endpoint, { headers: { Authorization: token } })
      .then(res => {
        const reportRows = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setData(reportRows);
        setPage(1);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || `Failed to fetch ${reportType} report data`);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, token]);

  // Handle global search, filtering, and sorting in React memory
  const getProcessedData = () => {
    let result = [...data];

    // Global Search
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(row => {
        if (reportType === 'employees') {
          return (
            String(row.name || '').toLowerCase().includes(s) ||
            String(row.email || '').toLowerCase().includes(s) ||
            String(row.phone || '').toLowerCase().includes(s) ||
            String(row.designation || '').toLowerCase().includes(s) ||
            String(row.department_name || '').toLowerCase().includes(s)
          );
        } else if (reportType === 'leaves') {
          return (
            String(row.employee_name || '').toLowerCase().includes(s) ||
            String(row.leave_name || '').toLowerCase().includes(s) ||
            String(row.department_name || '').toLowerCase().includes(s)
          );
        } else if (reportType === 'assets') {
          return (
            String(row.asset_code || '').toLowerCase().includes(s) ||
            String(row.asset_name || '').toLowerCase().includes(s) ||
            String(row.asset_type || '').toLowerCase().includes(s) ||
            String(row.status || '').toLowerCase().includes(s) ||
            String(row.current_user_name || '').toLowerCase().includes(s)
          );
        }
        return false;
      });
    }

    // Department Filter
    if (deptFilter) {
      result = result.filter(row => {
        const d = row.department_name || '';
        return d === deptFilter;
      });
    }

    // Status Filter
    if (statusFilter) {
      result = result.filter(row => {
        const s = row.status || '';
        return s.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Date Range Filter (e.g. for purchase date or creation date)
    if (dateFrom || dateTo) {
      result = result.filter(row => {
        const dateStr = reportType === 'assets' ? row.purchase_date : (row.created_at || row.applied_on);
        if (!dateStr) return false;
        const targetDate = new Date(dateStr);
        if (dateFrom && targetDate < new Date(dateFrom)) return false;
        if (dateTo && targetDate > new Date(dateTo + 'T23:59:59')) return false;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle nulls
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      // Numeric check
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'ASC' ? valA - valB : valB - valA;
      }

      // String check
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
      if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
      return 0;
    });

    return result;
  };

  const processedData = getProcessedData();

  // Pagination bounds
  const total = processedData.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedData = processedData.slice(startIndex, startIndex + limit);

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('DESC');
    }
  };

  // EXPORTS
  const exportToExcel = () => {
    if (processedData.length === 0) {
      showToast({ message: 'No data available to export', type: 'warning' });
      return;
    }
    const cleanData = processedData.map(({ id, user_id, department_id, employee_id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
    XLSX.writeFile(workbook, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    if (processedData.length === 0) {
      showToast({ message: 'No data available to export', type: 'warning' });
      return;
    }
    const cleanData = processedData.map(({ id, user_id, department_id, employee_id, ...rest }) => rest);
    const keys = Object.keys(cleanData[0]);
    const csvHeaders = keys.join(',');
    const csvRows = cleanData.map(row => 
      keys.map(key => `"${String(row[key] || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvHeaders + '\n' + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printPDF = () => {
    const printWindow = window.open('', '_blank');
    const cleanData = processedData.map(({ id, user_id, department_id, employee_id, ...rest }) => rest);
    if (cleanData.length === 0) return;
    const keys = Object.keys(cleanData[0]);

    const title = `${reportType.toUpperCase()} REPORT`;

    let html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; color: #0066cc; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #777; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Records: ${cleanData.length}</p>
          <table>
            <thead>
              <tr>
                ${keys.map(k => `<th>${k.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${cleanData.map(row => `
                <tr>
                  ${keys.map(k => `<td>${row[k] !== undefined && row[k] !== null ? row[k] : ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">Confidential Corporate Report - generated via ERP Portal.</div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Render headers based on Report Type
  const getHeaders = () => {
    if (reportType === 'employees') {
      return [
        { label: 'Name', key: 'name', render: (val) => <span style={{ fontWeight: '700' }}>{val}</span> },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
        { label: 'Department', key: 'department_name' },
        { label: 'Designation', key: 'designation' },
        { label: 'Salary', key: 'salary', render: (val) => `$${parseFloat(val).toLocaleString()}` }
      ];
    } else if (reportType === 'leaves') {
      return [
        { label: 'Employee Name', key: 'employee_name', render: (val) => <span style={{ fontWeight: '700' }}>{val}</span> },
        { label: 'Department', key: 'department_name' },
        { label: 'Leave Type', key: 'leave_name' },
        { label: 'Allocated Days', key: 'total_allocated' },
        { label: 'Available Days', key: 'available_days' },
        { label: 'Used Days', key: 'used_days' }
      ];
    } else if (reportType === 'assets') {
      return [
        { label: 'Asset Code', key: 'asset_code', render: (val) => <span style={{ fontWeight: '700' }}>{val}</span> },
        { label: 'Asset Name', key: 'asset_name' },
        { label: 'Asset Type', key: 'asset_type' },
        { label: 'Purchase Date', key: 'purchase_date', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
        { label: 'Cost', key: 'purchase_cost', render: (val) => val ? `$${parseFloat(val).toLocaleString()}` : 'N/A' },
        { label: 'Status', key: 'status' },
        { label: 'Allocated To', key: 'current_user_name', render: (val) => val || <span style={{ color: 'var(--text-secondary)' }}>Inventory</span> }
      ];
    }
    return [];
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header and Report Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>📑 ERP System Reporting & Search Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Generate PDF, Excel, and CSV data reports, filtered by departments, date-ranges, or custom criteria.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setReportType('employees')} 
            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
              backgroundColor: reportType === 'employees' ? 'var(--color-primary-light)' : 'transparent',
              color: reportType === 'employees' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Employees
          </button>
          <button 
            onClick={() => setReportType('leaves')} 
            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
              backgroundColor: reportType === 'leaves' ? 'var(--color-primary-light)' : 'transparent',
              color: reportType === 'leaves' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Leave Balances
          </button>
          <button 
            onClick={() => setReportType('assets')} 
            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
              backgroundColor: reportType === 'assets' ? 'var(--color-primary-light)' : 'transparent',
              color: reportType === 'assets' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Assets Ledger
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)' }}>
        
        {/* Global Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Global Search</label>
          <FormInput
            placeholder="Type anything..."
            name="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ margin: 0, padding: '0.5rem 0.75rem' }}
          />
        </div>

        {/* Department Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Department</label>
          <FormSelect
            name="deptFilter"
            placeholder="All Departments"
            options={departments.map(d => ({ value: d.department_name, label: d.department_name }))}
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
            style={{ margin: 0, padding: '0.5rem' }}
          />
        </div>

        {/* Optional Status filter */}
        {reportType === 'assets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Asset Status</label>
            <FormSelect
              name="statusFilter"
              placeholder="All Statuses"
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Allocated', label: 'Allocated' },
                { value: 'Returned', label: 'Returned' },
                { value: 'Damaged', label: 'Damaged' },
                { value: 'Lost', label: 'Lost' }
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ margin: 0, padding: '0.5rem' }}
            />
          </div>
        )}

        {/* Date From */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Date From</label>
          <FormInput
            type="date"
            name="dateFrom"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            style={{ margin: 0, padding: '0.5rem' }}
          />
        </div>

        {/* Date To */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Date To</label>
          <FormInput
            type="date"
            name="dateTo"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            style={{ margin: 0, padding: '0.5rem' }}
          />
        </div>

      </div>

      {error && (
        <div style={{ color: 'var(--color-danger)', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(220, 53, 69, 0.1)', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button 
            onClick={fetchData} 
            style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--color-primary-light)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Action Toolbar & Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Order by:</span>
          <button 
            onClick={() => handleSort(reportType === 'employees' ? 'name' : reportType === 'leaves' ? 'employee_name' : 'asset_code')}
            style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {sortField === 'id' ? 'ID' : sortField} ({sortOrder})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={printPDF} 
            style={{ padding: '0.6rem 1.2rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
          >
            🖨️ Print PDF
          </button>
          <button 
            onClick={exportToExcel} 
            style={{ padding: '0.6rem 1.2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
          >
            📊 Excel Sheets
          </button>
          <button 
            onClick={exportToCSV} 
            style={{ padding: '0.6rem 1.2rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
          >
            📥 Download CSV
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <FormTable
        headers={getHeaders()}
        data={paginatedData}
        loading={loading}
        keyField="id"
        emptyMessage="No matching data found for this report configuration."
      />

      {/* Paging Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{paginatedData.length}</strong> of <strong>{total}</strong> records (Page {page} of {totalPages})
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(page - 1)} 
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', backgroundColor: page <= 1 ? 'transparent' : 'var(--bg-secondary)', color: page <= 1 ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(page + 1)} 
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', backgroundColor: page >= totalPages ? 'transparent' : 'var(--bg-secondary)', color: page >= totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
