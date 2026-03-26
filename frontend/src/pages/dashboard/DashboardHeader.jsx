import React from 'react';
import { Link } from 'react-router-dom';
import ThemedIcon from '../../components/ThemedIcon';

export default function DashboardHeader() {
  return (
    <div className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-pri/70 mb-1">
              <Link to="/" className="hover:text-pri">Home</Link> / <span className="text-pri font-medium">Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold text-ink">My Dashboard</h1>
            <p className="text-sm text-pri/70 mt-1">Track your selling activity</p>
          </div>
          <Link
            to="/sell"
            className="flex items-center gap-2 px-4 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark transition-all shadow-md"
          >
            <ThemedIcon name="plus" size={16} color="#ffffff" /> Sell an Item
          </Link>
        </div>
      </div>
    </div>
  );
}
