import { createContext, useContext, useMemo, useState } from "react";

export interface AppNotification {
  id: string;
  type: "optimization" | "warning" | "success" | "info";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read" | "archived"> & { timestamp?: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  archiveNotification: (id: string) => void;
}

const defaultNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "optimization",
    title: "Optimize beam path — P-2024-001",
    description: "AI suggests a 1.2mm lateral shift for 15% lower cochlea dose.",
    timestamp: "5 min ago",
    read: false,
    archived: false,
    link: "/dashboard/planning",
  },
  {
    id: "n2",
    type: "warning",
    title: "OAR limit near — N. facialis",
    description: "P-2024-001: N. facialis dose 8.1 Gy (limit 8.0 Gy).",
    timestamp: "12 min ago",
    read: false,
    archived: false,
    link: "/dashboard/planning",
  },
  {
    id: "n3",
    type: "success",
    title: "Report generated",
    description: "Treatment report for Anna Lindstrom ready.",
    timestamp: "1 hour ago",
    read: false,
    archived: false,
    link: "/dashboard/reports",
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(defaultNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read && !n.archived).length,
    [notifications]
  );

  const addNotification: NotificationContextType["addNotification"] = (notification) => {
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        timestamp: notification.timestamp ?? "Now",
        read: false,
        archived: false,
        ...notification,
      },
      ...prev,
    ]);
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const archiveNotification = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, archived: true } : n)));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, archiveNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}

export function useNotificationCount() {
  return useNotifications().unreadCount;
}






