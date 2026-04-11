import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  Film,
  BookMarked,
  ClipboardList,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth";
import { useThemeStore, resolveEffectiveTheme } from "@/features/theme";

export function ProtectedHeader() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const logout = useAuthStore((s) => s.logout);
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const displayName = profile?.display_name ?? user?.email ?? "";
  const avatarUrl = profile?.avatar_url ?? undefined;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const effective = resolveEffectiveTheme(mode);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate({ to: "/login" });
  };

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="cursor-pointer">
            <img
              src={
                effective === "dark"
                  ? "https://www.slntech.com.br/logo-light.svg"
                  : "https://www.slntech.com.br/logo-dark.svg"
              }
              alt="CineDash"
              className="h-10"
            />
          </Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <Film className="size-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/watchlist">
                <BookMarked className="size-4" />
                Minha Lista
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/requests">
                <ClipboardList className="size-4" />
                Pedidos
              </Link>
            </Button>
            {isAdmin() && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/requests">
                  <Shield className="size-4" />
                  Admin
                </Link>
              </Button>
            )}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-8 cursor-pointer">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggle}>
              {effective === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              {effective === "dark" ? "Tema claro" : "Tema escuro"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
