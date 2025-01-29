// Main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { createBrowserRouter, 
        createRoutesFromElements, 
        Route, 
        RouterProvider } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Blogs from './pages/Blogs.jsx';
import Help from './pages/Help.jsx';
import Admin from './pages/Admin.jsx';
import User from './pages/User.jsx';
import Login from './pages/Login.jsx';
import Review from './pages/Review.jsx';
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
import { UserProvider, useUser } from './context/UserContext.jsx';
import BookingDetails from './pages/BookingDetails.jsx';
import Todolist from './pages/Todolist.jsx';
import AdminDashboard from './pages/Dashboard/AdminDashboard.jsx';
import UserDashboard from './pages/Dashboard/UserDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Unauthorized from './pages/Unauthorised.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="Home" element={<Home />} />
      <Route path="About" element={<About />} />
      <Route path="Blogs" element={<Blogs />} />
      <Route path="Help" element={<Help />} />
      <Route path="Login" element={<Login />} />
      <Route path="Signup" element={<Signup />} />
      <Route path="ForgotPassword" element={<ForgotPassword />} />
      <Route path="Review" element={<Review />} />
      <Route path="NeedAssist" element={<NeedAssist />} />
      <Route path="Todolist" element={<Todolist />} />
      <Route path="CurrencyConverter" element={<CurrencyConverter />} />
      <Route path="Destination" element={<Destination />} />
      <Route path="FlightAndHotel" element={<FlightAndHotel />} />
      <Route path="TravelInsurance" element={<TravelInsurance />} />
      <Route path="TravelPackages" element={<TravelPackages />} />
      <Route path="BookingDetails" element={<BookingDetails />} />
      <Route path="ContactUs" element={<ContactUs />} />
      <Route path="Test" element={<Test />} />
      <Route path="Unauthorized" element={<Unauthorized />} />

      Protected Routes
      <Route path="/AdminDashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/UserDashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />

      <Route path="admin/" element={<Admin />}>
      </Route>

      <Route path="user/" element={<User />}>
        <Route path=":userid" element={<User />} />
      </Route>

      <Route path="*" element={<ErrorNotFound />} />
    </Route>
  )
);

const App = () => {
  const { token, user, isAuthenticated, login, logout } = useUser();

  return (
    <>
    <RouterProvider router={router} />
    <ToastContainer />
    </>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>
);
