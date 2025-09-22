import { NavLink, useLocation } from "react-router-dom";
import { 
  Home,
  Users,
  Clock,
  FileText,
  UserCheck,
  DollarSign,
  Building2,
  ChevronLeft,
  ChevronRight,
  Hospital as HospitalIcon, // Import Hospital icon
  Building as UnitIcon, // Import Building icon for units
  Briefcase as CargoIcon, // Import Briefcase icon for cargos
  Bed as LeitoIcon // Import Bed icon for leitos
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Usuários e Permissões",
    url: "/users", // Changed from /usuarios to /users to match App.tsx route
    icon: Users,
  },
  {
    title: "Hospitais",
    url: "/hospitals",
    icon: HospitalIcon,
  },
  {
    title: "Unidades",
    url: "/unidades",
    icon: UnitIcon,
  },
  {
    title: "Cargos", // New item for Cargos
    url: "/cargos",
    icon: CargoIcon,
  },
  {
    title: "Leitos", // New item for Leitos
    url: "/leitos",
    icon: LeitoIcon,
  },
  {
    title: "Escalas e Turnos", 
    url: "/escalas",
    icon: Clock,
  },
  {
    title: "Sistemas SCP",
    url: "/scp",
    icon: FileText,
  },
  {
    title: "Equipes e Baseline",
    url: "/equipes",
    icon: UserCheck,
  },
  {
    title: "Custos da Folha",
    url: "/custos",
    icon: DollarSign,
  },
  {
    title: "Sítios Funcionais",
    url: "/sitios",
    icon: Building2,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const getNavCls = (url: string) => {
    const isActive = location.pathname === url;
    return isActive
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-muted text-muted-foreground hover:text-foreground";
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-primary">MedStaff</h2>
              <p className="text-xs text-muted-foreground">Sistema de Dimensionamento</p>
            </div>
          )}
          <SidebarTrigger className="ml-auto">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </SidebarTrigger>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-5 w-5" />
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