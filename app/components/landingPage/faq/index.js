"use client"

import Backgrounds from '../../../../public/assets/backgrounds/backgrounds_2.png'
import FAQButtons from '../../../components/buttons/subButtons/FAQButtons'
import Image from 'next/image'
import data from '../../data/QuestionData'
import { Button } from '../../buttons'
import { motion } from 'framer-motion';
import { useState } from 'react';
import '@/app/app.css'

export default function SeventhPages() {
  const [activeIndex, setActiveIndex] = useState(null)
  const initialLoadCount = 5
  const [loadedQuestions, setLoadedQuestions] = useState(data.slice(0, initialLoadCount))
  const [allLoaded, setAllLoaded] = useState(false)

  const handleFAQClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleLoadMoreOrLess = () => {
    if (allLoaded) {
      setLoadedQuestions(data.slice(0, initialLoadCount));
      setAllLoaded(false);
    } else {
      setLoadedQuestions(data);
      setAllLoaded(true);
    }
    setActiveIndex(null);
  };

  return (
    <section id='faq-screen' className='relative'>
      {/* <Image src={Backgrounds} alt='backgrounds' className='-z-20 absolute bg-repeat w-screen min-h-full' /> */}
      <section className='pt-12 pb-16 xl:w-2/3 mx-4 xl:mx-auto'>
        <section className='flex flex-col text-white mx-auto px-4 py-20 text-center text-4xl font-black font-serif-archivo'>
          <h1 className='mb-[4.5rem] text-white'>Tanya - tanya</h1>
            <section className='flex flex-col gap-4'>
              {loadedQuestions.map((item, index) => (
                <FAQButtons
                  key={item.id}
                  question={item.question}
                  answer={item.answer}
                  isOpen={activeIndex === index}
                  isList={item.isList}
                  onClick={() => handleFAQClick(index)
                  }
                />
              ))}
            </section>

          <motion.div 
            className='flex justify-center mt-8'
            whileTap={{scale: 0.9}}
            transition={{duration: 0.1}}
          >
            <Button.SecondaryVariants customButton='flex px-8 py-4 my-auto' onClicks={handleLoadMoreOrLess} >
              {allLoaded ? 'Muat lebih sedikit' : 'Muat lebih banyak'}
              <span className='pl-4 inline-block '>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className='flex my-auto'>
                  {allLoaded ? (
                    <>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </>
                  ) : (
                    <>
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </>
                  )}
                </svg>
              </span>
            </Button.SecondaryVariants>
          </motion.div>
        </section>
      </section>
    </section>
  );
}