import { useState } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";

import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter,Routes, Route } from "react-router-dom"

import { Container } from "react-bootstrap"
import Dashboard from "./components/Dashboard";
import UpdateProfile from "./components/UpdateProfile";
import ForgotPassword from "./components/ForgotPassword";
import PrivateRoute from "./components/PrivateRoute";


function App() {

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route exact path="/" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
                } 
              />
              <Route path="/update-profile" element={
                <PrivateRoute>
                  <UpdateProfile />
                </PrivateRoute>
                } 
              />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </Container>
  );
}

export default App;
