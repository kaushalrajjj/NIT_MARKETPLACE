import React from 'react';

export default function AuthHeading({ mode }) {
  return (
    <div className="mb-5">
      <h1 className="text-[1.35rem] font-extrabold text-ink">
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </h1>
      <p className="text-xs text-ink-3 mt-0.5">
        {mode === 'login'
          ? 'Login to your campus marketplace account'
          : 'Join the NIT Kurukshetra campus marketplace'}
      </p>
    </div>
  );
}
