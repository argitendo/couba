import VtoViewer from "@/app/components/vto/VtoViewer"
import VtoSelector from "../../vto/VtoSelector"

export default function index({ categories }) {
  return (
    <div className='flex md:flex-row flex-col'>
      <section className='w-full md:w-1/3 mr-4'>
        <VtoViewer category={categories} targetTexture={'/assets/vtoaccesories/rings/ring00.png'} />
      </section>

      <section className="flex md:hidden md:my-8 " />

      <section className='w-full md:w-2/3'>
        <div className="mx-auto w-full md:ml-4">
          <VtoSelector category={categories} />
        </div>
      </section>
    </div>
  )
}
