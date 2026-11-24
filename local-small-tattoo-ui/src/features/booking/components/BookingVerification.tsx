import { useEffect, useRef, useState } from "react";

type WidgetOptions = {
  sitekey: string;
  action: string;
  theme: "dark";
  size: "compact" | "flexible";
  "response-field": false;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};
type Turnstile = {
  ready(callback: () => void): void;
  render(element: HTMLElement, options: WidgetOptions): string;
  remove(id: string): void;
};
const browser = window as Window & { turnstile?: Turnstile };
let scriptPromise: Promise<Turnstile> | undefined;

function loadTurnstile() {
  if (browser.turnstile) return Promise.resolve(browser.turnstile);
  scriptPromise ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    const timer = window.setTimeout(fail, 12_000);
    function fail() {
      window.clearTimeout(timer);
      script.remove();
      scriptPromise = undefined;
      reject(new Error("The security check could not load."));
    }
    script.onerror = fail;
    script.onload = () => {
      const api = browser.turnstile;
      if (!api) return fail();
      api.ready(() => {
        window.clearTimeout(timer);
        resolve(api);
      });
    };
    document.head.append(script);
  });
  return scriptPromise;
}

export function BookingVerification({ onToken }: { onToken: (token: string) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!sitekey) return;
    let active = true;
    let instance: { api: Turnstile; id: string } | undefined;
    void loadTurnstile()
      .then((api) => {
        if (!active || !element.current) return;
        const id = api.render(element.current, {
          sitekey,
          action: "booking",
          theme: "dark",
          size: element.current.clientWidth < 300 ? "compact" : "flexible",
          "response-field": false,
          callback: (token) => {
            if (active) {
              setFailed(false);
              callback.current(token);
            }
          },
          "expired-callback": () => {
            if (active) callback.current("");
          },
          "error-callback": () => {
            if (active) {
              setFailed(true);
              callback.current("");
            }
          },
        });
        instance = { api, id };
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      if (instance) instance.api.remove(instance.id);
    };
  }, [attempt, sitekey]);

  if (!sitekey) return <p>Booking verification is temporarily unavailable.</p>;
  return (
    <>
      <div className="booking-verification__widget" ref={element} />
      {failed ? (
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            setFailed(false);
            setAttempt((value) => value + 1);
          }}
        >
          Reload security check
        </button>
      ) : null}
    </>
  );
}
