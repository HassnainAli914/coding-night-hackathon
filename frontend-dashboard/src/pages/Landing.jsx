import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "../components/landing/ui/header";
import Footer from "../components/landing/ui/footer";

import Hero from "../components/landing/hero-home";
import BusinessCategories from "../components/landing/business-categories";
import FeaturesPlanet from "../components/landing/features-planet";
import Testimonials from "../components/Testimonials";
import Cta from "../components/landing/cta";
import Pricing from "../components/Pricing";
import Separator from "../components/landing/ui/separator";

export default function Landing() {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip bg-white text-gray-900">
      <Header />
      <main className="grow">
        <Hero />
        <Separator />
        <BusinessCategories />
        <Separator />
        <FeaturesPlanet />
        <Separator />
        <Pricing />
        <Separator />
        <Testimonials />
        <Separator />
        <Cta />
      </main>
      <Footer border={true} />
    </div>
  );
}
