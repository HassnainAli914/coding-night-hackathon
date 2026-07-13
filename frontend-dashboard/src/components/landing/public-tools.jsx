import React from 'react';
import { Link } from 'react-router-dom';

export default function PublicTools() {
  return (
    <section className="bg-slate-50/50 py-12 md:py-20 border-y border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center pb-12 md:pb-16">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Open Access Tools
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Anyone can view the asset directory or track their reported issues. No account required.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Public Assets Card */}
          <div className="group relative rounded-3xl bg-white p-8 shadow-lg shadow-black/[0.03] transition-all hover:shadow-xl hover:-translate-y-1 border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100 to-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 mb-8">
              <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Public Asset Directory</h3>
              <p className="text-slate-600">Scan QR codes or browse all facility assets. Report issues instantly directly from an asset's public page.</p>
            </div>
            
            <Link to="/public/assets" className="relative z-10 inline-flex items-center text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              Browse Assets
              <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>

          {/* Track Ticket Card */}
          <div className="group relative rounded-3xl bg-white p-8 shadow-lg shadow-black/[0.03] transition-all hover:shadow-xl hover:-translate-y-1 border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 mb-8">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Track a Ticket</h3>
              <p className="text-slate-600">Already reported an issue? Enter your Ticket ID to get real-time status updates on maintenance progress.</p>
            </div>
            
            <Link to="/track" className="relative z-10 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Track Status
              <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
