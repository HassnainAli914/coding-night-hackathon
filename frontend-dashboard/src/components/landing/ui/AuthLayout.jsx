import React from "react";
import Logo from "./logo";
import TerminalTyping from "./TerminalTyping";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip bg-white text-gray-900">
      <header className="absolute z-30 w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Site branding */}
            <div className="mr-4 shrink-0">
              <Logo />
            </div>
          </div>
        </div>
      </header>

      <main className="relative flex grow">
        <div
          className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3"
          aria-hidden="true"
        >
          <div className="h-80 w-80 rounded-full bg-linear-to-tr from-blue-500 opacity-70 blur-[160px]"></div>
        </div>

        {/* Content */}
        <div className="w-full">
          <div className="flex h-full flex-col justify-center before:min-h-[4rem] before:flex-1 after:flex-1 md:before:min-h-[5rem]">
            <div className="px-4 sm:px-6">
              <div className="mx-auto w-full max-w-sm">
                <div className="py-16 md:py-20">{children}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="relative my-6 mr-6 hidden w-[572px] shrink-0 overflow-hidden rounded-2xl bg-blue-50 lg:block">
          {/* Background SVG fills full panel */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            <img
              src="/images/auth-bg.svg"
              className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
              width="1285"
              height="1684"
              alt="Auth bg"
            />
          </div>
          {/* Terminal Illustration */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2">
            <div className="w-full rounded-2xl bg-gray-900 px-5 py-3 shadow-xl" style={{aspectRatio: '16/9'}}>
              {/* Terminal header: dots + title */}
              <div className="relative mb-8 flex items-center justify-between">
                {/* Traffic light dots */}
                <div className="flex items-center gap-1.5">
                  <div className="h-[9px] w-[9px] rounded-full bg-gray-600"></div>
                  <div className="h-[9px] w-[9px] rounded-full bg-gray-600"></div>
                  <div className="h-[9px] w-[9px] rounded-full bg-gray-600"></div>
                </div>
                <span className="text-[13px] font-medium text-white">simple.com</span>
                <div className="w-[41px]"></div>
              </div>
              {/* Typing effect terminal */}
              <TerminalTyping />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
