"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Coins,
  House,
  Leaf,
  MessageCircle,
  Settings,
  Trees,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useApp } from "./provider";
import { classes } from "@/lib/demo";
import { AgentTools } from "./agent-tools";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
const items = [
  { href: "/pet", label: "My pet", icon: House },
  { href: "/plaza", label: "Student plaza", icon: Trees },
  { href: "/chat", label: "Class chat", icon: MessageCircle },
  { href: "/classroom", label: "Classroom", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];
function Navigation() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className="nav-item"
          >
            <Link href={item.href} onClick={() => setOpenMobile(false)}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const { state, ready, logout } = useApp();
  const pathname = usePathname();
  if (!ready)
    return (
      <main className="center-page">
        <Leaf className="float" />
        <p>Opening your little world…</p>
      </main>
    );
  if (!state)
    return (
      <main className="center-page">
        <div className="glass login-card">
          <Leaf size={36} />
          <h1>Make yourself at home.</h1>
          <p>Pick a name and a class to start your adventure.</p>
          <Button asChild className="primary-button">
            <Link href="/login">Enter MashRoom</Link>
          </Button>
        </div>
      </main>
    );
  if (pathname === "/pet")
    return (
      <>
        <AgentTools />
        {children}
      </>
    );
  return (
    <SidebarProvider>
      <AgentTools />
      <Sidebar className="app-sidebar">
        <SidebarHeader>
          <Link href="/" className="brand">
            <span className="brand-mark">
              <Leaf size={22} />
            </span>
            MashRoom<span className="brand-dot">.</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <div className="sidebar-label">YOUR LITTLE WORLD</div>
          <Navigation />
          <div className="sidebar-callout">
            <Sparkles size={22} />
            <strong>Little steps. Big growth.</strong>
            <p>Show your pet a little love today.</p>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="profile-row">
            <div className="mini-avatar">
              {state.profile.name[0].toUpperCase()}
            </div>
            <div>
              <strong>{state.profile.name}</strong>
              <small>
                {state.profile.mode === "demo"
                  ? "Demo explorer"
                  : "Google account"}
              </small>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={() => void logout()}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="app-header">
          <div className="header-class">
            <SidebarTrigger className="mobile-menu" />
            <BookOpen size={17} />
            {classes.find((c) => c.id === state.profile.classId)?.name ||
              "My classroom"}
            <span className="header-divider" />
            <span className="muted">A place to grow together</span>
          </div>
          <div className="header-points">
            <Coins size={17} />
            {state.profile.mode === "demo" ? "250" : "0"}
            <span>
              points{state.profile.mode === "demo" ? " · sample" : ""}
            </span>
          </div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="app-footer">
          <Leaf size={13} />{" "}
          {state.profile.mode === "demo"
            ? "Demo world · saved on this device · simulated classmates"
            : "Your connected world"}
          <span>MashRoom</span>
        </footer>
      </div>
    </SidebarProvider>
  );
}
