import { useState, useEffect } from 'react';

function BookingDetails() {
  const [packageName, setPackageName] = useState('');
  const [packageLocation, setPackageLocation] = useState('');
  const [packagePrice, setPackagePrice] = useState('');


  useEffect(() => {
    // Retrieve the selected package from the session
    const storedPackage = JSON.parse(sessionStorage.getItem('selectedPackage'));
    if (storedPackage) {
      setPackageName(storedPackage.name);
      setPackageLocation(storedPackage.location);
      setPackagePrice(storedPackage.price);

    }
  }, []); 

  return (
    <div>
      <h2>Here is your selected package: </h2>
        <p>Title: {packageName} <br/>
        Location: {packageLocation} <br/>
        Price: {packagePrice} </p>
      {/* ... your booking form ... */}
    </div>
  );
}

export default BookingDetails;