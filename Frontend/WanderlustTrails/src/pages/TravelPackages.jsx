import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import ReactCardFlip from 'react-card-flip';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [packagesPerPage] = useState(9);
    const [sortBy, setSortBy] = useState('none');
    const sortOptions = [
        { value: 'none', label: 'No Sorting' },
        { value: 'price_asc', label: 'Price (Low to High)' },
        { value: 'price_desc', label: 'Price (High to Low)' },      
        { value: 'name_asc', label: 'Name (A-Z)' },
        { value: 'name_desc', label: 'Name (Z-A)' },
    ];

    useEffect(() => {
        const fetchPackages = async (sortBy) => {
            try {
                const url = `http://localhost/WanderlustTrails/Backend/config/travelPackages.php?sort=${sortBy}`;
                const response = await fetch(url);
                const data = await response.json();

                setPackages(data.map((item) => new TravelPackage(
                    item.id,
                    item.name,
                    item.description,
                    item.location,
                    item.price,
                    item.image_url,
                )));
            } catch (error) {
                console.error('Error fetching packages:', error);
            }
        };
        fetchPackages(sortBy);
    }, [sortBy]);

    const handleSortChange = (selectedSortBy) => setSortBy(selectedSortBy);

    const handleBooking = (pkg) => {
        sessionStorage.setItem('selectedPackage', JSON.stringify(pkg));
        console.log('Selected Package:', pkg);
        window.location.href = `/BookingDetails`;
    };

    // Pagination logic
    const indexOfLastPackage = currentPage * packagesPerPage;
    const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
    const currentPackages = packages.slice(indexOfFirstPackage, indexOfLastPackage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // const loadImage = async (imageName) => {
    //     try {
    //         const importedImage = await import(`../../../../Assets/Images/packages/${imageName}`);
    //         return importedImage.default;
    //     } catch (error) {
    //         console.error(`Error loading image ${imageName}:`, error);
    //         const defaultImage = await import(`../../../../assets/Images/packages/default.jpg`);
    //         return defaultImage.default;
    //     }
    // };

    

    const loadImage = (imageName) => {
        const baseUrl = 'http://localhost/WanderlustTrails/Assets/Images/packages/';
        return `${baseUrl}${imageName}`;
    };
    
    const defaultImage = 'http://localhost/WanderlustTrails/Assets/Images/packages/default.jpg';
    
    
    

    return (
        <section className="bg-transparent py-12">
            <div className="max-w-5xl mx-auto px-4">
                <div className='flex items-center justify-between mb-8'>
                    <h2 className="text-3xl font-bold text-gray-200 mb-6 text-center">
                        Explore Our Travel Packages
                    </h2>
                    <DropdownButton
                        id="dropdown-basic-button"
                        title={<span className="text-dark font-bold hover:text-white">Sort by</span>}
                        className="text-gray-200 font-semibold text-sm focus:ring-4 bg-orange-600 rounded-lg text-sm mr-1"
                        variant='outline'
                        menuVariant='dark'
                    >
                        {sortOptions.map((option) => (
                            <Dropdown.Item
                                key={option.value}
                                onClick={() => handleSortChange(option.value)}
                                className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                            >
                                {option.label}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentPackages.map((pkg) => (
                        <DynamicPackageCard
                            key={pkg.id}
                            pkg={pkg}
                            loadImage={loadImage}
                            // handleFlip={handleFlip}
                            handleBooking={handleBooking}
                        />
                    ))}
                </div>

                {/* Pagination */}
                <Pagination
                    totalPackages={packages.length}
                    packagesPerPage={packagesPerPage}
                    currentPage={currentPage}
                    paginate={paginate}
                />
            </div>
        </section>
    );
};

const DynamicPackageCard = ({ pkg, loadImage, handleBooking }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isFlipped, setIsFlipped] = useState(false); // Individual flip state
         

    // useEffect(() => {
    //     (async () => {
    //         const imagePath = await loadImage(pkg.imageUrl);
    //         setImageSrc(imagePath);
    //     })();
    // }, [pkg.imageUrl, loadImage]);


    useEffect(() => {
        const imagePath = loadImage(pkg.imageUrl) || defaultImage;
        setImageSrc(imagePath);
    }, [pkg.imageUrl]);
    
    const handleFlip = () => {
        setIsFlipped(!isFlipped); // Toggle only this card’s state
    };

    return (
        <div className="bg-orange-100 backdrop:blur-5 rounded-lg shadow-md overflow-hidden">
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                {/* Front Side */}
                <div key="front" onClick={handleFlip} className="cursor-pointer">
                    <img src={imageSrc} 

                    alt={pkg.name} className="w-full h-40" />
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-lime-950 mb-2">{pkg.name}</h3>
                        <span className="text-orange-500 font-bold text-lg">
                            {pkg.location} ${pkg.price}
                        </span>
                    </div>
                </div>

                {/* Back Side */}
                <div key="back" onClick={handleFlip} className="cursor-pointer">
                    <div className="p-6 bg-cover backdrop:blur-5 bg-center w-auto h-80" style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover' }}>
                        <h3 className="text-xl font-bold text-fuchsia-900 shadow-inner mb-2">{pkg.name}</h3>
                        <p className="text-red-600 font-semibold shadow-inner text-sm mb-4">{pkg.description}</p>
                        <span className="text-cyan-500 font-extrabold shadow-inner backdrop-blur text-lg">
                            ${pkg.price} per Head
                        </span>
                        <button
                            className='text-gray-300 bg-gray-500 font-serif font-bold'
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent flip when clicking button
                                handleBooking(pkg)}}
                        >
                            Book now
                        </button>
                    </div>
                </div>
            </ReactCardFlip>
        </div>
    );
};

const Pagination = ({ totalPackages, packagesPerPage, currentPage, paginate }) => (
    <div className="flex justify-center mt-8">
        {Array.from({ length: Math.ceil(totalPackages / packagesPerPage) }, (_, index) => (
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
);

export default TravelPackages;
