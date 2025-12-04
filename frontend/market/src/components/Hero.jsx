import React, { useEffect, useState } from 'react'
import { ReactTyped } from 'react-typed'
import { useNavigate } from "react-router-dom"

const Hero = () => {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50) // short delay for smoothness
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="text-white"
      style={{
        background:
          'linear-gradient(180deg, hsla(236, 100%, 8%, 1) 40%, hsla(253, 32%, 30%, 1) 64%, hsla(262, 25%, 45%, 1) 76%, hsla(268, 30%, 58%, 1) 85%, hsla(276, 100%, 85%, 1) 100%)'
      }}
    >
      <div
        className={
          `max-w-[800px] mt-[-96px] w-full min-h-screen mx-auto text-center flex flex-col justify-center
           transform transition-all duration-700 ease-out
           ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`
        }
      >
        <p className="text-[#E0B0FF] font-darker-grotesque md:text-5xl sm:text-5xl text-xl mt-8">
          WELCOME TO
        </p>

        <img
          src="/images/hero.png"
          alt="Hero"
          className="w-full sm:w-3/4 md:w-1/2 lg:w-3/4 mx-auto h-auto -mt-6 -mb-8 object-contain"
        />

        <div className="flex justify-center items-center">
          <p className="md:text-5xl sm:text-5xl text-xl font-darker-grotesque">Your place to </p>
          <ReactTyped
            strings={['buy', 'sell', 'connect']}
            typeSpeed={100}
            backSpeed={120}
            loop
            className="md:text-5xl sm:text-5xl text-xl font-darker-grotesque text-[#E0B0FF] pl-2"
          />
        </div>

        <button
          className="bg-[#E0B0FF] w-[200px] rounded-md font-darker-grotesque font-medium sm:text-lg my-8 mx-auto py-2 text-black
                     hover:text-[#E0B0FF] hover:bg-transparent border-2 border-transparent hover:border-[#E0B0FF] px-8 transition duration-300"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

export default Hero