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

  // Safe initial values
  const initialTransactions = accountData?.accountSummary?.transactions || [];
  const defaultFrom = accountData?.accountSummary?.statementRange?.from || "";
  const defaultTo = accountData?.accountSummary?.statementRange?.to || "";

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [txnType, setTxnType] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Filter + Sort transactions
  const filteredTransactions = useMemo(() => {
    let txns = initialTransactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const dateMatch =
        (!from || txnDate >= from) && (!to || txnDate <= to);
      const typeMatch =
        txnType === "All"
          ? true
          : txn.type.toLowerCase() === txnType.toLowerCase();
      return dateMatch && typeMatch;
    });

    // Sort transactions
    txns.sort((a, b) => {
      const dateA = new Date(a.date),
        dateB = new Date(b.date);
      return sortOrder === "Newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return txns;
  }, [fromDate, toDate, txnType, sortOrder, initialTransactions]);

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

  const { company, accountNumber, accountSummary } = accountData;

  return (
    <div className="container my-5 bg-white rounded shadow-lg p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-primary">Transactions - {company}</h3>
          <p className="mb-0 text-muted">Account No: {accountNumber}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/statement", { state: { account: accountData } })}>
          Back to Statement
        </Button>
      </div>

      {/* Filters */}
      <div className="row g-3 p-3 bg-light border rounded mb-4">
        <div className="col-md-3">
          <label className="form-label">From Date</label>
          <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">To Date</label>
          <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Type</label>
          <select className="form-select" value={txnType} onChange={(e) => setTxnType(e.target.value)}>
            <option value="All">All</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Sort</label>
          <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="alert alert-info">No transactions found for the selected filters.</div>
      ) : (
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
              {filteredTransactions.map((txn, index) => (
                <tr key={index}>
                  <td>{txn.date}</td>
                  <td>{txn.description}</td>
                  <td>{txn.reference}</td>
                  <td>
                    <span className={`badge bg-${txn.type === "Credit" ? "success" : "danger"}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td>{txn.amount}</td>
                  <td>{txn.balance}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => setSelectedTxn(txn)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Detail Modal */}
      <Modal show={!!selectedTxn} onHide={() => setSelectedTxn(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTxn && (
            <>
              <p><strong>Date:</strong> {selectedTxn.date}</p>
              <p><strong>Description:</strong> {selectedTxn.description}</p>
              <p><strong>Reference:</strong> {selectedTxn.reference}</p>
              <p><strong>Type:</strong> {selectedTxn.type}</p>
              <p><strong>Amount:</strong> {selectedTxn.amount}</p>
              <p><strong>Balance After:</strong> {selectedTxn.balance}</p>
            </>
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
