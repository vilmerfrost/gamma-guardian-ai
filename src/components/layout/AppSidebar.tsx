import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ScanLine,
  Target,
  MessageSquare,
  FileText,
  Settings,
  Zap,
  Activity,
} from "lucide-react";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Bildanalys", url: "/image-analysis", icon: ScanLine },
  { title: "Planering", url: "/planning", icon: Target },
  { title: "AI Advisor", url: "/ai-advisor", icon: MessageSquare },
  { title: "Rapporter", url: "/reports", icon: FileText },
];

const settingsNav = [
  { title: "Inställningar", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center glow-cyan">
            <Zap className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-sidebar-primary-foreground">
              GammaAI
            </h1>
            <p className="text-[10px] font-medium text-sidebar-foreground/60 tracking-widest uppercase">
              Gamma Knife Suite
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] tracking-widest uppercase font-semibold px-4">
            Verktyg
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                      activeClassName="text-sidebar-primary bg-sidebar-accent shadow-sm"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] tracking-widest uppercase font-semibold px-4">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                      activeClassName="text-sidebar-primary bg-sidebar-accent shadow-sm"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-sidebar-primary" />
            <span className="text-[10px] font-semibold text-sidebar-primary uppercase tracking-wider">System Status</span>
          </div>
          <p className="text-[11px] text-sidebar-foreground/60">AI Engine: Online</p>
          <p className="text-[11px] text-sidebar-foreground/60">Senaste synk: 2 min sedan</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
