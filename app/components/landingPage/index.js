import { Layout } from '@/app/components/layouts'
import HeroPages from './hero'
import ProblemPages from './problems'
import HowToPages from './howToUse'
import FeaturePages from './feature'
import ProductPages from './accessories'
import ComingSoonPages from './comingSoon'
import FAQPages from './faq'
import ContactPages from './contact'
import '@/app/app.css'

function LandingPages() {
  return (
    <Layout.Main>
      <HeroPages />
      <ProblemPages />
      <HowToPages />
      <FeaturePages />
      <ProductPages />
      <ComingSoonPages />
      <FAQPages />
      <ContactPages />
    </Layout.Main>
  )
}

export default LandingPages