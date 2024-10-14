import React, { useState, useEffect } from 'react';
import {Dropdown, DropdownButton} from 'react-bootstrap';
import ReactCardFlip from 'react-card-flip';
import india from '../assets/Images/packages/india.jpg';
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
import morocco from '../assets/Images/packages/morocco.jpg';
import namibia from '../assets/Images/packages/namibia.jpg';
import malaysia from '../assets/Images/packages/malaysia.jpg'; 
import nepal from '../assets/Images/packages/nepal.jpg';
import spain from '../assets/Images/packages/spain.jpg';
import portugal from '../assets/Images/packages/portugal.jpg';
import canada from '../assets/Images/packages/canada.jpg';
import mexico from '../assets/Images/packages/mexico.jpg';
import argentina from '../assets/Images/packages/argentina.jpg';
import chile from '../assets/Images/packages/chile.jpg';
import fiji from '../assets/Images/packages/fiji.jpg';
import papua_new_guinea from '../assets/Images/packages/papua_new_guinea.jpg';
import greece from '../assets/Images/packages/greece.jpg';

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
    morocco: morocco,
    namibia: namibia,
    malaysia: malaysia, 
    nepal: nepal,
    spain: spain,
    portugal: portugal,
    canada: canada,
    mexico: mexico,
    argentina: argentina,
    chile: chile,
    fiji: fiji,
    papua_new_guinea: papua_new_guinea,
    greece: greece, 
};

class TravelPackage {
    constructor(id, name, description, location, price, imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.price = price;
        this.imageUrl = imageUrl;
        this.isFlipped = false; // Add isFlipped property
    }
}

const TravelPackages = () => {
    const [packages, setPackages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [packagesPerPage] = useState(9);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch('http://localhost/WanderlustTrails/travelData.php');
                const data = await response.json();

                const packageList = data.map((item) => new TravelPackage(
                    item.id,
                    item.name,
                    item.description,
                    item.location,
                    item.price,
                    item.image_url,
                ));

                setPackages(packageList);
            } catch (error) {
                console.error('Error fetching packages:', error);
            }
        };

        fetchPackages();
    }, []);

    const handleFlip = (pkg) => {
        setPackages( packages.map((p) =>
          p.id === pkg.id ? { ...p, isFlipped: !p.isFlipped } : p,
      ));
    };
    const sortOptions = [
        { value: null, label: 'No Sorting' },
        { value: 'price-asc', label: 'Price (Low to High)' },
        { value: 'price-desc', label: 'Price (High to Low)' },
        // Add other sorting options as needed
      ];
    
      const handleSortChange = (selectedSortBy) => {
        // ... (sorting logic)
      };

    // Logic for pagination
    const indexOfLastPackage = currentPage * packagesPerPage;
    const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
    const currentPackages = packages.slice(indexOfFirstPackage, indexOfLastPackage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <section className="bg-transparent py-12">
            <div className="max-w-5xl mx-auto px-4">
                <div className='flex items-center justify-between mb-8'>
                <h2 className="text-3xl font-bold text-gray-200 mb-6 text-center">
                    Explore Our Travel Packages
                </h2>
                <DropdownButton 
                id="dropdown-basic-button" 
                title={<span className="text-sky-300 font-bold hover:text-green-200">Sort by</span>}
                className=" text-gray-200 font-semibold focus:ring-4 bg-orange-600 rounded-lg text-sm mr-1 "
                variant='outline'
                menuVariant='dark'>
                    {sortOptions.map((option) => (
                     <Dropdown.Item 
                     key={option.value} 
                     onClick={() => handleSortChange(option.value)}
                     className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 "
                     >{option.label}
                     </Dropdown.Item>
                    ))}
                </DropdownButton>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                    {currentPackages.map((pkg) => (
                        <div key={pkg.id} className=" backdrop:blur-5 rounded-lg shadow-md overflow-hidden">
                            <ReactCardFlip isFlipped={pkg.isFlipped} flipDirection="horizontal">
                                {/* Front Side of the Card */}
                                <div key="front" onClick={() => handleFlip(pkg)} className="cursor-pointer">
                                    <img src={packageImages[pkg.imageUrl]} alt={pkg.name} className="w-full h-40" />
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-green-300 mb-2">{pkg.name}</h3>
                                        <span className="text-orange-500 font-bold text-lg">
                                            {pkg.location}
                                        </span>
                                    </div>
                                </div>

                                {/* Back Side of the Card */}
                                <div key="back" onClick={() => handleFlip(pkg)} className="cursor-pointer">
                                    <div className="p-6 bg-cover backdrop:blur-5 bg-center w-auto h-80" style={{ backgroundImage: `url(${packageImages[pkg.imageUrl]})` , backgroundSize: 'cover'}}>
                                        <h3 className="text-xl font-bold text-red-400 mb-2">{pkg.name}</h3>
                                        <p className="text-purple-300 font-semibold text-sm mb-4">{pkg.description}</p>
                                        <span className="text-orange-500 font-bold text-lg">
                                            ${pkg.price} per Head <button className='text-gray-800 font-serif font-bold'>Book now</button>
                                        </span>
                                    </div>
                                </div>
                            </ReactCardFlip>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                    {Array(Math.ceil(packages.length / packagesPerPage))
                        .fill()
                        .map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`px-3 py-2 mx-1 rounded-md ${currentPage === index + 1
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-500'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                </div>
            </div>
        </section>
    );
};

export default TravelPackages;