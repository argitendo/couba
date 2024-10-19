import Image from "next/image";
import { useEffect } from "react"
import Credential from "../../../../public/assets/character/credentials.png";
import { Button } from "@/app/components/buttons";
import '@/app/app.css'

export default function index() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className='flex flex-col relative justify-center m-12 xl:m-12'>
      <article className='flex flex-col w-full justify-center items-center'>
        <h1 className='text-3xl font-black text-center text-mainColor-tertiary'>Masuk ke akun Couba</h1>
        <Image src={Credential} alt='credentials' className='w-4/5 md:w-1/5 h-auto m-8 xl:p-8' />
      </article>
      <aside className='flex justify-center'>
        <Button.GoogleButton>Sign in with Google</Button.GoogleButton>
      </aside>
    </main>
  )
}
