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

  const setupInitialData = (data) =>
    data.map((item) => {
      let approvalsNeeded = 1;
      if (item.Amount > 500000) approvalsNeeded = 5;
      else if (item.Amount > 100000) approvalsNeeded = 3;

      const approvalsLeft = item.Status === "Pending" ? approvalsNeeded : 0;
      return {
        ...item,
        approvalsLeft,
        approvedByCurrentUser: false,
        rejectedByCurrentUser: false,
      };
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
        item.approvedByCurrentUser ||
        item.rejectedByCurrentUser
      ) {
        return prev;
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

      if (
        item.Status === "Pending" &&
        !item.approvedByCurrentUser &&
        !item.rejectedByCurrentUser
      ) {
        item.Status = "Reject";
        item.approvalsLeft = 0;
        item.rejectedByCurrentUser = true;
      }

      return newData;
    });
  };

  const getStatusBadge = (status, approvalsLeft) => {
    if (status === "Approved")
      return <span className="badge bg-success">Approved</span>;
    else if (status === "Reject")
      return <span className="badge bg-danger">Rejected</span>;
    else
      return (
        <span className="badge bg-warning text-dark">
          Pending ({approvalsLeft} left)
        </span>
      );
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Payroll Approval Dashboard</h4>
        <h6 className="text-muted">
          Total Pending Amount: ₹{getTotalPendingAmount().toLocaleString()}
        </h6>
      </div>

      <div className="table-responsive shadow rounded">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Payroll ID</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Period</th>
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
                <td>{getStatusBadge(row.Status, row.approvalsLeft)}</td>
                <td>
                  {row.Status === "Pending" &&
                  !row.approvedByCurrentUser &&
                  !row.rejectedByCurrentUser ? (
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
