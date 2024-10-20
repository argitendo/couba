import VtoViewer from "@/app/components/vto/VtoViewer"

export default function index({
  categories,
}) {
  return (
    <div className='flex md:flex-row flex-col'>


      <section className='w-full md:w-1/3 mr-4 bg-red-50'>
        <VtoViewer category={categories} />
      </section>

      <section className='w-full md:w-2/3 hidden md:flex flex-row'>
        <div className="mx-auto z-10 p-2 bg-blue-200 w-full">
          {/* Selector */}
        </div>
      </section>
    </div>
  )
}
