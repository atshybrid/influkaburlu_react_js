import React from 'react';
import SeoHead from '../components/SeoHead';

export default function Contact() {
  return (
    <main className="py-10">
      <SeoHead title="Contact" description="Contact Influ Kaburlu support." canonical="" />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Contact</h1>
      <p className="mt-4 text-gray-700 max-w-3xl">For support and business inquiries, reach out via email.</p>
      <div className="mt-4 text-gray-700">
        <div className="font-medium">Email</div>
        <a className="text-orange-700 hover:underline" href="mailto:support@kaburlumedia.com">
          support@kaburlumedia.com
        </a>
      </div>
    </main>
  );
}
