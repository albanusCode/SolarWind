import React from "react";
import { Play } from "lucide-react";

const About = () => {
  return (
    <section className="w-full bg-white text-gray-900">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh] md:h-[70vh] overflow-hidden">
        <img
          src="/images/solar-hero.jpg"
          alt="Solar panels"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-10 left-6 md:left-16 max-w-2xl text-white">
          <p className="text-sm md:text-base uppercase mb-2">About Us</p>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            <span className="text-blue-400">Passionate</span> <br />
            and sustainable
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        {/* Two-paragraph section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-12 mb-12">
        {/* Left paragraph */}
        <p className="text-lg md:text-xl font-medium md:w-1/2">
            We are proud to offer a wide range of solar energy services, including{" "}
            <span className="font-semibold">
            solar panel installation, maintenance, and repair.
            </span>
        </p>

        {/* Right paragraph */}
        <p className="text-gray-600 leading-relaxed mt-8 md:mt-0 md:w-1/2 md:text-right">
            Our commitment to sustainability is at the heart of everything we do. We
            believe that solar energy is the key to a more sustainable future, and we
            are dedicated to making it accessible to everyone. That’s why we offer
            competitive pricing and financing options to help make solar energy more
            affordable for our clients.
        </p>
        </div>

        {/* Video Section */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg mb-12">
        <video
            src="/images/solar-house.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[400px] object-cover">
        </video>
        <p className="absolute bottom-4 left-6 text-white text-lg md:text-xl">
            What solar can make{" "}
            <span className="text-orange-500 font-semibold">changes.</span>
        </p>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-orange-500">210+</p>
            <p className="text-gray-500">Commercial Installations</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-orange-500">510+</p>
            <p className="text-gray-500">Residentials</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-orange-500">18GW</p>
            <p className="text-gray-500">Power Produced</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-orange-500">15%</p>
            <p className="text-gray-500">City’s Electricity Supply</p>
          </div>
        </div>
      </div>

      {/* Contact / Newsletter Section */}
      <div className="bg-orange-50 py-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-orange-600 mb-3">
              Stay up to date on the latest Sunno news
            </h2>
            <p className="text-gray-600 mb-6">
              For any enquiries, questions, or comments please fill out the following form.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full sm:flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                className="bg-orange-500 text-white font-semibold rounded-xl px-6 py-3 hover:bg-orange-600 transition"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Vision Section */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our vision</h3>
            <p className="text-gray-600 mb-6">
              Our commitment to sustainability is at the heart of everything we do.
              We believe that solar energy is the key to a more sustainable future,
              and we are dedicated to making it accessible to everyone.
            </p>
            <button className="bg-orange-500 text-white rounded-xl px-6 py-3 font-semibold hover:bg-orange-600">
              Get a Quote
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;