"use client"

import LandingPage from '@/app/components/landingPage'
import '@/app/app.css'

export default function Home() {
  return (
    <main className="min-h-screen w-full flex-col items-center justify-between">
      <LandingPage />
    </main>
  );
}
