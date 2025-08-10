// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AccountSelectionPage from "./AccountSelectionPage";
import AccountStatement from "./AccountStatement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AccountSelectionPage />} />
        <Route path="/statement" element={<AccountStatement />} />
      </Routes>
    </Router>
  );
}
