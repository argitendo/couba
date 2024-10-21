import VtoViewer from "@/app/components/vto/VtoViewer"
import VtoSelectorViewer from "../../vto/VtoSelector"

export default function index({
  categories,
  setSelect,
}) {
  return (
    <div className='flex md:flex-row flex-col'>

      <section className='w-full md:w-1/3 mr-4 bg-red-50'>
        <VtoViewer category={categories} targetTexture={'/public/assets/vtoaccesories/ring00.png'} />
      </section>

      <section className='w-full md:w-2/3 hidden md:flex flex-row'>
        <div className="mx-auto z-10 p-2 w-full">
          <VtoSelectorViewer category={categories} />
        </div>
      </section>
    </div>
  )
}
