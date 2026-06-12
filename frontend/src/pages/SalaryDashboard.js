import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';
import { showToast } from '../components/ui';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

export default function SalaryDashboard() {
  const [activeTab, setActiveTab] = useState('structures'); // structures, payroll, compliance
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Salary Structure Form
  const [structure, setStructure] = useState({
    basic_salary: 0,
    hra: 0,
    allowances: 0,
    bonus: 0,
    deductions: 0,
    tds: 0,
    pf: 0,
    esic: 0
  });

  // Payroll Period
  const [period, setPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [payrollData, setPayrollData] = useState([]);
  const [generatingPayroll, setGeneratingPayroll] = useState(false);

  // Compliance States
  const [complianceType, setComplianceType] = useState('tds'); // tds, pf, esic
  const [complianceData, setComplianceData] = useState([]);
  const [complianceYear, setComplianceYear] = useState(new Date().getFullYear());

  // Chart data
  const [summaryData, setSummaryData] = useState([]);

  const token = localStorage.getItem('token');
  const headers = { Authorization: token };

  // Fetch initial employee list
  useEffect(() => {
    api.get('/api/employees?limit=200', { headers })
      .then(res => setEmployees(res.data.data || res.data || []))
      .catch(err => console.error(err));

    fetchMonthlySummary();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMonthlySummary = () => {
    api.get('/api/salary/reports/monthly-summary', { headers })
      .then(res => {
        // Reverse to display chronological order in charts
        const formatted = (res.data || []).map(item => ({
          ...item,
          period: `${MONTHS.find(m => m.value === item.month)?.label || item.month} ${item.year}`,
          'Total Expense': parseFloat(item.total_payroll)
        })).reverse();
        setSummaryData(formatted);
      })
      .catch(err => console.error('Error fetching monthly summary:', err));
  };

  // Fetch Structure for selected employee
  useEffect(() => {
    if (!selectedEmpId) {
      setStructure({
        basic_salary: 0,
        hra: 0,
        allowances: 0,
        bonus: 0,
        deductions: 0,
        tds: 0,
        pf: 0,
        esic: 0
      });
      return;
    }

    setLoading(true);
    api.get(`/api/salary/structure/${selectedEmpId}`, { headers })
      .then(res => {
        if (res.data && res.data.employee_id) {
          setStructure({
            basic_salary: parseFloat(res.data.basic_salary) || 0,
            hra: parseFloat(res.data.hra) || 0,
            allowances: parseFloat(res.data.allowances) || 0,
            bonus: parseFloat(res.data.bonus) || 0,
            deductions: parseFloat(res.data.deductions) || 0,
            tds: parseFloat(res.data.tds) || 0,
            pf: parseFloat(res.data.pf) || 0,
            esic: parseFloat(res.data.esic) || 0
          });
        } else {
          // Find employee's base salary from profile
          const emp = employees.find(e => String(e.id) === String(selectedEmpId));
          setStructure({
            basic_salary: emp ? parseFloat(emp.salary) || 0 : 0,
            hra: 0,
            allowances: 0,
            bonus: 0,
            deductions: 0,
            tds: 0,
            pf: 0,
            esic: 0
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedEmpId, employees]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStructureChange = (e) => {
    setStructure({ ...structure, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      showToast({ message: 'Please select an employee first.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/salary/structure', {
        employee_id: parseInt(selectedEmpId),
        ...structure
      }, { headers });
      
      showToast({ message: 'Salary structure updated successfully!', type: 'success' });
      // Refresh the structures/employee profile list if needed
    } catch (err) {
      showToast({ message: err.response?.data?.message || 'Failed to save salary structure.', type: 'error' });
    }
    setLoading(false);
  };

  // Fetch Payroll Data
  const fetchPayroll = useCallback(() => {
    setLoading(true);
    api.get(`/api/salary/payroll?month=${period.month}&year=${period.year}`, { headers })
      .then(res => {
        setPayrollData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'payroll') {
      fetchPayroll();
    }
  }, [activeTab, fetchPayroll]);

  const handleGeneratePayroll = async () => {
    setGeneratingPayroll(true);
    try {
      const res = await api.post('/api/salary/payroll/generate', {
        month: period.month,
        year: period.year
      }, { headers });

      showToast({ message: res.data.message || 'Payroll generated successfully!', type: 'success' });
      fetchPayroll();
      fetchMonthlySummary();
    } catch (err) {
      showToast({ message: err.response?.data?.message || 'Failed to generate payroll.', type: 'error' });
    }
    setGeneratingPayroll(false);
  };

  // Fetch Compliance Data
  const fetchCompliance = useCallback(() => {
    setLoading(true);
    let endpoint = '';
    if (complianceType === 'tds') {
      endpoint = `/api/salary/reports/tds?year=${complianceYear}`;
    } else if (complianceType === 'pf') {
      endpoint = `/api/salary/reports/pf?month=${period.month}&year=${period.year}`;
    } else if (complianceType === 'esic') {
      endpoint = `/api/salary/reports/esic?month=${period.month}&year=${period.year}`;
    }

    api.get(endpoint, { headers })
      .then(res => {
        setComplianceData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [complianceType, complianceYear, period]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'compliance') {
      fetchCompliance();
    }
  }, [activeTab, fetchCompliance]);

  // Calculations
  const calculatedNetSalary = 
    structure.basic_salary + 
    structure.hra + 
    structure.allowances + 
    structure.bonus - 
    structure.deductions - 
    structure.tds - 
    structure.pf - 
    structure.esic;

  // Exports
  const exportPayrollToExcel = () => {
    if (payrollData.length === 0) {
      showToast({ message: 'No payroll records to export.', type: 'warning' });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(payrollData.map(({ id, employee_id, ...rest }) => rest));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Run');
    XLSX.writeFile(workbook, `payroll_${period.month}_${period.year}.xlsx`);
  };

  const exportComplianceToExcel = () => {
    if (complianceData.length === 0) {
      showToast({ message: 'No compliance records to export.', type: 'warning' });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(complianceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${complianceType.toUpperCase()} Report`);
    XLSX.writeFile(workbook, `compliance_${complianceType}_${complianceYear}.xlsx`);
  };

  const printPDFReport = (title, data, columns) => {
    const printWindow = window.open('', '_blank');
    if (data.length === 0) return;

    let html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; color: #4f46e5; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #777; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Records: ${data.length}</p>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${columns.map(col => `<td>${row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">Confidential Payroll Document - generated via Employee Management Portal.</div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="page-container salary-dashboard" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>💰 Salary & Payroll Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage employee payroll, structure basic components, and generate compliance reports.</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('structures')} 
            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
              backgroundColor: activeTab === 'structures' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'structures' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Salary Setup
          </button>
          <button 
            onClick={() => setActiveTab('payroll')} 
            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
              backgroundColor: activeTab === 'payroll' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'payroll' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Monthly Payroll
          </button>
          <button 
            onClick={() => setActiveTab('compliance')} 
            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
              backgroundColor: activeTab === 'compliance' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'compliance' ? 'white' : 'var(--text-secondary)'
            }}
          >
            Compliance Reports
          </button>
        </div>
      </div>

      {/* Tab Content 1: Salary Setup */}
      {activeTab === 'structures' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
          {/* Employee Picker */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Select Employee</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <select 
                value={selectedEmpId} 
                onChange={e => setSelectedEmpId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
              >
                <option value="">-- Choose Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} (EMP-{String(emp.id).padStart(4, '0')})</option>
                ))}
              </select>
            </div>
            {selectedEmpId && (
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>Name:</strong> {employees.find(e => String(e.id) === String(selectedEmpId))?.name}</div>
                <div><strong>Dept:</strong> {employees.find(e => String(e.id) === String(selectedEmpId))?.department_name}</div>
                <div><strong>Role:</strong> {employees.find(e => String(e.id) === String(selectedEmpId))?.designation}</div>
                <div><strong>Base Salary:</strong> ${employees.find(e => String(e.id) === String(selectedEmpId))?.salary}</div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Configure Compensation Structure</h3>
            
            <form onSubmit={handleSaveStructure}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Earnings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontWeight: 700, color: 'var(--color-success)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem' }}>➕ Earnings</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Basic Salary ($)</label>
                    <input 
                      type="number" 
                      name="basic_salary" 
                      value={structure.basic_salary} 
                      onChange={handleStructureChange}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>HRA ($)</label>
                    <input 
                      type="number" 
                      name="hra" 
                      value={structure.hra} 
                      onChange={handleStructureChange}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Allowances ($)</label>
                    <input 
                      type="number" 
                      name="allowances" 
                      value={structure.allowances} 
                      onChange={handleStructureChange}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bonus ($)</label>
                    <input 
                      type="number" 
                      name="bonus" 
                      value={structure.bonus} 
                      onChange={handleStructureChange}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Deductions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontWeight: 700, color: 'var(--color-danger)', borderBottom: '1px dashed var(--border-color)', pb: '0.25rem' }}>➖ Deductions & Statutory</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Other Deductions ($)</label>
                    <input 
                      type="number" 
                      name="deductions" 
                      value={structure.deductions} 
                      onChange={handleStructureChange}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TDS (Tax) ($)</label>
                    <input 
                      type="number" 
                      name="tds" 
                      value={structure.tds} 
                      onChange={handleStructureChange}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Provident Fund (PF) ($)</label>
                    <input 
                      type="number" 
                      name="pf" 
                      value={structure.pf} 
                      onChange={handleStructureChange}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ESIC Health ($)</label>
                    <input 
                      type="number" 
                      name="esic" 
                      value={structure.esic} 
                      onChange={handleStructureChange}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

              </div>

              {/* Net Salary Display */}
              <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>Net Take-Home Pay</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Automatically calculated (Earnings minus Deductions)</p>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                  ${calculatedNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={loading || !selectedEmpId}
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  {loading ? 'Saving...' : 'Save Salary Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content 2: Monthly Payroll */}
      {activeTab === 'payroll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Controls Bar */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Month</label>
                <select 
                  value={period.month} 
                  onChange={e => setPeriod({ ...period, month: parseInt(e.target.value) })}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Year</label>
                <select 
                  value={period.year} 
                  onChange={e => setPeriod({ ...period, year: parseInt(e.target.value) })}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handleGeneratePayroll} 
                disabled={generatingPayroll} 
                className="btn btn-primary"
              >
                {generatingPayroll ? 'Processing...' : '⚙️ Generate Monthly Payroll'}
              </button>
              <button onClick={exportPayrollToExcel} className="btn btn-secondary">📊 Export Excel</button>
              <button 
                onClick={() => printPDFReport(
                  `PAYROLL RUN - ${MONTHS.find(m => m.value === period.month)?.label.toUpperCase()} ${period.year}`,
                  payrollData,
                  [
                    { label: 'Employee Name', key: 'employee_name' },
                    { label: 'Department', key: 'department_name' },
                    { label: 'Basic Salary ($)', key: 'basic_salary' },
                    { label: 'HRA ($)', key: 'hra' },
                    { label: 'Allowances ($)', key: 'allowances' },
                    { label: 'Deductions ($)', key: 'deductions' },
                    { label: 'Net Salary ($)', key: 'net_salary' }
                  ]
                )} 
                className="btn btn-danger"
              >
                🖨️ Print Report
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="master-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Basic Salary</th>
                  <th>HRA</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Tax/TDS</th>
                  <th>PF Cont.</th>
                  <th>Health/ESIC</th>
                  <th>Net Take-home</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="11" style={{ textAlign: 'center', padding: '3rem' }}>Loading payroll database...</td></tr>
                ) : payrollData.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                      No payroll records generated for this period. Click 'Generate Monthly Payroll' above to process.
                    </td>
                  </tr>
                ) : (
                  payrollData.map(row => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 600 }}>{row.employee_name}</td>
                      <td>{row.department_name}</td>
                      <td>${parseFloat(row.basic_salary).toFixed(2)}</td>
                      <td>${parseFloat(row.hra).toFixed(2)}</td>
                      <td>${parseFloat(row.allowances).toFixed(2)}</td>
                      <td>${parseFloat(row.deductions).toFixed(2)}</td>
                      <td>${parseFloat(row.tds).toFixed(2)}</td>
                      <td>${parseFloat(row.pf).toFixed(2)}</td>
                      <td>${parseFloat(row.esic).toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>${parseFloat(row.net_salary).toFixed(2)}</td>
                      <td>
                        <span className="status-badge badge-hr-approved">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Compliance Reports */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Controls */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Report Type</label>
                <select 
                  value={complianceType} 
                  onChange={e => setComplianceType(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="tds">TDS (Tax Deducted at Source)</option>
                  <option value="pf">Provident Fund (PF) Return</option>
                  <option value="esic">ESIC Insurance Return</option>
                </select>
              </div>

              {complianceType === 'tds' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tax Year</label>
                  <select 
                    value={complianceYear} 
                    onChange={e => setComplianceYear(parseInt(e.target.value))}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Month</label>
                    <select 
                      value={period.month} 
                      onChange={e => setPeriod({ ...period, month: parseInt(e.target.value) })}
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                      {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Year</label>
                    <select 
                      value={period.year} 
                      onChange={e => setPeriod({ ...period, year: parseInt(e.target.value) })}
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                      <option value={2028}>2028</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={exportComplianceToExcel} className="btn btn-secondary">📊 Export Excel</button>
              <button 
                onClick={() => {
                  const title = complianceType === 'tds' 
                    ? `ANNUAL TDS REPORT - FY ${complianceYear}`
                    : `${complianceType.toUpperCase()} STATEMENT - ${MONTHS.find(m => m.value === period.month)?.label.toUpperCase()} ${period.year}`;
                  
                  const columns = complianceType === 'tds' ? [
                    { label: 'Employee Name', key: 'employee_name' },
                    { label: 'Department', key: 'department_name' },
                    { label: 'Total Basic ($)', key: 'total_basic' },
                    { label: 'Total TDS Paid ($)', key: 'total_tds' },
                    { label: 'Total Net ($)', key: 'total_net' }
                  ] : complianceType === 'pf' ? [
                    { label: 'Employee Name', key: 'employee_name' },
                    { label: 'Department', key: 'department_name' },
                    { label: 'Basic Salary ($)', key: 'basic_salary' },
                    { label: 'Employee Contribution ($)', key: 'pf' },
                    { label: 'Employer Contribution ($)', key: 'employer_pf' }
                  ] : [
                    { label: 'Employee Name', key: 'employee_name' },
                    { label: 'Department', key: 'department_name' },
                    { label: 'Net Salary ($)', key: 'net_salary' },
                    { label: 'Employee Contribution ($)', key: 'esic' },
                    { label: 'Employer Contribution ($)', key: 'employer_esic' }
                  ];

                  printPDFReport(title, complianceData, columns);
                }} 
                className="btn btn-danger"
              >
                🖨️ Print Return
              </button>
            </div>
          </div>

          {/* Compliance Report Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="master-table">
              {complianceType === 'tds' && (
                <>
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Total Gross Basic Salary</th>
                      <th>Total TDS Paid (Tax)</th>
                      <th>Total Net Disbursed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading return sheets...</td></tr>
                    ) : complianceData.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>No TDS logs recorded for FY {complianceYear}</td></tr>
                    ) : (
                      complianceData.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{row.employee_name}</td>
                          <td>{row.department_name}</td>
                          <td>${parseFloat(row.total_basic).toFixed(2)}</td>
                          <td style={{ color: 'var(--color-danger-light)', fontWeight: '600' }}>${parseFloat(row.total_tds).toFixed(2)}</td>
                          <td>${parseFloat(row.total_net).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {complianceType === 'pf' && (
                <>
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Basic Salary</th>
                      <th>Employee Share (12%)</th>
                      <th>Employer Contribution (12%)</th>
                      <th>Total PF Fund Deposit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Loading PF sheets...</td></tr>
                    ) : complianceData.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>No PF returns filed for selected month.</td></tr>
                    ) : (
                      complianceData.map((row, idx) => {
                        const totalPF = parseFloat(row.pf) + parseFloat(row.employer_pf);
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{row.employee_name}</td>
                            <td>{row.department_name}</td>
                            <td>${parseFloat(row.basic_salary).toFixed(2)}</td>
                            <td>${parseFloat(row.pf).toFixed(2)}</td>
                            <td>${parseFloat(row.employer_pf).toFixed(2)}</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>${totalPF.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </>
              )}

              {complianceType === 'esic' && (
                <>
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Gross Net Salary</th>
                      <th>Employee Share (0.75%)</th>
                      <th>Employer Share (3.25%)</th>
                      <th>Total ESIC Insurance Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Loading ESIC sheets...</td></tr>
                    ) : complianceData.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>No ESIC returns filed for selected month.</td></tr>
                    ) : (
                      complianceData.map((row, idx) => {
                        const totalESIC = parseFloat(row.esic) + parseFloat(row.employer_esic);
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{row.employee_name}</td>
                            <td>{row.department_name}</td>
                            <td>${parseFloat(row.net_salary).toFixed(2)}</td>
                            <td>${parseFloat(row.esic).toFixed(2)}</td>
                            <td>${parseFloat(row.employer_esic).toFixed(2)}</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>${totalESIC.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Salary Summary Recharts Visualizations */}
      {summaryData.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>📈 Monthly Enterprise Payroll Expense Trend</h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="period" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend formatter={(value) => <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{value}</span>} />
                <Bar dataKey="Total Expense" fill="var(--color-primary-light)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
