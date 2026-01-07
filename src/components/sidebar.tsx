import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Building,
  LogOut,
  Search,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@/constants/constants';
import { sidebarItems, type SidebarItem } from '@/components/data/sidebar_data';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';

interface SidebarProps {
  className?: string;
  onCollapseChange?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function Sidebar({ className, onCollapseChange, isMobileOpen = false, onMobileOpenChange }: SidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<SidebarItem[]>([]);
  
  const { user, logout } = useAuthStore();

  // Get user info from auth context
  const userRole = user?.role || 'VIEWER';
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Guest User';
  const userEmail = user?.email || '';

  // Filter items based on user role and search query
  useEffect(() => {
    let items = sidebarItems.filter(item => {
      // Check role permissions
      const hasRoleAccess = !item.requiredRole || 
        item.requiredRole.some(role => role.toLowerCase() === userRole.toLowerCase());
      
      if (!hasRoleAccess) return false;

      // Filter submenu items based on role
      if (item.submenu) {
        item.submenu = item.submenu.filter(subItem => 
          !subItem.requiredRole || 
          subItem.requiredRole.some(role => role.toLowerCase() === userRole.toLowerCase())
        );
      }

      // Apply search filter
      if (searchQuery) {
        const matchesMain = item.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubmenu = item.submenu?.some(sub => 
          sub.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesMain || matchesSubmenu;
      }

      return true;
    });

    setFilteredItems(items);
  }, [userRole, searchQuery]);

  // Auto-expand items with active submenu
  useEffect(() => {
    const activeItems = filteredItems.filter(item => 
      item.submenu?.some(sub => isItemActive(sub.href))
    );
    
    const newExpanded = activeItems.map(item => item.label);
    setExpandedItems(prev => [...new Set([...prev, ...newExpanded])]);
  }, [filteredItems]);

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (newCollapsedState) {
      setExpandedItems([]);
      setSearchQuery('');
    }
    onCollapseChange?.(newCollapsedState);
  };

  const toggleExpanded = (itemLabel: string) => {
    if (isCollapsed) return;
    
    setExpandedItems(prev => 
      prev.includes(itemLabel) 
        ? prev.filter(label => label !== itemLabel)
        : [...prev, itemLabel]
    );
  };

  const isItemActive = (href: string) => {
    if (!href) return false;
    // Exact match for root
    if (href === '/') return false;
    // Exact match for non-root
    return false;
  };

  const hasActiveSubmenu = (submenu: SidebarItem[] = []) => {
    return submenu.some(item => isItemActive(item.href));
  };

  const handleNavigation = (href: string, hasSubmenu: boolean = false) => {
    if (hasSubmenu && !isCollapsed) return;
    
    if (href && href !== '#') {
      navigate(href);
    }
    
    try {
      // Close mobile sidebar after navigation
      if (isMobileOpen) {
        onMobileOpenChange?.(false);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Navigation failed');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Auto-expand items that match search
    if (query) {
      const matchingItems = sidebarItems.filter(item => {
        const matchesMain = item.label.toLowerCase().includes(query.toLowerCase());
        const matchesSubmenu = item.submenu?.some(sub => 
          sub.label.toLowerCase().includes(query.toLowerCase())
        );
        return (matchesMain || matchesSubmenu) && item.submenu?.length;
      });
      setExpandedItems(matchingItems.map(item => item.label));
    }
  };

  // Don't render sidebar if user is not authenticated
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-white backdrop-blur-sm md:hidden transition-colors duration-200"
          onClick={() => onMobileOpenChange?.(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col bg-white transition-all duration-300 ease-in-out border border-gray-200/80",
        "md:flex",
        isMobileOpen ? "flex" : "hidden md:flex",
        "w-64 md:w-auto",
        isCollapsed ? "md:w-16" : "md:w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="flex h-14 items-center px-3">
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMobileOpenChange?.(false)}
            className="md:hidden h-8 w-8 shrink-0 mr-2"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
          
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Building className="h-6 w-6 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-sm text-foreground truncate block">
                  {APP_CONFIG.company}
                </span>
                <span className="text-xs text-muted-foreground truncate block">
                  {APP_CONFIG.fullname}
                </span>
              </div>
            </div>
          )}
          
          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn(
              "hidden md:flex h-8 w-8 shrink-0",
              isCollapsed ? "mx-auto" : "ml-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Role Badge */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs border-none">
              {userRole} Access
            </Badge>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            !isCollapsed && (
              <div className="text-sm text-muted-foreground text-center py-4">
                {searchQuery ? 'No menu items found' : 'No menu items available'}
              </div>
            )
          ) : (
            filteredItems.map((item) => {
              const isActive = isItemActive(item.href);
              const isExpanded = expandedItems.includes(item.label);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const hasActiveChild = hasActiveSubmenu(item.submenu);
              
              return (
                <div key={`${item.href}-${item.label}`} className="space-y-1">
                  {/* Main Item */}
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground",
                      (isActive || hasActiveChild) ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                    onClick={() => {
                      if (hasSubmenu) {
                        toggleExpanded(item.label);
                      }
                      handleNavigation(item.href, hasSubmenu || false);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (hasSubmenu) {
                          toggleExpanded(item.label);
                        }
                        handleNavigation(item.href, hasSubmenu || false);
                      }
                    }}
                  >
                    <span className="shrink-0">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <Badge 
                              variant={item.badgeVariant || "default"}
                              className="h-5 min-w-[20px] text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {hasSubmenu && (
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-90"
                            )} />
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Submenu */}
                  {hasSubmenu && !isCollapsed && isExpanded && (
                    <div className="ml-6 space-y-1">
                      {item.submenu?.map((subItem) => (
                        <div
                          key={`${subItem.href}-${subItem.label}`}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
                            "hover:bg-accent hover:text-accent-foreground",
                            isItemActive(subItem.href) 
                              ? "bg-accent text-accent-foreground" 
                              : "text-muted-foreground"
                          )}
                          onClick={() => handleNavigation(subItem.href, false)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNavigation(subItem.href, false);
                            }
                          }}
                        >
                          <span className="shrink-0">
                            {subItem.icon}
                          </span>
                          <span className="flex-1 truncate">{subItem.label}</span>
                          {subItem.badge && (
                            <Badge 
                              variant={subItem.badgeVariant || "default"}
                              className="h-4 min-w-[16px] text-xs"
                            >
                              {subItem.badge}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-2 space-y-2">
          {/* Notifications */}
          

          {/* User Profile Section */}
          <div className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50 shadow-md",
            isCollapsed && "justify-center px-2"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={userName}>
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground truncate" title={userEmail}>
                  {userRole}
                </p>
              </div>
            )}
          </div>
          
          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
              isCollapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="flex-1 text-left">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;