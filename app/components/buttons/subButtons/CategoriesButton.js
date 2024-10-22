import React, { useState } from 'react'
import { motion } from 'framer-motion'

// const categories = ['Cincin', 'Jewelry', 'Eyewear', 'Watches', 'Outfit']

function CategoriesButton({ selectedCategory, setSelectedCategory, categories }) {

  return (
    <div className="flex md:overflow-hidden justify-around w-full px-0 md:px-36">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`text-center justify-center font-medium text-base md:text-lg xl:text-2xl  p-2 rounded-sm hover:border-4 hover:border-b-mainColor-primary
                  ${selectedCategory === category
              ? 'text-mainColor-primary border-4 border-b-mainColor-primary'
              : 'text-gray-500'
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoriesButton