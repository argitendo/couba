import Categories from '../buttons/subButtons/CategoriesButton'
import Demo from '@/app/components/demoPage/demo'
import { useState, useEffect } from 'react'
import { Layout } from '../layouts'
import '@/app/app.css'

export default function index() {
  const [selectedCategory, setSelectedCategory] = useState('ring')
  const [isLoading, setLoading] = useState(false)
  const categories = ['ring', 'earring', 'necklace', 'bracelet']

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleCategoryChange = (category) => {
    setLoading(true)
    setSelectedCategory(category)

    setTimeout(() => {
      setLoading(false)
    }, 700)
  };

  return (
    <Layout.Secondary>
      <main className='relative mx-8 xl:mx-[11.25rem] mb-20 xl:mb-8 text-mainColor-tertiary'>
        <header className='flex flex-col items-center justify-center my-8'>
          <Categories
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            categories={categories}
          />
        </header>
        {isLoading ? (
          <div className='flex justify-center w-full h-16'>
            loading
          </div>
        ) : (
          <Demo categories={selectedCategory} />
        )
        }
      </main>
    </Layout.Secondary>
  )
}
