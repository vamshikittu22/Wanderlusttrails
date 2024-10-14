import React, { useState, useEffect } from 'react';
import ReactCardFlip from 'react-card-flip';
import india from '../assets/Images/packages/india.jpg'
import kenya from '../assets/Images/packages/kenya.jpg';
import tanzania from '../assets/Images/packages/tanzania.jpg';
import usa from '../assets/Images/packages/usa.jpg';
import costa_rica from '../assets/Images/packages/costa_rica.jpg';
import brazil from '../assets/Images/packages/brazil.jpg';
import peru from '../assets/Images/packages/peru.jpg';
import italy from '../assets/Images/packages/italy.jpg';
import iceland from '../assets/Images/packages/iceland.jpg';
import australia from '../assets/Images/packages/australia.jpg';
import new_zealand from '../assets/Images/packages/new_zealand.jpg';
import japan from '../assets/Images/packages/japan.jpg';
import thailand from '../assets/Images/packages/thailand.jpg';
import vietnam from '../assets/Images/packages/vietnam.jpg';
import singapore from '../assets/Images/packages/singapore.jpg';

//console.log(india)

const packageImages = {
  india: india,
  kenya: kenya,
  tanzania: tanzania,
  usa: usa,
  costa_rica: costa_rica, 
  brazil: brazil,
  peru: peru,
  italy: italy,
  iceland: iceland,
  australia: australia,
  new_zealand: new_zealand,
  japan: japan,
  thailand: thailand,
  vietnam: vietnam,
  singapore: singapore,
};

class TravelPackage {
  constructor(id, name, description, location, price, imageUrl) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.location = location;
    this.price = price;
    this.imageUrl = imageUrl;
    this.isFlipped = false;
  }
}

const TravelPackages = () => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://localhost/WanderlustTrails/backend/travelPackages.php');
        const data = await response.json();
       // console.log(data)

        const packageList = data.map((item) => new TravelPackage(
          item.id,
          item.name,
          item.description,
          item.location,
          item.price,
          item.image_url
        ));

        setPackages(packageList);
        //console.log(packages)
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();
  }, []);

  const handleFlip = (pkg) => {
    setPackages(packages.map((p) =>
      p.id === pkg.id ? { ...p, isFlipped: !p.isFlipped } : p
    ));
  };
  // console.log(packages)
  // {packages.map((pkg) => {
  //   console.log(packageImages[pkg.image_url]); // Log the image_url value
  // })};
  return (
    <section className="bg-transparent py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Explore Our Travel Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <ReactCardFlip isFlipped={pkg.isFlipped} flipDirection="horizontal">
                {/* Front Side of the Card */}
                <div key="front" onClick={() => handleFlip(pkg)} className="cursor-pointer">
                  <img src={packageImages[pkg.imageUrl]} alt={pkg.name} className="w-full h-40" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                    <span className="text-orange-500 font-bold text-lg">
                      {pkg.location}
                    </span>
                  </div>
                </div>

                {/* Back Side of the Card */}
                <div key="back" onClick={() => handleFlip(pkg)} className="cursor-pointer">
                  <div className="p-6 bg-cover bg-center h-full" style={{ backgroundImage: `url(${packageImages[pkg.imageUrl]})` , backgroundSize: 'cover'}}> 
                    <h3 className="text-xl font-bold text-green-200 mb-2">{pkg.name}</h3>
                    <p className="text-sky-200 text-sm mb-4">{pkg.description}</p>
                    <span className="text-orange-500 font-bold text-lg">
                      ${pkg.price} per Head  <button className='text-gray-800 font-serif font-bold'>Book now</button>
                    </span>
                   
                  </div>
                </div>
              </ReactCardFlip>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelPackages;
