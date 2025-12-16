import Hero from '../sections/Hero';
import InfluencerCarousel from '../sections/InfluencerCarousel';
import Influencers from '../sections/Influencers';
import { WhyCreators, WhyBrands } from '../sections/WhyCreators';
import CaseStudies from '../sections/CaseStudies';
import TestimonialSlider from '../sections/TestimonialSlider';
import FAQ from '../sections/FAQ';
import AnimatedStats from '../sections/AnimatedStats';
import CTA from '../sections/CTA';
import Pricing from '../sections/Pricing';
import SeoHead from '../components/SeoHead';
import useSeoPage from '../hooks/useSeoPage';

export default function Landing() {
  const { seo } = useSeoPage('home');
  return (
    <main>
      <SeoHead
        title={seo?.title || ''}
        description={seo?.description || ''}
        keywords={seo?.keywords || ''}
        canonical={seo?.canonical || ''}
        ogImage={seo?.ogImage || ''}
        schema={seo?.schema || null}
        noindex={seo?.indexed === false}
      />
      <Hero />
      <Influencers />
      <InfluencerCarousel />
      
      <WhyCreators />
      <WhyBrands />
      
      <CaseStudies />
      <TestimonialSlider />
      <AnimatedStats />
      
      <FAQ />
      <CTA />
    </main>
  );
}
