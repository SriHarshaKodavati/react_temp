import React from "react";
import "./AccountSelectionPage.css";
import { Container, Navbar, Nav, Button, Card, Row, Col } from "react-bootstrap";
import userImage from "./user.png"; // add your own user image or icon here
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

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
  // Add more accounts here
];

const AccountSelectionPage = () => {
  const scroll = (direction) => {
    const container = document.getElementById("scroll-container");
    const scrollAmount = 320;
    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="light" expand="lg" className="shadow-sm px-4">
        <Navbar.Brand href="#home" className="fw-bold text-primary">🏦 Bank Portal</Navbar.Brand>
        <Nav className="ms-auto d-flex align-items-center gap-4">
          <Nav.Link href="#products">Banking Products</Nav.Link>
          <Nav.Link href="#notifications">Notifications</Nav.Link>
          <Nav.Link href="#help">Help</Nav.Link>
          <Button variant="outline-danger">Logout</Button>
          <img
            src={userImage}
            alt="user"
            width="35"
            height="35"
            className="rounded-circle border"
          />
        </Nav>
      </Navbar>

      {/* Welcome */}
      <Container className="text-center my-4">
        <h2>Welcome back, Harsha!</h2>
        <p>Please select an account to continue</p>
      </Container>

      {/* Scroll Arrows */}
      <Container className="position-relative">
        <FaArrowLeft
          className="scroll-arrow left-arrow"
          onClick={() => scroll("left")}
        />
        <FaArrowRight
          className="scroll-arrow right-arrow"
          onClick={() => scroll("right")}
        />

        {/* Scrollable Cards */}
        <div
          id="scroll-container"
          className="d-flex overflow-auto gap-3 px-4 scroll-container"
        >
          {accountData.map((acc, index) => (
            <Card
              key={index}
              className="flex-shrink-0 shadow-sm"
              style={{ minWidth: "300px", borderLeft: `5px solid #0473ea` }}
            >
              <Card.Body>
                <Card.Title className="fw-bold text-success">{acc.company}</Card.Title>
                <Card.Text>
                  <strong>Account Number:</strong> {acc.accountNumber}<br />
                  <strong>Role:</strong> {acc.role}<br />
                  <strong>Department:</strong> {acc.department}<br />
                  <strong>Status:</strong>{" "}
                  <span className={acc.status === "Active" ? "text-success" : "text-danger"}>
                    {acc.status}
                  </span>
                  <br />
                  <strong>Last Login:</strong> {acc.lastLogin}
                </Card.Text>
                <Button variant="primary" className="w-100 mt-2">
                  Access
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
};

export default AccountSelectionPage;
