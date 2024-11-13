"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#D9CFF5] to-[#FAF8F5]">
      <header className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/makeup.png" alt="Divine Beauty Lounge Logo" width={40} height={40} className="rounded-full" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6B4FA0] to-[#4C306D] bg-clip-text text-transparent">Divine Beauty Lounge</h1>
          </div>
          <Link
            href="/login"
            className="bg-gradient-to-r from-[#6B4FA0] to-[#4C306D] hover:from-[#4C306D] hover:to-[#6B4FA0] text-white font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <h2 className="text-5xl font-extrabold text-[#333333] leading-tight mb-6">
                  Streamline Your Beauty Business Inventory
                </h2>
                <p className="text-xl text-[#333333] mb-8">
                  Effortlessly manage your salon&apos;s inventory, track products, and boost efficiency with our comprehensive inventory management system.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-[#6B4FA0] to-[#4C306D] hover:from-[#4C306D] hover:to-[#6B4FA0] rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-[#4C306D] bg-[#D9CFF5] hover:bg-[#F8E5B3] rounded-full transition duration-300"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/pexels.jpg"
                  alt="Beauty Salon Dashboard"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl transform hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-[#FAF8F5] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-[#333333] mb-4">Why Choose Divine Beauty Lounge?</h3>
              <p className="text-xl text-[#333333]">Everything you need to manage your salon inventory efficiently</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300">
                  <div className="w-12 h-12 bg-[#D9CFF5] rounded-full flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-[#333333] mb-2">{feature.title}</h4>
                  <p className="text-[#333333]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#4C306D] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Divine Beauty Lounge</h4>
              <p className="text-[#D9CFF5]">Empowering beauty businesses with smart inventory solutions.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-[#D9CFF5]">
                <li><Link href="#features" className="hover:text-[#F8E5B3]">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-[#F8E5B3]">Pricing</Link></li>
                <li><Link href="#about" className="hover:text-[#F8E5B3]">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-[#D9CFF5]">
                <li>Email: booking.divinebeauty@gmail.com</li>
                <li>Phone: (+880) 1714-134028</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/DivineBeautyLounge/" target="_blank" rel="noopener noreferrer">
                  <svg className="w-6 h-6 text-[#3B5998]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5l-4 4m0-6l-4 4m4 5h4" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#6B4FA0] mt-8 pt-8 text-center text-[#D9CFF5]">
            <p>&copy; 2024 Divine Beauty Lounge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Real-time Tracking",
    description: "Monitor your inventory levels in real-time and get instant alerts when stock runs low.",
    icon: <svg className="w-6 h-6 text-[#6B4FA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  },
  {
    title: "Smart Analytics",
    description: "Get detailed insights and reports to make data-driven decisions for your business.",
    icon: <svg className="w-6 h-6 text-[#6B4FA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  },
  {
    title: "Easy Management",
    description: "Simplified interface for managing products, suppliers, and purchase orders.",
    icon: <svg className="w-6 h-6 text-[#6B4FA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
  }
];
