"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/app/components/buttons';
import FormModal from '../modals';
import Hamburger from 'hamburger-react';
import Image from 'next/image';

const info = {
  name: 'Couba',
};

const navBaritems = {
  0: { title: 'Cara Pake Couba' },
  1: { title: 'Fitur' },
  2: { title: 'Tipe Aksesoris' },
  3: { title: 'Tanya-tanya' },
  4: { title: 'Book Demo' },
  5: { title: 'Sign In' },
};

export default function MainNavbar({
  isSecondary,
  logoLight,
  logoDark,
}) {
  const [isOpen, setOpen] = useState(false);
  const [isOpenModal, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setOpen((prev) => !prev);
  const toggleModal = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (isOpen && !e.target.closest('.mobile-nav') && !e.target.closest('.hamburger-react')) {
        closeMenu();
      }
    };
    if (isOpen) {
      document.addEventListener('click', closeOnOutsideClick);
    }
    return () => {
      document.removeEventListener('click', closeOnOutsideClick);
    };
  }, [isOpen]);

  return (
    <header
      className={`flex flex-row sticky xl:top-0 custom-sticky z-30 py-4 px-8 xl:py-8 xl:px-[11.25rem] transition-all duration-300 ${isSecondary ? 'bg-mainColor-primary shadow-md' : isScrolled ? 'bg-white shadow-md' : 'bg-transparent'} justify-between font-bold`}>
      <Link href='/' className='my-auto z-20'>
        <Image
          src={isSecondary ? isOpen ? logoDark : logoLight : logoDark}
          alt={info.name}
          title={info.name}
          className='w-[8rem] aspect-auto z-20'
        />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: 1000 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 1000 }}
            transition={{ duration: 0.4 }}
            className='absolute top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center'
          >
            <div className='flex flex-col justify-center mobile-nav items-center text-3xl md:text-4xl font-serif-archivo font-black'>
              <Link href='/' onClick={() => { closeMenu(); document.getElementById('how-to-screen').scrollIntoView(); }} title={navBaritems[0].title} className='mb-4 md:mb-10 text-black'>{navBaritems[0].title}</Link>
              <Link href='/' onClick={() => { closeMenu(); document.getElementById('feature-screen').scrollIntoView(); }} title={navBaritems[1].title} className='mb-4 md:mb-10 text-black'>{navBaritems[1].title}</Link>
              <Link href='/' onClick={() => { closeMenu(); document.getElementById('accessories-screen').scrollIntoView(); }} title={navBaritems[2].title} className='mb-4 md:mb-10 text-black'>{navBaritems[2].title}</Link>
              <Link href='/' onClick={() => { closeMenu(); document.getElementById('faq-screen').scrollIntoView(); }} title={navBaritems[3].title} className='mb-4 text-black'>{navBaritems[3].title}</Link>
              <div className='relative'>
                <div className='mt-4 bottom-0'>
                  <Button.Secondary onClicks={toggleModal} customButton='py-4 px-20 w-full'>{navBaritems[4].title}</Button.Secondary>
                </div>
                <div className='mt-4'>
                  <Button.SecondaryVariants to='/login' customButton='py-4 px-20 w-full'>{navBaritems[5].title}</Button.SecondaryVariants>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpenModal && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed flex top-0 left-0 w-screen h-full bg-mainColor-tertiary bg-opacity-80 z-50 items-center justify-center'
          >
            <FormModal toggleExit={toggleModal} />
          </motion.section>
        )}
      </AnimatePresence>

      <nav className='lg:flex flex-row items-center hidden font-serif-nutito text-left text-base font-sans-nutito'>
        <Link href='/' onClick={() => { document.getElementById('how-to-screen').scrollIntoView(); }} title={navBaritems[0].title} className={`mr-8 ${isSecondary ? 'text-white' : 'text-mainColor-tertiary'}`}>{navBaritems[0].title}</Link>
        <Link href='/' onClick={() => { document.getElementById('feature-screen').scrollIntoView(); }} title={navBaritems[1].title} className={`mr-8 ${isSecondary ? 'text-white' : 'text-mainColor-tertiary'}`}>{navBaritems[1].title}</Link>
        <Link href='/' onClick={() => { document.getElementById('accessories-screen').scrollIntoView(); }} title={navBaritems[2].title} className={`mr-8 ${isSecondary ? 'text-white' : 'text-mainColor-tertiary'}`}>{navBaritems[2].title}</Link>
        <Link href='/' onClick={() => { document.getElementById('faq-screen').scrollIntoView(); }} title={navBaritems[3].title} className={`mr-[2rem] ${isSecondary ? 'text-white' : 'text-mainColor-tertiary'}`}>{navBaritems[3].title}</Link>
        <div className='mr-2' title={navBaritems[4].title}>
          <Button.Secondary onClicks={toggleModal} customButton='py-4 px-8'>{navBaritems[4].title}</Button.Secondary>
        </div>
        <div title={navBaritems[5].title}>
          <Button.SecondaryVariants to='/login' customButton='py-4 px-12'>{navBaritems[5].title}</Button.SecondaryVariants>
        </div>
      </nav>

      <nav className='flex lg:hidden items-center ml-[1.875rem] md:mx-0 z-20'>
        <Hamburger toggled={isOpen} toggle={toggleMenu} size={28} color={isSecondary ? isOpen ? 'black' : 'white' : 'black'} />
      </nav>
    </header>
  );
}