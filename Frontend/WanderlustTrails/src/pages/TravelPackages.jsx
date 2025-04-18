// path: Frontend/WanderlustTrails/src/pages/TravelPackages.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import { Dropdown, DropdownButton } from "react-bootstrap";
import ReactCardFlip from "react-card-flip";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/UserContext";

const TravelPackages = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useUser();
    const [packages, setPackages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [packagesPerPage] = useState(9);
    const [sortBy, setSortBy] = useState("none");
    const sortOptions = [
        { value: "none", label: "No Sorting" },
        { value: "price_asc", label: "Price (Low to High)" },
        { value: "price_desc", label: "Price (High to Low)" },
        { value: "name_asc", label: "Name (A-Z)" },
        { value: "name_desc", label: "Name (Z-A)" },
    ];

    useEffect(() => {
        console.log('[TravelPackages] Component mounted:', { isAuthenticated, userId: user?.id });
        const fetchPackages = () => {
            const url = `http://localhost/WanderlustTrails/backend/config/travelPackages.php?sort=${sortBy}`;
            console.log('[TravelPackages] Fetching packages:', url);
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                timeout: 5000,
                crossDomain: true,
                success: function (response) {
                    console.log('[TravelPackages] Packages response:', response);
                    if (Array.isArray(response)) {
                        setPackages(
                            response.map(item => ({
                                id: item.id,
                                name: item.name,
                                description: item.description,
                                location: item.location,
                                price: item.price,
                                imageUrl: item.image_url,
                            }))
                        );
                        if (!response.length) {
                            toast.info("No packages found.");
                        }
                    } else {
                        toast.error("Failed to fetch packages: Invalid response format");
                    }
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.error('[TravelPackages] Error fetching packages:', { xhr, textStatus, errorThrown });
                    let errorMessage = "Error fetching packages: Server error";
                    if (xhr.status === 0) {
                        errorMessage = "Error fetching packages: Server unreachable or CORS issue";
                    } else {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            errorMessage = "Error fetching packages: " + (response.message || "Server error");
                        } catch (e) {
                            errorMessage = xhr.statusText || `Server error (status: ${xhr.status})`;
                        }
                    }
                    toast.error(errorMessage);
                },
            });
        };
        fetchPackages();
    }, [sortBy]);

    const handleSortChange = selectedSortBy => setSortBy(selectedSortBy);

    const handleBooking = pkg => {
        console.log('[TravelPackages] handleBooking:', { pkg, isAuthenticated, userId: user?.id });
        sessionStorage.setItem("selectedPackage", JSON.stringify(pkg));
        navigate("/PackageBookingDetails");
    };

    const loadImage = imageName => {
        const baseUrl = "http://localhost/WanderlustTrails/Assets/Images/packages/";
        return `${baseUrl}${imageName}`;
    };

    const defaultImage = "http://localhost/WanderlustTrails/Assets/Images/packages/default.jpg";

    const indexOfLastPackage = currentPage * packagesPerPage;
    const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
    const currentPackages = packages.slice(indexOfFirstPackage, indexOfLastPackage);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <section className="bg-transparent py-12">
            <div className="max-w-5xl mx-auto px-4">
                <ToastContainer />
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-200 mb-6 text-center">
                        Explore Our Travel Packages
                    </h2>
                    <DropdownButton
                        id="dropdown-basic-button"
                        title={<span className="text-dark font-bold hover:text-white">Sort by</span>}
                        className="text-gray-200 font-semibold text-sm focus:ring-4 bg-orange-600 rounded-lg text-sm mr-1"
                        variant="outline"
                        menuVariant="dark"
                    >
                        {sortOptions.map(option => (
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
                    {currentPackages.map(pkg => (
                        <DynamicPackageCard
                            key={pkg.id}
                            pkg={pkg}
                            loadImage={loadImage}
                            defaultImage={defaultImage}
                            handleBooking={handleBooking}
                        />
                    ))}
                </div>

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

const DynamicPackageCard = ({ pkg, loadImage, defaultImage, handleBooking }) => {
    const [imageSrc, setImageSrc] = useState(defaultImage);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const imagePath = loadImage(pkg.imageUrl) || defaultImage;
        setImageSrc(imagePath);
    }, [pkg.imageUrl, loadImage, defaultImage]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="bg-orange-100 rounded-lg shadow-md overflow-hidden">
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                <div key="front" onClick={handleFlip} className="cursor-pointer">
                    <img src={imageSrc} alt={pkg.name} className="w-full h-40 object-cover" />
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-lime-950 mb-2">{pkg.name}</h3>
                        <span className="text-orange-500 font-bold text-lg">
                            {pkg.location} ${pkg.price}
                        </span>
                    </div>
                </div>

                <div key="back" onClick={handleFlip} className="cursor-pointer">
                    <div
                        className="p-6 bg-cover bg-center w-auto h-80"
                        style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: "cover" }}
                    >
                        <h3 className="text-xl font-bold text-fuchsia-900 shadow-inner mb-2">{pkg.name}</h3>
                        <p className="text-red-600 font-semibold shadow-inner text-sm mb-4">{pkg.description}</p>
                        <span className="text-cyan-500 font-extrabold shadow-inner backdrop-blur text-lg">
                            ${pkg.price} per Head
                        </span>
                        <button
                            className="text-gray-300 bg-gray-500 font-serif font-bold mt-4 px-4 py-2 rounded"
                            onClick={e => {
                                e.stopPropagation();
                                handleBooking(pkg);
                            }}
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
                className={`px-3 py-2 mx-1 rounded-md ${
                    currentPage === index + 1 ? "bg-orange-500 text-white" : "bg-gray-500"
                }`}
            >
                {index + 1}
            </button>
        ))}
    </div>
);

export default TravelPackages;