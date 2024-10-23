"use client"

import data from '../../../components/data/CardsIconsData'
import { Card } from '../../../components/cards'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const fadeInUp = {
  initial: (index) => ({
    y: 30,
    opacity: 0
  }),
  animate: (index) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: index * 0.1
    }
  })
}

export default function ComingSoonPages() {
  return (
    <section className='py-11 xl:py-[5.5rem] px-0 xl:px-[18rem]'>
      <section className='flex flex-col justify-center text-center'>
        <h2 className='font-black text-5xl py-[4.35rem] gradient-text font-serif-archivo'>Coming Soon~</h2>
        <section className='grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 w-4/5 mx-auto z-20 text-black'>
          {
            data.map((item, index) => (
              <AnimatedCard key={index} item={item} index={index} />
            ))
          }
        </section>
      </section>
    </section>
  )
}

function AnimatedCard({ item, index }) {
  const { ref, inView } = useInView({
    triggerOnce: false, // Trigger the animation only once
    threshold: 0.1, // Percentage of the element visible to trigger the animation
  });

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial='initial'
      animate={inView ? 'animate' : 'initial'}
      variants={fadeInUp}
      className='m-0 xl:mx-2'
    >
      <Card.Secondary
        title={item.icon}
        image={item.url}
        paddingImages='p-4 xl:p-12'
      />
    </motion.div>
  );
}
