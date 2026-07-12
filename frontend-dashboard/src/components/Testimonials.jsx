import React from 'react';

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-20 sm:py-24 bg-slate-100 dark:bg-neutral-900"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2
            data-motion="heading"
            className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4"
            style={{
              opacity: 1,
              transform: "translateY(0px)",
              filter: "blur(0px)"
            }}
          >
            <span data-animate="heading" style={{ opacity: 1 }}>
              <span
                className="motion-word"
                style={{
                  display: "inline-block",
                  opacity: 1,
                  transform: "translateY(0px)",
                  filter: "blur(0px)"
                }}
              >
                Customer
              </span>{" "}
              <span
                className="motion-word"
                style={{
                  display: "inline-block",
                  opacity: 1,
                  transform: "translateY(0px)",
                  filter: "blur(0px)"
                }}
              >
                stories
              </span>
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Large card */}
          <div
            data-motion="card"
            className="md:col-span-2 md:row-span-2 bg-blue-600 rounded-3xl p-8 flex flex-col justify-between"
            style={{
              opacity: 1,
              transform: "translateY(0px)",
              filter: "blur(0px)"
            }}
          >
            <div>
              <svg
                className="w-12 h-12 text-blue-300 mb-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                "This platform completely transformed how we work. Our team is more
                productive, more aligned, and happier than ever before."
              </blockquote>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <img
                data-motion="image"
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
                alt="Sarah"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white/30"
                style={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
              />
              <div>
                <p className="text-white font-semibold">Sarah Mitchell</p>
                <p className="text-blue-200">CEO at TechFlow Inc.</p>
              </div>
            </div>
          </div>
          {/* Small cards */}
          <div
            data-motion="card"
            className="bg-white dark:bg-neutral-800 rounded-3xl p-6"
            style={{
              opacity: 1,
              transform: "translateY(0px)",
              filter: "blur(0px)"
            }}
          >
            <p className="text-slate-700 dark:text-neutral-300 mb-4">
              "Best investment we've made this year. The ROI was visible within
              weeks."
            </p>
            <div className="flex items-center gap-3">
              <img
                data-motion="avatar"
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="James"
                className="w-10 h-10 rounded-full object-cover"
                style={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  James Chen
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  CTO at StartupX
                </p>
              </div>
            </div>
          </div>
          <div
            data-motion="card"
            className="bg-white dark:bg-neutral-800 rounded-3xl p-6"
            style={{
              opacity: 1,
              transform: "translateY(0px)",
              filter: "blur(0px)"
            }}
          >
            <p className="text-slate-700 dark:text-neutral-300 mb-4">
              "The customer support is exceptional. They truly care about our
              success."
            </p>
            <div className="flex items-center gap-3">
              <img
                data-motion="avatar"
                src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="Emily"
                className="w-10 h-10 rounded-full object-cover"
                style={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  Emily Davis
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  VP at GlobalCorp
                </p>
              </div>
            </div>
          </div>
          <div
            data-motion="card"
            className="bg-white dark:bg-neutral-800 rounded-3xl p-6"
            style={{
              opacity: 1,
              transform: "translateY(0px)",
              filter: "blur(0px)"
            }}
          >
            <p className="text-slate-700 dark:text-neutral-300 mb-4">
              "Simple, powerful, and exactly what we needed. No bloat, just
              results."
            </p>
            <div className="flex items-center gap-3">
              <img
                data-motion="avatar"
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="David"
                className="w-10 h-10 rounded-full object-cover"
                style={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  David Park
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Founder at LaunchPad
                </p>
              </div>
            </div>
          </div>
          <div
            data-motion="card"
            className="md:col-span-2 bg-white dark:bg-neutral-800 rounded-3xl p-6 flex items-center gap-6"
            style={{
              opacity: 1,
              transform: "translateY(0px)",
              filter: "blur(0px)"
            }}
          >
            <img
              data-motion="image"
              src="https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150"
              alt="Lisa"
              className="w-16 h-16 rounded-full object-cover"
              style={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
            />
            <div>
              <p className="text-slate-700 dark:text-neutral-300 mb-2">
                "Our team collaboration improved by 200%. Everyone loves using it
                daily."
              </p>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                Lisa Brown{" "}
                <span className="font-normal text-blue-600 dark:text-blue-400">
                  • PM at DesignCo
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
  );
}
