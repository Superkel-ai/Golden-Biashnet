import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/AuthContext"; // Update path to your AuthContext


// Splash
import SplashScreen from "./components/SplashScreen";
// functions

// Install prompt
import Install from "./components/Install";
//components
import InfiniteProducts from "./components/home/InfiniteProducts";

// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Houses from "./pages/Houses";
import Services from "./pages/Services";
import Adverts from "./pages/Adverts";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Boost from "./pages/Boost"
import MyOrders from "./pages/MyOrders";
import MyUploads from "./pages/MyUploads";
import EditListing from "./pages/EditListing";
import Edit from "./components/profile/Edit";
import Verify from "./pages/Verify";
import SearchPage from "./pages/SearchPage";
import SellerOrders from "./pages/SellerOrders";
import PostDetails from "./pages/PostDetails";
import Uploads from "./pages/Uploads";
import Subscription from "./pages/Subscription";
import Welcome from "./pages/Welcome";
import About from "./pages/About";
import Stk from "./pages/Stk";
import Wallet from "./pages/Wallet";
import Invest from "./pages/Invest";
import InvestorLogin from "./pages/InvestorLogin";
import Notify from "./pages/Notify";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import ChatSeller from "./pages/ChatSeller";
import FlashSale from "./pages/FlashSale";


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
import AdminVerify from "./pages/AdminVerify";
import AdminEdits from "./pages/AdminEdits";
import AdminFlash from "./pages/AdminFlash";




// Layouts
import AppLayout from "./layouts/AppLayout";
import AdminAppLayout from "./layouts/AdminAppLayout";
import InvestorLayout from "./layouts/InvestorLayout";
export default function App() {
 const [loadingSplash, setLoadingSplash] = useState(true);
const { user, isAdmin, loading: authLoading } = useAuth();

useEffect(() => {
  const timer = setTimeout(() => {
    setLoadingSplash(false);
  }, 1000);

  return () => clearTimeout(timer);
}, []);

// Only show splash for the first second
if (loadingSplash) {
  return <SplashScreen />;
}
  // SECURE PROTECTED ROUTE: Rejects localstorage manipulation completely
  const ProtectedAdminRoute = ({ children }) => {
    if (!user || !isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return children;
  };

 return (
  <Router>
    <Install />

    <Routes>

      {/* ================= MEMBER ROUTES ================= */}

      <Route
        path="/"
        element={
          <AppLayout>
            <Home />
          </AppLayout>
        }
      />

      <Route path="/welcome" element={<AppLayout><Welcome /></AppLayout>} />
      <Route path="/about" element={<AppLayout><About /></AppLayout>} />
      <Route path="/stk" element={<AppLayout><Stk /></AppLayout>} />
      <Route path="/wallet" element={<AppLayout><Wallet /></AppLayout>} />
      <Route path="/houses" element={<AppLayout><Houses /></AppLayout>} />
      <Route path="/services" element={<AppLayout><Services /></AppLayout>} />
      <Route path="/adverts" element={<AppLayout><Adverts /></AppLayout>} />
      <Route path="/signup" element={<AppLayout><Signup /></AppLayout>} />
      <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
      <Route path="/edit" element={<AppLayout><Edit /></AppLayout>} />
      <Route path="/cart" element={<AppLayout><Cart /></AppLayout>} />
      <Route path="/notify" element={<AppLayout><Notify /></AppLayout>} />
      <Route path="/chats" element={<AppLayout><ChatList /></AppLayout>} />
      <Route path="/support-chat/:chatId" element={<AppLayout><ChatRoom /></AppLayout>} />
      <Route path="/InfiniteProducts" element={<AppLayout><InfiniteProducts /></AppLayout>} />
      <Route path="/seller-support-chat/:chatId" element={<AppLayout><ChatSeller /></AppLayout>} />
      <Route path="/verify" element={<AppLayout><Verify /></AppLayout>} />
      <Route path="/boost" element={<AppLayout><Boost /></AppLayout>} />
      <Route path="/my-uploads" element={<AppLayout><MyUploads /></AppLayout>} />
      <Route path="/seller-orders" element={<AppLayout><SellerOrders /></AppLayout>} />
      <Route path="/search" element={<AppLayout><SearchPage /></AppLayout>} />
      <Route path="/post/:type/:id" element={<AppLayout><PostDetails /></AppLayout>} />
      <Route path="/uploads" element={<AppLayout><Uploads /></AppLayout>} />
      <Route path="/checkout" element={<AppLayout><Checkout /></AppLayout>} />
      <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
      <Route path="/orders" element={<AppLayout><Orders /></AppLayout>} />
      <Route path="/my-orders" element={<AppLayout><MyOrders /></AppLayout>} />
      <Route path="/flash-sales" element={<AppLayout><FlashSale /></AppLayout>} />
      <Route path="/subscription" element={<AppLayout><Subscription /></AppLayout>} />

      {/* ================= INVESTOR ROUTES ================= */}

      <Route
        path="/invest"
        element={
          <InvestorLayout>
            <Invest />
          </InvestorLayout>
        }
      />

      <Route
        path="/investor-login"
        element={<InvestorLogin />}
      />

      {/* ================= ADMIN LOGIN ================= */}

      <Route
        path="/admin"
        element={
          user && isAdmin
            ? <Navigate to="/admin/dashboard" replace />
            : <AdminLogin />
        }
      />

      {/* ================= ADMIN ROUTES ================= */}

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
        path="/admin/verify"
        element={
          <ProtectedAdminRoute>
            <AdminAppLayout>
              <AdminVerify />
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
        path="/admin/products/edit/:productId"
        element={
          <ProtectedAdminRoute>
            <AdminAppLayout>
              <AdminEdits />
            </AdminAppLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/flash"
        element={
          <ProtectedAdminRoute>
            <AdminAppLayout>
              <AdminFlash />
            </AdminAppLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/super"
        element={
          <ProtectedAdminRoute>
            <AdminAppLayout>
              <AdminSuper />
            </AdminAppLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/sub"
        element={
          <ProtectedAdminRoute>
            <AdminAppLayout>
              <AdminSub />
            </AdminAppLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/seller"
        element={
          <ProtectedAdminRoute>
            <AdminAppLayout>
              <AdminSeller />
            </AdminAppLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/chat/:chatId"
        element={
          <ProtectedAdminRoute>
            <AdminAppLayout>
              <AdminChat />
            </AdminAppLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/seller-chat/:chatId"
        element={
          <ProtectedAdminRoute>
            <AdminAppLayout>
              <AdminChatSeller />
            </AdminAppLayout>
          </ProtectedAdminRoute>
        }
      />

      {/* FALLBACK */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  </Router>
  );
}
