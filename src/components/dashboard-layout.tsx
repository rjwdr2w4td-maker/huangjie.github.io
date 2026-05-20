"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Sprout,
  MapPin,
  FlaskConical,
  ClipboardCheck,
  FileSearch,
  RotateCcw,
  Upload,
  Route,
  Search,
  Archive,
  Map,
  BarChart3,
  AlertTriangle,
  UserCog,
  BookOpen,
  ScrollText,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Menu,
  Bell,
  FileWarning,
  User,
  LogOut,
  Shield,
  ShieldCheck,
  TreePine,
  Wheat,
  Leaf,
  Camera,
  Refrigerator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavGroup {
  title: string;
  icon: React.ElementType;
  items: { title: string; href: string; icon: React.ElementType; badge?: string }[];
}

const navGroups: NavGroup[] = [
  {
    title: "亲本种子检测",
    icon: Sprout,
    items: [
      { title: "制种企业信息", href: "/filing/enterprises", icon: Building2 },
      { title: "亲本种子备案", href: "/filing/parent-seeds", icon: Sprout },
      { title: "亲本种子审核", href: "/filing/parent-seed-review", icon: ShieldCheck },
      { title: "接样单管理", href: "/sampling/parent-inspection", icon: ClipboardCheck },
    ],
  },
  {
    title: "播种抽检",
    icon: Wheat,
    items: [
      { title: "播种抽检任务", href: "/sampling/sowing-inspection", icon: MapPin },
      { title: "抽检任务跟踪", href: "/sampling/tasks", icon: ClipboardCheck, badge: "3" },
    ],
  },
  {
    title: "叶片抽检",
    icon: Leaf,
    items: [
      { title: "乡镇制种明细表", href: "/filing/township-details", icon: MapPin },
      { title: "叶片抽检任务管理", href: "/filing/county-sampling-detail", icon: ShieldCheck },
      { title: "叶片扦样单", href: "/sampling/leaf-inspection", icon: FileSearch },
      { title: "样品存档", href: "/inspection/sample-archive", icon: Refrigerator },
    ],
  },
  {
    title: "检验管理",
    icon: FlaskConical,
    items: [
      { title: "样品接收", href: "/inspection/receiving", icon: FlaskConical },
      { title: "检验数据录入", href: "/inspection/data-entry", icon: ClipboardCheck },
      { title: "检验报告", href: "/inspection/reports", icon: FileText },
    ],
  },
  {
    title: "质量监督",
    icon: Route,
    items: [
      { title: "样品生命周期", href: "/tracking/lifecycle", icon: Route },
      { title: "检验数据查询", href: "/tracking/query", icon: Search },
      { title: "报告归档", href: "/tracking/archive", icon: Archive },
      { title: "复检管理", href: "/tracking/retest", icon: RotateCcw },
      { title: "处罚文书", href: "/tracking/penalty", icon: FileWarning },
    ],
  },
  {
    title: "结果分析",
    icon: BarChart3,
    items: [
      { title: "抽检结果地图", href: "/analysis/map", icon: Map },
      { title: "统计分析报表", href: "/analysis/statistics", icon: BarChart3 },
      { title: "阳性地块预警", href: "/analysis/alerts", icon: AlertTriangle, badge: "2" },
    ],
  },
  {
    title: "系统管理",
    icon: UserCog,
    items: [
      { title: "用户权限管理", href: "/system/users", icon: UserCog },
      { title: "数据字典", href: "/system/dictionary", icon: BookOpen },
      { title: "操作日志", href: "/system/logs", icon: ScrollText },
      { title: "APP版本管理", href: "/system/app-version", icon: Smartphone },
    ],
  },
];

function NavGroupItem({ group, pathname, collapsed }: { group: NavGroup; pathname: string; collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const isActive = group.items.some((item) => pathname === item.href);
  const GroupIcon = group.icon;

  if (collapsed) {
    return (
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="icon"
              className={cn("w-full h-10", isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
            >
              <GroupIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-52">
            <div className="px-2 py-1.5 text-sm font-semibold">{group.title}</div>
            <DropdownMenuSeparator />
            {group.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                    <ItemIcon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
          isActive && !open && "bg-sidebar-accent/50 text-sidebar-accent-foreground"
        )}
      >
        <GroupIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">{group.title}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
      </button>
      {(open || isActive) && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
          {group.items.map((item) => {
            const ItemIcon = item.icon;
            const itemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  itemActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
              >
                <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.title}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0 shrink-0">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn("flex items-center border-b border-sidebar-border px-4 py-3", collapsed ? "justify-center" : "gap-3")}>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
          <Shield className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">种子质量监管</span>
            <span className="text-xs text-sidebar-foreground/60 leading-tight">监督检验管理平台</span>
          </div>
        )}
      </div>

      {/* Dashboard Link */}
      <div className={cn("px-3 pt-3", collapsed && "px-2")}>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            pathname === "/" && "bg-sidebar-accent text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {!collapsed && <span>工作台</span>}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className={cn("space-y-1", collapsed && "space-y-2 px-0")}>
          {navGroups.map((group) => (
            <NavGroupItem key={group.title} group={group} pathname={pathname} collapsed={collapsed} />
          ))}
        </div>
      </ScrollArea>

      {/* Version */}
      {!collapsed && (
        <div className="border-t border-sidebar-border px-4 py-2">
          <p className="text-xs text-sidebar-foreground/50">v1.0.0</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} pathname={pathname} />
        <div className={cn("border-t border-sidebar-border p-2", collapsed && "flex justify-center")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", collapsed ? "justify-center px-2" : "justify-start")}
          >
            <Menu className="h-4 w-4" />
            {!collapsed && <span className="ml-2 text-xs">收起菜单</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0 bg-sidebar text-sidebar-foreground">
                <SidebarContent collapsed={false} pathname={pathname} />
              </SheetContent>
            </Sheet>
            <h2 className="text-base font-semibold hidden sm:block">
              {getPageTitle(pathname)}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">县级</AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:inline">张管理</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">张管理</p>
                  <p className="text-xs text-muted-foreground">县级种子管理人员</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  个人信息
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    "/": "工作台",
    "/filing/enterprises": "制种企业信息",
    "/filing/parent-seeds": "亲本种子备案",
    "/filing/parent-seed-review": "亲本种子审核",
    "/filing/township-details": "乡镇制种明细表",
    "/filing/county-sampling-detail": "叶片抽检任务管理",
    "/sampling/parent-inspection": "接样单管理",
    "/sampling/sowing-inspection": "播种抽检任务",

    "/sampling/leaf-inspection": "叶片扦样单",
    "/sampling/tasks": "抽检任务跟踪",
    "/inspection/receiving": "样品接收",
    "/inspection/data-entry": "检验数据录入",
    "/inspection/reports": "检验报告",
    "/inspection/retest": "复检管理",
    "/inspection/sample-archive": "样品存档",
    "/tracking/lifecycle": "样品生命周期",
    "/tracking/query": "检验数据查询",
    "/tracking/archive": "报告归档",
    "/tracking/retest": "复检管理",
    "/tracking/penalty": "处罚文书",
    "/analysis/map": "抽检结果地图",
    "/analysis/statistics": "统计分析报表",
    "/analysis/alerts": "阳性地块预警",
    "/system/users": "用户权限管理",
    "/system/dictionary": "数据字典",
    "/system/logs": "操作日志",
    "/system/app-version": "APP版本管理",
  };
  return titles[pathname] || "种子质量监管系统";
}
