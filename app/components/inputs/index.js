import { Icons } from '../icons'

export function Inputs({ children }) {
  return (
    <>{children}</>
  )
}

function CustomInputs({ children }) {
  return (
    <section className='flex items-center border-2 rounded-full p-2 xl:px-4 '>
      <Icons.Person />
      <input placeholder={children} className='bg-transparent outline-none text-white mx-4' type='email' />
    </section>
  )
}

function CustomFormInputs({ children, types, values, onChanges, placeholders }) {
  return (
    <section className='flex flex-col mt-4 text-left w-full'>
      <label className='text-white text-base font-sans-nutito font-normal'>{children}</label>
      <input 
        type={types} 
        value={values} 
        onChange={onChanges}
        placeholder={placeholders}
        className='bg-white rounded-md px-2 py-2 font-normal text-black text-base focus:outline-none focus:ring focus:ring-mainColor-tertiary' />
    </section>
  )
}

export const Input = Object.assign(Inputs, {
  Main: CustomInputs,
  MainForm: CustomFormInputs
})