import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'



function Layout() {
  return (
    <>
    <div className="bg-gray-800 text-white min-h-screen">
    <Header />
    <Outlet />
    <Footer />
    </div>
    
    </>
  )
}

export default Layout