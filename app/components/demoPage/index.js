import Categories from '../buttons/subButtons/CategoriesButton'
import Demo from '@/app/components/demoPage/demo'
import SkeletonsDemo from '../skeletons'
import { useState, useEffect } from 'react'
import { Layout } from '../layouts'
import '@/app/app.css'

export default function index() {
  const [selectedCategory, setSelectedCategory] = useState('Cincin')
  const [isLoading, setLoading] = useState(false)
  const categories = ['Cincin', 'Gelang', 'Anting', 'Kalung']

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleCategoryChange = (category) => {
    setLoading(true)
    setSelectedCategory(category)

    setTimeout(() => {
      setLoading(false)
    }, 200)
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
          <SkeletonsDemo />
        ) : (
          <Demo categories={selectedCategory} />
        )
        }
      </main>
    </Layout.Secondary>
  )
}
