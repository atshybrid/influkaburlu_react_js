import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SeoHead from '../components/SeoHead';
import useSeoPage from '../hooks/useSeoPage';

export default function Ads() {
	const { seo } = useSeoPage('ads');
	const [ads, setAds] = useState([]);

	useEffect(() => {
		axios.get(import.meta.env.VITE_API_URL + '/ads?state=Telangana').then(r => setAds(r.data)).catch(() => {});
	}, []);

	return (
		<main>
			<SeoHead
				title={seo?.title || 'Ads'}
				description={seo?.description || ''}
				keywords={seo?.keywords || ''}
				canonical={seo?.canonical || ''}
				ogImage={seo?.ogImage || ''}
				schema={seo?.schema || null}
				noindex={seo?.indexed === false}
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{ads.length === 0 ? (
					<div className="p-6 bg-white rounded shadow">No ads (run backend seed)</div>
				) : (
					ads.map(a => (
						<div key={a.id} className="p-4 bg-white rounded shadow">
							<h3 className="font-semibold text-lg">{a.title}</h3>
							<p className="text-sm text-gray-600">{a.description}</p>
							<div className="mt-2 text-sm"><strong>Pay:</strong> ₹{a.payPerInfluencer}</div>
							<div className="mt-2 text-xs text-gray-500">Targets: {a.targetStates && a.targetStates.join(', ')}</div>
						</div>
					))
				)}
			</div>
		</main>
	);
}