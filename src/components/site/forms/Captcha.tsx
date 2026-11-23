"use client";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export type CaptchaHandle = { token: () => string | null; reset: () => void };

/** hCaptcha widget. Renders nothing when NEXT_PUBLIC_HCAPTCHA_SITE_KEY is not configured (local development). */
export const Captcha = forwardRef<CaptchaHandle>(function Captcha(_, ref) {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  const [token, setToken] = useState<string | null>(null);
  const widget = useRef<HCaptcha>(null);
  useImperativeHandle(ref, () => ({
    token: () => token,
    reset: () => {
      widget.current?.resetCaptcha();
      setToken(null);
    },
  }));
  if (!siteKey) return null;
  return <HCaptcha ref={widget} sitekey={siteKey} onVerify={setToken} onExpire={() => setToken(null)} reCaptchaCompat={false} />;
});
