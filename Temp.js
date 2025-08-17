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

  const processedData = initialData.map((item) => {
    let approvalsNeeded = 1;
    if (item.Amount > 500000) approvalsNeeded = 5;
    else if (item.Amount > 100000) approvalsNeeded = 3;

    // If already approved or rejected, no approvals needed
    const approvalsLeft = item.Status === "Pending" ? approvalsNeeded : 0;

    return { ...item, approvalsLeft };
  });

  const [payrollData, setPayrollData] = useState(processedData);

  const getTotalPendingAmount = () => {
    return payrollData
      .filter((item) => item.Status === "Pending")
      .reduce((sum, item) => sum + item.Amount, 0);
  };

  const handleApprove = (index) => {
    const newData = [...payrollData];
    const item = newData[index];

    if (item.Status !== "Pending") return;

    if (item.approvalsLeft > 1) {
      item.approvalsLeft -= 1;
    } else {
      item.approvalsLeft = 0;
      item.Status = "Approved";
    }

    setPayrollData(newData);
  };

  const handleReject = (index) => {
    const newData = [...payrollData];
    const item = newData[index];

    if (item.Status === "Pending") {
      item.Status = "Reject";
      item.approvalsLeft = 0;
      setPayrollData(newData);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Payroll Approval</h4>
        <h5>Total Pending Amount: ₹{getTotalPendingAmount().toLocaleString()}</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
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
                      {row.Status} ({row.approvalsLeft} left)
                    </span>
                  ) : row.Status === "Approved" ? (
                    <span className="badge bg-success">{row.Status}</span>
                  ) : (
                    <span className="badge bg-danger">{row.Status}</span>
                  )}
                </td>
                <td>
                  {row.Status === "Pending" ? (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleApprove(index)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleReject(index)}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-outline-secondary btn-sm" disabled>
                      No Action
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2">
        <small className="text-muted">
          Showing {payrollData.length} records
        </small>
      </div>
    </div>
  );
}
