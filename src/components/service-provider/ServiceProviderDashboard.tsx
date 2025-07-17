import React from 'react';

export const ServiceProviderDashboard: React.FC = () => {
  // This dashboard now only manages services. Business registration is handled in its own route/component.
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
      <p className="mb-4 text-muted-foreground">Use the navigation to register your business or manage your services.</p>
      {/* Optionally, you can add dashboard stats or quick links here. */}
    </div>
  );
};
