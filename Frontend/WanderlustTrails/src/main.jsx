//path: Wanderlusttrails/Frontend/WanderlustTrails/src/main.jsx

// React core libraries
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import Bootstrap for global styles
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Toast component and styles
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom global CSS
import './index.css';

// React Router DOM - Routing setup
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate
} from 'react-router-dom';

// Layout and Page components
import Layout from './Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Blogs from './pages/Blogs.jsx';
import Help from './pages/Help.jsx';
import Admin from './pages/Admin.jsx';
import User from './pages/User.jsx';
import Login from './pages/Login.jsx';
import NeedAssist from './pages/NeedAssist.jsx';
import CurrencyConverter from './pages/CurrencyConverter.jsx';
import Destination from './pages/Destination.jsx';
import FlightAndHotel from './pages/FlightAndHotel.jsx';
import TravelInsurance from './pages/TravelInsurance.jsx';
import TravelPackages from './pages/TravelPackages.jsx';
import ErrorNotFound from './pages/ErrorNotFound.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ContactUs from './pages/ContactUs.jsx';
import Test from './components/test.jsx';
import Test2 from './pages/Test2.jsx';
import Reviews from './pages/Reviews.jsx';
import LanguageAndTouristAssist from './pages/NeedAssist.jsx';
import LearnCultureAndHistory from './pages/CultureAndHistory.jsx';
import CustomizedItinerary from './pages/CustomizedIternerary.jsx';
import HelpAndSupport from './pages/Help.jsx';
import PackageBookingDetails from './pages/PackageBookingDetails.jsx';
import Todolist from './pages/Todolist.jsx';
import AboutSwiss from './pages/AboutSwiss.jsx';

// Dashboard views
import AdminDashboard from './pages/Dashboard/AdminDashboard.jsx';
import UserDashboard from './pages/Dashboard/UserDashboard.jsx';

// Auth and context
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Unauthorized from './pages/Unauthorised.jsx';
import Payment from './pages/Payment.jsx';
import { UserProvider, useUser } from './context/UserContext.jsx';
import { TodoProvider } from './context/TodoContext.jsx';

// Set up router with routes using React Router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      {/* Public routes - accessible without login */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="needassist" element={<LanguageAndTouristAssist />} />
      <Route path="about" element={<About />} />
      <Route path="about-swiss" element={<AboutSwiss />} />
      <Route path="contactus" element={<ContactUs />} />
      <Route path="help" element={<HelpAndSupport />} />
      <Route path="test2" element={<Test2 />} />

      {/* Protected routes - require login */}
      <Route element={<ProtectedRoute />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="todolist" element={<Todolist />} />
        <Route path="currencyconverter" element={<CurrencyConverter />} />
        <Route path="destination" element={<Destination />} />
        <Route path="flightandhotel" element={<FlightAndHotel />} />
        <Route path="travelpackages" element={<TravelPackages />} />
        <Route path="PackageBookingdetails" element={<PackageBookingDetails />} />
        <Route path="CustomizedItinerary" element={<CustomizedItinerary />} />
        <Route path="cultureandhistory" element={<LearnCultureAndHistory />} />
        <Route path="travelinsurance" element={<TravelInsurance />} />
        <Route path="Payment" element={<Payment />} />
        <Route path="test" element={<Test />} />
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Role-based protected routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="user" />}>
        <Route path="/UserDashboard" element={<UserDashboard />} />
      </Route>

      {/* Catch-all fallback route for unmatched URLs */}
      <Route path="*" element={<ErrorNotFound />} />
    </Route>
  )
);

// Main application component with router and toast
const App = () => {
  // Use context to fetch user state
  const { token, user, isAuthenticated, login, logout } = useUser();

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
};

// Render the root app inside StrictMode, wrapping with User and Todo context providers
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <TodoProvider>
        <App />
      </TodoProvider>
    </UserProvider>
  </StrictMode>
);
