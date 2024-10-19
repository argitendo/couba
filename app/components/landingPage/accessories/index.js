import data from '@/app/components/data/PreviewsData'
import { Card } from '../../../components/cards'
import { Button, PrimaryButton, SecondaryButton } from '@/app/components/buttons'
import { ImageDecoration } from '../../../components/decoration'

export default function AccessoriesPage() {
  return (
    <section className='relative' id='accessories-screen'>

      <div className='absolute flex xl:hidden left-0 bottom-[35%] w-36'> <ImageDecoration.BannerLeftAccessories /> </div>
      <div className='absolute flex xl:hidden right-0 top-[22%] w-20'> <ImageDecoration.BannerRightAccessories /> </div>

      <section className='flex flex-col bg-mainColor-primary p-8 pb-36 z-20'>
        <nav className='mt-[5.315rem] mb-14'>
          <h1 className='text-center text-4xl font-black font-serif-archivo text-white'> Tipe Aksesoris </h1>
        </nav>

        <section className='flex flex-col md:flex-row xl:flex-row justify-center w-full xl:w-3/4 mx-auto'>
          <CardComponentTop data={data} />
        </section>

        <div className='hidden xl:flex my-4 xl:my-4' />

        <section className='flex flex-col md:flex-row xl:flex-row justify-center w-full xl:w-3/4 mx-auto'>
          <CardComponentBottom data={data} />
        </section>

        <div className='flex justify-center mt-8'>
          <Button.MainVariantsWhite to='/coming-soon' customButton='py-4 px-16 xl:py-2 xl:px-8 text-xl xl:text-base'>Semua Produk </Button.MainVariantsWhite>
        </div>
      </section>
    </section>
  )
}

export const CardSection = ({ image, title }) => (
  <section className="flex flex-col text-3xl font-medium font-serif-archivo text-mainColor-tertiary">
    <Card.Main image={image} heightCards="" title={title} isOverlay></Card.Main>
  </section>
);

export const CardComponentTop = ({ data }) => (
  <>
    {data.slice(0, 3).map((item, index) => (
      <div
        key={index}
        className="relative group transform transition-transform duration-300 ease-out hover:-translate-y-4 pb-8 md:mx-4 xl:mx-8 xl:-mb-2"
      >
        <CardSection image={item.image} title={item.name} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button.MainVariantsGreen to={`/product/${item.id}`} customButton="py-4 px-16 xl:py-2 xl:px-8 text-xl xl:text-base">
            Coba Gratis
          </Button.MainVariantsGreen>
        </div>
      </div>
    ))}
  </>
);

export const CardComponentBottom = ({ data }) => (
  <>
    {data.slice(3, 5).map((item, index) => (
      <div
        key={index}
        className="relative group transform transition-transform duration-300 ease-out hover:-translate-y-4 pb-8 md:mx-4 xl:mx-8 xl:mb-8"
      >
        <CardSection image={item.image} title={item.name} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button.MainVariantsGreen to={`/product/${item.id}`} customButton="py-4 px-16 xl:py-2 xl:px-8 text-xl xl:text-base">
            Coba Gratis
          </Button.MainVariantsGreen>
        </div>
      </div>
    ))}
  </>
);
