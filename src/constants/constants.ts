// Application constants

export const APP_CONFIG = {
    name: 'EARS',
    fullname: "Economic Activities Reporting System",
    version: '1.0.0',
    description: 'Economic Activities Reporting System',
    author: 'Nepal Rastra Bank',
    url: '',
    company: 'Nepal Rastra Bank'
  } as const;
  
  export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 10000,
    retries: 3,
  } as const;
  
  
  // Routes constants
  export const ROUTES = {
    HOME: '/',
    ABOUT: '/about',
    CONTACT: '/contact',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    NOT_FOUND: '/404',
    
    // Ticket Management
    TICKETS: '/tickets',
    TICKETS_CREATE: '/tickets/create',
    TICKETS_MY: '/tickets/my-tickets',
    TICKETS_ASSIGNED: '/tickets/assigned',
    TICKETS_OPEN: '/tickets/open',
    TICKETS_IN_PROGRESS: '/tickets/in-progress',
    TICKETS_RESOLVED: '/tickets/resolved',
    TICKETS_CLOSED: '/tickets/closed',
    
    // Issue Categories
    CATEGORIES: '/categories',
    CATEGORIES_HARDWARE: '/categories/hardware',
    CATEGORIES_NETWORK: '/categories/network',
    CATEGORIES_SOFTWARE: '/categories/software',
    CATEGORIES_MAINTENANCE: '/categories/maintenance',
    
    // Knowledge Base
    KNOWLEDGE_BASE: '/knowledge-base',
    KB_ARTICLES: '/knowledge-base/articles',
    KB_FAQS: '/knowledge-base/faqs',
    KB_TROUBLESHOOTING: '/knowledge-base/troubleshooting',
    KB_SEARCH: '/knowledge-base/search',
    
    // User Management
    USERS: '/users',
    USERS_STAFF: '/users/staff',
    USERS_SUPPORT_TEAM: '/users/support-team',
    USERS_ACTIVITY: '/users/activity',
    
    // Reports & Analytics
    REPORTS: '/reports',
    REPORTS_TICKETS: '/reports/tickets',
    REPORTS_PERFORMANCE: '/reports/performance',
    REPORTS_USERS: '/reports/users',
    REPORTS_SYSTEM_HEALTH: '/reports/system-health',
    
    // Schedule & Calendar
    SCHEDULE: '/schedule',
    SCHEDULE_MAINTENANCE: '/schedule/maintenance',
    SCHEDULE_SUPPORT: '/schedule/support',
    SCHEDULE_HOLIDAYS: '/schedule/holidays',
    
    // Administration
    ADMIN: '/admin',
    ADMIN_SETTINGS: '/admin/settings',
    ADMIN_CATEGORIES: '/admin/categories',
    ADMIN_PRIORITIES: '/admin/priorities',
    ADMIN_EMAIL_TEMPLATES: '/admin/email-templates',
    
    // Approvals & Audit
    APPROVALS: '/approvals',
    AUDIT: '/audit',
  } as const;
  
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  } as const;
  
  export const ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    TIMEOUT: 'TIMEOUT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  } as const;
  
  export const ERROR_MESSAGES = {
    [ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
    [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action.',
    [ERROR_CODES.FORBIDDEN]: 'Access denied. You do not have permission to access this resource.',
    [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
    [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ERROR_CODES.SERVER_ERROR]: 'Internal server error. Please try again later.',
    [ERROR_CODES.TIMEOUT]: 'Request timeout. Please try again.',
    [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  } as const;
  
  export const PAGINATION_DEFAULTS = {
    page: 1,
    limit: 10,
    maxLimit: 100,
  } as const;
  
  export const THEME_OPTIONS = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  } as const;
  
  export const LOCAL_STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language',
  } as const;
  
  export const QUERY_KEYS = {
    AUTH: 'auth',
    USER: 'user',
    USERS: 'users',
    PROFILE: 'profile',
    TICKETS: 'tickets',
    TICKET: 'ticket',
    CATEGORIES: 'categories',
    KNOWLEDGE_BASE: 'knowledge-base',
    REPORTS: 'reports',
  } as const;
  
  // Helpdesk specific constants
  export const TICKET_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
  } as const;
  
  export const TICKET_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
    URGENT: 'urgent',
  } as const;
  
  export const ISSUE_CATEGORIES = {
    HARDWARE: 'hardware',
    NETWORK: 'network',
    SOFTWARE: 'software',
    MAINTENANCE: 'maintenance',
    ACCOUNT_ACCESS: 'account_access',
    EMAIL: 'email',
    PRINTER: 'printer',
    PHONE: 'phone',
    OTHER: 'other',
  } as const;
  
  export const USER_ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    ADMIN: 'ADMIN',
    IT_MANAGER: 'IT_MANAGER',
    IT_SUPPORT: 'IT_SUPPORT',
    STAFF: 'STAFF',
    USER: 'USER',
  } as const;
  
  export const TICKET_PRIORITY_COLORS = {
    [TICKET_PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
    [TICKET_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
    [TICKET_PRIORITY.HIGH]: 'bg-yellow-100 text-yellow-800',
    [TICKET_PRIORITY.CRITICAL]: 'bg-red-100 text-red-800',
    [TICKET_PRIORITY.URGENT]: 'bg-purple-100 text-purple-800',
  } as const;
  
  export const TICKET_STATUS_COLORS = {
    [TICKET_STATUS.OPEN]: 'bg-red-100 text-red-800',
    [TICKET_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [TICKET_STATUS.RESOLVED]: 'bg-green-100 text-green-800',
    [TICKET_STATUS.CLOSED]: 'bg-gray-100 text-gray-800',
    [TICKET_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
  } as const;
  