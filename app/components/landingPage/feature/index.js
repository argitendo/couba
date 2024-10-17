"use client"

import Img1 from '@/public/assets/character/pays.png'
import Img2 from '@/public/assets/character/uploads.png'
import Img3 from '@/public/assets/character/links.png'
import Img4 from '@/public/assets/character/products.png'
import Blurs from '@/public/assets/decoration/Blurs.png'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ImageDecoration } from '@/app/components/decoration'
import "@/app/components/landingPage/styles/app.css"

export default function FourthPages() {
  return (
    <section className='relative' id='feature-screen'>
      <div className='hidden lg:flex absolute left-0 top-[35%] transform -translate-y-1/2 -z-10 '> <ImageDecoration.BannerLeftLines /> </div>
      <div className='hidden lg:flex absolute right-0 bottom-0 transform -translate-y-1/2 -z-10'> <ImageDecoration.BannerRightLines /> </div>
      <Image src={Blurs} alt='blurs' className='absolute right-0 -top-40 -z-20 hidden lg:flex' />

      <section className='content-center mx-auto relative text-black'>
        {/* ============================= First =============================  */}
        <section className='flex flex-col lg:flex-row lg:mt-8 mx-8 lg:mx-[11.25rem] justify-between'>
          <motion.section
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false }}
            className='flex lg:mx-0 mb-8 justify-center w-full lg:w-1/2 mt-16 lg:mt-0'
          >
            <Image src={Img1} alt='one products' />
          </motion.section>

          <div className='mr-8' />

          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false }}
            className='flex flex-col w-full lg:w-1/2 lg:flex my-auto text-4xl lg:text-4xl font-black font-sans-nutito'
          >
            <h2 className='gradient-text'>Bayar Sekali,<br/> Pakai Setahun</h2>
            <p className='text-lg lg:text-xl font-medium mt-8 text-left'>
              Cuma Rp39rb per produk buat setahun penuh. No ribet, no biaya bulanan. Bikin customer happy
              dan jualan makin laris dengan investasi minim!
            </p>
          </motion.section>
        </section>

        {/* ============================= Second =============================  */}
        <section className='flex flex-col lg:flex-row lg:mt-8 mx-8 lg:mx-[11.25rem] justify-center'>
          {/* ============================= Desktop Views =============================  */}
          <motion.section
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false }}
            className='hidden flex-col w-full lg:w-1/2 lg:flex my-auto text-left text-4xl lg:text-4xl font-black font-sans-nutito'
          >
            <h2 className='gradient-text'>Cuma Tinggal <br/> Upload Foto Ajaaa </h2>
            <p className='text-2xl lg:text-xl font-medium mt-8'>
              Ga perlu pusing bikin 3D model. Cukup upload foto produk aksesoris kamu, langsung bisa dipakai buat
              virtual try-on. Easy peasy, super cepat, dan hasilnya keren banget!
            </p>
          </motion.section>

          <div className='mr-8' />

          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false }}
            className='flex lg:mx-0 mb-8 justify-center w-full lg:w-1/2'
          >
            <Image src={Img2} alt='preview' className='max-w-full mt-12' />
          </motion.section>

          {/* ============================= Mobile Views =============================  */}
          <section className='flex flex-col lg:hidden my-auto text-left text-3xl lg:text-6xl font-black md:font-bold font-serif-archivo'>
            <h2 className='gradient-text '>Cuma Tinggal Upload Foto Ajaaa</h2>
            <p className='text-lg lg:text-xl mt-8 font-medium'>
              Ga perlu pusing bikin 3D model. Cukup upload foto produk aksesoris kamu, langsung bisa dipakai buat
              virtual try-on. Easy peasy, super cepat, dan hasilnya keren banget!
            </p>
          </section>
        </section>

        {/* ============================= Third =============================  */}
        <section className='flex flex-col lg:flex-row lg:mt-8 mx-8 lg:mx-[11.25rem] justify-between'>
          <motion.section
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false }}
            className='flex lg:mx-0 mb-8 justify-center w-full lg:w-1/2'
          >
            <Image src={Img3} alt='preview' className='max-w-full mt-24' />
          </motion.section>

          <div className='mr-8' />

          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false }}
            className='flex flex-col w-full lg:w-1/2 lg:flex my-auto text-left text-3xl lg:text-4xl font-black font-sans-nutito'
          >
            <h2 className='gradient-text'>Tinggal Share Link Langsung Nyoba~</h2>
            <p className='text-lg lg:text-xl font-medium mt-8 text-left'>
              Mudah banget! Abis upload dan atur, tinggal share link
              ke customer kamu. Mereka bisa langsung nyobain
              produk aksesoris kamu secara virtual. Praktis dan cepet!
            </p>
          </motion.section>
        </section>

        {/* ============================= Fourth =============================  */}
        <section className='flex flex-col lg:flex-row lg:mt-8 m-20 mx-8 lg:mx-[11.25rem] justify-center'>
          {/* ============================= Desktop Views =============================  */}
          <motion.section
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false }}
            className='hidden flex-col w-full lg:w-1/2 lg:flex my-auto text-left text-4xl font-black font-sans-nutito'
          >
            <h2 className='gradient-text'>Bisa Nyambung ke Online <br /> Store Kamu Juga</h2>
            <p className='text-2xl lg:text-xl font-medium mt-8'>
              Integrasi gampang banget! Tinggal sambungin Couba ke
              Online Store Kamu Juga, dan customer bisa langsung nyobain
              produk aksesoris kamu secara virtual dari sana. Praktis dan bikin belanja makin seru!
            </p>
          </motion.section>

          <div className='mr-8' />

          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false }}
            className='flex lg:mx-0 mb-8 justify-center w-full lg:w-1/2'
          >
            <Image src={Img4} alt='preview' className='max-w-full' />
          </motion.section>

          {/* ============================= Mobile Views =============================  */}
          <section className='flex flex-col lg:hidden my-auto text-left text-3xl lg:text-4xl font-black md:font-bold font-serif-archivo '>
            <h1 className='gradient-text drop-shadow-md'>Sambungkan ke Online Store-mu dengan Mudah!</h1>
            <p className='text-lg lg:text-2xl font-medium mt-8 '>
              Integrasi gampang banget! Tinggal sambungin Couba ke online store kamu, dan customer bisa langsung nyobain
              produk aksesoris kamu secara virtual dari sana. Praktis dan bikin belanja makin seru!
            </p>
          </section>

        </section>
      </section>


    </section>
  )
}
