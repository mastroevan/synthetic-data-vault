"use client";
import { useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Synthetic Data Vault</h1>
      <p className="text-lg text-gray-600 mb-6 text-center max-w-xl">
        Generate realistic, privacy-safe datasets on demand.
      </p>

      {/* Button to open modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700"
      >
        Join the Waitlist
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4 relative">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>

            {/* Embedded Google Form */}
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdMMGGaP9jtM_XThafpABdSStK6dKN2r4Y1lhGFExYf8E2L_Q/viewform?embedded=true"
             width="640" 
             height="2453" 
             frameBorder="0" 
             marginHeight={0} 
             marginWidth={0}>
            Loading…
            </iframe>
          </div>
        </div>
      )}
    </main>
  );
}