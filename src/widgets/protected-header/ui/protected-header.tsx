import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  Film,
  BookMarked,
  ClipboardList,
  MessageSquare,
  Shield,
  Moon,
  Sun,
  Menu,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { useAuthStore } from "@/features/auth";
import { useThemeStore, resolveEffectiveTheme } from "@/features/theme";
import { NotificationBell } from "@/features/notifications";

export function ProtectedHeader() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const logout = useAuthStore((s) => s.logout);
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const mobileNavLinks = [
    { to: "/dashboard" as const, icon: Film, label: "Dashboard" },
    { to: "/watchlist" as const, icon: BookMarked, label: "Minha Lista" },
    { to: "/requests" as const, icon: ClipboardList, label: "Pedidos" },
    { to: "/feed" as const, icon: MessageSquare, label: "Feed" },
    ...(isAdmin()
      ? [{ to: "/admin/requests" as const, icon: Shield, label: "Admin" }]
      : []),
  ];

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="sm:hidden -ml-2">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="text-left">
                  <img
                    src={
                      effective === "dark"
                        ? "https://www.slntech.com.br/logo-light.svg"
                        : "https://www.slntech.com.br/logo-dark.svg"
                    }
                    alt="CineDash"
                    className="h-10"
                  />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3 gap-0.5">
                {mobileNavLinks.map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/dashboard" className="cursor-pointer shrink-0">
            <img
              src={
                effective === "dark"
                  ? "https://www.slntech.com.br/logo-light.svg"
                  : "https://www.slntech.com.br/logo-dark.svg"
              }
              alt="CineDash"
              className="h-10 hidden sm:block"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/feed">
                <MessageSquare className="size-4" />
                Feed
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

        <div className="flex items-center gap-1">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="size-8 cursor-pointer">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                <div>
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuItem>
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
      </div>
    </header>
  );
}
