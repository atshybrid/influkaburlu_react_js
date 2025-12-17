import React from 'react';
import SeoHead from '../components/SeoHead';

export default function PrivacyPolicy() {
  return (
    <main className="py-10">
      <SeoHead title="Privacy Policy" description="Privacy policy for Influ Kaburlu." canonical="" />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-4 text-gray-700 max-w-3xl">
        We collect and process information you provide to operate the platform (account creation, authentication,
        collaborations, and support). We do not sell personal data.
      </p>
      <p className="mt-3 text-gray-700 max-w-3xl">
        For questions or deletion requests, contact{' '}
        <a className="text-orange-700 hover:underline" href="mailto:support@kaburlumedia.com">
          support@kaburlumedia.com
        </a>
        .
      </p>
    </main>
  );
}
