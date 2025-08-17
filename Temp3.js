import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function PayrollPage() {
  const initialData = [
    {
      PayrollId: "2031171",
      EmployeeName: "John",
      Department: "Technology",
      Period: "31 Aug",
      Amount: 40000,
      Status: "Pending",
    },
    {
      PayrollId: "2031172",
      EmployeeName: "Scott",
      Department: "Technology",
      Period: "31 Aug",
      Amount: 150000,
      Status: "Pending",
    },
    {
      PayrollId: "2031173",
      EmployeeName: "Martin",
      Department: "Technology",
      Period: "31 Aug",
      Amount: 600000,
      Status: "Pending",
    },
    {
      PayrollId: "2031174",
      EmployeeName: "James",
      Department: "Technology",
      Period: "31 Aug",
      Amount: 40000,
      Status: "Approved",
    },
    {
      PayrollId: "2031175",
      EmployeeName: "Nisha",
      Department: "Technology",
      Period: "31 Aug",
      Amount: 40000,
      Status: "Reject",
    },
  ];

  const setupInitialData = (data) =>
    data.map((item) => {
      let approvalsNeeded = 1;
      if (item.Amount > 500000) approvalsNeeded = 5;
      else if (item.Amount > 100000) approvalsNeeded = 3;

      const approvalsLeft = item.Status === "Pending" ? approvalsNeeded : 0;
      return { ...item, approvalsLeft, approvedByCurrentUser: false };
    });

  const [payrollData, setPayrollData] = useState(setupInitialData(initialData));

  const getTotalPendingAmount = () =>
    payrollData
      .filter((item) => item.Status === "Pending")
      .reduce((sum, item) => sum + item.Amount, 0);

  const handleApprove = (index) => {
    setPayrollData((prev) => {
      const newData = [...prev];
      const item = newData[index];

      if (
        item.Status !== "Pending" ||
        item.approvedByCurrentUser === true
      ) {
        return prev; // prevent multiple approvals
      }

      if (item.approvalsLeft > 1) {
        item.approvalsLeft -= 1;
        item.approvedByCurrentUser = true;
      } else {
        item.Status = "Approved";
        item.approvalsLeft = 0;
      }

      return newData;
    });
  };

  const handleReject = (index) => {
    setPayrollData((prev) => {
      const newData = [...prev];
      const item = newData[index];

      if (item.Status === "Pending") {
        item.Status = "Reject";
        item.approvalsLeft = 0;
      }

      return newData;
    });
  };

  const getStatusBadge = (status, approvalsLeft) => {
    switch (status) {
      case "Approved":
        return <span className="badge bg-success px-3 py-2">✅ Approved</span>;
      case "Reject":
        return <span className="badge bg-danger px-3 py-2">❌ Rejected</span>;
      default:
        return (
          <span className="badge bg-warning text-dark px-3 py-2">
            ⏳ Pending ({approvalsLeft} left)
          </span>
        );
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">💼 Payroll Approval Dashboard</h3>
        <h5 className="text-muted">
          Total Pending Amount:{" "}
          <span className="text-dark fw-bold">
            ₹{getTotalPendingAmount().toLocaleString()}
          </span>
        </h5>
      </div>

      <div className="table-responsive shadow-lg rounded">
        <table className="table table-hover table-borderless align-middle">
          <thead className="bg-dark text-white">
            <tr>
              <th>🆔 Payroll ID</th>
              <th>👤 Employee</th>
              <th>🏢 Department</th>
              <th>📅 Period</th>
              <th>💰 Amount</th>
              <th>📌 Status</th>
              <th>⚙️ Action</th>
            </tr>
          </thead>
          <tbody className="bg-light">
            {payrollData.map((row, index) => (
              <tr key={index} className="border-bottom">
                <td>{row.PayrollId}</td>
                <td>{row.EmployeeName}</td>
                <td>{row.Department}</td>
                <td>{row.Period}</td>
                <td>₹{row.Amount.toLocaleString()}</td>
                <td>{getStatusBadge(row.Status, row.approvalsLeft)}</td>
                <td>
                  {row.Status === "Pending" ? (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                        onClick={() => handleApprove(index)}
                        disabled={row.approvedByCurrentUser}
                      >
                        <FaCheckCircle />{" "}
                        {row.approvedByCurrentUser ? "Approved" : "Approve"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                        onClick={() => handleReject(index)}
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled
                    >
                      No Action
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-muted small text-end">
        Showing <strong>{payrollData.length}</strong> records
      </div>
    </div>
  );
}
