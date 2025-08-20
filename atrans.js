// src/components/AccountTransactionsPage.js
import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, Card, Badge, Tooltip, OverlayTrigger, Dropdown, ButtonGroup } from "react-bootstrap";
import { 
  FaEye, FaFilter, FaCalendarAlt, FaChartLine, FaDownload, FaPrint, 
  FaArrowUp, FaArrowDown, FaSort, FaSortUp, FaSortDown, FaSearch,
  FaFileExport, FaListAlt, FaTable, FaThLarge 
} from "react-icons/fa";
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
  const [sortBy, setSortBy] = useState("date");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // table, card, compact
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate opening and closing balances + filter transactions
  const { openingBalance, closingBalance, filteredTransactions, paginatedTransactions } = useMemo(() => {
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
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          const amountA = parseFloat(a.amount.replace(/[₹,]/g, ''));
          const amountB = parseFloat(b.amount.replace(/[₹,]/g, ''));
          comparison = amountA - amountB;
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }
      
      return sortOrder === "Newest" || sortOrder === "desc" ? -comparison : comparison;
    });

    // Calculate opening and closing balances
    let opening = "0.00";
    let closing = "0.00";
    
    if (filtered.length > 0) {
      const sortedByDate = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstTxn = sortedByDate[0];
      const lastTxn = sortedByDate[sortedByDate.length - 1];
      
      // Opening balance calculation
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
    const totalPages = Math.ceil(filtered.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    return { 
      openingBalance: opening, 
      closingBalance: closing, 
      filteredTransactions: filtered,
      paginatedTransactions: paginated,
      totalPages
    };
  }, [fromDate, toDate, txnType, sortOrder, sortBy, searchTerm, initialTransactions, pageSize, currentPage]);

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
      debitCount: debits.length,
      netFlow: totalCredits - totalDebits
    };
  }, [filteredTransactions]);

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset filters
  const resetFilters = () => {
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setTxnType("All");
    setSearchTerm("");
    setSortBy("date");
    setSortOrder("Newest");
    setCurrentPage(1);
  };

  // If no account data, show fallback
  if (!accountData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>No account data found</h4>
          <p>Please select an account to view transactions.</p>
        </div>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          <FaArrowUp className="me-2" />
          Back to Accounts
        </button>
      </div>
    );
  }

  const { company, accountNumber, accountSummary } = accountData;
  const { totalPages } = filteredTransactions;

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`btn ${currentPage === i ? 'btn-primary' : 'btn-outline-primary'} me-1`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="d-flex justify-content-center align-items-center mt-4">
        <button
          className="btn btn-outline-primary me-2"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <FaArrowUp style={{ transform: 'rotate(-90deg)' }} />
        </button>
        {pages}
        <button
          className="btn btn-outline-primary ms-2"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <FaArrowDown style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>
    );
  };

  return (
    <div className="container-fluid my-4">
      <div className="row justify-content-center">
        <div className="col-lg-11 col-xl-10">
          <div className="modern-transactions-container">
            
            {/* Header Section */}
            <div className="transactions-header">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                <div className="header-left">
                  <h2 className="transactions-title">
                    <FaListAlt className="me-3" />
                    Transaction History
                  </h2>
                  <div className="transactions-subtitle">
                    {company} • Account: {accountNumber}
                  </div>
                </div>
                
                <div className="header-actions mt-3 mt-md-0">
                  <ButtonGroup className="me-2">
                    <Button 
                      variant={viewMode === "table" ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <FaTable />
                    </Button>
                    <Button 
                      variant={viewMode === "card" ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setViewMode("card")}
                    >
                      <FaThLarge />
                    </Button>
                    <Button 
                      variant={viewMode === "compact" ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setViewMode("compact")}
                    >
                      <FaListAlt />
                    </Button>
                  </ButtonGroup>
                  
                  <Dropdown className="d-inline-block me-2">
                    <Dropdown.Toggle variant="outline-primary" size="sm">
                      <FaFileExport className="me-1" />
                      Export
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <FaDownload className="me-2" />
                        Download PDF
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <FaFileExport className="me-2" />
                        Export Excel
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <FaPrint className="me-2" />
                        Print
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  
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

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <Card className="summary-card opening-balance">
                  <Card.Body className="text-center">
                    <FaArrowDown className="summary-icon" />
                    <h6>Opening Balance</h6>
                    <h4>{openingBalance}</h4>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="summary-card closing-balance">
                  <Card.Body className="text-center">
                    <FaArrowUp className="summary-icon" />
                    <h6>Closing Balance</h6>
                    <h4>{closingBalance}</h4>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="summary-card credits">
                  <Card.Body className="text-center">
                    <FaChartLine className="summary-icon" />
                    <h6>Total Credits ({summaryStats.creditCount})</h6>
                    <h4>{summaryStats.totalCredits}</h4>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="summary-card debits">
                  <Card.Body className="text-center">
                    <FaChartLine className="summary-icon" />
                    <h6>Total Debits ({summaryStats.debitCount})</h6>
                    <h4>{summaryStats.totalDebits}</h4>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <Card className="filters-card mb-4">
                <Card.Body>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-2">
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
                      <small className="text-muted">dd-mm-yy</small>
                    </div>
                    <div className="col-md-2">
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
                      <small className="text-muted">dd-mm-yy</small>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select modern-input"
                        value={txnType}
                        onChange={(e) => setTxnType(e.target.value)}
                      >
                        <option value="All">All Types</option>
                        <option value="Credit">Credits</option>
                        <option value="Debit">Debits</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">
                        <FaSearch className="me-1" />
                        Search
                      </label>
                      <input
                        type="text"
                        className="form-control modern-input"
                        placeholder="Description or Reference"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Show</label>
                      <select
                        className="form-select modern-input"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <Button variant="outline-secondary" onClick={resetFilters} className="w-100">
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Results Info */}
            <div className="results-info mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Badge bg="primary" className="me-2">
                    {filteredTransactions.length} transactions found
                  </Badge>
                  {searchTerm && (
                    <Badge bg="info">
                      Searching: "{searchTerm}"
                    </Badge>
                  )}
                </div>
                <div className="small text-muted">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length}
                </div>
              </div>
            </div>

            {/* Transactions Display */}
            {filteredTransactions.length === 0 ? (
              <Card className="no-transactions-card">
                <Card.Body className="text-center py-5">
                  <FaChartLine size={48} className="text-muted mb-3" />
                  <h5>No transactions found</h5>
                  <p className="text-muted">Try adjusting your filters or search criteria</p>
                  <Button variant="primary" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <>
                {viewMode === "table" && (
                  <Card className="transactions-table-card">
                    <div className="table-responsive">
                      <table className="table modern-transactions-table mb-0">
                        <thead>
                          <tr>
                            <th onClick={() => handleSort("date")} className="sortable">
                              Date
                              {sortBy === "date" && (
                                sortOrder === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                              )}
                              {sortBy !== "date" && <FaSort className="ms-1" />}
                            </th>
                            <th onClick={() => handleSort("description")} className="sortable">
                              Description
                              {sortBy === "description" && (
                                sortOrder === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                              )}
                              {sortBy !== "description" && <FaSort className="ms-1" />}
                            </th>
                            <th>Reference</th>
                            <th onClick={() => handleSort("type")} className="sortable">
                              Type
                              {sortBy === "type" && (
                                sortOrder === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                              )}
                              {sortBy !== "type" && <FaSort className="ms-1" />}
                            </th>
                            <th onClick={() => handleSort("amount")} className="sortable">
                              Amount
                              {sortBy === "amount" && (
                                sortOrder === "asc" ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />
                              )}
                              {sortBy !== "amount" && <FaSort className="ms-1" />}
                            </th>
                            <th>Balance</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedTransactions.map((txn, index) => (
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
                  </Card>
                )}

                {viewMode === "card" && (
                  <div className="row g-3">
                    {paginatedTransactions.map((txn, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <Card className={`transaction-card ${txn.type.toLowerCase()}`}>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Badge 
                                bg={txn.type === "Credit" ? "success" : "danger"}
                                className="type-badge"
                              >
                                {txn.type === "Credit" ? "+" : "-"} {txn.type}
                              </Badge>
                              <small className="text-muted">{formatDate(txn.date)}</small>
                            </div>
                            <h6 className="card-title">{txn.description}</h6>
                            <p className="card-text">
                              <small className="text-muted">Ref: {txn.reference}</small>
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className={`amount-display ${txn.type.toLowerCase()}`}>
                                {txn.amount}
                              </div>
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => setSelectedTxn(txn)}
                              >
                                <FaEye />
                              </Button>
                            </div>
                            <div className="balance-info mt-2">
                              <small className="text-muted">Balance: {txn.balance}</small>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === "compact" && (
                  <Card className="compact-transactions-card">
                    <Card.Body className="p-0">
                      {paginatedTransactions.map((txn, index) => (
                        <div key={index} className="compact-transaction-row" onClick={() => setSelectedTxn(txn)}>
                          <div className="d-flex align-items-center">
                            <div className={`transaction-type-indicator ${txn.type.toLowerCase()}`}></div>
                            <div className="flex-grow-1 ms-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="transaction-description">{txn.description}</div>
                                  <small className="text-muted">{formatDate(txn.date)} • {txn.reference}</small>
                                </div>
                                <div className="text-end">
                                  <div className={`amount-display ${txn.type.toLowerCase()}`}>
                                    {txn.amount}
                                  </div>
                                  <small className="text-muted">Bal: {txn.balance}</small>
                                </div>
                              </div>
                            </div>
                            <FaEye className="ms-3 text-muted" />
                          </div>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                )}

                {/* Pagination */}
                {renderPagination()}
              </>
            )}

            {/* Footer Actions */}
            <div className="footer-actions mt-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate("/statement", { state: { account: accountData } })}
                >
                  <FaArrowUp className="me-2" />
                  Back to Statement
                </Button>
                
                <div className="mt-3 mt-md-0">
                  <Button variant="outline-primary" className="me-2">
                    <FaDownload className="me-1" />
                    Export Data
                  </Button>
                  <Button variant="primary">
                    <FaPrint className="me-1" />
                    Print Report
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Modal show={!!selectedTxn} onHide={() => setSelectedTxn(null)} centered size="lg">
        <Modal.Header closeButton className="modal-header-modern">
          <Modal.Title>
            <FaListAlt className="me-2" />
            Transaction Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-modern">
          {selectedTxn && (
            <div className="transaction-details">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="detail-card">
                    <label>Transaction Date</label>
                    <div className="detail-value">
                      {formatDate(selectedTxn.date)}
                      <small className="text-muted ms-2">(dd-mm-yy format)</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-card">
                    <label>Transaction Type</label>
                    <div className="detail-value">
                      <Badge bg={selectedTxn.type === "Credit" ? "success" : "danger"} className="fs-6">
                        {selectedTxn.type === "Credit" ? "+" : "-"} {selectedTxn.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="detail-card">
                    <label>Description</label>
                    <div className="detail-value">{selectedTxn.description}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-card">
                    <label>Reference Number</label>
                    <div className="detail-value font-monospace">{selectedTxn.reference}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="detail-card">
                    <label>Transaction Amount</label>
                    <div className={`detail-value fw-bold fs-5 ${selectedTxn.type.toLowerCase()}`}>
                      {selectedTxn.amount}
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="detail-card">
                    <label>Account Balance After Transaction</label>
                    <div className="detail-value fw-bold fs-5 text-primary">{selectedTxn.balance}</div>
                  </div>
                </div>
              </div>
              
              {/* Additional Actions in Modal */}
              <div className="modal-actions mt-4 pt-3 border-top">
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm">
                    <FaDownload className="me-1" />
                    Download Receipt
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <FaPrint className="me-1" />
                    Print Details
                  </Button>
                  <Button variant="outline-info" size="sm">
                    <FaFileExport className="me-1" />
                    Export
                  </Button>
                </div>
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

export default AccountTransactionsPage;
