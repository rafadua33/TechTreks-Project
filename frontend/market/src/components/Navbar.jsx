import React, {useState} from 'react'
import {AiOutlineClose, AiOutlineMenu} from 'react-icons/ai'

const Navbar = () => {
    const[nav, setNav] = useState(false)

    const handleNav = () => {
        setNav(!nav)
    }
    
    return (
        <div className= 'flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white'>
            <h1 className='w-full text-3xl font-bold text-[#E0B0FF]'>MARKETPLACE</h1>
            <ul className='hidden md:flex'>
                <li className='p-4'>Home</li>
                <li className='p-4'>Login</li>
                <li className='p-4'>Buy</li>
                <li className='p-4'>Sell</li>
            </ul>     
            <div onClick={handleNav} className='block md:hidden'>
                {!nav ? <AiOutlineClose size={20}/> : <AiOutlineMenu size={20} />}

            </div>   
            <div className={!nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500' : 'fixed left-[-100%] ease-in-out duration-500'}>
                <h1 className='w-full text-3xl font-bold text-[#E0B0FF] m-4'>MARKETPLACE</h1>
                

                <ul className='uppercase p-4'>
                <li className='p-4 border-b border-gray-600'>Home</li>
                <li className='p-4 border-b border-gray-600'>About</li>
                <li className='p-4 border-b border-gray-600'>Buy</li>
                <li className='p-4'>Sell</li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar