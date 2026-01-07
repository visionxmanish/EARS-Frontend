
import React from 'react';
import {
  LayoutDashboard,
  Database,
  CalendarClock,
  GitBranch,
  ListTree,
  LineChart,
  Building2,
  FilePieChart,
  BarChart3,
  Users,
  UserCog,
  Activity,
} from 'lucide-react';


export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  requiredRole?: string[];
  submenu?: SidebarItem[];
}

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Data Management',
    href: '',
    icon: <Database className="h-4 w-4" />,
    submenu: [
      { label: 'Manage Fiscal Years', href: '/fiscal-year', icon: <CalendarClock className="h-3 w-3" /> },
      { label: 'Manage Sectors', href: '/sector', icon: <GitBranch className="h-3 w-3" /> },
      { label: 'Manage Data Categories', href: '/data-categories', icon: <ListTree className="h-3 w-3" /> },
      { label: 'Manage Economic Data', href: '/manage-economic-data', icon: <LineChart className="h-3 w-3" /> },
      { label: 'Manage Offices', href: '/manage-offices', icon: <Building2 className="h-3 w-3" /> },
    ]
  },
  {
    label: 'Reports',
    href: '/tickets/status',
    icon: <FilePieChart className="h-4 w-4" />,
    submenu: [
      { label: 'Generate Reports', href: '/level-report', icon: <BarChart3 className="h-3 w-3" />, badge: '12', badgeVariant: 'destructive' },
    ]
  },
  {
    label: 'User Management',
    href: '/categories',
    icon: <Users className="h-4 w-4" />,
    submenu: [
      { label: 'Manage Users', href: '/users/users-list', icon: <UserCog className="h-3 w-3" /> },
      { label: 'User Activity Logs', href: 'users/activity-logs', icon: <Activity className="h-3 w-3" /> },
    
    ]
  },
  
];