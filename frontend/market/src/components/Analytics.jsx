import React from 'react'
import { useNavigate } from "react-router-dom";


const Analytics = () => {{
    const navigate = useNavigate();
    return (
        <div className='w-full bg-[#e0b0ff] py-16 px-4'>
            <div className='max-w-[1240px] mx-auto'>
                <div>
                    <h1 className='text-[#000328] md:text-8xl sm:text-7xl text-5xl font-darker-grotesque font-bold md:py-6 p-2'>Welcome!</h1>

                    <p className='text-[#000328] w-full md:text-5xl text-4xl font-darker-grotesque font-bold p-2'>Please follow our guidelines to make our marketplace a safe and enjoyable place for everyone.</p> 
                    <ul className='list-disc text-[#000328] md:text-2xl sm:text-xl text-lg font-darker-grotesque font-medium p-2 pl-8'>
                        <li className='py-2 pl-4'>Be respectful and courteous to other users.</li>
                        <li className='py-2 pl-4'>Provide accurate and honest information about your products.</li>
                        <li className='py-2 pl-4'>Avoid spamming or posting irrelevant content.</li>
                        <li className='py-2 pl-4'>Meet in public places, particularly NYU campus locations, when exchanging goods.</li>
                        <li className='py-2 pl-4'>Ensure your seller is reputable before making a purchase.</li>
                        <li className='py-2 pl-4'>Report any suspicious or inappropriate behavior to the admin team.</li>
                    </ul>



                    <h1 className='text-[#000328] md:text-6xl sm:text-5xl text-4xl font-darker-grotesque font-bold md:pt-6 p-2'>New To MRKT @ NYU?</h1>
                    <span className='md:text=5xl sm:text-4xl text-xl underline font-darker-grotesque font-bold pl-2 text-[#000328]/70 hover:text-[#000328]/60' onClick={() => navigate("/login")}>   Log in</span>
                    <span className='text-[#000328] md:text=5xl sm:text-4xl text-xl font-darker-grotesque font-bold'> to get started.</span>
                </div>
            </div>

        </div>
    )
}}
export default Analytics