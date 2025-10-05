import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Column 1 - Company Info */}
        <div>
          <h2 className="text-2xl font-bold text-orange-500 mb-4">SolarWind</h2>
          <p className="text-sm leading-relaxed mb-4">
            Empowering communities through renewable energy. 
            At SolarWind, we believe in a sustainable tomorrow — 
            one powered by clean and affordable solar solutions.
          </p>
          <p className="text-sm">Nairobi, Kenya</p>
          <p className="text-sm">Email: contact@solarwind.com</p>
        </div>

        {/* Column 2 - Links */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-orange-400">About Us</a></li>
              <li><a href="" className="hover:text-orange-400">Services</a></li>
              <li><a href="/careers" className="hover:text-orange-400">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/blog" className="hover:text-orange-400">Blog</a></li>
              <li>
                <Link to="/insight#faq" className="hover:text-orange-400">
                  FAQ
                </Link>
              </li>
              <li><a href="" className="hover:text-orange-400">Contact</a></li>
              <li><a href="" className="hover:text-orange-400">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Column 3 - Socials & Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Stay Connected</h3>
          <p className="text-sm mb-4">
            Join our newsletter to stay updated on solar innovations and offers.
          </p>
          <form className="flex mb-6">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600"
            >
              Join
            </button>
          </form>

          {/* Social Icons */}
          <div className="flex space-x-4">
            <a href="#" className="hover:text-orange-400"><Facebook size={18} /></a>
            <a href="#" className="hover:text-orange-400"><Twitter size={18} /></a>
            <a href="#" className="hover:text-orange-400"><Instagram size={18} /></a>
            <a href="#" className="hover:text-orange-400"><Linkedin size={18} /></a>
            <a href="mailto:contact@solarwind.com" className="hover:text-orange-400"><Mail size={18} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} <span className="text-orange-400 font-semibold">SolarWind</span>. 
          All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;