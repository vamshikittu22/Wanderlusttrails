//path: Frontend/WanderlustTrails/src/pages/TravelPackages.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/UserContext";
import useAjaxFetch from "../hooks/useAjaxFetch";
import FilterSortBar from "../components/FilterSortBar";
import Pagination from "../components/Pagination";
import ReactCardFlip from "react-card-flip";

// Components
const TravelPackages = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUser();
  const [packages, setPackages] = useState([]);
  const [sortedPackages, setSortedPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Add searchQuery state
  const [currentPage, setCurrentPage] = useState(1);
  const [packagesPerPage] = useState(9);

  const { data, loading, error } = useAjaxFetch(
    `http://localhost/WanderlustTrails/backend/config/AdminDashboard/manageDestinations/viewPackage.php`
  );

  // Check if the user is authenticated and has a valid user ID
  useEffect(() => {
    console.log("[TravelPackages] Component mounted:", { isAuthenticated, userId: user?.id });
    if (data) {
      if (Array.isArray(data)) {
        const formattedPackages = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          location: item.location,
          price: parseFloat(item.price),
          imageUrl: item.image_url,
        }));
        setPackages(formattedPackages);
        console.log("[TravelPackages] Packages fetched:", formattedPackages);
        setSortedPackages(formattedPackages);
        if (!formattedPackages.length) {
          toast.info("No packages found.");
        }
      } else {
        toast.error("Failed to fetch packages: Invalid response format");
      }
    }
  }, [data]);

  // Function to extract searchable text from a package
  const getSearchableText = (pkg) => {
    const fields = [
      pkg.id?.toString() || "",
      pkg.name || "",
      pkg.description || "",
      pkg.location || "",
      pkg.price?.toString() || "",
    ];

    return fields
      .filter(field => field !== null && field !== undefined)
      .map(field => field.toString().toLowerCase())
      .join(" ");
  };

  // Memoize the searched packages to prevent recalculation on every render
  const searchedPackages = useMemo(() => {
    return packages.filter(pkg => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const searchableText = getSearchableText(pkg);
      return searchableText.includes(searchLower);
    });
  }, [packages, searchQuery]);

  // Update sortedPackages whenever searchedPackages changes
  useEffect(() => {
    setSortedPackages(searchedPackages);
    setCurrentPage(1); // Reset to first page when search query changes
  }, [searchedPackages]);

  // Function to handle booking a package
  const handleBooking = pkg => {
    console.log("[TravelPackages] handleBooking:", { pkg, isAuthenticated, userId: user?.id });
    sessionStorage.setItem("selectedPackage", JSON.stringify(pkg));
    navigate("/PackageBookingDetails");
  };

  // Function to load image URL
  const loadImage = imageName => {
    const baseUrl = "http://localhost/WanderlustTrails/Assets/Images/packages/";
    return `${baseUrl}${imageName}`;
  };

  const defaultImage = "http://localhost/WanderlustTrails/Assets/Images/packages/default.jpg";

  // Function to handle sorting
  const sortOptions = [
    { key: "none", label: "No Sorting", sortFunction: () => 0 },
    { key: "price_asc", label: "Price (Low to High)", sortFunction: (a, b) => a.price - b.price },
    { key: "price_desc", label: "Price (High to Low)", sortFunction: (a, b) => b.price - a.price },
    { key: "name_asc", label: "Name (A-Z)", sortFunction: (a, b) => a.name.localeCompare(b.name) },
    { key: "name_desc", label: "Name (Z-A)", sortFunction: (a, b) => b.name.localeCompare(a.name) },
  ];

  // Sort the packages based on the selected sort option
  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = sortedPackages.slice(indexOfFirstPackage, indexOfLastPackage);

  // Function to handle sort option change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to clear the search input
  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="text-center p-4 text-gray-200">Loading packages...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-2 text-blue-500 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="bg-transparent py-12">
      <div className="max-w-5xl mx-auto px-4">
        <ToastContainer />
        <h2 className="text-3xl font-bold text-gray-200 mb-6 text-center">
          Explore Our Travel Packages
        </h2>

        {/* Dynamic Search Input */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex w-full max-w-lg">
            <input
              type="text"
              placeholder="Search by ID, name, location, description, price..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 p-3 rounded-l-lg bg-orange-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="p-3 bg-gray-500 text-white rounded-r-lg hover:bg-gray-600 transition-all duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <FilterSortBar
          items={sortedPackages}
          setFilteredItems={setSortedPackages}
          filterOptions={[]}
          sortOptions={sortOptions}
        />

        {sortedPackages.length === 0 ? (
          <p className="text-center text-gray-200">No packages found.</p>
        ) : (
          <>
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
              totalItems={sortedPackages.length}
              itemsPerPage={packagesPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </section>
  );
};

// Dynamic Package Card Component
const DynamicPackageCard = ({ pkg, loadImage, defaultImage, handleBooking }) => {
  const [imageSrc, setImageSrc] = useState(defaultImage);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load the image when the component mounts or when the image URL changes
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

export default TravelPackages;