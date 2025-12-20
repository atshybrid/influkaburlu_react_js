import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../utils/apiClient';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth.token');
    const user = localStorage.getItem('auth.user');
    setAuthed(!!token);
    try { setRole(user ? JSON.parse(user)?.role || '' : ''); } catch { setRole(''); }
  }, []);

  async function handleLogout() {
    if (loggingOut) return; // prevent double clicks
    setLoggingOut(true);
    try {
      setAuthed(false);
      setRole('');
      // Fire-and-forget; apiClient.logout clears session immediately
      logout().catch(() => {});
      // Use navigate then hard replace to avoid back to authed state
      navigate('/');
      setTimeout(() => {
        window.location.replace('/');
      }, 50);
    } finally {
      setLoggingOut(false);
    }
  }
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-200/80 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-18 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center py-1">
          <img src="/assets/brand-logo.png" alt="Influ Kaburlu" className="h-20 w-20 md:h-24 md:w-24 object-contain" onError={(e)=>{e.currentTarget.src='/assets/brand-logo.png'}} />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <Link to="/">Home</Link>
          <a href="#influencers">Creators</a>
          <a href="#why-brands">Why Brands</a>
          <a href="#case-studies">Results</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          {!authed ? (
            <Link to="/login" className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50">Login</Link>
          ) : (
            <>
              {role === 'superadmin' ? (
                <Link to="/super-admin" className="px-3 py-2 rounded-md text-sm bg-gray-900 text-white">Super Admin</Link>
              ) : role === 'admin' ? (
                <Link to="/admin" className="px-3 py-2 rounded-md text-sm bg-gray-900 text-white">Admin</Link>
              ) : role === 'influencer' ? (
                <Link to="/dashboard-influencer" className="px-3 py-2 rounded-md text-sm bg-gray-900 text-white">My Dashboard</Link>
              ) : (
                <Link to="/dashboard-advertiser" className="px-3 py-2 rounded-md text-sm bg-gray-900 text-white">My Dashboard</Link>
              )}
              <button onClick={handleLogout} disabled={loggingOut} className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-50">{loggingOut ? 'Logging out…' : 'Logout'}</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
