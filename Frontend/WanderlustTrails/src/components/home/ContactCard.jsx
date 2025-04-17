//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import React from 'react';

const ContactCard = () => {
  return (

    <>

<section className="relative"> 
     
      
       
        <div className="container mx-auto px-4 py-12 text-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-3/4 mb-6 md:mb-0">
            <h5 className="text-lg font-medium text-orange-500 mb-2">CALL TO ACTION</h5>
            <h2 className="text-3xl font-bold mb-4">
              READY FOR UNFORGATABLE TRAVEL. REMEMBER US!
            </h2>
            <p className="text-gray-300">
              {' '}
            </p>
          </div>
          <div className="md:w-1/4 text-center">
            <a
              href='/ContactUs'
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105" 
            >
              Contact Us!
            </a>
          </div>
        </div>
        
      </div>
    </section>

    


    </>
  );
};

export default ContactCard;