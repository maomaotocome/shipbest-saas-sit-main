export async function validateTurnstileToken(token: string) {
  try {
    const formData = new FormData();
    formData.append("secret", process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "");
    formData.append("response", token);

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const outcome = await result.json();
    console.info("Turnstile validation result:", outcome);

    return outcome.success;
  } catch (error) {
    console.error("Turnstile validation error:", error);
    return false;
  }
}
