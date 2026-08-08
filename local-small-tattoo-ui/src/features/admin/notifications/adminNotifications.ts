export type AdminNotificationType = "success" | "error";

export type AdminNotification = {
  type: AdminNotificationType;
  message: string;
};

export const ADMIN_NOTIFICATION_EVENT = "local-small-admin-notification";

export function notifyAdmin(notification: AdminNotification) {
  window.dispatchEvent(
    new CustomEvent<AdminNotification>(ADMIN_NOTIFICATION_EVENT, { detail: notification }),
  );
}
