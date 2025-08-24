import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  Edit2, 
  Trash2, 
  Send, 
  X, 
  Check, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  History,
  ChevronDown,
  ChevronRight,
  Eye,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Info,
  HelpCircle
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Mock data for people selection - Famous Indian personalities (non-celebrities)
const MOCK_PEOPLE = [
  { id: 1, name: 'Ratan Tata', role: 'Chairman', avatar: '👨‍💼' },
  { id: 2, name: 'Kiran Mazumdar Shaw', role: 'Executive Chairperson', avatar: '👩‍💼' },
  { id: 3, name: 'N. R. Narayana Murthy', role: 'Co-founder', avatar: '👨‍💻' },
  { id: 4, name: 'Falguni Nayar', role: 'Manager', avatar: '👩‍💼' },
  { id: 5, name: 'Azim Premji', role: 'Manager', avatar: '👨‍💼' },
  { id: 6, name: 'Shikha Sharma', role: 'Manager', avatar: '👩‍💻' },
  { id: 7, name: 'Uday Kotak', role: 'Manager', avatar: '👨‍💼' },
  { id: 8, name: 'Chanda Kochhar', role: 'Manager', avatar: '👩‍💼' },
  { id: 9, name: 'Raghuram Rajan', role: 'Manager', avatar: '👨‍💼' },
  { id: 10, name: 'Urjit Patel', role: 'Manager', avatar: '👨‍💼' }
];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkTransactions, setBulkTransactions] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [batches, setBatches] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [approverSearch, setApproverSearch] = useState('');
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [expandedHistoryBatch, setExpandedHistoryBatch] = useState(null);
  const [showCsvTooltip, setShowCsvTooltip] = useState(false);
  
  const fileInputRef = useRef();

  // Single transaction form
  const [singleForm, setSingleForm] = useState({
    bankId: '',
    accountNumber: '',
    name: '',
    amount: '',
    remarks: ''
  });

  const sidebarItems = [
    { id: 'create', label: 'Payroll Creation', icon: FileText },
    { id: 'requests', label: 'Approval Requests', icon: Clock },
    { id: 'history', label: 'Payroll History', icon: History }
  ];

  const handleSingleFormChange = (field, value) => {
    setSingleForm(prev => ({ ...prev, [field]: value }));
  };

  const addSingleTransaction = () => {
    if (Object.values(singleForm).every(field => field.trim() !== '')) {
      const newTransaction = {
        id: Date.now(),
        ...singleForm,
        amount: parseFloat(singleForm.amount)
      };
      setTransactions(prev => [...prev, newTransaction]);
      setSingleForm({ bankId: '', accountNumber: '', name: '', amount: '', remarks: '' });
    } else {
      alert('All fields are mandatory!');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const parsedTransactions = lines.slice(1)
            .filter(line => line.trim())
            .map((line, index) => {
              const values = line.split(',').map(v => v.trim());
              return {
                id: Date.now() + index,
                bankId: values[0] || '',
                accountNumber: values[1] || '',
                name: values[2] || '',
                amount: values[3] ? parseFloat(values[3]) : '',
                remarks: values[4] || '',
                isValid: values.every(v => v && v.trim())
              };
            });

          setBulkTransactions(parsedTransactions);
          setShowBulkUpload(true);
        } catch (error) {
          alert('Error parsing CSV file');
        }
      };
      reader.readAsText(file);
    }
  };

  const removeBulkTransaction = (id) => {
    setBulkTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addBulkTransactions = () => {
    const validTransactions = bulkTransactions.filter(t => t.isValid);
    if (validTransactions.length === 0) {
      alert('No valid transactions to add!');
      return;
    }
    
    setTransactions(prev => [...prev, ...validTransactions]);
    setBulkTransactions([]);
    setShowBulkUpload(false);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const startEditing = (transaction) => {
    setEditingRow({ ...transaction });
  };

  const saveEdit = () => {
    if (Object.values(editingRow).every(field => 
      typeof field === 'number' || (typeof field === 'string' && field.trim() !== '')
    )) {
      setTransactions(prev => 
        prev.map(t => t.id === editingRow.id ? editingRow : t)
      );
      setEditingRow(null);
    } else {
      alert('All fields are mandatory!');
    }
  };

  const getTotalAmount = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalHistoryAmount = () => {
    return payrollHistory.reduce((sum, batch) => sum + batch.totalAmount, 0);
  };

  const getRequiredApprovers = () => {
    const total = getTotalAmount();
    if (total >= 500000) return 5;
    if (total >= 100000) return 3;
    return 1;
  };

  const handleApproverSearch = (value) => {
    setApproverSearch(value);
    setShowApproverDropdown(value.length > 0);
  };

  const addApprover = (person) => {
    if (!selectedApprovers.find(a => a.id === person.id)) {
      setSelectedApprovers(prev => [...prev, person]);
    }
    setApproverSearch('');
    setShowApproverDropdown(false);
  };

  const removeApprover = (id) => {
    setSelectedApprovers(prev => prev.filter(a => a.id !== id));
  };

  const sendForApproval = () => {
    const requiredApprovers = getRequiredApprovers();
    if (selectedApprovers.length < requiredApprovers) {
      alert(`You need at least ${requiredApprovers} approvers for this batch amount`);
      return;
    }

    const batchId = `BATCH-${Date.now()}`;
    const newBatch = {
      id: batchId,
      transactions: [...transactions],
      totalAmount: getTotalAmount(),
      approvers: [...selectedApprovers],
      status: 'pending',
      createdAt: new Date().toISOString(),
      approvedBy: [],
      requiredApprovals: requiredApprovers
    };

    setBatches(prev => [...prev, newBatch]);
    setTransactions([]);
    setSelectedApprovers([]);
    setShowApprovalModal(false);
    alert(`Batch ${batchId} sent for approval!`);
  };

  const approveBatch = (batchId) => {
    const batchToApprove = batches.find(batch => batch.id === batchId && batch.status === 'pending');
    if (batchToApprove) {
      const approvedBatch = {
        ...batchToApprove,
        status: 'approved',
        approvedAt: new Date().toISOString()
      };
      
      setBatches(prev => prev.filter(batch => batch.id !== batchId));
      setPayrollHistory(prev => [...prev, approvedBatch]);
    }
  };

  const filteredPeople = MOCK_PEOPLE.filter(person =>
    person.name.toLowerCase().includes(approverSearch.toLowerCase()) &&
    !selectedApprovers.find(a => a.id === person.id)
  );

  const toggleBatchExpansion = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  const toggleHistoryBatchExpansion = (batchId) => {
    setExpandedHistoryBatch(expandedHistoryBatch === batchId ? null : batchId);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // CSV Tooltip Component
  const CSVTooltip = () => (
    <div className="csv-tooltip">
      <div className="csv-tooltip-content">
        <h6 className="mb-2">CSV Format Required:</h6>
        <div className="csv-example">
          <div className="csv-header">Bank ID,Account Number,Name,Amount,Remarks</div>
          <div className="csv-row">BANK001,1234567890,John Doe,25000,Salary Payment</div>
          <div className="csv-row">BANK002,9876543210,Jane Smith,30000,Bonus Payment</div>
          <div className="csv-row">BANK003,5678901234,Mike Johnson,35000,Monthly Salary</div>
        </div>
        <small className="text-muted mt-2 d-block">
          • First row must be headers<br/>
          • All fields are mandatory<br/>
          • Amount should be numeric only
        </small>
      </div>
    </div>
  );

  const renderCreateTab = () => (
    <div className="container-fluid">
      {/* Single Transaction Form */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0 text-primary">
            <Plus size={18} className="me-2" />
            Add Single Transaction
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <input
                type="text"
                placeholder="Bank ID"
                value={singleForm.bankId}
                onChange={(e) => handleSingleFormChange('bankId', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                placeholder="Account Number"
                value={singleForm.accountNumber}
                onChange={(e) => handleSingleFormChange('accountNumber', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                placeholder="Name"
                value={singleForm.name}
                onChange={(e) => handleSingleFormChange('name', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                placeholder="Amount"
                value={singleForm.amount}
                onChange={(e) => handleSingleFormChange('amount', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                placeholder="Remarks"
                value={singleForm.remarks}
                onChange={(e) => handleSingleFormChange('remarks', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <button onClick={addSingleTransaction} className="btn btn-primary w-100">
                <Plus size={16} className="me-1" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0 text-primary">
            <Upload size={18} className="me-2" />
            Bulk Upload
          </h5>
        </div>
        <div className="card-body">
          <div className="upload-area text-center p-4 border-2 border-dashed rounded">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="btn btn-secondary mb-3"
            >
              <Upload size={16} className="me-1" />
              Upload CSV
            </button>
            <div className="d-flex align-items-center justify-content-center">
              <span className="text-muted me-2">Accepted format:</span>
              <div className="position-relative">
                <HelpCircle 
                  size={16} 
                  className="text-info cursor-pointer"
                  onMouseEnter={() => setShowCsvTooltip(true)}
                  onMouseLeave={() => setShowCsvTooltip(false)}
                />
                {showCsvTooltip && <CSVTooltip />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h5 className="card-title mb-0 text-primary">
              Current Batch ({transactions.length} transactions)
            </h5>
            {transactions.length > 0 && (
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-success fs-6 px-3 py-2">
                  {formatCurrency(getTotalAmount())}
                </span>
                <button 
                  onClick={() => setShowApprovalModal(true)}
                  className="btn btn-success btn-sm"
                >
                  <Send size={16} className="me-1" />
                  Send for Approval
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card-body p-0">
          {transactions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>Bank ID</th>
                    <th>Account</th>
                    <th>Name</th>
                    <th className="text-end">Amount</th>
                    <th>Remarks</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>
                        {editingRow?.id === transaction.id ? (
                          <input
                            type="text"
                            value={editingRow.bankId}
                            onChange={(e) => setEditingRow(prev => ({...prev, bankId: e.target.value}))}
                            className="form-control form-control-sm"
                          />
                        ) : (
                          transaction.bankId
                        )}
                      </td>
                      <td>
                        {editingRow?.id === transaction.id ? (
                          <input
                            type="text"
                            value={editingRow.accountNumber}
                            onChange={(e) => setEditingRow(prev => ({...prev, accountNumber: e.target.value}))}
                            className="form-control form-control-sm"
                          />
                        ) : (
                          transaction.accountNumber
                        )}
                      </td>
                      <td>
                        {editingRow?.id === transaction.id ? (
                          <input
                            type="text"
                            value={editingRow.name}
                            onChange={(e) => setEditingRow(prev => ({...prev, name: e.target.value}))}
                            className="form-control form-control-sm"
                          />
                        ) : (
                          transaction.name
                        )}
                      </td>
                      <td className="text-end">
                        {editingRow?.id === transaction.id ? (
                          <input
                            type="number"
                            value={editingRow.amount}
                            onChange={(e) => setEditingRow(prev => ({...prev, amount: parseFloat(e.target.value) || 0}))}
                            className="form-control form-control-sm"
                          />
                        ) : (
                          <span className="fw-bold text-success">{formatCurrency(transaction.amount)}</span>
                        )}
                      </td>
                      <td>
                        {editingRow?.id === transaction.id ? (
                          <input
                            type="text"
                            value={editingRow.remarks}
                            onChange={(e) => setEditingRow(prev => ({...prev, remarks: e.target.value}))}
                            className="form-control form-control-sm"
                          />
                        ) : (
                          transaction.remarks
                        )}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          {editingRow?.id === transaction.id ? (
                            <>
                              <button onClick={saveEdit} className="btn btn-success">
                                <Check size={14} />
                              </button>
                              <button onClick={() => setEditingRow(null)} className="btn btn-secondary">
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditing(transaction)} className="btn btn-primary">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => deleteTransaction(transaction.id)} className="btn btn-danger">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <FileText size={48} className="mb-3 opacity-50" />
              <p>No transactions added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0 text-primary">
            <Clock size={18} className="me-2" />
            Pending Approvals
          </h5>
        </div>
        <div className="card-body">
          {batches.filter(b => b.status === 'pending').length > 0 ? (
            <div className="row g-3">
              {batches.filter(b => b.status === 'pending').map(batch => (
                <div key={batch.id} className="col-12">
                  <div className="card border">
                    <div 
                      className="card-header bg-white cursor-pointer"
                      onClick={() => toggleBatchExpansion(batch.id)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1 text-primary">{batch.id}</h6>
                          <div className="d-flex gap-3 small text-muted">
                            <span><Calendar size={14} className="me-1" /> {new Date(batch.createdAt).toLocaleDateString()}</span>
                            <span><DollarSign size={14} className="me-1" /> {formatCurrency(batch.totalAmount)}</span>
                            <span><Users size={14} className="me-1" /> {batch.transactions.length} transactions</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-warning">
                            <Clock size={14} className="me-1" />
                            Pending
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              approveBatch(batch.id);
                            }}
                            className="btn btn-success btn-sm"
                          >
                            Approve
                          </button>
                          {expandedBatch === batch.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </div>
                    </div>
                    
                    {expandedBatch === batch.id && (
                      <div className="card-body bg-light">
                        <div className="mb-3">
                          <h6 className="text-primary">Approvers Required: {batch.requiredApprovals}</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {batch.approvers.map(approver => (
                              <span key={approver.id} className="badge bg-primary fs-7 px-3 py-2">
                                <span className="me-2">{approver.avatar}</span>
                                {approver.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="text-primary">Transactions</h6>
                          <div className="row g-2">
                            {batch.transactions.map(transaction => (
                              <div key={transaction.id} className="col-12">
                                <div className="card card-body py-2">
                                  <div className="d-flex justify-content-between">
                                    <span>{transaction.name}</span>
                                    <span>{transaction.bankId}</span>
                                    <span className="fw-bold text-success">{formatCurrency(transaction.amount)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <Clock size={48} className="mb-3 opacity-50" />
              <p>No pending approval requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="container-fluid">
      <div className="card">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h5 className="card-title mb-0 text-primary">
              <History size={18} className="me-2" />
              Payroll History
            </h5>
            {payrollHistory.length > 0 && (
              <div className="d-flex gap-3">
                <div className="badge bg-primary fs-6 px-3 py-2">
                  <TrendingUp size={16} className="me-1" />
                  Total: {formatCurrency(getTotalHistoryAmount())}
                </div>
                <div className="badge bg-info fs-6 px-3 py-2">
                  <FileText size={16} className="me-1" />
                  {payrollHistory.length} Batches
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          {payrollHistory.length > 0 ? (
            <div className="row g-3">
              {payrollHistory.map(batch => (
                <div key={batch.id} className="col-12">
                  <div className="card border">
                    <div 
                      className="card-header bg-white cursor-pointer"
                      onClick={() => toggleHistoryBatchExpansion(batch.id)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1 text-primary">{batch.id}</h6>
                          <div className="d-flex gap-3 small text-muted">
                            <span><Calendar size={14} className="me-1" /> {new Date(batch.approvedAt).toLocaleDateString()}</span>
                            <span><DollarSign size={14} className="me-1" /> {formatCurrency(batch.totalAmount)}</span>
                            <span><Users size={14} className="me-1" /> {batch.transactions.length} transactions</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-success">
                            <CheckCircle size={14} className="me-1" />
                            Approved
                          </span>
                          {expandedHistoryBatch === batch.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </div>
                    </div>
                    
                    {expandedHistoryBatch === batch.id && (
                      <div className="card-body bg-light">
                        <h6 className="text-primary">Transaction Details</h6>
                        <div className="table-responsive">
                          <table className="table table-sm table-hover">
                            <thead className="table-primary">
                              <tr>
                                <th>Name</th>
                                <th>Bank ID</th>
                                <th>Account</th>
                                <th className="text-end">Amount</th>
                                <th>Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batch.transactions.map(transaction => (
                                <tr key={transaction.id}>
                                  <td>{transaction.name}</td>
                                  <td>{transaction.bankId}</td>
                                  <td>{transaction.accountNumber}</td>
                                  <td className="text-end fw-bold text-success">{formatCurrency(transaction.amount)}</td>
                                  <td>{transaction.remarks}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <History size={48} className="mb-3 opacity-50" />
              <p>No payroll history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-white border-end shadow-sm">
        <nav className="p-3">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`btn w-100 mb-2 d-flex align-items-center justify-content-start ${
                activeTab === item.id ? 'btn-primary' : 'btn-outline-primary'
              }`}
            >
              <item.icon size={18} className="me-2" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-3 bg-light min-vh-100">
        {activeTab === 'create' && renderCreateTab()}
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>

      {/* Modals */}
      {showBulkUpload && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Review Bulk Upload</h5>
                <button 
                  onClick={() => setShowBulkUpload(false)} 
                  className="btn-close btn-close-white"
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-primary">
                      <tr>
                        <th>Status</th>
                        <th>Bank ID</th>
                        <th>Account</th>
                        <th>Name</th>
                        <th className="text-end">Amount</th>
                        <th>Remarks</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkTransactions.map(transaction => (
                        <tr key={transaction.id} className={!transaction.isValid ? 'table-danger' : ''}>
                          <td>
                            {transaction.isValid ? (
                              <Check size={16} className="text-success" />
                            ) : (<X size={16} className="text-danger" />
                            )}
                          </td>
                          <td>{transaction.bankId || '-'}</td>
                          <td>{transaction.accountNumber || '-'}</td>
                          <td>{transaction.name || '-'}</td>
                          <td className="text-end">
                            <span className="fw-bold text-success">
                              {transaction.amount ? formatCurrency(transaction.amount) : '-'}
                            </span>
                          </td>
                          <td>{transaction.remarks || '-'}</td>
                          <td className="text-center">
                            <button
                              onClick={() => removeBulkTransaction(transaction.id)}
                              className="btn btn-danger btn-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowBulkUpload(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={addBulkTransactions} className="btn btn-success">
                  Add Valid ({bulkTransactions.filter(t => t.isValid).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Send for Approval</h5>
                <button 
                  onClick={() => setShowApprovalModal(false)} 
                  className="btn-close btn-close-white"
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <div className="d-flex justify-content-between">
                    <span><DollarSign size={16} className="me-1" />Total: {formatCurrency(getTotalAmount())}</span>
                    <span><Users size={16} className="me-1" />Required: {getRequiredApprovers()} approvers</span>
                    <span><CheckCircle size={16} className="me-1" />Selected: {selectedApprovers.length}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="position-relative">
                    <input
                      type="text"
                      placeholder="Search for approvers..."
                      value={approverSearch}
                      onChange={(e) => handleApproverSearch(e.target.value)}
                      className="form-control"
                    />
                    {showApproverDropdown && (
                      <div className="dropdown-menu show w-100 shadow">
                        {filteredPeople.map(person => (
                          <button
                            key={person.id}
                            className="dropdown-item d-flex align-items-center"
                            onClick={() => addApprover(person)}
                          >
                            <span className="me-2">{person.avatar}</span>
                            <div>
                              <div className="fw-medium">{person.name}</div>
                              <small className="text-muted">{person.role}</small>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedApprovers.length > 0 && (
                  <div>
                    <h6 className="text-primary">Selected Approvers</h6>
                    <div className="row g-2">
                      {selectedApprovers.map(approver => (
                        <div key={approver.id} className="col-md-6">
                          <div className="card">
                            <div className="card-body py-2 d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <span className="me-2">{approver.avatar}</span>
                                <span className="fw-medium">{approver.name}</span>
                              </div>
                              <button
                                onClick={() => removeApprover(approver.id)}
                                className="btn btn-danger btn-sm"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowApprovalModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button 
                  onClick={sendForApproval}
                  className="btn btn-success"
                  disabled={selectedApprovers.length < getRequiredApprovers()}
                >
                  Send for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
