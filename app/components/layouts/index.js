"use client"

import Navbar from '../navbars'
import { Footer } from '../footers'
import DefaultLogo from '@/public/assets/logo/logo.png'
import WhiteLogo from '@/public/assets/logo/logo_white.png'

export function Layouts({ children }) {
  <> {children} </>
}

export function MainLayouts({ children, isSecondary }) {
  return (
    <>
      <Navbar
        logoDark={DefaultLogo}
        logoLight={WhiteLogo}
        isSecondary={false}
      />
      {children}
      <Footer.Main isHelpsFooters={false}/>
    </>
  )
}

export function SecondaryLayouts({ children }) {
  return (
    <>
      <Navbar
        logoDark={DefaultLogo}
        logoLight={WhiteLogo}
        isSecondary={true}
      />
      {children}
      <Footer.Main isHelpsFooters={true}/>
    </>
  )
}

export const Layout = Object.assign(Layouts, {
  Main: MainLayouts,
  Secondary: SecondaryLayouts
})
