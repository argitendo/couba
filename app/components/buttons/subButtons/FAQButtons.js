import React from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../icons';

export default function FAQButtons({ question, answer, isOpen, onClick, isList = false }) {
  return (
    <div className='bg-mainColor-tertiary rounded-lg translate-x-1 translate-y-1'>
      <div className='
            bg-white py-5 px-7 
            text-black rounded-lg 
            border-2 border-mainColor-tertiary
            shadow-lg -translate-x-1 -translate-y-1 '>
        <button onClick={onClick} className='flex items-center justify-between w-full text-left'>
          <span className='text-xl font-bold font-sans-nutito'>{question}</span>
          <span className={`transform transition-transform ml-4 duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
            <Icons.Arrow rotateIcon='transform rotate-90' />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='overflow-hidden'
            >
              <div className='text-base mt-2 py-4 text-left border-t-2 font-normal'>
                <div className='mt-2' />
                {isList ? (
                  <ul className='list-decimal ml-6'>
                    {answer.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <div>{answer}</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

