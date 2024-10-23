import React from 'react'

function SearchButton({ onClicks, actions }) {
   return (
      <div class="">
         <form action={actions} className='flex items-center border border-gray-300 rounded-xl overflow-hidden px-4  my-4'>
            <input
               type="text"
               placeholder="Cari produk"
               className="py-6 px-4 w-full focus:outline-none text-mainColor-tertiary placeholder-gray-400"
            />
            <button class="bg-mainColor-primary p-4 rounded-xl border-b-mainColor-tertiary border-b-2" onClick={onClicks}>
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.415-1.415l4.243 4.243-1.415 1.415-4.243-4.243zM8 14a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd" />
               </svg>
            </button>
         </form>
      </div>
   
  )
}

export default SearchButton