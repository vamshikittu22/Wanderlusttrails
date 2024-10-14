import React,{ useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Blogs from './pages/Blogs.jsx';
import Help from './pages/Help.jsx';
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
import Test from './components/test.jsx'
import { UserProvider } from './context/UserContext.jsx';

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
      <Route path="CurrencyConverter" element={<CurrencyConverter />} />
      <Route path="Destination" element={<Destination />} />
      <Route path="FlightAndHotel" element={<FlightAndHotel />} />
      <Route path="TravelInsurance" element={<TravelInsurance />} />
      <Route path="TravelPackages" element={<Test />} />
      <Route path="ContactUs" element={<ContactUs />} />  
      <Route path="test" element={<Test />} />

      <Route path="user/" element={<User />}>
        <Route path=":userid" element={<User />} />
      </Route>

      <Route path="*" element={<ErrorNotFound />} />
    </Route>
  )
);

const App = () => { // Create a functional component for your app
  const [user, setUser] = useState(null);

  return (
    <UserProvider value={{ user, setUser }}>
      <RouterProvider router={router} />
    </UserProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>
);