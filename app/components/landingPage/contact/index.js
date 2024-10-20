"use client"

import { ImageDecoration } from '@/app/components/decoration'
import { Button } from '@/app/components/buttons'
import Image from 'next/image'
import Backgrounds from '@/public/assets/backgrounds/backgrounds_3.png'

export default function ContactPages() {
  return (
    // <section className="py-20 xl:py-40 xl:px-[16.25rem] z-20 relative" id='ask-screen'>
    <section id='ask-screen' className='relative'>
      <Image src={Backgrounds} alt='backgrounds' className='bg-no-repeat bg-contain -z-10 w-full h-full absolute' />
      <div className='absolute hidden xl:flex xl:top-0 right-64 xl:right-0 z-10' > <ImageDecoration.BannerTopContact /> </div>
      <div className='absolute bottom-0 xl:left-0 '> <ImageDecoration.BannerBottomContact /> </div>
      <section className='mx-4 z-20 text-center relative py-20 xl:py-40 xl:px-[16.25rem]'>
        <h2 className='text-4xl font-bold  text-center font-serif-archivo text-white'>Mau ajak ngobrol kita dulu?</h2>
        <p className='text-lg text-white text-center font-sans-nutito mt-8 mb-[3.625rem]'>Boleh dongs, klik button di bawah ini biar bisa kita kontak yaaa</p>
        <div className='flex justify-center'>
          <Button.MainVariantsWhite onClicks={() => { document.getElementById('intro-screen').scrollIntoView() }} customButton='px-12 py-4 xl:px-8 xl:py-3'> Kontak Couba </Button.MainVariantsWhite>
        </div>
      </section>
    </section>
  )
}
