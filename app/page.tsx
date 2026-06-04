import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CursorCrow from "@/components/CursorCrow";

function SectionRule() {
  return <hr className="border-t border-[#222]" aria-hidden="true" />;
}

export default function Page() {
  return (
    <>
      <CursorCrow />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute top-[8%] left-[6%] w-[560px] h-[560px] rounded-full blur-3xl opacity-[0.16] animate-blob-1"
          style={{
            background:
              "radial-gradient(circle, rgba(245,245,240,1), transparent 65%)",
          }}
        />
        <div
          className="absolute top-[42%] right-[6%] w-[620px] h-[620px] rounded-full blur-3xl opacity-[0.14] animate-blob-2"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,1), transparent 65%)",
          }}
        />
        <div
          className="absolute top-[72%] left-[44%] w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.12] animate-blob-3"
          style={{
            background:
              "radial-gradient(circle, rgba(245,245,240,1), transparent 65%)",
          }}
        />
      </div>
      <Ticker variant="outer" />
      <Nav />
      <div className="max-w-[1100px] mx-auto px-8">
        <Hero />
      </div>
      <Ticker variant="inner" />
      <div className="max-w-[1100px] mx-auto px-8 py-24">
        <Features />
      </div>
      <SectionRule />
      <div className="max-w-[1100px] mx-auto px-8 py-24">
        <HowItWorks />
      </div>
      <SectionRule />
      <div className="max-w-[1100px] mx-auto px-8 py-24">
        <CTASection />
      </div>
      <div className="max-w-[1100px] mx-auto px-8">
        <Footer />
      </div>
    </>
  );
}
