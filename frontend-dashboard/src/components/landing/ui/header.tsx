import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import DropdownProfile from "../../DropdownProfile";

import Logo from "./logo";

export default function Header() {
  const { user, isLoading } = useAuth();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `/#${id}`);
    }
  };

  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-gray-950/80 px-3 shadow-2xl shadow-black/20 backdrop-blur-md border border-gray-800/50">
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* Desktop navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/#home"
              onClick={(e) => handleScroll(e, "home")}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Home
            </a>
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
          </nav>

          {/* Desktop sign in links / user profile */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <DropdownProfile align="right" dark={true} />
              </div>
            ) : (
              <ul className="flex items-center gap-4">
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
          </div>
        </div>
      </div>
    </header>
  );
}
