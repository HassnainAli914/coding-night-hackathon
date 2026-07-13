import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import DropdownProfile from "../../DropdownProfile";

import Logo from "./logo";

export default function Header({ isPublicRoute = false, searchBar = null }) {
  const { user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `/#${id}`);
    }
  };

  return (
    <header className="fixed top-2 md:top-6 z-50 w-full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex items-center justify-between gap-3 bg-gray-950/90 backdrop-blur-md shadow-2xl shadow-black/20 h-14 px-3 rounded-2xl border border-gray-800/50">
          {/* Site branding and search */}
          <div className="flex flex-1 items-center gap-4">
            <Logo />
            {searchBar}
          </div>

          {/* Desktop navigation links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <a
              href="/#categories"
              onClick={(e) => handleScroll(e, "categories")}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Categories
            </a>
            <a
              href="/#features"
              onClick={(e) => handleScroll(e, "features")}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="/#pricing"
              onClick={(e) => handleScroll(e, "pricing")}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="/#testimonials"
              onClick={(e) => handleScroll(e, "testimonials")}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Testimonials
            </a>
            <Link
              to="/public/assets"
              className="text-sm font-medium text-violet-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Public Assets
            </Link>
            <Link
              to="/track"
              className="text-sm font-medium text-violet-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Track Ticket
            </Link>
          </nav>

          {/* Desktop sign in links / user profile */}
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin hidden sm:block"></div>
            ) : user ? (
              <div className="hidden lg:flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <DropdownProfile align="right" dark={true} />
              </div>
            ) : (
              <ul className="hidden lg:flex items-center gap-4">
                <li>
                  <Link
                    to="/signin"
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="btn-sm bg-blue-600 text-white shadow-md hover:bg-blue-500 transition-all duration-150"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden ml-2 text-gray-400 hover:text-white transition-colors p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full px-4 sm:px-6 mt-2 z-40 transition-all">
          <div className="mx-auto max-w-6xl rounded-2xl bg-gray-950/95 backdrop-blur-xl border border-gray-800 shadow-2xl p-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-4 px-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
              <a href="/#categories" onClick={(e) => { handleScroll(e, "categories"); setMobileMenuOpen(false); }} className="text-base font-medium text-gray-300 hover:text-white transition-colors">Categories</a>
              <a href="/#features" onClick={(e) => { handleScroll(e, "features"); setMobileMenuOpen(false); }} className="text-base font-medium text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="/#pricing" onClick={(e) => { handleScroll(e, "pricing"); setMobileMenuOpen(false); }} className="text-base font-medium text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="/#testimonials" onClick={(e) => { handleScroll(e, "testimonials"); setMobileMenuOpen(false); }} className="text-base font-medium text-gray-300 hover:text-white transition-colors">Testimonials</a>
              <Link to="/public/assets" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-violet-300 hover:text-white transition-colors">Public Assets</Link>
              <Link to="/track" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-violet-300 hover:text-white transition-colors">Track Ticket</Link>
            </nav>

            <hr className="border-gray-800 my-2 mx-2" />

            {user ? (
              <div className="flex flex-col gap-4 px-2 pb-2">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                <div className="flex items-center mt-2" onClick={() => setMobileMenuOpen(false)}>
                  <DropdownProfile align="left" dark={true} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 px-2 pb-2">
                <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-blue-600 text-white font-medium shadow-md hover:bg-blue-500 transition-all duration-150 text-center py-2.5 rounded-lg">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
