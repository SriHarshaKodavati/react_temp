// src/components/AccountStatement.js
import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./AccountStatement.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AccountStatement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // The account data passed from AccountSelectionPage
  const accountData = location.state?.account;

  // Date formatting helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  // Set safe initial values for hooks
  const initialFrom = accountData?.accountSummary?.statementRange?.from || "";
  const initialTo = accountData?.accountSummary?.statementRange?.to || "";
  const initialTransactions = accountData?.accountSummary?.transactions || [];

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [txnType, setTxnType] = useState("All");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [viewMode, setViewMode] = useState("recent"); // "recent", "last50", "all", "filtered"
  const [showFilters, setShowFilters] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  // Calculate opening and closing balances for selected period
  const { openingBalance, closingBalance, filteredTransactions } = useMemo(() => {
    let filtered = initialTransactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const dateMatch = (!from || txnDate >= from) && (!to || txnDate <= to);
      const typeMatch = txnType === "All" ? true : txn.type.toLowerCase() === txnType.toLowerCase();

      return dateMatch && typeMatch;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply view mode filtering
    if (viewMode === "recent") {
      filtered = filtered.slice(0, 5);
    } else if (viewMode === "last50") {
      filtered = filtered.slice(0, 50);
    }

    // Calculate opening and closing balances
    let opening = "₹0.00";
    let closing = "₹0.00";
    
    if (filtered.length > 0) {
      const sortedByDate = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstTxn = sortedByDate[0];
      const lastTxn = sortedByDate[sortedByDate.length - 1];
      
      const firstAmount = parseFloat(firstTxn.amount.replace(/[₹,]/g, ''));
      const firstBalance = parseFloat(firstTxn.balance.replace(/[₹,]/g, ''));
      
      if (firstTxn.type === "Credit") {
        opening = `₹${(firstBalance - firstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      } else {
        opening = `₹${(firstBalance + firstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      }
      
      closing = lastTxn.balance;
    }

    return { openingBalance: opening, closingBalance: closing, filteredTransactions: filtered };
  }, [fromDate, toDate, txnType, viewMode, initialTransactions]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const credits = filteredTransactions.filter(txn => txn.type === "Credit");
    const debits = filteredTransactions.filter(txn => txn.type === "Debit");
    
    const totalCredits = credits.reduce((sum, txn) => {
      return sum + parseFloat(txn.amount.replace(/[₹,]/g, ''));
    }, 0);
    
    const totalDebits = debits.reduce((sum, txn) => {
      return sum + parseFloat(txn.amount.replace(/[₹,]/g, ''));
    }, 0);

    return {
      totalCredits: `₹${totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      totalDebits: `₹${totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      creditCount: credits.length,
      debitCount: debits.length
    };
  }, [filteredTransactions]);

  // If no account data, show fallback
  if (!accountData) {
    return (
      <div className="container mt-5">
        <h3>No account data found</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Back to Accounts
        </button>
      </div>
    );
  }

  const { company, accountNumber, role, accountSummary } = accountData;
  const { accountType, ifsc, micr, nomination, currentBalance, asOnDate, statementRange } = accountSummary;

  return (
    <div className="container my-4">
      <div className="account-statement-bg rounded shadow p-4">

        {/* Header with Interactive Elements */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between border-bottom pb-3 mb-4">
          <div>
            <h2 className="bank-title">{company}</h2>
            <div className="small text-secondary">
              Statement ({accountType} Account)
            </div>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <span className="badge bg-success fs-6">
              Period: {formatDate(statementRange.from)} to {formatDate(statementRange.to)}
            </span>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-light p-3 mb-4 rounded border">
          <div className="row g-2">
            <div className="col-md-3"><strong>Account No:</strong> {accountNumber}</div>
            <div className="col-md-2"><strong>Type:</strong> {accountType}</div>
            <div className="col-md-2"><strong>IFSC:</strong> {ifsc}</div>
            <div className="col-md-2"><strong>MICR:</strong> {micr}</div>
            <div className="col-md-3"><strong>Nomination:</strong> {nomination}</div>
            <div className="col-md-3 text-success"><strong>Balance:</strong> {currentBalance}</div>
            <div className="col-md-3"><strong>As on:</strong> {formatDate(asOnDate)}</div>
          </div>
        </div>

        {/* Interactive Balance Summary */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div 
              className="balance-summary-card opening"
              onClick={() => setAnimateCards(!animateCards)}
            >
              <div className="balance-label">Opening Balance</div>
              <div className="balance-amount">{openingBalance}</div>
              <div className="balance-trend">
                <small className="text-muted">Start of period</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div 
              className="balance-summary-card closing"
              onClick={() => setAnimateCards(!animateCards)}
            >
              <div className="balance-label">Closing Balance</div>
              <div className="balance-amount">{closingBalance}</div>
              <div className="balance-trend">
                <small className="text-muted">End of period</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div 
              className="balance-summary-card credits"
              onClick={() => setTxnType(txnType === "Credit" ? "All" : "Credit")}
            >
              <div className="balance-label">Total Credits ({summaryStats.creditCount})</div>
              <div className="balance-amount">{summaryStats.totalCredits}</div>
              <div className="balance-trend">
                <small className="text-muted">Click to filter</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div 
              className="balance-summary-card debits"
              onClick={() => setTxnType(txnType === "Debit" ? "All" : "Debit")}
            >
              <div className="balance-label">Total Debits ({summaryStats.debitCount})</div>
              <div className="balance-amount">{summaryStats.totalDebits}</div>
              <div className="balance-trend">
                <small className="text-muted">Click to filter</small>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="bg-white p-3 rounded border mb-4 filter-slide-in">
            <div className="row align-items-end g-3">
              <div className="col-md-3">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <small className="text-muted">Format: dd-mm-yy</small>
              </div>
              <div className="col-md-3">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <small className="text-muted">Format: dd-mm-yy</small>
              </div>
              <div className="col-md-3">
                <label className="form-label">Transaction Type</label>
                <select
                  className="form-select"
                  value={txnType}
                  onChange={(e) => setTxnType(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">View Mode</label>
                <select
                  className="form-select"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                >
                  <option value="recent">Last 5 Transactions</option>
                  <option value="last50">Last 50 Transactions</option>
                  <option value="all">All Transactions</option>
                  <option value="filtered">Filtered Period</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        <h5 className="mb-3 text-primary">
          Transactions 
          {viewMode === "recent" && " (Last 5)"}
          {viewMode === "last50" && " (Last 50)"}
          <span className="badge bg-primary ms-2">{filteredTransactions.length}</span>
        </h5>
        
        {filteredTransactions.length === 0 ? (
          <div className="alert alert-info">
            No transactions found for the selected filters.
            <strong>Current Balance: {currentBalance}</strong>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle statement-table">
                              <thead className="table-primary">
                <tr>
                  <th>Date <small className="text-white-50">(dd-mm-yy)</small></th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn, index) => (
                  <tr key={index} className="transaction-row">
                    <td>
                      <div>{formatDate(txn.date)}</div>
                    </td>
                    <td>{txn.description}</td>
                    <td>{txn.reference}</td>
                    <td>
                      <span className={`badge bg-${txn.type === "Credit" ? "success" : "danger"}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className={txn.type === "Credit" ? "text-success fw-bold" : "text-danger fw-bold"}>
                      {txn.amount}
                    </td>
                    <td>{txn.balance}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => setSelectedTxn(txn)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            Back to Accounts
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate("/transactions", { state: { account: accountData } })}
          >
            View All Transactions
          </button>
        </div>

      </div>

      {/* Transaction Detail Modal */}
      <Modal show={!!selectedTxn} onHide={() => setSelectedTxn(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTxn && (
            <div className="transaction-details">
              <div className="detail-row">
                <strong>Date:</strong> {formatDate(selectedTxn.date)}
              </div>
              <div className="detail-row">
                <strong>Description:</strong> {selectedTxn.description}
              </div>
              <div className="detail-row">
                <strong>Reference:</strong> {selectedTxn.reference}
              </div>
              <div className="detail-row">
                <strong>Type:</strong> 
                <span className={`badge bg-${selectedTxn.type === "Credit" ? "success" : "danger"} ms-2`}>
                  {selectedTxn.type}
                </span>
              </div>
              <div className="detail-row">
                <strong>Amount:</strong> 
                <span className={`fw-bold ms-2 ${selectedTxn.type === "Credit" ? "text-success" : "text-danger"}`}>
                  {selectedTxn.amount}
                </span>
              </div>
              <div className="detail-row">
                <strong>Balance After:</strong> {selectedTxn.balance}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedTxn(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountStatement;
