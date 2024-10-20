import googleIcon from '@/public/assets/logo/Google.png';
import Image from 'next/image';
import Link from 'next/link';

export function Buttons({ children }) {
  return (
    <>{children}</>
  )
}

// Main Rounded Blue Button
export default function MainButtons({
  // to,
  children,
  onClicks,
  types = "button",
  customButton = 'px-[3rem] py-[1rem] text-white'
}) {
  return (
    // <Link href={ to ?? "/" } onClick={onClicks}>
      <div className='bg-black translate-y-1 rounded-full'>
        <button
          onClick={onClicks}
          type={types}
          className={`button-main ${customButton} text-base font-bold font-sans-nutito -translate-y-1 rounded-full border-2 border-mainColor-tertiary`} >
          {children}
        </button>
      </div>
    // </Link>
  );
}

// White Variant Main Button
export function WhiteVariantsMainButton({
  // to,
  children,
  onClicks,
  types = "button",
  customButton = 'px-[1.5rem] py-[1rem]',
}) {
  return (
    // <Link href={ to ?? '/'}>
      <div className='bg-mainColor-tertiary translate-y-1 rounded-full'>
        <button
          type={types}
          onClick={onClicks}
          className={`button-variant-secondary ${customButton} text-base font-bold font-sans-nutito -translate-y-1 rounded-full border-2 border-mainColor-tertiary`}>
          {children}
        </button>
      </div>
    // </Link>
  );
}

// Green Variant Main Button
export function GreenVariantsMainButton({
  // to,
  children,
  onClicks,
  types = "button",
  customButton = 'px-[1.5rem] py-[1rem] text-black',
}) {
  return (
    // <Link href={ to ?? '/'}>
      <div className='bg-mainColor-tertiary translate-y-1 rounded-full'>
        <button
          type={types}
          onClick={onClicks}
          className={`button-secondary ${customButton} text-base font-bold font-sans-nutito -translate-y-1 rounded-full border-2 border-mainColor-tertiary`}>
          {children}
        </button>
      </div>
    // </Link>
  );
}

// Secondary Rectangular Button
export function SecondaryButton({
  // to,
  children,
  onClicks,
  types = "button",
  customButton = 'px-8 py-4',
}) {
  return (
    // <Link href={ to ?? '/'}>
      <div className='bg-mainColor-tertiary translate-y-1 rounded-lg'>
        <button
          type={types}
          onClick={onClicks}
          className={`button-secondary ${customButton} text-base font-bold font-sans-nutito -translate-y-1 rounded-lg border-2 border-mainColor-tertiary`}>
          {children}
        </button>
      </div>
    // </Link>
  );
}

// White Variant Secondary Button
export function WhiteVariantsSecondaryButton({
  // to,
  children,
  onClicks,
  customButton = 'px-8 py-4',
}) {
  return (
    // <Link href={ to ?? '/'}>
      <div className='bg-mainColor-tertiary translate-y-1 rounded-lg'>
        <button
          onClick={onClicks}
          className={`button-variant-secondary ${customButton} text-base font-bold font-sans-nutito -translate-y-1 rounded-lg border-2 border-mainColor-tertiary`}>
          {children}
        </button>
      </div>
    // </Link>
  );
}


// Blue Variant Secondary Button
export function BlueVariantsSecondaryButton({
  to,
  children,
  customButton = 'px-8 py-4 text-white',
}) {
  return (
    <Link href={ to ?? '/'}>
      <div className='bg-mainColor-tertiary translate-y-1 rounded-lg'>
        <button className={`button-main ${customButton} text-base font-bold font-sans-nutito -translate-y-1 rounded-lg border-2 border-mainColor-tertiary`}>
          {children}
        </button>
      </div>
    </Link>
  );
}

// Google Sign-In Button
export function GoogleSignInButton({ children }) {
  return (
    <button className="flex justify-between text-sm font-medium p-4 border-2 border-[#C1D5F6] rounded-full hover:bg-slate-50">
      <Image src={googleIcon} alt="Google sign-in" className='w-8 xl:ml-8' />
      <div className="mx-2 xl:mx-8" />
      <span className="text-xl font-medium justify-center self-center font-sans-roboto xl:mr-8 text-mainColor-tertiary">
        {children}
      </span>
    </button>
  );
}

export const Button = Object.assign(Buttons, {
  Main: MainButtons,
  MainVariantsWhite: WhiteVariantsMainButton,
  MainVariantsGreen: GreenVariantsMainButton,
  Secondary: SecondaryButton,
  SecondaryVariants: WhiteVariantsSecondaryButton,
  SecondaryVariantsBlue: BlueVariantsSecondaryButton,
  GoogleButton: GoogleSignInButton
})