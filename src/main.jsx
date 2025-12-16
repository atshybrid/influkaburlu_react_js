import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Ads from './pages/Ads';
import ProfileBuilder from './pages/ProfileBuilderAdvanced';
import Login from './pages/Login';
import GetStarted from './pages/GetStarted';
import Brands from './pages/Brands';
import BrandRegister from './pages/BrandRegister';
import PublicInfluencerProfile from './pages/PublicInfluencerProfile';
import InfluencersList from './pages/InfluencersList';
import DashboardInfluencer from './pages/DashboardInfluencer';
import DashboardAdvertiser from './pages/DashboardAdvertiser';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SeoHead from './components/SeoHead';
import { getRoleFromToken, normalizeRole } from './utils/apiClient';
import './styles.css';

function App(){
	return (
		<HelmetProvider>
			<BrowserRouter>
				<Navbar />
				<div className="max-w-6xl mx-auto px-6">
					<Routes>
						<Route path="/" element={<Landing/>} />
						<Route path="/home" element={<Home/>} />
						<Route path="/ads" element={<Ads/>} />
						<Route path="/profile-builder" element={<ProfileBuilder/>} />
						<Route path="/login" element={<Login/>} />
                    	<Route path="/get-started" element={<GetStarted/>} />
						<Route path="/brands" element={<Brands/>} />
                    	<Route path="/register/brand" element={<BrandRegister/>} />
						<Route path="/influencers" element={<InfluencersList/>} />
						<Route path="/influencer/:slug" element={<PublicInfluencerProfile/>} />
						<Route path="/dashboard/influencer" element={<RequireAuth role="influencer"><DashboardInfluencer/></RequireAuth>} />
						<Route path="/dashboard/advertiser" element={<RequireAuth role="advertiser"><DashboardAdvertiser/></RequireAuth>} />
						<Route path="/dashboard-influencer" element={<RequireAuth role="influencer"><DashboardInfluencer/></RequireAuth>} />
						<Route path="/dashboard-advertiser" element={<RequireAuth role="advertiser"><DashboardAdvertiser/></RequireAuth>} />
						<Route path="/admin" element={<Admin/>} />
					</Routes>
				</div>
				<Footer />
			</BrowserRouter>
		</HelmetProvider>
	)
}

createRoot(document.getElementById('root')).render(<App />);

export default App;

function RequireAuth({ children, role }){
	const token = localStorage.getItem('auth.token');
	const user = safeParse(localStorage.getItem('auth.user'));
	const userRole = normalizeRole(user?.role);
	const tokenRole = normalizeRole(getRoleFromToken(token));
	const effectiveRole = userRole || tokenRole;
	const okRole = role ? effectiveRole === role : true;
	if (!token || (role && !okRole)) {
		const next = window.location.pathname + window.location.search;
		window.location.replace(`/login?next=${encodeURIComponent(next)}`);
		return null;
	}
	const title = role === 'influencer' ? 'Influencer Dashboard' : role === 'advertiser' ? 'Advertiser Dashboard' : 'Dashboard';
	return (
		<>
			<SeoHead title={title} noindex />
			{children}
		</>
	);
}

function safeParse(str){
	try { return str ? JSON.parse(str) : null; } catch { return null; }
}