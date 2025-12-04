import React, { useRef, useEffect } from 'react'
import { useNavigate } from "react-router-dom"

const Analytics = () => {
  const navigate = useNavigate()
  const ref = useRef(null)
  const rafRef = useRef(null)
  const ticking = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      console.error('Analytics: ref.current is null')
      return
    }

    // prepare element
    el.style.willChange = 'transform, opacity'
    // start hidden
    el.style.transform = 'translateY(40px)'
    el.style.opacity = '0'

    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      // compute how many pixels of the element are visible
      const visibleTop = Math.max(rect.top, 0)
      const visibleBottom = Math.min(rect.bottom, vh)
      const visibleHeight = Math.max(visibleBottom - visibleTop, 0)

      const progress = rect.height > 0 ? Math.min(Math.max(visibleHeight / rect.height, 0), 1) : 0

      // Apply styles following progress (no CSS transition so it matches scroll)
      const translate = (1 - progress) * 40 // px
      const opacity = progress

      el.style.transform = `translateY(${translate}px)`
      el.style.opacity = `${opacity}`

      console.debug('Analytics:update', {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
        visibleHeight: Number(visibleHeight.toFixed(1)),
        vh,
        progress: Number(progress.toFixed(3)),
        translate: Number(translate.toFixed(2)),
        opacity: Number(opacity.toFixed(2))
      })

      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        rafRef.current = requestAnimationFrame(update)
      }
    }

    // initial update
    update()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className='w-full bg-[#e0b0ff] py-16 px-4'>
      <div className='max-w-[1240px] mx-auto'>
        <div ref={ref}>
          <h1 className='text-[#000328] md:text-8xl sm:text-7xl text-5xl font-darker-grotesque font-bold md:py-6 p-2'>
            Welcome!
          </h1>

          <p className='text-[#000328] w-full md:text-5xl text-4xl font-darker-grotesque font-bold p-2'>
            Please follow our guidelines to make our marketplace a safe and enjoyable place for everyone.
          </p>

          <ul className='list-disc text-[#000328] md:text-2xl sm:text-xl text-lg font-darker-grotesque font-medium p-2 pl-8'>
            <li className='py-2 pl-4'>Be respectful and courteous to other users.</li>
            <li className='py-2 pl-4'>Provide accurate and honest information about your products.</li>
            <li className='py-2 pl-4'>Avoid spamming or posting irrelevant content.</li>
            <li className='py-2 pl-4'>Meet in public places, particularly NYU campus locations, when exchanging goods.</li>
            <li className='py-2 pl-4'>Ensure your seller is reputable before making a purchase.</li>
            <li className='py-2 pl-4'>Report any suspicious or inappropriate behavior to the admin team.</li>
          </ul>

          <h1 className='text-[#000328] md:text-6xl sm:text-5xl text-4xl font-darker-grotesque font-bold md:pt-6 p-2'>
            New to MRKT @ NYU?
          </h1>

          <span
            className='md:text-5xl sm:text-4xl text-xl underline font-darker-grotesque font-bold pl-2 text-[#000328]/70 hover:text-[#000328]/60 cursor-pointer'
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
          <span className='text-[#000328] md:text-5xl sm:text-4xl text-xl font-darker-grotesque font-bold'>
            {" "}
            to get started.
          </span>
        </div>
      </div>
    </div>
  )
}

export default Analytics

// find the H1 "Welcome!" then the nearest container
const h = Array.from(document.querySelectorAll('h1')).find(el => el.textContent.trim().startsWith('Welcome'));
if (!h) { console.error('Welcome H1 not found'); } else {
  const root = h.closest('div'); 
  console.log('root element:', root);
  console.log('computed opacity:', getComputedStyle(root).opacity);
  console.log('computed transform:', getComputedStyle(root).transform);
  console.log('root inline style:', root.style.cssText);
}