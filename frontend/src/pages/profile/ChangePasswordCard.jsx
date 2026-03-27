import React from 'react';

/**
 * ChangePasswordCard — two-step password change with OTP verification.
 *
 * Step 1 (otpSent=false): User enters current + new + confirm password → clicks "Update Password"
 *   → backend verifies current password and sends OTP to registered email.
 * Step 2 (otpSent=true): User enters the 6-digit OTP → clicks "Confirm Change"
 *   → backend verifies OTP and persists the new password.
 *
 * Props:
 *   currentPass, newPass, confirmPass  — controlled input values (step 1)
 *   saving       — boolean: show spinner on action button
 *   otpSent      — boolean: whether step 2 is active
 *   otpDigits    — string[6]: individual digit values for OTP boxes
 *   otpError     — string|null: OTP-level error message
 *   expirySec    — number: seconds until OTP expires (counts down)
 *   resendCd     — number: seconds until resend is allowed
 *
 *   onCurrent, onNew, onConfirm   — step-1 change handlers
 *   onSendOtp    — handler: called when "Update Password" is clicked (sends OTP)
 *   onOtpChange(idx, val)         — step-2 digit change
 *   onOtpKeyDown(idx, e)          — step-2 key handler (backspace navigation)
 *   onOtpPaste(e)                 — step-2 paste handler
 *   onVerifyOtp  — handler: called when "Confirm Change" is clicked
 *   onResend     — handler: re-send OTP
 *   onBack       — handler: go back to step 1
 */
export default function ChangePasswordCard({
  currentPass, newPass, confirmPass,
  saving, otpSent,
  otpRefs, otpDigits, otpError, expirySec, resendCd,
  onCurrent, onNew, onConfirm,
  onSendOtp, onOtpChange, onOtpKeyDown, onOtpPaste,
  onVerifyOtp, onResend, onBack,
}) {
  const mm = String(Math.floor((expirySec || 0) / 60)).padStart(2, '0');
  const ss = String((expirySec || 0) % 60).padStart(2, '0');

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <h3 className="font-bold text-ink mb-1">Change Password</h3>
      <p className="text-xs text-ink-3 mb-4">
        {otpSent
          ? 'An OTP has been sent to your registered email. Enter it below to confirm the password change.'
          : 'Enter your current password to set a new one.'}
      </p>

      {!otpSent ? (
        /* ── Step 1: password fields ── */
        <>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-ink-2 mb-1.5">Current Password</label>
              <input
                type="password" value={currentPass} onChange={e => onCurrent(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-1.5">New Password</label>
                <input
                  type="password" value={newPass} onChange={e => onNew(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-1.5">Confirm Password</label>
                <input
                  type="password" value={confirmPass} onChange={e => onConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20"
                />
              </div>
            </div>
          </div>
          <button
            onClick={onSendOtp} disabled={saving}
            className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:bg-red-300 transition-colors"
          >
            {saving ? 'Sending OTP…' : 'Update Password'}
          </button>
        </>
      ) : (
        /* ── Step 2: OTP entry ── */
        <div>
          {/* 6-digit OTP boxes */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-2 mb-3 text-center">
              Enter 6-digit OTP
            </label>
            <div className="flex justify-center gap-2" onPaste={onOtpPaste}>
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={otpRefs ? otpRefs[i] : undefined}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => onOtpChange(i, e.target.value)}
                  onKeyDown={e => onOtpKeyDown(i, e)}
                  className={`w-11 h-12 text-center text-lg font-bold border rounded-xl bg-bg text-ink focus:outline-none focus:ring-2 transition-all ${
                    otpError
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-border focus:ring-red-300 focus:border-red-500'
                  }`}
                  style={d ? { borderColor: '#ef4444' } : {}}
                />
              ))}
            </div>
            {otpError && (
              <p className="text-[11px] text-red-500 mt-2 font-medium text-center">{otpError}</p>
            )}
          </div>

          {/* Countdown */}
          <div className="text-center text-xs text-ink-3 mb-4">
            {expirySec > 0
              ? <>OTP expires in <span className="font-semibold tabular-nums" style={{ color: expirySec < 60 ? '#ef4444' : '#dc2626' }}>{mm}:{ss}</span></>
              : <span className="text-red-500 font-medium">OTP expired — please resend.</span>
            }
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button" onClick={onBack}
              className="text-xs text-ink-3 hover:underline"
              style={{ color: '#dc2626' }}
            >
              ← Edit details
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button" onClick={onResend}
                disabled={resendCd > 0 || saving}
                className="text-xs hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: '#dc2626' }}
              >
                {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend OTP'}
              </button>
              <button
                onClick={onVerifyOtp}
                disabled={saving || expirySec === 0}
                className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:bg-red-300 transition-colors"
              >
                {saving ? 'Verifying…' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
