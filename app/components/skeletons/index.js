
export function index() {
  return (
    <div className='flex md:flex-row flex-col animate-pulse w-full '>
      <section className='w-1/3 bg-gray-200 rounded-2xl h-[500px]'/>
      <section className='w-2/3 grid grid-cols-4 gap-4 rounded-3xl ml-8' >
        <div className='bg-gray-200 aspect-square rounded-2xl'></div>
        <div className='bg-gray-200 aspect-square rounded-2xl'></div>
        <div className='bg-gray-200 aspect-square rounded-2xl'></div>
        <div className='bg-gray-200 aspect-square rounded-2xl'></div>
      </section>
    </div>
  )
}

export default index