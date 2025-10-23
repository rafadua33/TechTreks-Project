import React from 'react'
import {ReactTyped} from 'react-typed';

const Hero = () => {
    return (
        <div className='text-white'>
            <div className='max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center'>
                <p className='text-[#E0B0FF] font-bold md:text=5xl sm:text-4xl text-xl'>WELCOME TO</p>
                <h1 className='md:text-7xl sm:text-6xl text-4xl font-bold md:py-6 p-2'>NYU Marketplace.</h1>
                <div className='flex justify-center items-center'>
                    <p className='md:text=5xl sm:text-4xl text-xl font-bold'>Your place to </p>
                    <ReactTyped strings={['buy', 'sell', 'connect']} typeSpeed={100} backSpeed={120} loop className='md:text=5xl sm:text-4xl text-xl font-bold text-[#E0B0FF] pl-2'/>
                </div>
                {/* <p className='md:text-2xl text-xl font-bold text-gray-600'></p> */}
                <button className='bg-[#E0B0FF] w-[200px] rounded-md font-medium my-6 mx-auto py-3 text-black'>Get Started</button>
            </div>
        </div>

    )
}

export default Hero