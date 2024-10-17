import Preview from '../../../public/assets/decoration/decor_l_1.png'
import Previews from '../../../public/assets/decoration/TopBanner.png'
import Previewss from '../../../public/assets/decoration/BottomLeftBanner.png'
import Previewsss from '../../../public/assets/decoration/decor.png'
import Previewssss from '../../../public/assets/decoration/decor_2.png'
import Previewsssss from '../../../public/assets/decoration/decor_4.png'
import Previewssssss from '../../../public/assets/decoration/decor_5.png'
import Previewsssssss from '../../../public/assets/decoration/decor_6.png'
import Previewssssssss from '../../../public/assets/decoration/decor_7.png'
import Previewsssssssss from '../../../public/assets/decoration/decor_8.png'
import Previewssssssssss from '../../../public/assets/decoration/decor_r_1.png'
import Image from 'next/image'


export function CustomDecoration({ children }) {
  return (
    <>{children}</>
  )
}

export function BannerDecorHome() {
  return (
    <div>
      <Image src={Preview} alt='decor six' />
    </div>
  )
}

export function TopDecorContact() {
  return (
    <div>
      <Image src={Previews} alt='...' />
    </div>
  )
}

export function BottomDecorContact() {
  return (
    <div>
      <Image src={Previewss} alt='...' />
    </div>
  )
}

export function RightDecorContact() {
  return (
    <div>
      <Image src={Preview} alt='...' />
    </div>
  )
}

export function BannerTopBlurs({ blurRadius = 'blur-2xl' }) {
  return (
    <div className={`w-[42rem] h-[42rem] bg-mainColor-secondary rounded-full ${blurRadius} opacity-50`}>
    </div>
  )
}

export function BannerRightBlurs() {
  return (
    <div>
      <Image src={Previewsss} alt='preview' />
    </div>
  )
}

export function BannerLeftBlurs() {
  return (
    <div>
      <Image src={Previewssss} alt='preview' className='w-[32rem] xl:w-3/5' />
    </div>
  )
}

export function BannerLeftLines() {
  return (
    <div>
      <Image src={Previewsssss} alt='preview' />
    </div>
  )
}

export function BannerRightLines() {
  return (
    <div>
      <Image src={Previewssssss} alt='preview' />
    </div>
  )
}

export function BannerRights() {
  return (
    <div>
      <Image src={Previewsssssss} alt='preview' />
    </div>
  )
}

export function BannerRightAccessories() {
  return (
    <div>
      <Image src={Previewssssssss} alt='preview' />
    </div>
  )
}

export function BannerLeftAccessories() {
  return (
    <div>
      <Image src={Previewsssssssss} alt='preview' />
    </div>
  )
}

export function Bannerss() {
  return (
    <div>
      <Image src={Previewssssssssss} alt='preview' />
    </div>
  )
}

export const ImageDecoration = Object.assign(CustomDecoration, {
  Banner: BannerDecorHome,
  BannerTopContact: TopDecorContact,
  BannerBottomContact: BottomDecorContact,
  BannerRightContact: RightDecorContact,
  BannerTopBlurs: BannerTopBlurs,
  BannerRightBlurs: BannerRightBlurs,
  BannerLeftBlurs: BannerLeftBlurs,
  BannerLeftLines: BannerLeftLines,
  BannerRightLines: BannerRightLines,
  BannerRightss: BannerRights,
  BannerRightAccessories: BannerRightAccessories,
  BannerLeftAccessories: BannerLeftAccessories,
  Bannerr: Bannerss
})
