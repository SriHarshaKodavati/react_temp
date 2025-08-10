// src/components/AccountStatement.js
import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AccountStatement.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AccountStatement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // The account data passed from AccountSelectionPage
  const accountData = location.state?.account;

  // Set safe initial values for hooks (so hooks are top-level, not conditional)
  const initialFrom = accountData?.accountSummary?.statementRange?.from || "";
  const initialTo = accountData?.accountSummary?.statementRange?.to || "";
  const initialTransactions = accountData?.accountSummary?.transactions || [];

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [txnType, setTxnType] = useState("All");

  // Filtered transactions memoized
  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((txn) => {
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
  }, [fromDate, toDate, txnType, initialTransactions]);

  // If no account data, show fallback after setting hooks
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

  const {
    company,
    accountNumber,
    role,
    accountSummary
  } = accountData;

  const {
    accountType,
    ifsc,
    micr,
    nomination,
    currentBalance,
    asOnDate,
    statementRange
  } = accountSummary;

  return (
    <div className="container my-5 account-statement-bg rounded shadow-lg px-3 px-md-4 py-4">

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between border-bottom pb-3 mb-4">
        <div>
          <h2 className="bank-title">{company}</h2>
          <div className="small text-secondary">
            Statement ({accountType} Account)
          </div>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-success fs-6">
            Original Period: {statementRange.from} to {statementRange.to}
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
          <div className="col-md-3"><strong>As on:</strong> {asOnDate}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded border mb-4">
        <div className="row align-items-end g-3">
          <div className="col-md-3">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
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
        </div>
      </div>

      {/* Transactions */}
      <h5 className="mb-3 text-primary">Transactions</h5>
      {filteredTransactions.length === 0 ? (
        <div className="alert alert-info">
          No transactions found for the selected filters.{" "}
          <strong>Balance: {currentBalance}</strong>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle statement-table">
            <thead className="table-primary">
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="btn btn-secondary mt-4" onClick={() => navigate("/")}>
        Back to Accounts
      </button>
    </div>
  );
};

export default AccountStatement;
