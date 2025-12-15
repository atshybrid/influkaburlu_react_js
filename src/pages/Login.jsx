import React, { useRef, useState } from 'react';
import { apiClient, getRoleFromToken, normalizeRole, saveTokens } from '../utils/apiClient';
import { Link, useSearchParams } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Login(){
	const [phone, setPhone] = useState('');
	const [mpinDigits, setMpinDigits] = useState(['','','','','','']);
	const boxesRef = useRef([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [params] = useSearchParams();
	const next = params.get('next');

	const mpin = mpinDigits.join('');

	const handleDigitChange = (idx, val) => {
		const v = (val || '').replace(/[^0-9]/g, '').slice(0,1);
		const nextDigits = [...mpinDigits];
		nextDigits[idx] = v;
		setMpinDigits(nextDigits);
		if (v && boxesRef.current[idx+1]) boxesRef.current[idx+1].focus();
	};

	const handleDigitKeyDown = (idx, e) => {
		if (e.key === 'Backspace' && !mpinDigits[idx] && boxesRef.current[idx-1]) {
			boxesRef.current[idx-1].focus();
		}
	};

	const login = async (e) => {
		e?.preventDefault();
		if (phone.length !== 10 || mpin.length !== 6) {
			setError('Enter 10-digit phone and 6-digit MPIN.');
			return;
		}
		setLoading(true); setError('');
		try {
				// Use centralized apiClient to ensure correct base URL and headers
				const data = await apiClient.request('/auth/login-mobile', {
					method: 'POST',
					body: JSON.stringify({ phone, mpin }),
				});

			saveTokens({
				token: data?.token,
				refreshToken: data?.refreshToken,
				expiresAt: data?.expiresAt,
				refreshExpiresAt: data?.refreshExpiresAt,
				user: data?.user,
			});

			const resolvedRole = normalizeRole(data?.user?.role) || getRoleFromToken(data?.token);
			const redirect = next || (resolvedRole === 'influencer' ? '/dashboard-influencer' : '/dashboard-advertiser');
			window.location.href = redirect;
		} catch (e) {
			console.error('Login error:', e);
			const msg = e?.message || e?.response?.data?.message || 'Login failed. Please check your phone and MPIN.';
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const [showReset, setShowReset] = useState(false);
	const [otp, setOtp] = useState('');
	const [newDigits, setNewDigits] = useState(['','','','','','']);
	const newRefs = useRef([]);

	const requestOtp = async () => {
		setLoading(true); setError('');
		try {
				await apiClient.request('/auth/request-mpin-reset', {
					method: 'POST',
					body: JSON.stringify({ phone })
				});
				setShowReset(true);
			} catch (e) {
				console.error('Request OTP error:', e);
				setError(e?.message || 'Failed to request OTP.');
		} finally {
			setLoading(false);
		}
	};

	const handleNewDigitChange = (idx, val) => {
		const v = (val || '').replace(/[^0-9]/g, '').slice(0,1);
		const nextDigits = [...newDigits];
		nextDigits[idx] = v;
		setNewDigits(nextDigits);
		if (v && newRefs.current[idx+1]) newRefs.current[idx+1].focus();
	};

	const verifyReset = async () => {
		const newMpin = newDigits.join('');
		if (otp.length !== 6 || newMpin.length !== 6) { setError('Enter 6-digit OTP and new MPIN.'); return; }
		setLoading(true); setError('');
		try {
				const r = await apiClient.request('/auth/verify-mpin-reset', {
					method: 'POST',
					body: JSON.stringify({ phone, otp, newMpin })
				});
				if (r?.success) {
				setShowReset(false);
				setOtp('');
				setNewDigits(['','','','','','']);
			}
			} catch (e) {
				console.error('Verify reset error:', e);
				setError(e?.message || 'Failed to verify OTP.');
		} finally { setLoading(false); }
	};

	return (
		<section className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50">
			<div className="max-w-7xl mx-auto px-4 pt-20 pb-16">
				<div className="grid md:grid-cols-2 gap-8 items-center">
					<div>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white ring-1 ring-gray-200 text-xs text-gray-700">Secure login</div>
						<h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Sign in to Influ Kaburlu</h1>
						<p className="mt-2 text-sm text-gray-600">Access your campaigns, collaborations, and insights all in one place.</p>
						<div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
							<Link to="/get-started?role=influencer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 text-gray-800">Create Creator account</Link>
							<Link to="/register/brand" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 text-gray-800">Create Brand account</Link>
						</div>
					</div>
					<div className="mx-auto w-full max-w-md">
						<div className="rounded-2xl p-[1px] bg-gradient-to-br from-orange-200 to-pink-200">
							<div className="rounded-2xl bg-white p-6">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-bold text-gray-900">Welcome back</h2>
									<Link to="/get-started" className="text-xs text-orange-600">Create account</Link>
								</div>
								{error && <div className="mt-3 text-xs text-red-600">{error}</div>}
								<form className="mt-4 space-y-4" onSubmit={login}>
									<label className="block text-sm text-gray-700">Mobile Number</label>
									<div className="flex items-center gap-2">
										<div className="h-12 px-3 rounded-md bg-gray-100 text-sm text-gray-700 inline-flex items-center">+91</div>
										<input type="tel" inputMode="numeric" maxLength={10} required placeholder="88888 88888" value={phone} className="flex-1 h-12 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 tracking-wider" onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0,10))} />
									</div>

									<label className="block text-sm text-gray-700">Enter 6-digit MPIN</label>
									<div className="grid grid-cols-6 gap-2">
										{mpinDigits.map((d, i) => (
											<input key={i} ref={el => boxesRef.current[i] = el} type="password" inputMode="numeric" maxLength={1} value={d} onChange={(e)=>handleDigitChange(i, e.target.value)} onKeyDown={(e)=>handleDigitKeyDown(i, e)} className="h-12 text-center rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-lg" />
										))}
									</div>
									<div className="flex items-center justify-between">
										<button type="button" onClick={requestOtp} disabled={loading || !phone || phone.length !== 10} className="text-xs text-orange-600">Forgot MPIN?</button>
										<button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600">
											{loading ? 'Signing in…' : 'Sign in'}
										</button>
									</div>
								</form>
								{showReset && (
									<div className="fixed inset-0 z-50 flex items-center justify-center">
										<div className="absolute inset-0 bg-black/40" onClick={()=>setShowReset(false)}></div>
										<div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
											<div className="flex items-center justify-between">
												<h3 className="text-lg font-semibold">Reset MPIN</h3>
												<button className="text-gray-500" onClick={()=>setShowReset(false)}>✕</button>
											</div>
											<p className="mt-1 text-xs text-gray-600">An OTP has been sent to {phone}.</p>
											<div className="mt-4 space-y-3">
												<label className="block text-sm text-gray-700">Enter OTP</label>
												<input type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={otp} className="w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 px-3 py-2" onChange={e=>setOtp(e.target.value.replace(/[^0-9]/g,'').slice(0,6))} />
												<label className="block text-sm text-gray-700">Set new 6-digit MPIN</label>
												<div className="grid grid-cols-6 gap-2">
													{newDigits.map((d, i) => (
														<input key={i} ref={el => newRefs.current[i] = el} type="password" inputMode="numeric" maxLength={1} value={d} onChange={(e)=>handleNewDigitChange(i, e.target.value)} className="h-12 text-center rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-lg" />
													))}
												</div>
												<div className="flex items-center justify-end gap-2">
													<button className="px-3 py-2 rounded-md text-sm bg-gray-100" onClick={()=>setShowReset(false)}>Cancel</button>
													<button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-900" onClick={verifyReset} disabled={loading || otp.length!==6 || newDigits.join('').length!==6}>Verify & Update</button>
												</div>
											</div>
										</div>
									</div>
								)}
								<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<div className="mb-1 text-xs text-gray-700">Continue with Google (Creator)</div>
										<GoogleAuthButton
											role="influencer"
											onSuccess={(auth) => {
												const role = auth?.user?.role || 'influencer';
												const redirect = next || (role === 'influencer' ? '/dashboard-influencer' : '/dashboard-advertiser');
												window.location.href = redirect;
											}}
											onError={(e) => {
												setError(e?.message || 'Google sign-in failed.');
											}}
										/>
									</div>
									<div>
										<div className="mb-1 text-xs text-gray-700">Continue with Google (Brand)</div>
										<GoogleAuthButton
											role="brand"
											onSuccess={(auth) => {
												const role = auth?.user?.role || 'brand';
												const redirect = next || (role === 'influencer' ? '/dashboard-influencer' : '/dashboard-advertiser');
												window.location.href = redirect;
											}}
											onError={(e) => {
												setError(e?.message || 'Google sign-in failed.');
											}}
										/>
									</div>
								</div>
							</div>
						</div>
						<p className="mt-3 text-xs text-gray-600 text-center">By continuing, you agree to our Terms and Privacy Policy.</p>
					</div>
				</div>
			</div>
		</section>
	);
}
