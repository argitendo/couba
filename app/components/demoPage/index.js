import Categories from '../buttons/subButtons/CategoriesButton'
import { Layout } from '../layouts'
import { useState, useEffect } from 'react'
import VtoViewer from '../vto/VtoViewer'
import '@/app/app.css'

export default function index() {
  const [selectedCategory, setSelectedCategory] = useState('ring')
  const [isLoading, setLoading] = useState(false)
  const categories = ['ring', 'earring', 'necklace', 'bracelet']

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <Layout.Secondary>
      <main className='relative mx-8 xl:mx-[11.25rem] mb-20 xl:mb-8 text-mainColor-tertiary'>
        <header className='flex flex-col items-center justify-center my-8'>
          <Categories
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </header>
        { isLoading ? (
          <div className='flex justify-center w-full h-16'>
            loading
          </div>
        ) : (
          <div className='flex justify-center w-full h-16'>
            <VtoViewer category={selectedCategory} />
          </div>
        )
        }
      </main>
    </Layout.Secondary>
  )
}
