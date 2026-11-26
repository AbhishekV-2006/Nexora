import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center space-x-3">
          <Link to={isAuthenticated() ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 font-bold text-white shadow-lg shadow-indigo-500/30">N</div>
            <div>
              <div className="text-lg font-semibold text-white">Nexora</div>
              <div className="text-xs text-slate-400">Premium marketplace</div>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-2 text-sm text-slate-300 sm:gap-4">
          <Link to="/projects" className="rounded-full px-3 py-2 transition hover:bg-slate-800 hover:text-white">Projects</Link>
          <Link to="/messages" className="rounded-full px-3 py-2 transition hover:bg-slate-800 hover:text-white">Messages</Link>
          <Link to="/payments" className="rounded-full px-3 py-2 transition hover:bg-slate-800 hover:text-white">Payments</Link>
          {isAuthenticated() ? (
            <div className="flex items-center gap-2">
              <Link to="/profile/edit" className="rounded-full bg-indigo-600 px-3 py-2 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500">Edit Profile</Link>
              <button onClick={() => logout()} className="rounded-full px-3 py-2 transition hover:bg-slate-800 hover:text-white">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full px-3 py-2 transition hover:bg-slate-800 hover:text-white">Login</Link>
              <Link to="/register" className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 font-medium text-white shadow-lg shadow-indigo-500/20">Get started</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
