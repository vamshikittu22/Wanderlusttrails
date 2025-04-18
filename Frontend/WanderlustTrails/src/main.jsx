//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { createBrowserRouter, 
        createRoutesFromElements, 
        Route, 
        RouterProvider,
        Navigate } from 'react-router-dom';
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
import { UserProvider, useUser } from './context/UserContext.jsx';
import PackageBookingDetails from './pages/PackageBookingDetails.jsx';
import Todolist from './pages/Todolist.jsx';
import AdminDashboard from './pages/Dashboard/AdminDashboard.jsx';
import UserDashboard from './pages/Dashboard/UserDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Unauthorized from './pages/Unauthorised.jsx';
import Payment from './pages/Payment.jsx';
import Test2 from './pages/Test2.jsx';
import Reviews from './pages/Reviews.jsx';
import LanguageAndTouristAssist from './pages/NeedAssist.jsx';
import LearnCultureAndHistory from './pages/CultureAndHistory.jsx';
import CustomizedItinerary from './pages/CustomizedIternerary.jsx';
import HelpAndSupport from './pages/Help.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
   
      {/* If user is not logged in, only allow access to Login & Signup */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="needassist" element={<LanguageAndTouristAssist />} />
      <Route path="About" element={<About />} />
      <Route path="contactus" element={<ContactUs />} />
      <Route path="help" element={<HelpAndSupport/>} />
      <Route path="test2" element={<Test2 />} />


      {/* Redirect any unauthorized user to Login */}
      {/* <Route path="*" element={<Navigate to="/login" />} /> */}

      {/* Protected Routes - Requires Authentication */}
      <Route element={<ProtectedRoute />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="todolist" element={<Todolist />} />
        <Route path="currencyconverter" element={<CurrencyConverter />} />
        <Route path="destination" element={<Destination />} />
        <Route path="flightandhotel" element={<FlightAndHotel />} />
        {/* <Route path="travelinsurance" element={<TravelInsurance />} /> */}
        <Route path="travelpackages" element={<TravelPackages />} />
        <Route path="PackageBookingdetails" element={<PackageBookingDetails />} />
        <Route path="CustomizedItinerary" element={<CustomizedItinerary />} />
        <Route path="cultureandhistory" element={<LearnCultureAndHistory />} />
        <Route path="travelinsurance" element={<TravelInsurance />} />

        <Route path="Payment" element={<Payment />} />
        <Route path="test" element={<Test />} />
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>

       {/* Role-Based Protected Routes */}
       <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="user" />}>
          <Route path="/UserDashboard" element={<UserDashboard />} />
        </Route>

        {/* Catch-All Route */}
           <Route path="*" element={<ErrorNotFound />} />

  </Route>


//  {/* Protected Routes - Only Check Authentication */}
//  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
//       <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
//       <Route path="/blogs" element={<ProtectedRoute><Blogs /></ProtectedRoute>} />
//       <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

      
//       {/* Protected Routes - Check Authentication and Role */}
//       <Route path="/AdminDashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
//       <Route path="/UserDashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />

     
//       <Route path="Blogs" element={<Blogs />} />
//       <Route path="Help" element={<Help />} />
//       <Route path="Login" element={<Login />} />
//       <Route path="Signup" element={<Signup />} />
//       <Route path="ForgotPassword" element={<ForgotPassword />} />
//       <Route path="Review" element={<Review />} />
//       <Route path="NeedAssist" element={<NeedAssist />} />
//       <Route path="Todolist" element={<Todolist />} />
//       <Route path="CurrencyConverter" element={<CurrencyConverter />} />
//       <Route path="Destination" element={<Destination />} />
//       <Route path="FlightAndHotel" element={<FlightAndHotel />} />
//       <Route path="TravelInsurance" element={<TravelInsurance />} />
//       <Route path="TravelPackages" element={<TravelPackages />} />
//       <Route path="BookingDetails" element={<BookingDetails />} />
//       <Route path="ContactUs" element={<ContactUs />} />
//       <Route path="Test" element={<Test />} />
//       <Route path="Unauthorized" element={<Unauthorized />} />

//       Protected Routes
//       <Route path="/AdminDashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
//       <Route path="/UserDashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />

//       <Route path="admin/" element={<Admin />}>
//       </Route>

//       <Route path="user/" element={<User />}>
//         <Route path=":userid" element={<User />} />
//       </Route>

//       <Route path="*" element={<ErrorNotFound />} />
//     </Route>
    
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
