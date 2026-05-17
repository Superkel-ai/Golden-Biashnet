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
import ChatSeller from "./pages/ChatSeller";


//Admin
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminHouses from "./pages/AdminHouses";
import AdminAdverts from "./pages/AdminAdverts";
import AdminServices from "./pages/AdminServices";
import AdminInvestor from "./pages/AdminInvestor";
import AdminSupport from "./pages/AdminSupport";
import AdminNotify from "./pages/AdminNotify";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminSuper from "./pages/AdminSuper";
import AdminSub from "./pages/AdminSub";
import AdminChat from "./pages/AdminChat";
import AdminChatSeller from "./pages/AdminChatSeller";
import AdminSeller from "./pages/AdminSeller";




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
                <Route path="/support-chat/:chatId" element={<ChatRoom />} />
                <Route path="/seller-support-chat/:chatId" element={<ChatSeller />} />
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
          path="/admin/support"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminSupport />
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

         <Route
          path="/admin/sub"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminSub/>
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/seller"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminSeller/>
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />


         <Route
          path="/admin/chat/:chatId"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminChat/>
              </AdminAppLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/seller-chat/:chatId"
          element={
            <ProtectedAdminRoute>
              <AdminAppLayout>
                <AdminChatSeller/>
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