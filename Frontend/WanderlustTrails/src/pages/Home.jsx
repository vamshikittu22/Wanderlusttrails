import React from 'react'
import Banner from '../components/home/Banner.jsx'
import DestinationSearchBar from '../components/home/destinationSearch.jsx'
import ContactCard from '../components/home/ContactCard.jsx'

function Home() {
  return (
    <>
    <DestinationSearchBar />
    <Banner />
    <ContactCard />
    <h2>cards showing features</h2>
    </>
  )
}

export default Home