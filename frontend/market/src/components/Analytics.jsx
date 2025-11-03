import React from 'react'
import { useNavigate } from "react-router-dom";


const Analytics = () => {{
    const navigate = useNavigate();
    return (
        <div className='w-full bg-white py-16 px-4'>
            <div className='max-w-[1240px] mx-auto grid md:grid-cols-2'>
                <div>
                    <h1 className='md:text-7xl sm:text-6xl text-4xl font-bold md:py-6 p-2'>Welcome to the marketplace!</h1>
                    <span className='md:text=5xl sm:text-4xl text-xl font-bold pl-2 text-[#000300] hover:underline' onClick={() => navigate("/login")}> Log in</span>
                    <span className='md:text=5xl sm:text-4xl text-xl font-bold'> to get started.</span>
                </div>
            </div>

        </div>
    )
}}
export default Analytics