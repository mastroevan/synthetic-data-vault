import React from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-end justify-center bg-gray-900 py-12 pr-12">
      <Image
        src="/bgimage.jpg"
        alt="Background"
        fill
        quality={100}
        className="absolute inset-0 object-cover opacity-80"
      />
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full h-1/2 justify-center">
        <div className="bg-gray-800 bg-opacity-75 p-8 rounded-lg shadow-xl w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
