import { Inputs } from '../inputs'
import Exit from '../../../public/assets/svg/exit.svg'
import SemiLogo from '../../../public/assets/logo/logo_half.png'
import Preview from '../../../public/assets/decoration/DecorFormSide.png'
import BannerDecor from '../../../public/assets/decoration/BannerHand.png'
import BannerMobile from '../../../public/assets/decoration/DecorMobiles.png'
import BannerDecors from '../../../public/assets/decoration/BannerHandFront.png'
import ImageHandsLeft from '../../../public/assets/decoration/HandsMobileLeft.png'
import ImageHandsRight from '../../../public/assets/decoration/HandsMobileRight.png'
import { Button } from '../buttons'
import Image from 'next/image'

function ModalForm({ toggleExit }) {
  return (
    <section className='w-full md:w-3/4 mx-auto px-4 sm:px-6 md:px-8 lg:px-12'>
      <section className='bg-mainColor-tertiary translate-x-2 translate-y-2 rounded-2xl'>
        <section className='flex flex-col md:flex-row relative bg-white -translate-x-2 -translate-y-2 rounded-2xl justify-evenly'>

          <div className='absolute rounded-full -right-5 -top-5'>
            <button className='w-10 h-10 md:w-12 md:h-12 
                bg-mainColor-primary 
                rounded-full flex justify-center items-center
                text-white font-bold'
              onClick={toggleExit} >
              <Image src={Exit} alt='exit' />
            </button>
          </div>

          {/* Form Section */}
          <form className='
              flex flex-col
              bg-mainColor-primary
              px-4 sm:px-8 md:px-16 lg:px-24 xl:pl-24 xl:pr-12 pt-4 pb-4
              justify-center rounded-tl-2xl rounded-tr-2xl
              md:rounded-tr-none
              md:rounded-tl-2xl md:rounded-bl-2xl 
              text-left w-full md:w-3/5'>
            <h1 className='text-xl sm:text-2xl md:text-3xl xl:text-4xl text-white font-bold text-center md:text-left'>
              Isi data diri kamu dulu yuk
            </h1>

            <Inputs.MainForm> Full Name </Inputs.MainForm>
            <Inputs.MainForm> Phone Number </Inputs.MainForm>
            <Inputs.MainForm> Email </Inputs.MainForm>
            <Inputs.MainForm> Brand </Inputs.MainForm>
            <div className='mb-8' />
            <div className='flex justify-center md:justify-start'>
              <Button.MainVariantsWhite to='/demo' customButton='py-3 px-8 sm:px-10 md:px-12'>Submit</Button.MainVariantsWhite>
            </div>
          </form>

          {/* Mobile Image Section */}
          <section className='flex md:hidden relative'>
            <Image src={ImageHandsLeft} alt='banner' className='absolute left-[40%] -bottom-4 -z-10' />
            <Image src={ImageHandsRight} alt='banner' className='absolute left-[25%] -bottom-[30%]' />
            <Image src={BannerMobile} alt='banner' className='w-full' />
            <Image src={SemiLogo} alt='Couba' className='absolute top-[90%] right-5 w-2/6 rotate-12' />
          </section>

          {/* Desktop Image Section */}
          <section className='hidden md:flex relative w-2/5 lg:w-1/5'>
            <Image src={BannerDecor} alt='banner' className='absolute bottom-[30%] -left-[10%] scale-75' />
            <Image src={Preview} alt='preview' className='h-full rounded-tr-2xl rounded-br-xl z-10' />
            <Image src={BannerDecors} alt='banner' className='absolute bottom-[10%] -left-[5%] z-20' />
          </section>

          {/* Desktop Logo Section */}
          <section className='hidden md:flex flex-col relative w-2/5 lg:w-1/5 max-h-20 aspect-square my-auto'>
            <div className='flex h-60' />
            <Image src={SemiLogo} alt='Couba' className='w-5/6' />
          </section>

        </section>
      </section>
    </section>
  )
}


export default ModalForm