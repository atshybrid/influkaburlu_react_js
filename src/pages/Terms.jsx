import React from 'react';
import SeoHead from '../components/SeoHead';

export default function Terms() {
  return (
    <main className="py-10">
      <SeoHead title="Terms" description="Terms of service for Influ Kaburlu." canonical="" />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Terms</h1>
      <p className="mt-4 text-gray-700 max-w-3xl">
        By using Influ Kaburlu, you agree to use the platform lawfully and provide accurate information.
        Accounts may be suspended for abuse or misuse.
      </p>
    </main>
  );
}
