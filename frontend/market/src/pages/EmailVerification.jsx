import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * EmailVerification Component
 *
 * Route: /verify-email
 *
 * This page is shown after a user submits the registration form.
 * The user receives a 4-digit verification code in their email and must
 * enter it here to complete their account creation.
 *
 * Features:
 * - Input field for 4-digit code
 * - Real-time feedback on code submission
 * - "Resend Code" button (rate limited to 5 times per hour on backend)
 * - Error handling and attempt tracking
 * - Timer showing code expiration (10 minutes)
 * - Auto-focus on code input for better UX
 *
 * Flow:
 * 1. User fills registration form → submits to /auth/register
 * 2. Backend validates and sends email with 4-digit code
 * 3. Frontend redirects here with email parameter
 * 4. User enters code → submits to /auth/verify-email
 * 5. Backend verifies code and creates account
 * 6. User auto-logged in → redirected to home
 */
const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from navigation state or URL params
  // The Register page passes email when it redirects here
  const email = location.state?.email || new URLSearchParams(location.search).get('email');

  // ============ STATE MANAGEMENT ============

  // Code input - the 4-digit code user enters
  // Will be a string like "5738"
  const [code, setCode] = useState("");

  // Submission states
  const [loading, setLoading] = useState(false);     // Show loading spinner during API call
  const [error, setError] = useState(null);          // Error message if verification fails
  const [resendLoading, setResendLoading] = useState(false);  // Loading state for resend button

  // Verification attempt tracking
  // Backend tracks attempts and limits to 5 failed attempts
  // We show feedback to user about how many attempts they have left
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  // Success state - show confirmation before redirect
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // ============ HANDLERS ============

  /**
   * Handle code submission
   *
   * When user enters the 4-digit code and clicks "Verify Code",
   * this function:
   * 1. Validates the code format (must be 4 digits)
   * 2. Sends it to backend /auth/verify-email endpoint
   * 3. Backend checks if code matches the one we sent to their email
   * 4. If correct: Account is created and user is logged in
   * 5. If incorrect: Shows error and decrements remaining attempts
   */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate code format - must be exactly 4 digits
    if (!code || code.length !== 4 || !/^\d+$/.test(code)) {
      setError("Code must be exactly 4 digits");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email not found. Please register again.");
      setLoading(false);
      return;
    }

    try {
      // Send verification request to backend
      // Endpoint: POST /auth/verify-email
      // Body: { email, code }
      const res = await fetch("http://localhost:5001/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // Include session cookie for auto-login
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Account created and user logged in
        // Show success message before redirecting
        setVerificationSuccess(true);

        // Wait 2 seconds to show success message, then redirect to home
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        // Verification failed
        const errorMsg = data.error || "Verification failed";
        setError(errorMsg);

        // If backend returns remaining attempts, update our state
        // This helps user know how many tries they have left
        if (data.remaining_attempts !== undefined) {
          setRemainingAttempts(data.remaining_attempts);
        }

        // Clear code input so user can try again
        setCode("");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle resend code request
   *
   * If user didn't receive the code or it expired,
   * they can click "Resend Code" to get a new one.
   *
   * Backend limits resends to 5 per hour per IP (rate limiting).
   *
   * On success:
   * - New code is generated and sent to email
   * - Timer is reset (another 10 minutes)
   * - Attempt counter is reset (fresh 5 attempts)
   */
  const handleResend = async () => {
    setError(null);
    setResendLoading(true);

    if (!email) {
      setError("Email not found. Please register again.");
      setResendLoading(false);
      return;
    }

    try {
      // Send resend request to backend
      // Endpoint: POST /auth/resend-code
      // Body: { email }
      const res = await fetch("http://localhost:5001/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success - new code sent
        setError(null);
        setRemainingAttempts(5);  // Reset attempts counter
        setCode("");  // Clear input field

        // Show success message (could be in a toast notification)
        alert("New verification code sent to your email! Check your inbox.");
      } else {
        // Resend failed - show error
        const errorMsg = data.error || "Failed to resend code";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // ============ RENDER ============

  // If verification already succeeded, show success screen
  if (verificationSuccess) {
    return (
      <div className="min-h-screen bg-[#000328] text-white flex items-center justify-center px-6">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md text-center border border-[#E0B0FF]">
          <div className="mb-4">
            {/* Success checkmark icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-gray-300 mb-4">Your email has been verified successfully.</p>
          <p className="text-gray-400 text-sm">Redirecting you home...</p>
        </div>
      </div>
    );
  }

  // Main verification form
  return (
    <div className="min-h-screen bg-[#000328] text-white flex items-center justify-center px-6 py-10">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-800">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-gray-400">
            We sent a 4-digit code to<br />
            <span className="text-[#E0B0FF] font-semibold">{email || "your email"}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
            {remainingAttempts < 5 && (
              <p className="text-red-400 text-xs mt-2">
                Attempts remaining: {remainingAttempts}/5
              </p>
            )}
          </div>
        )}

        {/* Code Input Form */}
        <form onSubmit={handleVerify} className="mb-6">
          {/* Code Input Field */}
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-semibold mb-2">
              Enter Verification Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength="4"
              placeholder="0000"
              value={code}
              onChange={(e) => {
                // Only allow digits, max 4 characters
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setCode(val);
              }}
              disabled={loading}
              autoFocus
              className={`w-full px-4 py-3 border-2 rounded-lg text-center font-mono text-xl tracking-widest
                bg-gray-800 text-white placeholder-gray-500
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
                ${
                  code.length === 4
                    ? "border-[#E0B0FF] focus:outline-none"
                    : "border-gray-700 focus:border-[#E0B0FF] focus:outline-none"
                }
              `}
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || code.length !== 4}
            className={`w-full py-3 rounded-lg font-semibold transition duration-200
              ${
                loading || code.length !== 4
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-[#E0B0FF] text-gray-900 hover:bg-[#d498f5] active:scale-95"
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">⏰ Code expires in:</span>
            <br />
            10 minutes from email delivery
          </p>
        </div>

        {/* Resend Code Button */}
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className={`w-full py-2 rounded-lg font-semibold transition duration-200 text-sm
            ${
              resendLoading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-[#E0B0FF] hover:bg-gray-700 border border-gray-700 hover:border-[#E0B0FF]"
            }
          `}
        >
          {resendLoading ? "Sending..." : "Didn't receive code? Resend"}
        </button>

        {/* Back to Register Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-sm text-gray-400 hover:text-[#E0B0FF] transition"
          >
            ← Back to registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
