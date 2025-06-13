//path: Frontend/WanderlustTrails/src/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';

// Importing UI components used in layout
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import GoToTopButton from './components/GoToTopButton';

/**
 * Layout component that wraps every page with consistent UI
 * including Header, Footer, and a scroll-to-top button.
 * The <Outlet /> renders child routes inside this layout.
 */
function Layout() {
  return (
    <>
      {/* Container for the entire app layout with dark theme */}
      <div className="bg-gray-800 text-white min-h-screen">
        <Header />
        <Outlet />
        <GoToTopButton />
        <Footer />
      </div>
    </>
  );
}

export default Layout;
