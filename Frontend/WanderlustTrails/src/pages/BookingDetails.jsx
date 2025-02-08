import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


function BookingDetails() {
  const { user } = useUser(); // Extract user details from context
  const [packageName, setPackageName] = useState('');
  const [packageLocation, setPackageLocation] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [persons, setPersons] = useState(1); // State for number of persons
  const [imageSrc, setImageSrc] = useState(''); // State for image source
  const [dateRange, setDateRange] = useState([null, null]);
      const [startDate, endDate] = dateRange;
  

 

  useEffect(() => {
    // Retrieve the selected package from the session
    const storedPackage = JSON.parse(sessionStorage.getItem('selectedPackage'));
    if (storedPackage) {
      setPackageName(storedPackage.name);
      setPackageLocation(storedPackage.location);
      setPackagePrice(storedPackage.price);
      import(`../assets/Images/packages/${storedPackage.imageUrl}.jpg`)
        .then(image => setImageSrc(image.default))
        .catch(err => console.error('Error loading image:', err));
    }
  }, []); 

  

  return (
    <>
    <h1 className="text-3xl font-semibold text-gray-300 mb-6">Booking Details</h1> 
      <div className="min-h-screen  p-6 flex flex-col items-center">
            <div className="flex flex-wrap justify-between bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl ">

                <div className="border-b pb-4 mb-4 w-full md:w-1/3">
                <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your Selected Package</h2>

                    <p className="text-gray-700"><strong>Title:</strong> {packageName}</p>
                    <p className="text-gray-700"><strong>Location:</strong> {packageLocation}</p>
                    <p className="text-gray-700"><strong>Price:</strong> ${packagePrice} Per Head</p>
                </div>
                <div className="border-b pb-4 mb-4 p-6 w-full h-64 md:w-2/3" style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover' }}> </div>
               
               
                <div className='flex flex-row flex-grow flex-wrap justify-around align-baseline gap-4 mb-4'>
                  <div className="md:w-1/4">
                      <label className="block text-gray-700 font-medium">No of Persons:</label>
                      <input 
                          type="number"
                          name="persons"
                          id="persons"
                          value={persons}
                          min="1"
                          max="10"
                          onChange={(e) => setPersons(e.target.value)}
                          required
                          className="w-full p-2 border rounded-lg mt-1 text-slate-800"
                      />
                  </div>

                  <div className="md:w-1/4">
                    <label htmlFor="dateRange" className="block text-gray-800 font-medium mb-2">
                    Date Range:
                    </label>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        minDate={new Date()}
                        onChange={(update) => {
                        setDateRange(update);}}
                        isClearable={true}dateFormat="MMM d, yyyy"
                        className="shadow-sm border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>

                  <div className="md:w-1/4">
                      <p className="text-lg font-semibold text-gray-800">
                          Total Price: <span className="text-blue-600">${packagePrice * persons}</span>
                      </p>
                  </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Book Now
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Details</h2>
                <div className="text-gray-700 space-y-2">
                    <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone}</p>
                    <p><strong>Date of Birth:</strong> {user.dob}</p>
                    <p><strong>Gender:</strong> {user.gender}</p>
                    <p><strong>Nationality:</strong> {user.nationality}</p>
                    <p><strong>Address:</strong> {user.street}, {user.city}, {user.state}, {user.zip}</p>
                </div>
            </div>
        </div>
    </>
  );
}

export default BookingDetails;