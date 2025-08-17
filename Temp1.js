import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

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

  // Initialize with approvalsLeft
  const setupInitialData = (data) =>
    data.map((item) => {
      let approvalsNeeded = 1;
      if (item.Amount > 500000) approvalsNeeded = 5;
      else if (item.Amount > 100000) approvalsNeeded = 3;

      const approvalsLeft = item.Status === "Pending" ? approvalsNeeded : 0;
      return { ...item, approvalsLeft };
    });

  const [payrollData, setPayrollData] = useState(setupInitialData(initialData));

  const getTotalPendingAmount = () => {
    return payrollData
      .filter((item) => item.Status === "Pending")
      .reduce((sum, item) => sum + item.Amount, 0);
  };

  const handleApprove = (index) => {
    setPayrollData((prevData) => {
      const updated = [...prevData];
      const item = updated[index];

      if (item.Status !== "Pending") return prevData;

      if (item.approvalsLeft > 1) {
        item.approvalsLeft -= 1;
      } else {
        item.Status = "Approved";
        item.approvalsLeft = 0;
      }

      return updated;
    });
  };

  const handleReject = (index) => {
    setPayrollData((prevData) => {
      const updated = [...prevData];
      const item = updated[index];

      if (item.Status === "Pending") {
        item.Status = "Reject";
        item.approvalsLeft = 0;
      }

      return updated;
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-primary">Payroll Approval Dashboard</h3>
        <h5 className="text-secondary">
          Total Pending Amount:{" "}
          <span className="text-dark fw-bold">
            ₹{getTotalPendingAmount().toLocaleString()}
          </span>
        </h5>
      </div>

      <div className="table-responsive shadow rounded">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-primary">
            <tr>
              <th>Payroll ID</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Payroll Period</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((row, index) => (
              <tr key={index}>
                <td>{row.PayrollId}</td>
                <td>{row.EmployeeName}</td>
                <td>{row.Department}</td>
                <td>{row.Period}</td>
                <td>₹{row.Amount.toLocaleString()}</td>
                <td>
                  {row.Status === "Pending" ? (
                    <span className="badge bg-warning text-dark">
                      Pending ({row.approvalsLeft} left)
                    </span>
                  ) : row.Status === "Approved" ? (
                    <span className="badge bg-success">Approved</span>
                  ) : (
                    <span className="badge bg-danger">Rejected</span>
                  )}
                </td>
                <td>
                  {row.Status === "Pending" ? (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApprove(index)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleReject(index)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-outline-secondary" disabled>
                      No Action
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-muted small">
        Showing <strong>{payrollData.length}</strong> records
      </div>
    </div>
  );
}
