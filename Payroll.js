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
  TrendingUp
} from 'lucide-react';
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

  // Calculate total amount from payroll history
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

  // Fixed approval function
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

  const renderCreateTab = () => (
    <div className="tab-content">
      {/* Single Transaction Form */}
      <div className="card">
        <div className="card-header">
          <h3><Plus size={18} /> Add Single Transaction</h3>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <input
              type="text"
              placeholder="Bank ID"
              value={singleForm.bankId}
              onChange={(e) => handleSingleFormChange('bankId', e.target.value)}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={singleForm.accountNumber}
              onChange={(e) => handleSingleFormChange('accountNumber', e.target.value)}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Name"
              value={singleForm.name}
              onChange={(e) => handleSingleFormChange('name', e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Amount"
              value={singleForm.amount}
              onChange={(e) => handleSingleFormChange('amount', e.target.value)}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Remarks"
              value={singleForm.remarks}
              onChange={(e) => handleSingleFormChange('remarks', e.target.value)}
              className="form-input"
            />
            <button onClick={addSingleTransaction} className="btn btn-primary">
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Upload */}
      <div className="card">
        <div className="card-header">
          <h3><Upload size={18} /> Bulk Upload</h3>
        </div>
        <div className="card-body">
          <div className="upload-area">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="btn btn-secondary"
            >
              <Upload size={16} />
              Upload CSV
            </button>
            <p className="upload-hint">CSV format: Bank ID, Account Number, Name, Amount, Remarks</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <div className="header-content">
            <h3>Current Batch ({transactions.length} transactions)</h3>
            {transactions.length > 0 && (
              <div className="batch-actions">
                <span className="total-amount">{formatCurrency(getTotalAmount())}</span>
                <button 
                  onClick={() => setShowApprovalModal(true)}
                  className="btn btn-success btn-sm"
                >
                  <Send size={16} />
                  Send for Approval
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          {transactions.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bank ID</th>
                    <th>Account</th>
                    <th>Name</th>
                    <th className="amount-header">Amount</th>
                    <th>Remarks</th>
                    <th className="actions-header">Actions</th>
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
                            className="edit-input"
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
                            className="edit-input"
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
                            className="edit-input"
                          />
                        ) : (
                          transaction.name
                        )}
                      </td>
                      <td className="amount-cell">
                        {editingRow?.id === transaction.id ? (
                          <input
                            type="number"
                            value={editingRow.amount}
                            onChange={(e) => setEditingRow(prev => ({...prev, amount: parseFloat(e.target.value) || 0}))}
                            className="edit-input"
                          />
                        ) : (
                          formatCurrency(transaction.amount)
                        )}
                      </td>
                      <td>
                        {editingRow?.id === transaction.id ? (
                          <input
                            type="text"
                            value={editingRow.remarks}
                            onChange={(e) => setEditingRow(prev => ({...prev, remarks: e.target.value}))}
                            className="edit-input"
                          />
                        ) : (
                          transaction.remarks
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {editingRow?.id === transaction.id ? (
                            <>
                              <button onClick={saveEdit} className="btn-icon btn-success">
                                <Check size={14} />
                              </button>
                              <button onClick={() => setEditingRow(null)} className="btn-icon btn-secondary">
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditing(transaction)} className="btn-icon btn-primary">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => deleteTransaction(transaction.id)} className="btn-icon btn-danger">
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
            <div className="empty-state">
              <FileText size={48} />
              <p>No transactions added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="tab-content">
      <div className="card">
        <div className="card-header">
          <h3><Clock size={18} /> Pending Approvals</h3>
        </div>
        <div className="card-body">
          {batches.filter(b => b.status === 'pending').length > 0 ? (
            <div className="batches-list">
              {batches.filter(b => b.status === 'pending').map(batch => (
                <div key={batch.id} className="batch-item">
                  <div className="batch-summary" onClick={() => toggleBatchExpansion(batch.id)}>
                    <div className="batch-info">
                      <div className="batch-main">
                        <h4>{batch.id}</h4>
                        <span className="status-badge pending">
                          <Clock size={14} />
                          Pending
                        </span>
                      </div>
                      <div className="batch-meta">
                        <span><Calendar size={14} /> {new Date(batch.createdAt).toLocaleDateString()}</span>
                        <span><DollarSign size={14} /> {formatCurrency(batch.totalAmount)}</span>
                        <span><Users size={14} /> {batch.transactions.length} transactions</span>
                      </div>
                    </div>
                    <div className="batch-actions">
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
                  
                  {expandedBatch === batch.id && (
                    <div className="batch-details">
                      <div className="approvers-section">
                        <h5>Approvers Required: {batch.requiredApprovals}</h5>
                        <div className="approvers-list">
                          {batch.approvers.map(approver => (
                            <div key={approver.id} className="approver-chip">
                              <span className="avatar">{approver.avatar}</span>
                              <span>{approver.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="transactions-section">
                        <h5>Transactions</h5>
                        <div className="mini-table">
                          {batch.transactions.map(transaction => (
                            <div key={transaction.id} className="mini-row">
                              <span>{transaction.name}</span>
                              <span>{transaction.bankId}</span>
                              <span className="mini-amount">{formatCurrency(transaction.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Clock size={48} />
              <p>No pending approval requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="tab-content">
      <div className="card">
        <div className="card-header">
          <div className="header-content">
            <h3><History size={18} /> Payroll History</h3>
            {payrollHistory.length > 0 && (
              <div className="history-summary">
                <div className="summary-stat">
                  <TrendingUp size={16} />
                  <span>Total Processed: {formatCurrency(getTotalHistoryAmount())}</span>
                </div>
                <div className="summary-stat">
                  <FileText size={16} />
                  <span>{payrollHistory.length} Batches</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          {payrollHistory.length > 0 ? (
            <div className="batches-list">
              {payrollHistory.map(batch => (
                <div key={batch.id} className="batch-item">
                  <div className="batch-summary" onClick={() => toggleHistoryBatchExpansion(batch.id)}>
                    <div className="batch-info">
                      <div className="batch-main">
                        <h4>{batch.id}</h4>
                        <span className="status-badge approved">
                          <CheckCircle size={14} />
                          Approved
                        </span>
                      </div>
                      <div className="batch-meta">
                        <span><Calendar size={14} /> {new Date(batch.approvedAt).toLocaleDateString()}</span>
                        <span><DollarSign size={14} /> {formatCurrency(batch.totalAmount)}</span>
                        <span><Users size={14} /> {batch.transactions.length} transactions</span>
                      </div>
                    </div>
                    <div className="batch-actions">
                      {expandedHistoryBatch === batch.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                  
                  {expandedHistoryBatch === batch.id && (
                    <div className="batch-details">
                      <div className="transactions-section">
                        <h5>Transaction Details</h5>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Bank ID</th>
                                <th>Account</th>
                                <th className="amount-header">Amount</th>
                                <th>Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batch.transactions.map(transaction => (
                                <tr key={transaction.id}>
                                  <td>{transaction.name}</td>
                                  <td>{transaction.bankId}</td>
                                  <td>{transaction.accountNumber}</td>
                                  <td className="amount-cell">{formatCurrency(transaction.amount)}</td>
                                  <td>{transaction.remarks}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <History size={48} />
              <p>No payroll history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-container">
        {activeTab === 'create' && renderCreateTab()}
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </main>

      {/* Rest of the modals remain the same with formatCurrency updates */}
      {showBulkUpload && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Review Bulk Upload</h3>
              <button onClick={() => setShowBulkUpload(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Bank ID</th>
                      <th>Account</th>
                      <th>Name</th>
                      <th className="amount-header">Amount</th>
                      <th>Remarks</th>
                      <th className="actions-header">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkTransactions.map(transaction => (
                      <tr key={transaction.id} className={!transaction.isValid ? 'invalid-row' : ''}>
                        <td>
                          {transaction.isValid ? (
                            <Check size={16} className="text-success" />
                          ) : (
                            <X size={16} className="text-danger" />
                          )}
                        </td>
                        <td>{transaction.bankId || '-'}</td>
                        <td>{transaction.accountNumber || '-'}</td>
                        <td>{transaction.name || '-'}</td>
                        <td className="amount-cell">{transaction.amount ? formatCurrency(transaction.amount) : '-'}</td>
                        <td>{transaction.remarks || '-'}</td>
                        <td>
                          <button
                            onClick={() => removeBulkTransaction(transaction.id)}
                            className="btn-icon btn-danger"
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
      )}

      {showApprovalModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Send for Approval</h3>
              <button onClick={() => setShowApprovalModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="approval-summary">
                <div className="summary-item">
                  <DollarSign size={16} />
                  <span>Total: {formatCurrency(getTotalAmount())}</span>
                </div>
                <div className="summary-item">
                  <Users size={16} />
                  <span>Required: {getRequiredApprovers()} approvers</span>
                </div>
                <div className="summary-item">
                  <CheckCircle size={16} />
                  <span>Selected: {selectedApprovers.length}</span>
                </div>
              </div>

              <div className="approver-selection">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search for approvers..."
                    value={approverSearch}
                    onChange={(e) => handleApproverSearch(e.target.value)}
                    className="form-input"
                  />
                  {showApproverDropdown && (
                    <div className="dropdown">
                      {filteredPeople.map(person => (
                        <div
                          key={person.id}
                          className="dropdown-item"
                          onClick={() => addApprover(person)}
                        >
                          <span className="avatar">{person.avatar}</span>
                          <div>
                            <div className="person-name">{person.name}</div>
                            <div className="person-role">{person.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedApprovers.length > 0 && (
                  <div className="selected-approvers">
                    <h4>Selected Approvers</h4>
                    <div className="approvers-grid">
                      {selectedApprovers.map(approver => (
                        <div key={approver.id} className="selected-approver">
                          <span className="avatar">{approver.avatar}</span>
                          <span>{approver.name}</span>
                          <button
                            onClick={() => removeApprover(approver.id)}
                            className="btn-icon btn-danger"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
      )}
    </div>
  );
}

export default App;
