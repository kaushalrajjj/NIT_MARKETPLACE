import React from 'react';
import { Link } from 'react-router-dom';

export default function PageHeader({ breadcrumb, title, subtitle, action }) {
  // breadcrumb: [{ label, to }] — last item is current page (no link)
  return (
    <div className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            {breadcrumb && (
              <div className="text-xs text-pri/70 mb-1">
                {breadcrumb.map((crumb, i) =>
                  crumb.to ? (
                    <React.Fragment key={i}>
                      <Link to={crumb.to} className="hover:text-pri">{crumb.label}</Link>
                      <span className="mx-1">/</span>
                    </React.Fragment>
                  ) : (
                    <span key={i} className="text-pri font-medium">{crumb.label}</span>
                  )
                )}
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
            {subtitle && <p className="text-sm text-pri/70 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  );
}
