"use client";

import { AwardDialog } from "./components/AwardDialog";
import { useCreditAward } from "./hooks/useCreditAward";

export function CreditAward() {
  const {
    loading,
    error,
    success,
    canClaimNewUser,
    canClaimDaily,
    showDialog,
    isEligible,
    setTurnstileToken,
    setSelectedAwardType,
    handleDeclineToday,
    handleDeclineForever,
    handleLater,
    declinedForSession,
  } = useCreditAward();
  if (declinedForSession) {
    return null;
  }
  if (
    !process.env.NEXT_PUBLIC_CREDIT_NEW_USER_AWARD_AMOUNT ||
    process.env.NEXT_PUBLIC_CREDIT_NEW_USER_AWARD_AMOUNT.trim() === "0" ||
    !process.env.NEXT_PUBLIC_CREDIT_DAILY_LOGIN_AWARD_AMOUNT ||
    process.env.NEXT_PUBLIC_CREDIT_DAILY_LOGIN_AWARD_AMOUNT.trim() === "0"
  ) {
    return null;
  }

  if (!isEligible) {
    return null;
  }

  return (
    <AwardDialog
      showDialog={showDialog}
      canClaimNewUser={canClaimNewUser}
      canClaimDaily={canClaimDaily}
      loading={loading}
      error={error}
      success={success}
      setTurnstileToken={setTurnstileToken}
      setSelectedAwardType={setSelectedAwardType}
      handleDeclineToday={handleDeclineToday}
      handleDeclineForever={handleDeclineForever}
      handleLater={handleLater}
    />
  );
}
