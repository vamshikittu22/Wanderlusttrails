import React from 'react'
import Banner from '../components/Banner'
import DestinationSearchBar from '../components/destinationSearch'
import ContactCard from '../components/ContactCard'
import GoToTopButton from '../components/GoToTopButton'

function Home() {
  return (
    <>
    <Banner />
    <DestinationSearchBar />
    <ContactCard />
    <h2>cards showing features</h2>
    <GoToTopButton/>
    </>
  )
}

export default Home