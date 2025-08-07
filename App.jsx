import React from "react";
import "./AccountSelectionPage.css";
import {
  Container,
  Navbar,
  Nav,
  Button,
  Card,
} from "react-bootstrap";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import userImage from "./user.png";
import logoImage from "./abc-logo.png"; // <-- Your custom logo

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
  // Add more accounts as needed
];

const AccountSelectionPage = () => {
  return (
    <>
      {/* Navbar */}
      <Navbar expand="lg" className="navbar-custom shadow-sm px-4">
        <Navbar.Brand href="#home" className="d-flex align-items-center gap-2">
          <img
            src={logoImage}
            alt="Logo"
            height="40"
            className="rounded-circle"
          />
          <span className="fw-bold fs-4">ABC Corp</span>
        </Navbar.Brand>
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
      </Navbar>

      {/* Welcome Message */}
      <Container className="text-center my-4">
        <h2>Welcome back, Harsha!</h2>
        <p>Please select an account to continue</p>
      </Container>

      {/* Carousel Section */}
      <Container>
        <OwlCarousel
          className="owl-theme"
          loop
          margin={15}
          nav
          dots={false}
          responsive={{
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 3 },
          }}
        >
          {accountData.map((acc, index) => (
            <div key={index}>
              <Card className="account-card shadow-sm">
                <Card.Body>
                  <Card.Title className="account-title">{acc.company}</Card.Title>
                  <Card.Text>
                    <strong>Account Number:</strong> {acc.accountNumber} <br />
                    <strong>Role:</strong> {acc.role} <br />
                    <strong>Department:</strong> {acc.department} <br />
                    <strong>Status:</strong>{" "}
                    <span
                      className={acc.status === "Active" ? "text-success" : "text-danger"}
                    >
                      {acc.status}
                    </span>
                    <br />
                    <strong>Last Login:</strong> {acc.lastLogin}
                  </Card.Text>
                  <Button className="access-btn w-100 mt-2">Access</Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </OwlCarousel>
      </Container>
    </>
  );
};

export default AccountSelectionPage;
