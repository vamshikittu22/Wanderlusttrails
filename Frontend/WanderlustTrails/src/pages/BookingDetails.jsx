import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import UserDetails from '../components/UserDetails';
import { toast } from 'react-toastify';
import BookingDetailsStickyForm from '../components/forms/BookingDetailsStickyForm';


function BookingDetails() {
  const { user } = useUser(); // Extract user details from context  
  const [packageName, setPackageName] = useState('');
  const [packageLocation, setPackageLocation] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [imageSrc, setImageSrc] = useState(''); // State for image source

  // Load stored booking details from sessionStorage
  useEffect(() => {
    // Retrieve the selected package from the session
    const storedPackage = JSON.parse(sessionStorage.getItem('selectedPackage'));

    if (storedPackage) {
      setPackageName(storedPackage.name);
      setPackageLocation(storedPackage.location);
      setPackagePrice(parseFloat(storedPackage.price));
      import(`../assets/Images/packages/${storedPackage.imageUrl}.jpg`)
        .then(image => setImageSrc(image.default))
        .catch(err => console.error('Error loading image:', err));
    }
    
  }, []);

 
  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-300 mb-6">Booking Details</h1>
      <div className="min-h-screen p-6 flex flex-col items-center">
        <div className="flex flex-wrap justify-between bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
          <div className="border-b pb-4 mb-4 w-full md:w-1/3">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your Selected Package</h2>
            <p className="text-gray-700"><strong>Title:</strong> {packageName}</p>
            <p className="text-gray-700"><strong>Location:</strong> {packageLocation}</p>
            <p className="text-gray-700"><strong>Price:</strong> ${packagePrice} Per Head</p>
          </div>
          <div className="border-b pb-4 mb-4 p-6 w-full h-64 md:w-2/3" style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover' }}></div>

            <BookingDetailsStickyForm />
        </div>

        {/* User Details */}
        <UserDetails user={user} />
      </div>
    </>
  );
}

export default BookingDetails;