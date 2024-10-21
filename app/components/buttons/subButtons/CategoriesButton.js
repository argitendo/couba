import React, { useState } from 'react'
import { motion } from 'framer-motion'

// const categories = ['Cincin', 'Jewelry', 'Eyewear', 'Watches', 'Outfit']

function CategoriesButton({ selectedCategory, setSelectedCategory, categories }) {

   return (
      <div className="flex md:overflow-hidden flex-wrap justify-around w-full px-36">
         {categories.map((category) => (
            <motion.button
               key={category}
               onClick={() => setSelectedCategory(category)}
               className={`text-center justify-center font-medium text-base md:text-lg xl:text-2xl mx-4 xl:mx-8 p-4 rounded-sm
                  ${selectedCategory === category
                  ? 'text-mainColor-primary border-4 border-b-mainColor-primary'
                  : 'text-gray-500'
               }`}
               whileHover={{ scale: 0.9 }}
               whileTap={{ scale: 0.95 }}
            >
               {category}
            </motion.button>
         ))}
      </div>
   )
}

export default CategoriesButton