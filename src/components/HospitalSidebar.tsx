import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Database,
  TrendingUp,
  Users,
  Building2,
  Layers3,
  BedDouble,
  Gauge,
  FileBarChart2,
  CalendarDays,
} from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Usuários e Permissões", url: "/users", icon: Users },
  { title: "Escalas e Turnos", url: "/teams", icon: CalendarDays },
  { title: "Sistemas SCP", url: "/metodos-scp", icon: TrendingUp },
  { title: "Equipes e Baseline", url: "/departments", icon: Building2 },
  { title: "Custos da Folha", url: "/reports", icon: FileBarChart2 },
  { title: "Sítios Funcionais", url: "/sitios", icon: Layers3 },
];

export function HospitalSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path || 
    (path === "/dashboard" && location.pathname === "/");

  return (
    <Sidebar className="bg-white border-r border-border/20" collapsible="icon">
      <SidebarHeader className="border-b border-border/20 px-4 py-3 bg-white">
        <div className="flex items-center">
          {!collapsed && (
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-primary">MedStaff</div>  
              <div className="text-xs text-muted-foreground">Sistema de Dimensionamento</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-medium text-muted-foreground mb-2 px-2 ${collapsed ? "sr-only" : ""}`}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                        isActive(item.url)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
