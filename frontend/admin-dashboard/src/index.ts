/**
 * Public entry point for @resqlink/admin-dashboard when it is consumed as a
 * nested module inside another app (the product-website shell, mounted at
 * "/admin/*").
 *
 * IMPORTANT: this file — not main.tsx — is what the merged build actually
 * imports, so the stylesheet has to be pulled in here too. main.tsx (used
 * only for this package's own standalone `npm run dev`) imports it
 * separately; without this line here, /admin inside product-website would
 * silently get zero admin-dashboard CSS.
 */
import './index.css';

export { AdminApp } from './App';
export { useAuth } from './hooks/useAuth';
export { useAuthStore } from './store/authStore';
export type { AuthUser } from './store/authStore';
