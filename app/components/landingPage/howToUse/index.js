"use client"

import { motion } from 'framer-motion'
import { HowToCards } from '@/app/components/cards'
import { useInView } from 'react-intersection-observer'
import Arrows from '@/public/assets/instruction/arrows.png'
import Backgrounds from '@/public/assets/backgrounds/backgrounds.png'
import data from '@/app/components/data/InstructionData'
import Image from 'next/image'

const fadeIn = {
  initial: {
    opacity: 0,
    x: -50
  },
  animate: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.4,
      duration: 0.8,
      ease: 'easeOut'
    }
  })
}


export default function ThirdPages() {
  return (
    <section id='how-to-screen' className='relative'>
      <Image 
        src={Backgrounds} 
        alt='backgrounds' 
        className='w-full h-full xl:min-h-screen bg-cover bg-center -z-10 absolute object-cover' 
        layout='fill' // This ensures the image spans its container
      />
      <section className='flex flex-col text-white py-36'>
        <section className="flex flex-col xl:flex-col mx-auto px-4 pb-8 xl:pb-20 text-center text-4xl font-black font-serif-archivo">
          <h2 className='mb-4 mx-auto text-white'>Pake Couba aja! Ga ribet kok, cuma 3 step:</h2>
        </section>
        <section className="flex flex-col lg:flex-row mx-auto xl:max-w-screen-xl">
          {
            data.map((item, index) => (
              <AnimateCards key={index} item={item} index={index} />
            ))
          }
        </section>
      </section>
    </section>
  )
}

function AnimateCards({ item, index }) {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial='initial'
      animate={inView ? 'animate' : 'initial'}
      variants={fadeIn}
      className='flex flex-col lg:flex-row mx-auto justify-center'
    >
      <HowToCards image={item.icon}>
        {item.description}
      </HowToCards>
      {
        index < data.length - 1 && (
          <section className='flex justify-center'>
            <Image src={Arrows} alt='arrows' className='w-16 h-16 lg:my-auto my-4 m-4 rotate-90 lg:rotate-0' />
          </section>
        )
      }
    </motion.div>
  )
}
