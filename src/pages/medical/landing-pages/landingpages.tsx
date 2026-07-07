import { Hero } from './Hero';
import { ContentSection } from './all-specialities';
import { DoctorsList } from './doctors';
import { ServicesSection } from './ServicesSection';
import { AboutAndFeatures } from './about-us';
import { AppointmentAndNews } from './news';
import { LocationSection } from './WhereToFindUs';



export function LandingPages() {
  return (
    <>
      <Hero />
      <ContentSection />
      <DoctorsList />
       <ServicesSection />
      <AboutAndFeatures />
      <AppointmentAndNews />
      <LocationSection />
    </>
  );
}