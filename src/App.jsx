import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Pricing from "./pages/pricing";
import Contact from "./pages/contact";
import Library from "./pages/library";
import PromptDetail from "./pages/promptdetail";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Upgrade from "./pages/upgrade";
import PaymentSuccess from "./pages/PaymentSuccess";
import Admin from "./pages/admin";
import AdminRoute from "./components/AdminRoute";
import { Toaster } from "react-hot-toast";
import Profile from "./pages/profile";
import Layout from "./components/Layout";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/pricing"
          element={
            <Layout>
              <Pricing />
            </Layout>
          }
        />

        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />

        <Route
          path="/library"
          element={
            <Layout>
              <Library />
            </Layout>
          }
        />

        <Route
          path="/prompt/:id"
          element={
            <Layout>
              <PromptDetail />
            </Layout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout>
                <Admin />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />

        <Route
          path="/upgrade"
          element={
            <Layout>
              <Upgrade />
            </Layout>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
          },
        }}
      />
    
    </BrowserRouter>
  );
}

export default App;