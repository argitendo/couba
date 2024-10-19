"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/app/components/buttons'
import Image from 'next/image'
import ModalForm from '../../modals'
import Preview from '../../../../public/assets/showcase/previews.png'
import Couba from '../../../../public/assets/logo/couba_logo.png'
import Bag from '../../../../public/assets/parts/Bag.png'
import Thunder from '../../../../public/assets/parts/Light.png'
import Mobile from '../../../../public/assets/parts/Phone.png'
import Clouds from '../../../../public/assets/parts/Clouds.png'
import { ImageDecoration } from '@/app/components/decoration'
import { useState } from 'react'

export default function HeroSection() {
  const [isOpen, setOpen] = useState(false);
  const [isOpenModal, setIsOpen] = useState(false);

  const toggleMenu = () => setOpen((prev) => !prev);
  const toggleModal = () => setIsOpen((prev) => !prev);

  return (
    <section className='relative' id='intro-screen'>
      <AnimatePresence>
        {isOpenModal && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed flex top-0 left-0 w-screen h-full bg-mainColor-tertiary bg-opacity-80 z-50 items-center justify-center'
          >
            <ModalForm toggleExit={toggleModal} />
          </motion.section>
        )}
      </AnimatePresence>

      <section className='absolute -top-[60%] -left-60 -z-10 hidden xl:flex '>
        <ImageDecoration.BannerTopBlurs blurRadius='blur-3xl' />
      </section>
      <motion.section
        className='flex flex-col xl:flex-row mt-20 xl:mt-12 mx-8 xl:mx-[11.25rem] justify-between'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <section className='my-auto text-left text-4xl xl:w-2/4'>
          <h1 className="font-black font-serif-archivo text-mainColor-tertiary">
            Ga ribet! Buat Customer <br /> bisa
            <span className="relative inline-block align-middle">
              <Image src={Couba} alt="preview" className="w-32 inline-block relative top-1" />
            </span>
            produk<br />aksesorismu
            <span className="gradient-text"><em> virtually</em>
            </span>
            ~
          </h1>
          <p className='text-xl my-8 font-sans-nutito text-black'>
            Virtual try on paling simpellll. <br />
            Share link aja kak, customer langsung <br />  bisa nyoba!
          </p>
          <div className='flex'>
            <Button.Main to='' customButton='py-4 px-12 text-white' onClicks={toggleModal}>
              Coba Gratis
            </Button.Main>
          </div>
        </section>

        <section className='mx-16 mb-8 xl:mb-0'></section>

        <section className='relative xl:w-2/4 mx-auto lg:mx-0 mb-32'>
          <div className='relative'>
            <Image src={Bag} alt=' preview' className='absolute w-1/5 -top-[90%] -left-[10%]' />
          </div>
          <div className='relative'>
            <Image src={Thunder} alt=' preview' className='absolute w-1/6 -top-16 -right-[0%]' />
          </div>
          <Image src={Preview} alt='preview' className='xl:w-auto mx-auto' />
          <div className='relative'>
            <Image src={Mobile} alt=' preview' className='absolute w-1/5 -bottom-10 -left-0 -rotate-12' />
          </div>
          <div className='relative'>
            <Image src={Clouds} alt=' preview' className='absolute w-1/3 -top-52 right-12  -rotate-12' />
          </div>
        </section>
      </motion.section>
    </section>
  )
}
