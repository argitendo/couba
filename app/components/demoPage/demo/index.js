import VtoViewer from "@/app/components/vto/VtoViewer"
import VtoSelectorViewer from "../../vto/VtoSelector"
import ringsImage from '@/public/assets/vtoaccesories/rings/ring00.png'

export default function index({ categories }) {
  return (
    <div className='flex md:flex-row flex-col'>
      <section className='w-full md:w-1/3 mr-4'>
        <VtoViewer category={categories} targetTexture={ringsImage} />
      </section>

      <section className='w-full md:w-2/3'>
        <div className="mx-auto w-full ml-4">
          <VtoSelectorViewer category={categories} />
        </div>
      </section>
    </div>
  )
}
