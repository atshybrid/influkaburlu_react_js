import React from 'react';
import SeoHead from '../components/SeoHead';

export default function About() {
  return (
    <main className="py-10">
      <SeoHead
        title="About"
        description="Influ Kaburlu is an influencer marketing and brand collaboration platform."
        canonical=""
      />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">About Influ Kaburlu</h1>
      <p className="mt-4 text-gray-700 max-w-3xl">
        Influ Kaburlu helps brands discover creators, run collaborations, and measure outcomes.
      </p>
    </main>
  );
}
