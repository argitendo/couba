import React, { useState } from 'react'
import { motion } from 'framer-motion'

// const categories = ['Cincin', 'Jewelry', 'Eyewear', 'Watches', 'Outfit']
const categories = ['ring', 'earring', 'necklace', 'bracelet']

function CategoriesButton() {
   const [selectedCategory, setSelectedCategory] = useState('Jewelry')

   return (
      <motion.div
         className="flex md:overflow-hidden flex-wrap px-6 my-4 space-x-8 justify-between w-full"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.5 }}
      >
         {categories.map((category) => (
            <motion.button
               key={category}
               onClick={() => setSelectedCategory(category)}
               className={`xl:px-4 py-4 rounded-xl focus:outline-none font-sans-nutito ${selectedCategory === category
                  ? 'bg-mainColor-primary text-white'
                  : 'text-gray-800'
               }`}
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.95 }}
            >
               {category}
            </motion.button>
         ))}
      </motion.div>
   )
}

export default CategoriesButton