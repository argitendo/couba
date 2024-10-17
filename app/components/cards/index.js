import Image from 'next/image'
import React from 'react'

export function Cards({ children }) {
  return (
    <>{children}</>
  )
}

export function MainCard({
  title,
  children,
  image = 'https://via.placeholder.com/400',
  heightCards = 'my-2',
  paddingImages = 'p-0',
  horizotalPadding = 'px-0',
  topPadding = 'pt-0',
  marginCard = 'mx-0',
  isOverlay = false
}) {
  return (
    <>
      <section className={`bg-mainColor-tertiary rounded-3xl ${marginCard}`}>
        <section className={`flex flex-col justify-center bg-white ${horizotalPadding} ${topPadding} rounded-2xl border-4 xl:border-2 border-mainColor-tertiary `}>
          <section className={`flex flex-col xl:flex text-left font-serif-archivo text-2xl ${heightCards} mx-2`}> {title} </section>
          <section className='flex flex-col xl:flex my-auto text-justify font-bold font-serif-archivo '>
          <div className="relative">
            <Image
              src={image}
              alt={title}
              title={title}
              className={`aspect-square object-cover ${paddingImages} w-full md:w-72 rounded-br-2xl rounded-bl-2xl border-t-4 xl:border-t-2 border-mainColor-tertiary bg-mainColor-primary`}
            />
            {isOverlay && (
              <div className="absolute inset-0 bg-black opacity-0 rounded-br-2xl rounded-bl-2xl group-hover:opacity-40 transition-opacity duration-300" />
            )}
          </div>
          </section>
          <section>
            {children}
          </section>
        </section>
      </section>
    </>
  )
}

export function SecondaryCard({
  title,
  children,
  image = 'https://via.placeholder.com/400',
  heightCards = 'my-2',
  paddingImages = 'p-0',
  horizotalPadding = 'px-0',
  topPadding = 'pt-0',
  marginCard = 'mx-0',
}) {
  return (
    <>
      <section className={`bg-mainColor-tertiary rounded-3xl ${marginCard} translate-x-1 translate-y-1`}>
        <section className={`flex flex-col justify-center bg-white ${horizotalPadding} ${topPadding} -translate-x-1 -translate-y-1 rounded-3xl border-2 border-mainColor-tertiary `}>
          <section className='flex flex-col xl:flex my-auto text-justify font-bold font-serif-archivo '>
            <Image
              src={image}
              alt={title}
              title={title}
              className={`aspect-square object-cover ${paddingImages} rounded-tr-3xl rounded-tl-3xl border-b-2 border-mainColor-tertiary bg-mainColor-primary`}
            />
          </section>
          <section className={`flex flex-col xl:flex text-center font-medium font-serif-archivo text-2xl ${heightCards} mx-2`}> {title} </section>
          <section>
            {children}
          </section>
        </section>
      </section>
    </>
  )
}

export function HowToCards({
  children,
  image = 'https://via.placeholder.com/400',
  isOverlay = false
}) {
  return (
    <section className='flex w-max bg-mainColor-tertiary translate-y-1 rounded-3xl drop-shadow-xl'>
      <section className='flex flex-col relative justify-center -translate-y-1 bg-white rounded-3xl border-2 border-mainColor-tertiary'>
        <Image
          src={image}
          alt='arrows'
          className='w-auto xl:w-[14rem] h-auto xl:h-[14rem] object-cover m-8'
        />
        {isOverlay && (
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        )}
        <section className='flex flex-col absolute 
               bottom-0 left-0 right-0
               xl:flex text-center 
               font-serif-archivo 
               text-2xl font-semibold 
               pb-4 text-mainColor-tertiary font-sans-nutito'>
          {children}
        </section>
      </section>
    </section>
  )
}

export const Card = Object.assign(Cards, {
  Main: MainCard,
  Secondary: SecondaryCard,
})