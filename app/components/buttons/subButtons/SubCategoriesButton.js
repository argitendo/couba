import React from 'react'

function SubCategoriesComponents({selectedCategory, setSelectedCategory}) {
  const categories = ['Cincin', 'Gelang', 'Anting', 'Kalung']

  return (
    <div className="flex space-x-4 w-full">
      <div className="text-center justify-center xl:mx-16 w-full">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)} // Change selected category
            className={`text-center justify-center font-medium text-base md:text-lg xl:text-2xl mx-4 xl:mx-8 ${
              selectedCategory === category
                ? 'text-mainColor-primary pb-4 border-b-2 border-mainColor-primary'
                : 'text-gray-500'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );

}

export default SubCategoriesComponents