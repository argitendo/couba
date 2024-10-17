"use client"

import Previews from '../../../../public/assets/character/problems.png'
import { motion } from 'framer-motion'
import { ImageDecoration } from '../../../components/decoration'
import Image from 'next/image'

export default function SecondPages() {
  return (
    <section className='relative' id='problem-screen'>
      <div className='absolute inset-y-0 left-0 flex items-center -z-10 w-72 xl:w-full'> <ImageDecoration.BannerLeftBlurs /> </div>

      <section className='flex flex-col lg:flex-row m-20 mt-4 xl:mt-8 mx-8 xl:mx-[11.25rem] justify-between'>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{
            once: true
          }}
          className='hidden flex-col lg:flex my-auto 
               text-left text-4xl font-black font-serif-archivo 
               leading-snug gradient-text w-2/4'
        >
          <h1 className='text-4xl font-black font-serif-archivo leading-snug gradient-text'>Susah jualan online karena customer ga bisa nyobain dulu?</h1>

          <p className='text-xl my-8 font-medium leading-normal text-black text-left'>
            Ga perlu khawatir lagi! Dengan virtual try on Couba, customer bisa nyoba produk aksesorismu secara virtual.
            Jadi bakal ningkatin kepercayaan dan keinginan membeli!
          </p>
        </motion.div>

        <section className='mx-16 mb-8 xl:mb-0'></section>

        <motion.section
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{
            once: true
          }}
          className='flex xl:w-2/4 lg:mx-0 mb-8 justify-center'
        >
          <Image src={Previews} alt='preview' className='w-[32rem] xl:max-w-none p-0 xl:p-12' />
        </motion.section>

        <section className='flex flex-col lg:hidden my-auto text-left text-3xl xl:text-6xl font-black md:font-bold font-serif-archivo gradient-text'>
          <h2>Susah jualan online Karena customer ga bisa nyobain dulu?</h2>

          <p className='text-lg xl:text-xl my-8 font-semibold text-mainColor-tertiary'>
            Ga perlu khawatir lagi! Dengan virtual try on Couba, customer bisa nyoba produk aksesorismu secara virtual.
            Jadi bakal ningkatin kepercayaan dan keinginan membeli!
          </p>
        </section>
      </section>

      <div className='absolute inset-y-0 top-[30%] w-12 xl:w-24 -right-0 -z-10'> <ImageDecoration.BannerRightss /> </div>

    </section>
  )
}
