import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Splash
import SplashScreen from "./components/SplashScreen";
// functions

// Install prompt
import Install from "./components/Install";
// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Product from "./pages/Product";
import Houses from "./pages/Houses";
import Services from "./pages/Services";
import Adverts from "./pages/Adverts";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Boost from "./pages/Boost"
import Lend from "./pages/Lend"
import MyOrders from "./pages/MyOrders";
import MyUploads from "./pages/MyUploads";
import EditListing from "./pages/EditListing";
import Verify from "./pages/Verify";
import SearchPage from "./pages/SearchPage";
import SellerOrders from "./pages/SellerOrders";
import PostDetails from "./pages/PostDetails";
import Uploads from "./pages/Uploads";
import Subscription from "./pages/Subscription";
import TrackOrder from "./pages/TrackOrder";
import Welcome from "./pages/Welcome";
import InvestorDashboard from "./pages/InvestorDashboard";
import Notify from "./pages/Notify";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";


//Admin
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminHouses from "./pages/AdminHouses";
import AdminAdverts from "./pages/AdminAdverts";
import AdminServices from "./pages/AdminServices";
import AdminInvestor from "./pages/AdminInvestor";
import AdminMembers from "./pages/AdminMembers";
import AdminNotify from "./pages/AdminNotify";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminSuper from "./pages/AdminSuper";




// Layouts
import AppLayout from "./layouts/AppLayout";
import AdminAppLayout from "./layouts/AdminAppLayout";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  

  // Splash timer
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Check localStorage for admin login
  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    setAdminLoggedIn(loggedIn === "true");
  }, []);

  if (loading) return <SplashScreen />;

  // Protected admin route
  const ProtectedAdminRoute = ({ children }) => {
    return adminLoggedIn ? children : <Navigate to="/admin" replace />;
  };

  return (
    <Router>
      <Install />
      <Routes>
        {/* ================= MEMBER ROUTES ================= */}
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/product" element={<Product />} />
                <Route path="/" element={<Welcome />} />
                <Route path="/houses" element={<Houses />} />
                <Route path="/services" element={<Services />} />
                <Route path="/adverts" element={<Adverts />} />
                <Route path="/home" element={<Home />} />
                <Route path="/edit/:collection/:id" element={<EditListing />} />
                <Route path="/lend" element={<Lend />} />
                <Route path="/investor-dashboard" element={<InvestorDashboard />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/notify" element={<Notify />} />
                <Route path="/chats" element={<ChatList />} />
                <Route path="/chat/:chatId" element={<ChatRoom />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/boost" element={<Boost />} />
                <Route path="/my-uploads" element={<MyUploads />} />
                <Route path="/seller-orders" element={<SellerOrders />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/post/:type/:id" element={<PostDetails />} />
                <Route path="/uploads" element={<Uploads />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/product" element={<Product />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/subscription" element={< Subscription />} />
                <Route path="/track-order/:id" element={< TrackOrder />} />
              </Routes>
            </AppLayout>
          }
        />

        {/* ================= ADMIN LOGIN ================= */}
        <Route
          path="/admin"
          element={
            adminLoggedIn ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin onLoginSuccess={() => setAdminLoggedIn(true)} />
            )
          }
        />

        {/* ================= ADMIN DASHBOARD ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminDashboard />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />

        {/* ================= ADMIN PRODUCTS ================= */}
        <Route
          path="/admin/products"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminProducts />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/houses"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminHouses />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/investors"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminInvestor />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminMembers />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />


        


        <Route
          path="/admin/adverts"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminAdverts />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />

         <Route
          path="/admin/notify"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminNotify />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />



        <Route
          path="/admin/services"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminServices />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />

<Route
          path="/admin/orders"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminOrders />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminUsers />
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/super"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminSuper/>
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />



        

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}