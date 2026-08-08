import { useEffect, useState, type ReactNode } from "react";
import { ADMIN_NOTIFICATION_EVENT, type AdminNotification } from "./adminNotifications";

export function AdminNotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<AdminNotification | null>(null);

  useEffect(() => {
    const receive = (event: Event) => {
      setNotification((event as CustomEvent<AdminNotification>).detail);
    };
    window.addEventListener(ADMIN_NOTIFICATION_EVENT, receive);
    return () => window.removeEventListener(ADMIN_NOTIFICATION_EVENT, receive);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotification(null);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [notification]);

  return (
    <>
      {children}
      {notification ? (
        <div
          className="admin-notification-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setNotification(null);
          }}
        >
          <section
            className={`admin-notification-modal is-${notification.type}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-notification-title"
          >
            <span className="admin-notification-modal__icon" aria-hidden="true">
              {notification.type === "success" ? "✓" : "!"}
            </span>
            <div>
              <p id="admin-notification-title">
                {notification.type === "success" ? "Success" : "Something went wrong"}
              </p>
              <span>{notification.message}</span>
            </div>
            <button type="button" className="admin-primary" onClick={() => setNotification(null)}>
              Close
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
