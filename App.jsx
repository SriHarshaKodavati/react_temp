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

// Demo account data
const accountData = [
  {
    company: "ABC Tech Ltd.",
    accountNumber: "1234567890",
    role: "Manager",
    department: "Finance",
    status: "Active",
    lastLogin: "2025-08-05 10:30 AM",
  },
  {
    company: "XYZ Corp.",
    accountNumber: "9876543210",
    role: "Employee",
    department: "Sales",
    status: "Inactive",
    lastLogin: "2025-07-29 4:45 PM",
  },
  {
    company: "Innova Systems",
    accountNumber: "1122334455",
    role: "Finance Officer",
    department: "Accounts",
    status: "Active",
    lastLogin: "2025-08-01 12:15 PM",
  },
  // Duplicate entries as in your sample...
  {
    company: "Innova Systems",
    accountNumber: "1122334455",
    role: "Finance Officer",
    department: "Accounts",
    status: "Active",
    lastLogin: "2025-08-01 12:15 PM",
  },
  {
    company: "Innova Systems",
    accountNumber: "1122334455",
    role: "Finance Officer",
    department: "Accounts",
    status: "Active",
    lastLogin: "2025-08-01 12:15 PM",
  },
  {
    company: "Innova Systems",
    accountNumber: "1122334455",
    role: "Finance Officer",
    department: "Accounts",
    status: "Active",
    lastLogin: "2025-08-01 12:15 PM",
  },
  {
    company: "Innova Systems",
    accountNumber: "1122334455",
    role: "Finance Officer",
    department: "Accounts",
    status: "Active",
    lastLogin: "2025-08-01 12:15 PM",
  },
];

const AccountSelectionPage = () => {
  // Selected card index for highlight
  const [selectedIndex, setSelectedIndex] = useState(null);

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
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Handler to set which account is selected
  const handleAccessClick = (idx) => {
    setSelectedIndex(idx);
    // ...navigate, set account in state, etc.
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

      {/* Welcome Text */}
      <Container className="text-center my-4">
        <h2>
          Welcome back, <span style={{ color: "#38d200" }}>Harsha!</span>
        </h2>
        <p>Please select an account to continue</p>
      </Container>

      {/* Account Cards Carousel */}
      <Container className="mb-5">
        <Slider {...settings}>
          {accountData.map((acc, index) => (
            <div key={index}>
              <Card
                className={`account-card shadow-sm m-3 ${selectedIndex === index ? "selected-account-card" : ""}`}
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
                      <span className={acc.status === "Active" ? "text-success" : "text-danger"}>
                        {acc.status}
                      </span>
                    </p>
                    <p>
                      <strong>Last Login:</strong> {acc.lastLogin}
                    </p>
                  </Card.Text>
                  <Button
                    className={`access-btn w-100 mt-2 ${selectedIndex === index ? "selected-btn" : ""}`}
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
        <small>
          © {new Date().getFullYear()} ABC Corp. All rights reserved.
        </small>
      </footer>
    </>
  );
};

export default AccountSelectionPage;
