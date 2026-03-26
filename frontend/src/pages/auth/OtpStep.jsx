import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

/**
 * OtpStep — step 2 of the sign-up flow.
 * Props:
 *   email, otpDigits, otpRefs, otpError
 *   expirySec, resendCd
 *   loading
 *   onOtpChange(idx, val)
 *   onOtpKeyDown(idx, e)
 *   onOtpPaste(e)
 *   onVerify(e)
 *   onBack()
 *   onResend()
 */
export default function OtpStep({
  email, otpDigits, otpRefs, otpError,
  expirySec, resendCd, loading,
  onOtpChange, onOtpKeyDown, onOtpPaste,
  onVerify, onBack, onResend,
}) {
  const { theme } = useTheme();
  const mm = String(Math.floor(expirySec / 60)).padStart(2, '0');
  const ss = String(expirySec % 60).padStart(2, '0');

  return (
    <form onSubmit={onVerify} className="space-y-5 flex-1">
      {/* Email reminder */}
      <div className="rounded-xl p-3 text-xs text-center" style={{ background: `${theme.pri}15`, color: theme.pri }}>
        OTP sent to <strong>{email}</strong>
      </div>

      {/* 6-digit boxes */}
      <div>
        <label className="block text-xs font-semibold text-ink-2 mb-3 text-center">Enter 6-digit OTP</label>
        <div className="flex justify-center gap-2" onPaste={onOtpPaste}>
          {otpDigits.map((d, i) => (
            <input
              key={i}
              ref={otpRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => onOtpChange(i, e.target.value)}
              onKeyDown={(e) => onOtpKeyDown(i, e)}
              className={`w-11 h-12 text-center text-lg font-bold border rounded-xl bg-bg text-ink focus:outline-none focus:ring-2 transition-all ${
                otpError ? 'border-red-300 focus:ring-red-200' : 'border-border focus:ring-pri/30 focus:border-pri'
              }`}
              style={d ? { borderColor: theme.pri } : {}}
            />
          ))}
        </div>
        {otpError && <p className="text-[11px] text-red-500 mt-2 font-medium text-center">{otpError}</p>}
      </div>

      {/* Expiry countdown */}
      <div className="text-center text-xs text-ink-3">
        {expirySec > 0
          ? <>OTP expires in <span className="font-semibold tabular-nums" style={{ color: expirySec < 60 ? '#ef4444' : theme.pri }}>{mm}:{ss}</span></>
          : <span className="text-red-500 font-medium">OTP expired — please resend.</span>
        }
      </div>

      {/* Verify button */}
      <button
        type="submit"
        disabled={loading || expirySec === 0}
        className="w-full py-3.5 text-white font-extrabold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[14px] tracking-wide uppercase hover:opacity-90"
        style={{ backgroundColor: (loading || expirySec === 0) ? '#9ca3af' : theme.pri, boxShadow: (loading || expirySec === 0) ? 'none' : `0 8px 25px ${theme.pri}55` }}
      >
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><ThemedIcon name="check" size={18} color="#ffffff" /> Verify &amp; Create Account</>}
      </button>

      {/* Resend + Back */}
      <div className="flex items-center justify-between text-xs text-ink-3 pt-1">
        <button type="button" onClick={onBack} className="hover:underline" style={{ color: theme.pri }}>
          ← Edit details
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={resendCd > 0 || loading}
          className="hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: theme.pri }}
        >
          {resendCd > 0 ? `Resend in ${resendCd}s` : 'Resend OTP'}
        </button>
      </div>
    </form>
  );
}
