/**
 * One-shot cleanup of any guest/local Nerve state.
 * Not wired into the app — call manually from the console
 * when simulating a fresh user experience.
 */
export const clearAllGuestData = () => {
  const nerveKeys = [
    "nerve_scan_company_inputs",
    "nerve_scan_email",
    "nerve_scan_last_session_id",
    "nerve_scan_guest",
    "nerve_zero_session_id",
    "nerve_onboarding_module",
    "nerve_pulse_waitlist",
    "snag_usage",
    "snag_input",
    "diagnostic_guest_session",
  ];

  nerveKeys.forEach((key) => localStorage.removeItem(key));
  sessionStorage.clear();

  console.log(
    "Nerve database wipe complete. All users and associated data deleted. Ready for fresh start.",
  );
};
