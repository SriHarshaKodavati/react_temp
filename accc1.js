// src/components/AccountStatement.js
import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, Card, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaEye, FaFilter, FaCalendarAlt, FaChartLine, FaDownload, FaPrint, FaArrowUp, FaArrowDown } from "react-icons/fa";
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [viewMode, setViewMode] = useState("recent"); // "recent", "all", "filtered"

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

    // Calculate opening balance (balance before first transaction in period)
    let opening = "0.00";
    let closing = "0.00";
    
    if (filtered.length > 0) {
      const firstTxn = filtered[filtered.length - 1]; // Oldest in filtered set
      const lastTxn = filtered[0]; // Newest in filtered set
      
      // Opening balance is the balance before the first transaction
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
        <div className="alert alert-warning">
          <h4>No account data found</h4>
          <p>Please select an account to view statements.</p>
        </div>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          <FaArrowUp className="me-2" />
          Back to Accounts
        </button>
      </div>
    );
  }

  const { company, accountNumber, role, accountSummary } = accountData;
  const { accountType, ifsc, micr, nomination, currentBalance, asOnDate, statementRange } = accountSummary;

  return (
    <div className="container-fluid my-4">
      <div className="row justify-content-center">
        <div className="col-lg-11 col-xl-10">
          <div className="modern-statement-container">
            
            {/* Header Section */}
            <div className="statement-header">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                <div className="header-left">
                  <div className="bank-logo-section">
                    <div className="statement-logo rounded-circle d-inline-flex align-items-center justify-content-center">
                      {company.charAt(0)}
                    </div>
                    <div className="ms-3 d-inline-block">
                      <h2 className="bank-title mb-0">{company}</h2>
                      <div className="statement-subtitle">Account Statement - {accountType}</div>
                    </div>
                  </div>
                </div>
                
                <div className="header-actions mt-3 mt-md-0">
                  <div className="action-buttons">
                    <OverlayTrigger overlay={<Tooltip>Download Statement</Tooltip>}>
                      <Button variant="outline-primary" size="sm" className="me-2">
                        <FaDownload />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Print Statement</Tooltip>}>
                      <Button variant="outline-primary" size="sm" className="me-2">
                        <FaPrint />
                      </Button>
                    </OverlayTrigger>
                    <Button 
                      variant={showFilters ? "primary" : "outline-primary"} 
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <FaFilter className="me-1" />
                      Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information Card */}
            <Card className="account-info-card mb-4">
              <Card.Body>
                <div className="row g-3">
                  <div className="col-md-6 col-lg-4">
                    <div className="info-item">
                      <label>Account Number</label>
                      <div className="info-value">{accountNumber}</div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="info-item">
                      <label>IFSC Code</label>
                      <div className="info-value">{ifsc}</div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="info-item">
                      <label>MICR Code</label>
                      <div className="info-value">{micr}</div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="info-item">
                      <label>Current Balance</label>
                      <div className="info-value balance-highlight">{currentBalance}</div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="info-item">
                      <label>As on Date</label>
                      <div className="info-value">{formatDate(asOnDate)} (dd-mm-yy)</div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="info-item">
                      <label>Nomination</label>
                      <div className="info-value">{nomination}</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Filters Section */}
            {showFilters && (
              <Card className="filters-card mb-4">
                <Card.Body>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label">
                        <FaCalendarAlt className="me-1" />
                        From Date
                      </label>
                      <input
                        type="date"
                        className="form-control modern-input"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                      <small className="text-muted">Format: dd-mm-yy</small>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">
                        <FaCalendarAlt className="me-1" />
                        To Date
                      </label>
                      <input
                        type="date"
                        className="form-control modern-input"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                      <small className="text-muted">Format: dd-mm-yy</small>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Transaction Type</label>
                      <select
                        className="form-select modern-input"
                        value={txnType}
                        onChange={(e) => setTxnType(e.target.value)}
                      >
                        <option value="All">All Transactions</option>
                        <option value="Credit">Credits Only</option>
                        <option value="Debit">Debits Only</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">View Mode</label>
                      <select
                        className="form-select modern-input"
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
                </Card.Body>
              </Card>
            )}

            {/* Balance Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <Card className="balance-card opening-balance">
                  <Card.Body className="text-center">
                    <FaArrowDown className="balance-icon" />
                    <h6>Opening Balance</h6>
                    <h4>{openingBalance}</h4>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="balance-card closing-balance">
                  <Card.Body className="text-center">
                    <FaArrowUp className="balance-icon" />
                    <h6>Closing Balance</h6>
                    <h4>{closingBalance}</h4>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="balance-card credits">
                  <Card.Body className="text-center">
                    <FaChartLine className="balance-icon" />
                    <h6>Total Credits ({summaryStats.creditCount})</h6>
                    <h4>{summaryStats.totalCredits}</h4>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="balance-card debits">
                  <Card.Body className="text-center">
                    <FaChartLine className="balance-icon" />
                    <h6>Total Debits ({summaryStats.debitCount})</h6>
                    <h4>{summaryStats.totalDebits}</h4>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Transactions Section */}
            <Card className="transactions-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaChartLine className="me-2" />
                  Transactions {viewMode === "recent" && "(Last 5)"}
                  {viewMode === "last50" && "(Last 50)"}
                </h5>
                <Badge bg="primary">{filteredTransactions.length} transactions</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {filteredTransactions.length === 0 ? (
                  <div className="no-transactions">
                    <div className="text-center py-5">
                      <FaChartLine size={48} className="text-muted mb-3" />
                      <h5>No transactions found</h5>
                      <p className="text-muted">Try adjusting your filters or date range</p>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table modern-table mb-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Reference</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Balance</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((txn, index) => (
                          <tr key={index} className="transaction-row">
                            <td>
                              <div className="date-cell">
                                {formatDate(txn.date)}
                                <small className="text-muted d-block">dd-mm-yy</small>
                              </div>
                            </td>
                            <td className="description-cell">{txn.description}</td>
                            <td className="reference-cell">{txn.reference}</td>
                            <td>
                              <Badge 
                                bg={txn.type === "Credit" ? "success" : "danger"}
                                className="type-badge"
                              >
                                {txn.type === "Credit" ? "+" : "-"} {txn.type}
                              </Badge>
                            </td>
                            <td className={`amount-cell ${txn.type.toLowerCase()}`}>
                              {txn.amount}
                            </td>
                            <td className="balance-cell">{txn.balance}</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => setSelectedTxn(txn)}
                                className="details-btn"
                              >
                                <FaEye />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Footer Actions */}
            <div className="footer-actions mt-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <Button variant="secondary" onClick={() => navigate("/")}>
                  <FaArrowUp className="me-2" />
                  Back to Accounts
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={() => navigate("/transactions", { state: { account: accountData } })}
                  className="mt-3 mt-md-0"
                >
                  View All Transactions
                  <FaArrowDown className="ms-2" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Modal show={!!selectedTxn} onHide={() => setSelectedTxn(null)} centered>
        <Modal.Header closeButton className="modal-header-modern">
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-modern">
          {selectedTxn && (
            <div className="transaction-details">
              <div className="detail-row">
                <label>Date</label>
                <span>{formatDate(selectedTxn.date)} (dd-mm-yy)</span>
              </div>
              <div className="detail-row">
                <label>Description</label>
                <span>{selectedTxn.description}</span>
              </div>
              <div className="detail-row">
                <label>Reference</label>
                <span>{selectedTxn.reference}</span>
              </div>
              <div className="detail-row">
                <label>Type</label>
                <Badge bg={selectedTxn.type === "Credit" ? "success" : "danger"}>
                  {selectedTxn.type}
                </Badge>
              </div>
              <div className="detail-row">
                <label>Amount</label>
                <span className={`fw-bold ${selectedTxn.type.toLowerCase()}`}>
                  {selectedTxn.amount}
                </span>
              </div>
              <div className="detail-row">
                <label>Balance After Transaction</label>
                <span className="fw-bold">{selectedTxn.balance}</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedTxn(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountStatement;
