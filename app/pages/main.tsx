import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "@/components/mashroom/provider";
import { Shell } from "@/components/mashroom/shell";
import Welcome from "@/app/page";
import Login from "@/app/login/page";
import Pet from "@/app/(world)/pet/page";
import Plaza from "@/app/(world)/plaza/page";
import Chat from "@/app/(world)/chat/page";
import Classroom from "@/app/(world)/classroom/page";
import Settings from "@/app/(world)/settings/page";
import ClassroomSettings from "@/app/(world)/settings/classroom/page";
import "@/app/globals.css";

const path = location.pathname
  .replace(/^\/MashRoom(?=\/|$)/, "")
  .replace(/\/$/, "") || "/";
const routes: Record<string, React.ReactNode> = {
  "/": <Welcome />,
  "/login": <Login />,
  "/pet": <Pet />,
  "/plaza": <Plaza />,
  "/chat": <Chat />,
  "/classroom": <Classroom />,
  "/settings": <Settings />,
  "/settings/classroom": <ClassroomSettings />,
};
const page = routes[path] ?? <Welcome />;

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    {path === "/" || path === "/login" ? page : <Shell>{page}</Shell>}
  </AppProvider>,
);
