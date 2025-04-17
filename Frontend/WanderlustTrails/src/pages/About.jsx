//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/About.jsx
import React, { useEffect } from 'react'
import { useLoaderData } from 'react-router-dom'

function About() {

  //const data = useLoaderData()

    const [data, setData] = React.useState([])
    useEffect(() => {
        fetch('https://api.github.com/users/vamshikittu22')
        .then((response) => response.json())
        .then(data => {
            console.log(data)
            setData(data)
        })
    }, [])

  return (
    <div className='text-center m-4 bg-gray-600
     text-white p-4 text-3xl'>Github followers: {data.followers}
     <img src={data.avatar_url} width={300} alt="" />
     <p>Hi There, Thankyou for visiting this site. </p>
     
     </div>
  )
}

export default About

// export const githubInfoLoader = async () => {
//   const response = await fetch('https://api.github.com/users/vamshikittu22')
//   return response.json()
// }