import Link from "next/link";
import Logo from "../../../public/assets/logo/logo_white.png";
import { Icons } from "../icons";
import { Button } from "../buttons";
import Image from "next/image";

const socialMedia = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/'
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/'
  }
]

export function FooterContainer({ children }) {
  return <>{children}</>;
}

export function FooterNavbar({ children }) {
  return (
    <section className="flex-col mx-11 mt-12 text-center text-white text-3xl font-black">
      {children}
    </section>
  );
}

export function FooterNavigation({ children }) {
  return (
    <section className="flex flex-col justify-center font-sans-nutito">
      {children}
    </section>
  );
}

export function FooterInformation({ children }) {
  return (
    <section className="flex flex-col lg:flex-row justify-between xl:m-20 xl:mb-4 m-4 mx-8 xl:mx-[8.25rem] text-white">
      {children}
    </section>
  );
}

export function FooterHelps({ children }) {
  return (
    <section>
      {children}
    </section>
  );
}

export function FooterInformationLeft({ children }) {
  return (
    <section className="flex xl:flex-row flex-col text-sm xl:text-base font-medium leading-loose">
      {children}
    </section>
  );
}

export function FooterInformationRight({ children }) {
  return (
    <section className="flex flex-col text-left font-medium xl:mt-0 mt-8">
      {children}
    </section>
  );
}

export function FooterInformationNavigation({ children }) {
  return (
    <section className="flex flex-col xl:mr-20 mr-12 leading-loose text-base xl:text-lg font-sans-nutito">
      {children}
    </section>
  );
}

export function FooterInformationNavigationSecond({ children }) {
  return (
    <section className="flex flex-col">
      {children}
    </section>
  );
}

export function FooterInformationNavigationThird({ children }) {
  return (
    <section className="flex flex-col mt-8 md:mt-0">
      {children}
    </section>
  );
}

export function FooterLegalInformation({ children }) {
  return (
    <section className=' text-white'>
      <div className='hidden lg:flex border-t-[1.3px] border-mainColor-primary opacity-30 mx-8 xl:mx-[8.25rem] mt-11' />
      {children}
    </section>
  );
}

export function FooterLegalInformationContent({ children }) {
  return (
    <section className='flex flex-col md:flex-row md:justify-between xl:mx-[8.25rem] mx-8 mt-4 xl:mt-12 mb-[5.25rem] '>
      {children}
      <section className='flex xl:hidden'>  <p className='text-white text-lg mr-0 xl:mr-4 my-4 font-normal text-left'>© {new Date().getFullYear()}. Tendos Studio Teknologi</p> </section>
    </section>
  );
}

export function FooterLegalInformationBrand() {
  return (
    <section className='hidden xl:flex text-left'>
      <p className='text-white text-sm mr-4 opacity-80 font-normal'>© {new Date().getFullYear()}. Tendos Studio Teknologi</p>
    </section>
  );
}

export function FooterLegalInformationPrivacyPolicy() {
  return (
    <section className='flex flex-col xl:flex-row justify-center text-left'>
      <Link href='/' className='opacity-80 xl:my-0 my-2 xl:text-sm text-lg' title='Terms of Service & Privacy Policy'>Terms of Service & Privacy Policy</Link>
    </section>
  );
}

export function MainFooter({
  isHelpsFooters = false,
}) {
  return (
    <footer className='flex flex-col bg-mainColor-tertiary justify-center'>

      <Footer.Navigation>
        {
          isHelpsFooters
            ? (
              <Footer.Helps>
                <h2 className='text-3xl font-bold text-white text-center font-serif-archivo my-16 mx-4'>Bingung atau butuh bantuan?</h2>
                <div className='flex justify-center'>
                  <Button.Main to='/' customButton='py-3 px-12 text-white'>Hubungi Kami</Button.Main>
                </div>
                <div className='border-b-[1.3px] border-mainColor-primary opacity-30 mx-8 xl:mx-[8.25rem] mt-20' />
              </Footer.Helps>
            )
            : null
        }
        <Footer.Information>
          <Footer.InformationLeft>
            <Image src={Logo} alt='Logo' className='object-contain xl:w-[12rem] xl:h-[6rem] w-[10rem] h-[4rem] mr-8 mt-4 md:mt-12 lg:mt-0 ' />
            <div className="flex flex-col">
              <div className='flex flex-col text-left xl:leading-loose font-normal text-lg xl:mt-0 mt-8'>
                <p>The Lapan Square,</p>
                <p>Jl. Jurang Mangu Bar. No 88,</p>
                <p>Jurang Mangu Barat</p>
              </div>
              <div className="flex flex-row xl:my-4 my-8 space-x-4">
                <a className="flex items-center justify-center w-10 h-10 rounded-full border-2" href={socialMedia[0].url} title="Instagram">
                  <Icons.Instagram />
                </a>
                <a className="flex items-center justify-center w-10 h-10 rounded-full border-2" href={socialMedia[1].url} title="WhatsApp">
                  <Icons.WhatsApp />
                </a>
              </div>
              <div className='lg:hidden border-b-[1.3px] border-mainColor-primary opacity-30 xl:mx-[4.25rem]' />
            </div>
          </Footer.InformationLeft>
          <Footer.InformationRight>
            <h1 className='text-xl mb-2 font-medium font-sans-nutito'>Quicklink</h1>
            <div className="flex flex-row">
              <Footer.InformationNavigation>
                <Link href='/' onClick={() => { document.getElementById('how-to-screen').scrollIntoView() }} title="Cara Pakai Couba">Cara Pakai Couba</Link>
                <Link href='/' onClick={() => { document.getElementById('feature-screen').scrollIntoView() }} title="Fitur">Fitur</Link>
              </Footer.InformationNavigation>
              <Footer.InformationNavigation>
                <Link href='/' onClick={() => { document.getElementById('accessories-screen').scrollIntoView() }} title="Produk">Produk</Link>
                <Link href='/' onClick={() => { document.getElementById('faq-screen').scrollIntoView() }} title="FAQ">FAQ</Link>
              </Footer.InformationNavigation>
            </div>
            <div className='flex lg:hidden border-t-[1.3px] border-mainColor-primary opacity-30 mt-11' />
          </Footer.InformationRight>
        </Footer.Information>
      </Footer.Navigation>

      <Footer.LegalInformation>
        <Footer.LegalInformationContent>
          <Footer.LegalInformationBrand />
          <Footer.LegalInformationPrivacyPolicy />
        </Footer.LegalInformationContent>
      </Footer.LegalInformation>
    </footer>
  )
}

export const Footer = Object.assign(FooterContainer, {
  Navbar: FooterNavbar,
  Navigation: FooterNavigation,
  Information: FooterInformation,
  Helps: FooterHelps,
  InformationLeft: FooterInformationLeft,
  InformationRight: FooterInformationRight,
  InformationNavigation: FooterInformationNavigation,
  InformationNavigationSecond: FooterInformationNavigationSecond,
  InformationNavigationThird: FooterInformationNavigationThird,
  // NewsLetter: FooterNewsLetter,
  // NewsLetterInput: FooterNewsLetterInput,
  LegalInformation: FooterLegalInformation,
  LegalInformationBrand: FooterLegalInformationBrand,
  LegalInformationContent: FooterLegalInformationContent,
  LegalInformationPrivacyPolicy: FooterLegalInformationPrivacyPolicy,
  Main: MainFooter
})