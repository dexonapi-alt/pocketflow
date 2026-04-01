"use client";

import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { Features } from "./features";
import { Pricing } from "./pricing";
import { FAQ } from "./faq";
import { Footer } from "./footer";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#fbfbf8] text-black">
      <Navbar onGetStarted={onGetStarted} onLogin={onLogin} />

      <Hero onGetStarted={onGetStarted} onLogin={onLogin} />

      <div id="features">
        <Features />
      </div>

      <div id="pricing">
        <Pricing onGetStarted={onGetStarted} />
      </div>

      <div id="faq">
        <FAQ />
      </div>

      <Footer />
    </div>
  );
}
