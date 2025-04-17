//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import Carousel from 'react-bootstrap/Carousel';
import  Image1 from '../../assets/Images/travel1.jpg';
import  Image2 from '../../assets/Images/travel2.jpg';
import  Image3 from '../../assets/Images/travel3.jpg';
import  Image4 from '../../assets/Images/travel4.jpg';
import  Image5 from '../../assets/Images/travel5.jpg';


function Banner() {
  return (
  
    <Carousel>
      <Carousel.Item interval={2500}>
        <div className="carousel-image-container w-full h-screen md:h-[75vh] overflow-hidden"> 
          <img 
              src={Image1} 
              className=" d-block w-full h-100 object-cover " 
              alt="First slide" 
            />
        </div>
        <Carousel.Caption>
          <h3 className='text-green-700 font-extrabold'>Welcome!! plan your trip with us now</h3>
          <p className='text-blue-700 font-semibold'>Give us the dates and you are ready to go</p>
          <p className="mt-4 text-center">
              <a href="/Reviews" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">read our reviews</a>
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item interval={2500}>
        <div className="carousel-image-container w-full h-screen md:h-[75vh] overflow-hidden"> 
          <img 
              src={Image2} 
              className=" d-block w-full h-100 object-cover " 
              alt="Second slide" 
            />
        </div>
        <Carousel.Caption>
          <h3 className='text-yellow-500 font-extrabold'>Welcome!! want to go on a solo trip </h3>
          <p className='text-violet-500 font-semibold'>you have a lot of adventures waiting for you.</p>
          <p className="mt-4 text-center">
                <a href="/TodoList" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">enter your task here !!</a>
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item interval={2500}>
        <div className="carousel-image-container w-full h-screen md:h-[75vh] overflow-hidden"> 
          <img 
              src={Image3} 
              className=" d-block w-full h-100 object-cover " 
              alt="Third slide" 
            />
        </div>
        <Carousel.Caption>
          <h3 className='text-blue-200 font-extrabold'> Welcome!! need a family vacation</h3>
          <p className='text-purple-700 font-semibold'>check out our pre planned packages.</p>
          <p className="mt-4 text-center">
                <a href="/TravelPackages" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">click here !!</a>
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item interval={2500}>
        <div className="carousel-image-container w-full h-screen md:h-[75vh] overflow-hidden"> 
          <img 
              src={Image4} 
              className=" d-block w-full h-100 object-cover " 
              alt="Forth slide" 
            />
        </div>
        <Carousel.Caption>
          <h3 className='text-gray-200 font-extrabold'> Welcome!! need a family vacation-</h3>
          <p className='text-red-400 font-semibold'>check out our pre planned packages.</p>
          <p className="mt-4 text-center">
                <a href="/TravelPackages" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">click here !!</a>
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item interval={2500}>
        <div className="carousel-image-container w-full h-screen md:h-[75vh] overflow-hidden"> 
          <img 
              src={Image5} 
              className=" d-block w-full h-100 object-cover " 
              alt="Fifth slide" 
            />
        </div>
        <Carousel.Caption>
          <h3 className='text-gray-200 font-extrabold'> Welcome!! need a family vacation</h3>
          <p className='text-red-400 font-semibold'>check out our pre planned packages.</p>
          <p className="mt-4 text-center">
                <a href="/TravelPackages" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">click here !!</a>
          </p>
        </Carousel.Caption>
      </Carousel.Item>
      
    </Carousel>
 
  );
}

export default Banner;