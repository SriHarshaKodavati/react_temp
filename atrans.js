// src/components/AccountTransactionsPage.js
import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AccountTransactionsPage.css";

const AccountTransactionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  // Safe initial values
  const initialTransactions = accountData?.accountSummary?.transactions || [];
  const defaultFrom = accountData?.accountSummary?.statementRange?.from || "";
  const defaultTo = accountData?.accountSummary?.statementRange?.to || "";

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [txnType, setTxnType] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate opening and closing balances + filter transactions
  const { openingBalance, closingBalance, filteredTransactions, paginatedTransactions, totalPages } = useMemo(() => {
    let filtered = initialTransactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      
      const dateMatch = (!from || txnDate >= from) && (!to || txnDate <= to);
      const typeMatch = txnType === "All" ? true : txn.type.toLowerCase() === txnType.toLowerCase();
      const searchMatch = searchTerm === "" || 
        txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.reference.toLowerCase().includes(searchTerm.toLowerCase());

      return dateMatch && typeMatch && searchMatch;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

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

    // Pagination
    const pages = Math.ceil(filtered.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    return { 
      openingBalance: opening, 
      closingBalance: closing, 
      filteredTransactions: filtered,
      paginatedTransactions: paginated,
      totalPages: pages
    };
  }, [fromDate, toDate, txnType, sortOrder, searchTerm, initialTransactions, pageSize, currentPage]);

  // Calculate summary statistics
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

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  const { company, accountNumber } = accountData;

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i <= 3 || i > totalPages - 3 || Math.abs(i - currentPage) <= 1) {
        pages.push(
          <button
            key={i}
            className={`btn btn-sm mx-1 ${currentPage === i ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      } else if (pages[pages.length - 1]?.key !== 'ellipsis') {
        pages.push(<span key="ellipsis" className="mx-2">...</span>);
      }
    }

    return (
      <div className="d-flex justify-content-center align-items-center mt-4">
        <button
          className="btn btn-outline-primary btn-sm me-2"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        {pages}
        <button
          className="btn btn-outline-primary btn-sm ms-2"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="container my-4">
      <div className="bg-white rounded shadow p-4">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="text-primary mb-1">Transaction History - {company}</h3>
            <p className="mb-0 text-muted">Account No: {accountNumber}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/statement", { state: { account: accountData } })}>
            Back to Statement
          </Button>
        </div>

        {/* Balance Summary */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="summary-card opening">
              <div className="summary-label">Opening Balance</div>
              <div className="summary-amount">{openingBalance}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card closing">
              <div className="summary-label">Closing Balance</div>
              <div className="summary-amount">{closingBalance}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card credits">
              <div className="summary-label">Total Credits ({summaryStats.creditCount})</div>
              <div className="summary-amount">{summaryStats.totalCredits}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="summary-card debits">
              <div className="summary-label">Total Debits ({summaryStats.debitCount})</div>
              <div className="summary-amount">{summaryStats.totalDebits}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3 p-3 bg-light border rounded mb-4">
          <div className="col-md-2">
            <label className="form-label">From Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
            />
            <small className="text-muted">dd-mm-yy</small>
          </div>
          <div className="col-md-2">
            <label className="form-label">To Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
            />
            <small className="text-muted">dd-mm-yy</small>
          </div>
          <div className="col-md-2">
            <label className="form-label">Type</label>
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
          <div className="col-md-2">
            <label className="form-label">Sort</label>
            <select 
              className="form-select" 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Description/Reference"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Show</label>
            <select
              className="form-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span className="badge bg-primary me-2">{filteredTransactions.length} transactions found</span>
            {searchTerm && (
              <span className="badge bg-info">Searching: "{searchTerm}"</span>
            )}
          </div>
          <div className="small text-muted">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length}
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="alert alert-info text-center">
            <h5>No transactions found</h5>
            <p>Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((txn, index) => (
                    <tr key={index} className="transaction-row">
                      <td>
                        <div>{formatDate(txn.date)}</div>
                        <small className="text-muted">dd-mm-yy</small>
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
                        <Button
                          size="sm"
                          variant="info"
                          onClick={() => setSelectedTxn(txn)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Footer */}
        <div className="d-flex justify-content-between mt-4 pt-3 border-top">
          <Button variant="secondary" onClick={() => navigate("/statement", { state: { account: accountData } })}>
            Back to Statement
          </Button>
          <div>
            <Button variant="outline-primary" className="me-2">
              Export Data
            </Button>
            <Button variant="primary">
              Print Report
            </Button>
          </div>
        </div>

      </div>

      {/* Transaction Details Modal */}
      <Modal show={!!selectedTxn} onHide={() => setSelectedTxn(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTxn && (
            <div className="transaction-details">
              <div className="detail-row">
                <strong>Date:</strong> {formatDate(selectedTxn.date)} <small className="text-muted">(dd-mm-yy)</small>
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
                <strong>Balance After Transaction:</strong> {selectedTxn.balance}
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

export default AccountTransactionsPage;
