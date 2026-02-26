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
    title: "Optimera strålbana — P-2024-001",
    description: "AI föreslår 1.2mm lateralt skift för 15% lägre cochlea-dos.",
    timestamp: "5 min sedan",
    read: false,
    archived: false,
    link: "/dashboard/planning",
  },
  {
    id: "n2",
    type: "warning",
    title: "OAR-gräns nära — N. facialis",
    description: "P-2024-001: N. facialis dos 8.1 Gy (gräns 8.0 Gy).",
    timestamp: "12 min sedan",
    read: false,
    archived: false,
    link: "/dashboard/planning",
  },
  {
    id: "n3",
    type: "success",
    title: "Rapport genererad",
    description: "Behandlingsrapport för Anna Lindström klar.",
    timestamp: "1 timme sedan",
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
        timestamp: notification.timestamp ?? "Nu",
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
