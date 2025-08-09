import {
  awardCredits,
  getLastDailyLoginAwardGrant,
  getNewUserAwardGrant,
} from "@/actions/billing/credit/award";
import { CreditSource } from "@/db/generated/prisma";
import { USER_CREDITS_QUERY_KEY } from "@/hooks/use-user-credits";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { STORAGE_KEYS } from "../constants";

function isWithin24Hours(date: Date | string) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date in isWithin24Hours:", { date });
    return false;
  }
  const now = Date.now();
  const dateTime = dateObj.getTime();
  const diff = now - dateTime;
  const result = diff < 1000 * 60 * 60 * 24;
  return result;
}

export function useCreditAward() {
  const t = useTranslations("billing");
  const { status, data: session } = useSession();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [canClaimNewUser, setCanClaimNewUser] = useState(false);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [selectedAwardType, setSelectedAwardType] = useState<CreditSource | null>(null);
  const [declinedForSession, setDeclinedForSession] = useState(false);

  // Use useLocalStorage hooks for all localStorage operations
  const [foreverDeclined, setForeverDeclined] = useLocalStorage(
    STORAGE_KEYS.FOREVER_AWARD_DECLINED_FLAG,
    ""
  );
  const [thisDayDeclined, setThisDayDeclined] = useLocalStorage(
    STORAGE_KEYS.THIS_DAY_AWARD_DECLINED_TIME,
    ""
  );
  const [dailyAwardTime, setDailyAwardTime] = useLocalStorage(
    STORAGE_KEYS.DAILY_LOGIN_AWARD_TIME,
    ""
  );
  const [newUserAwardTime, setNewUserAwardTime] = useLocalStorage(
    STORAGE_KEYS.NEW_USER_AWARD_TIME,
    ""
  );

  useEffect(() => {
    if (isEligible && !declinedForSession) {
      console.log("isEligible changed to true and not declined for session, showing dialog");
      setShowDialog(true);
    }
  }, [isEligible, declinedForSession]);

  const checkLocalStorage = useCallback((type: CreditSource) => {
    if (type === CreditSource.NEW_USER_AWARD) {
      if (newUserAwardTime) {
        if (isWithin24Hours(new Date(newUserAwardTime))) {
          return false;
        }
      }
    } else if (type === CreditSource.DAILY_LOGIN_AWARD) {
      if (dailyAwardTime) {
        if (isWithin24Hours(new Date(dailyAwardTime))) {
          return false;
        }
      }
    }
    return true;
  }, [newUserAwardTime, dailyAwardTime]);

  const updateLocalStorage = useCallback((type: CreditSource) => {
    const now = new Date().toISOString();
    if (type === CreditSource.NEW_USER_AWARD) {
      setNewUserAwardTime(now);
      setDailyAwardTime(now);
    } else if (type === CreditSource.DAILY_LOGIN_AWARD) {
      setDailyAwardTime(now);
    }
  }, [setNewUserAwardTime, setDailyAwardTime]);

  const handleAward = useCallback(
    async (type: CreditSource) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        if (!checkLocalStorage(type)) {
          setError(t("award.already_received"));
          return;
        }

        if (!turnstileToken) {
          setError(t("award.verify_human"));
          return;
        }

        const result = await awardCredits({ type, turnstileToken });

        if (result.error) {
          setError(result.error);
          return;
        }

        updateLocalStorage(type);
        setSuccess(true);
        setShowDialog(false);
        setTurnstileToken("");
        setSelectedAwardType(null);

        // Reset credit query cache
        await queryClient.invalidateQueries({
          queryKey: USER_CREDITS_QUERY_KEY,
        });
      } catch (err) {
        setError("award.error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [turnstileToken, t, queryClient, checkLocalStorage, updateLocalStorage]
  );

  useEffect(() => {
    if (turnstileToken && selectedAwardType) {
      console.log("Turnstile token received, handling award...");
      handleAward(selectedAwardType);
    }
  }, [turnstileToken, selectedAwardType, handleAward]);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        console.log("Checking award eligibility...");
        const currentTime = new Date();
        console.log("Current time (ISO):", currentTime.toISOString());
        console.log("Current time (Local):", currentTime.toString());
        console.log("Session status:", status);

        if (status !== "authenticated") {
          console.log("User not authenticated, hiding dialog");
          setShowDialog(false);
          setIsEligible(false);
          return;
        }

        if (foreverDeclined === "true") {
          console.log("User has declined forever");
          setIsEligible(false);
          return;
        }

        if (thisDayDeclined && isWithin24Hours(new Date(thisDayDeclined))) {
          console.log("User has declined today");
          setIsEligible(false);
          return;
        }

        // Check daily reward eligibility
        let canClaimDaily = false;

        if (dailyAwardTime) {
          console.log("Checking daily award eligibility from localStorage...");
          const dailyTime = new Date(dailyAwardTime);
          const isWithin24 = isWithin24Hours(dailyTime);
          console.log("Daily award check result:", {
            dailyTime: dailyTime.toISOString(),
            currentTime: currentTime.toISOString(),
            isWithin24,
            canClaim: !isWithin24,
          });

          if (!isWithin24) {
            canClaimDaily = true;
            console.log("Setting canClaimDaily to true from localStorage");
          }
        } else {
          console.log("No local daily award record, checking server...");
          const lastDailyAward = await getLastDailyLoginAwardGrant();
          if (lastDailyAward) {
            const lastAwardTime = lastDailyAward.createdAt;
            setDailyAwardTime(lastAwardTime.toISOString());
            if (!isWithin24Hours(lastAwardTime)) {
              canClaimDaily = true;
              console.log("Setting canClaimDaily to true from server");
            }
          } else {
            canClaimDaily = true;
            console.log("No server record found, but user is new, not showing daily award");
          }
        }

        let canClaimNewUser = false;
        if (!session?.user?.createdAt) {
          console.log("No createdAt date, cannot claim new user award");
        } else {
          const userCreatedAt = session.user.createdAt;
          console.log("userCreatedAt", userCreatedAt, typeof userCreatedAt);
          if (isWithin24Hours(userCreatedAt)) {
            if (!newUserAwardTime || !isWithin24Hours(new Date(newUserAwardTime))) {
              console.log("Checking new user award from server...");
              const newUserAward = await getNewUserAwardGrant();
              if (!newUserAward) {
                canClaimNewUser = true;
                canClaimDaily = false;
                console.log("Setting canClaimNewUser to true from server");
              } else {
                setNewUserAwardTime(newUserAward.createdAt.toISOString());
              }
            }
          }
        }

        setCanClaimDaily(canClaimDaily);
        setCanClaimNewUser(canClaimNewUser);
        const canClaim = canClaimNewUser || canClaimDaily;
        setIsEligible(canClaim);
        if (canClaim) {
          setShowDialog(true);
        }

        console.log("Final eligibility state:", {
          canClaimNewUser,
          canClaimDaily,
          isEligible: canClaim,
          showDialog,
        });
      } catch (err) {
        console.error("Error checking award eligibility:", err);
      }
    };

    checkEligibility();
  }, [
    status,
    session?.user?.createdAt,
    showDialog,
    foreverDeclined,
    thisDayDeclined,
    dailyAwardTime,
    setDailyAwardTime,
    setNewUserAwardTime,
    newUserAwardTime,
  ]);


  const handleDeclineToday = () => {
    setThisDayDeclined(new Date().toISOString());
    setShowDialog(false);
  };

  const handleDeclineForever = () => {
    setForeverDeclined("true");
    setShowDialog(false);
  };

  const handleLater = () => {
    setDeclinedForSession(true);
    setShowDialog(false);
  };

  return {
    loading,
    error,
    success,
    declinedForSession,
    canClaimNewUser,
    canClaimDaily,
    turnstileToken,
    showDialog,
    isEligible,
    setTurnstileToken,
    setShowDialog,
    setSelectedAwardType,
    handleDeclineToday,
    handleDeclineForever,
    handleLater,
  };
}
