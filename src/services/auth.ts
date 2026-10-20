/**
 * Authentication Service Module
 *
 * Keeps UI components decoupled from backend authentication logic.
 * Supports integration with Firebase Auth, Supabase, or custom REST APIs.
 */

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

/**
 * TOGGLE THIS FLAG ONCE YOU HAVE CONNECTED A REAL BACKEND.
 */
export let IS_BACKEND_CONFIGURED = false;

/**
 * DEMO MODE FLAG:
 * Set to `true` while developing/previewing the Figma flow so you can test all steps
 * (Email -> 5-digit OTP Code "12345" -> Set New Password -> Success Dialog).
 * Set to `false` to verify error handling when no real backend is active.
 */
export let DEMO_MODE = true;

/**
 * 1. Request Password Reset / OTP Code
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    if (!IS_BACKEND_CONFIGURED && !DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      throw new Error(
        `No authentication backend is connected yet for ${normalizedEmail}. Please configure Firebase, Supabase, or your backend in src/services/auth.ts.`
      );
    }

    // Simulate network delay in demo mode
    await new Promise((resolve) => setTimeout(resolve, 750));

    // =========================================================================
    // OPTION 1: FIREBASE AUTHENTICATION INTEGRATION
    // =========================================================================
    // import { getAuth, sendPasswordResetEmail } from "firebase/auth";
    // const auth = getAuth();
    // await sendPasswordResetEmail(auth, normalizedEmail);

    // =========================================================================
    // OPTION 2: SUPABASE AUTH INTEGRATION
    // =========================================================================
    // import { supabase } from "@/lib/supabase";
    // const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    //   redirectTo: "mynewapp://reset-password",
    // });
    // if (error) throw error;

    return {
      success: true,
      message: `We sent a reset code to ${normalizedEmail}. Enter the 5-digit code mentioned in the email.`,
    };
  } catch (error: any) {
    if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
      throw new Error("Network error. Please check your internet connection and try again.");
    }
    throw new Error(error?.message || "An unexpected error occurred. Please try again later.");
  }
}

/**
 * 2. Verify 5-Digit OTP Code
 */
export async function verifyResetCode(email: string, code: string): Promise<PasswordResetResponse> {
  try {
    if (!IS_BACKEND_CONFIGURED && !DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      throw new Error("Authentication backend not configured.");
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    // In demo mode, accept any 5-digit code or default "12345"
    if (DEMO_MODE && code.length !== 5) {
      throw new Error("Please enter a valid 5-digit verification code.");
    }

    return {
      success: true,
      message: "Code verified successfully.",
    };
  } catch (error: any) {
    throw new Error(error?.message || "Invalid or expired verification code.");
  }
}

/**
 * 3. Update / Set New Password
 */
export async function updatePassword(password: string): Promise<PasswordResetResponse> {
  try {
    if (!IS_BACKEND_CONFIGURED && !DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      throw new Error("Authentication backend not configured.");
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    return {
      success: true,
      message: "Congratulations! Your password has been changed.",
    };
  } catch (error: any) {
    throw new Error(error?.message || "Failed to update password. Please try again.");
  }
}
