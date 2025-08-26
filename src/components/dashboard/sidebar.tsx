"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Users, 
  Code, 
  Globe, 
  Calendar, 
  LogOut,
  AlertTriangle
} from "lucide-react";

const navItems = [
  { name: "Vue d'ensemble", href: "/dashboard", icon: Home },
  { name: "Créateurs", href: "/dashboard/creators", icon: Users },
  { name: "Codes promo", href: "/dashboard/codes", icon: Code },
  { name: "Codes expirant bientôt", href: "/dashboard/expiring", icon: AlertTriangle },
  { name: "Sites", href: "/dashboard/sites", icon: Globe },
  { name: "Utilisateurs", href: "/dashboard/users", icon: Calendar },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="flex h-16 items-center justify-center border-b">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <div className="flex flex-col justify-between h-[calc(100vh-4rem)]">
        <nav className="space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="px-2 py-4 border-t">
          <button
            onClick={logout}
            className="flex w-full items-center px-2 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
