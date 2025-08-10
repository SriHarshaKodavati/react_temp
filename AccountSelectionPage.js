// src/components/AccountSelectionPage.js
import React, { useState } from "react";
import "./AccountSelectionPage.css";
import {
  Container,
  Navbar,
  Nav,
  Button,
  Card,
} from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import userImage from "./logo192.png";
import logoImage from "./logo512.png";
import { useNavigate } from "react-router-dom";

// Demo account data with statements (one or two transactions per account)
const accountData = [
  {
    company: "ABC Tech Ltd.",
    accountNumber: "1234567890",
    role: "Manager",
    department: "Finance",
    status: "Active",
    lastLogin: "2025-08-05 10:30 AM",
    accountSummary: {
      accountType: "Savings",
      ifsc: "ABCC0001001",
      micr: "123456789",
      nomination: "Registered",
      currentBalance: "₹5,50,000.00",
      asOnDate: "2025-08-05",
      statementRange: { from: "2025-08-01", to: "2025-08-05" },
      transactions: [
        {
          date: "2025-08-02",
          description: "Salary Credit",
          reference: "TXN10001",
          type: "Credit",
          amount: "₹50,000.00",
          balance: "₹5,50,000.00",
        },
        {
          date: "2025-08-03",
          description: "Vendor Payment",
          reference: "TXN10002",
          type: "Debit",
          amount: "₹15,000.00",
          balance: "₹5,35,000.00",
        },
      ],
    },
  },
  {
    company: "XYZ Corp.",
    accountNumber: "9876543210",
    role: "Employee",
    department: "Sales",
    status: "Inactive",
    lastLogin: "2025-07-29 4:45 PM",
    accountSummary: {
      accountType: "Current",
      ifsc: "ABCC0002002",
      micr: "987654321",
      nomination: "Not Registered",
      currentBalance: "₹2,00,000.00",
      asOnDate: "2025-07-29",
      statementRange: { from: "2025-07-20", to: "2025-07-29" },
      transactions: [],
    },
  },
  {
    company: "Innova Systems",
    accountNumber: "1122334455",
    role: "Finance Officer",
    department: "Accounts",
    status: "Active",
    lastLogin: "2025-08-01 12:15 PM",
    accountSummary: {
      accountType: "Savings",
      ifsc: "ABCC0003003",
      micr: "456789123",
      nomination: "Registered",
      currentBalance: "₹8,75,000.00",
      asOnDate: "2025-08-01",
      statementRange: { from: "2025-07-25", to: "2025-08-01" },
      transactions: [
        {
          date: "2025-07-28",
          description: "Invoice Payment",
          reference: "TXN30003",
          type: "Credit",
          amount: "₹1,25,000.00",
          balance: "₹8,75,000.00",
        },
      ],
    },
  },
  {
    company: "DEF Tech Ltd.",
    accountNumber: "1234567880",
    role: "Finance Officer",
    department: "Finance",
    status: "Active",
    lastLogin: "2025-08-05 10:30 AM",
    accountSummary: {
      accountType: "Savings",
      ifsc: "ABCC0001201",
      micr: "123456779",
      nomination: "Registered",
      currentBalance: "₹7,30,999.00",
      asOnDate: "2025-08-05",
      statementRange: { from: "2025-08-01", to: "2025-08-05" },
      transactions: [
        {
          date: "2025-08-02",
          description: "Salary Credit",
          reference: "TXN10001",
          type: "Credit",
          amount: "₹50,000.00",
          balance: "₹5,50,000.00",
        },
        {
          date: "2025-08-03",
          description: "Vendor Payment",
          reference: "TXN10002",
          type: "Debit",
          amount: "₹15,000.00",
          balance: "₹5,35,000.00",
        },
      ],
    },
  },
];

const AccountSelectionPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const navigate = useNavigate();

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const handleAccessClick = (idx) => {
    setSelectedIndex(idx);
    const selectedAcc = accountData[idx];
    navigate("/statement", { state: { account: selectedAcc } });
  };

  return (
    <>
      {/* Navbar */}
      <Navbar expand="lg" className="navbar-custom shadow-sm px-4" collapseOnSelect>
        <Navbar.Brand href="#home" className="d-flex align-items-center gap-2">
          <img src={logoImage} alt="Logo" height="40" className="rounded-circle" />
          <span className="fw-bold fs-4">ABC Corp</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center gap-4">
            <Nav.Link href="#products">Banking Products</Nav.Link>
            <Nav.Link href="#notifications">Notifications</Nav.Link>
            <Nav.Link href="#help">Help</Nav.Link>
            <Button variant="outline-light">Logout</Button>
            <img
              src={userImage}
              alt="user"
              width="35"
              height="35"
              className="rounded-circle border"
            />
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="text-center my-4">
        <h2>
          Welcome back, <span style={{ color: "#38d200" }}>Harsha!</span>
        </h2>
        <p>Please select an account to continue</p>
      </Container>

      <Container className="mb-5">
        <Slider {...settings}>
          {accountData.map((acc, index) => (
            <div key={index}>
              <Card
                className={`account-card shadow-sm m-3 ${
                  selectedIndex === index ? "selected-account-card" : ""
                }`}
              >
                <Card.Body>
                  <Card.Title className="account-title mb-3">{acc.company}</Card.Title>
                  <Card.Text>
                    <p>
                      <strong>Account Number:</strong> {acc.accountNumber}
                    </p>
                    <p>
                      <strong>Role:</strong> {acc.role}
                    </p>
                    <p>
                      <strong>Department:</strong> {acc.department}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          acc.status === "Active" ? "text-success" : "text-danger"
                        }
                      >
                        {acc.status}
                      </span>
                    </p>
                    <p>
                      <strong>Last Login:</strong> {acc.lastLogin}
                    </p>
                  </Card.Text>
                  <Button
                    className={`access-btn w-100 mt-2 ${
                      selectedIndex === index ? "selected-btn" : ""
                    }`}
                    onClick={() => handleAccessClick(index)}
                  >
                    Access
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </Slider>
      </Container>

      {/* Footer */}
      <footer className="footer-custom text-center py-3">
        <small>© {new Date().getFullYear()} ABC Corp. All rights reserved.</small>
      </footer>
    </>
  );
};

export default AccountSelectionPage;

