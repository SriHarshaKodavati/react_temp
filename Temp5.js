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

      <div className="d-flex flex-column gap-3">
        {payrollData.map((row, index) => (
          <div
            key={index}
            className="p-4 bg-white shadow-sm rounded d-flex flex-wrap justify-content-between align-items-center"
          >
            <div className="mb-2 mb-md-0">
              <h6 className="mb-1 fw-semibold">Payroll ID: {row.PayrollId}</h6>
              <div className="text-muted small">
                <div>Employee: {row.EmployeeName}</div>
                <div>Department: {row.Department}</div>
                <div>Period: {row.Period}</div>
              </div>
            </div>

            <div className="text-end me-auto me-md-0 ms-md-4 mb-2 mb-md-0">
              <div className="fw-bold">₹{row.Amount.toLocaleString()}</div>
              <div>{getStatusBadge(row.Status, row.approvalsLeft)}</div>
            </div>

            <div className="ms-auto">
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
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-muted small text-end">
        Showing <strong>{payrollData.length}</strong> records
      </div>
    </div>
  );
}
