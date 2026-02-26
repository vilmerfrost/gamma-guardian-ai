import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, X, Check, Archive, Zap, AlertTriangle, CheckCircle2, Info, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Notification {
  id: string;
  type: "optimization" | "warning" | "success" | "info";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  link?: string; // route to navigate
}

const defaultNotifications: Notification[] = [
  {
    id: "n1", type: "optimization", title: "Optimera strålbana — P-2024-001",
    description: "AI föreslår 1.2mm lateralt skift för 15% lägre cochlea-dos.",
    timestamp: "5 min sedan", read: false, archived: false, link: "/dashboard/planning",
  },
  {
    id: "n2", type: "warning", title: "OAR-gräns nära — N. facialis",
    description: "P-2024-001: N. facialis dos 8.1 Gy (gräns 8.0 Gy).",
    timestamp: "12 min sedan", read: false, archived: false, link: "/dashboard/planning",
  },
  {
    id: "n3", type: "success", title: "Rapport genererad",
    description: "Behandlingsrapport för Anna Lindström klar.",
    timestamp: "1 timme sedan", read: false, archived: false, link: "/dashboard/reports",
  },
  {
    id: "n4", type: "info", title: "AI-modell uppdaterad",
    description: "Gemini 3 Flash Preview — ny version deployad.",
    timestamp: "2 timmar sedan", read: true, archived: false, link: "/dashboard/settings",
  },
  {
    id: "n5", type: "success", title: "Segmentering godkänd",
    description: "GTV/CTV för Erik Johansson verifierad av Dr. Svensson.",
    timestamp: "3 timmar sedan", read: true, archived: false, link: "/dashboard/image-analysis",
  },
];

const iconMap = {
  optimization: Zap,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const colorMap = {
  optimization: "text-medical-cyan bg-medical-cyan/10 border-medical-cyan/20",
  warning: "text-medical-amber bg-medical-amber/10 border-medical-amber/20",
  success: "text-medical-green bg-medical-green/10 border-medical-green/20",
  info: "text-medical-purple bg-medical-purple/10 border-medical-purple/20",
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const visible = notifications.filter(n => !n.archived);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const archiveNotif = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n));
  };

  const handleClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 z-50 card-medical-elevated overflow-hidden"
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Notiser</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={markAllRead}>
                    <Check className="w-3 h-3 mr-1" />Markera alla
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[400px]">
              <div className="divide-y divide-border">
                {visible.map((notif) => {
                  const Icon = iconMap[notif.type];
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-3 cursor-pointer transition-colors hover:bg-muted/30 ${!notif.read ? "bg-primary/[0.02]" : ""}`}
                      onClick={() => handleClick(notif)}
                    >
                      <div className="flex gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${colorMap[notif.type]}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs leading-tight ${!notif.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-medical-cyan shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-muted-foreground/60">{notif.timestamp}</span>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              {!notif.read && (
                                <button onClick={() => markRead(notif.id)} className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted/50">
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button onClick={() => archiveNotif(notif.id)} className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted/50">
                                <Archive className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {visible.length === 0 && (
                  <div className="p-8 text-center">
                    <Bell className="w-6 h-6 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">Inga notiser</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useNotificationCount() {
  return defaultNotifications.filter(n => !n.read && !n.archived).length;
}
