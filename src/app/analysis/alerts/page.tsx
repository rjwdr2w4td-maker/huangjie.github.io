"use client";

import { useState, useCallback } from "react";
import {
  AlertTriangle, Bell, CheckCircle2, Eye, MoreHorizontal, Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AlertRecord {
  id: string;
  sampleNo: string;
  township: string;
  variety: string;
  enterprise: string;
  result: "positive";
  alertTime: string;
  isRead: boolean;
  isHandled: boolean;
  remark: string;
}

const initialAlerts: AlertRecord[] = [
  { id: "1", sampleNo: "63-1", township: "朝阳镇", variety: "玉米郑单958", enterprise: "丰源种业", result: "positive", alertTime: "2024-05-14 16:32", isRead: false, isHandled: false, remark: "转基因检测CaMV35S阳性" },
  { id: "2", sampleNo: "44-3", township: "河西镇", variety: "水稻宜香优2115", enterprise: "绿丰农业", result: "positive", alertTime: "2024-05-09 11:20", isRead: true, isHandled: true, remark: "已复检确认" },
  { id: "3", sampleNo: "31-2", township: "南湖镇", variety: "玉米川单189", enterprise: "德农种业", result: "positive", alertTime: "2024-04-28 09:45", isRead: true, isHandled: true, remark: "复检阴性" },
  { id: "4", sampleNo: "63-2", township: "城关镇", variety: "杂交水稻Y两优900", enterprise: "丰收种业", result: "positive", alertTime: "2024-06-07 10:30", isRead: false, isHandled: false, remark: "CaMV35S阳性，需复检" },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>(initialAlerts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<AlertRecord | null>(null);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const filtered = alerts.filter((e) => {
    const matchesSearch = e.sampleNo.includes(searchTerm) || e.variety.includes(searchTerm) || e.enterprise.includes(searchTerm) || e.township.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || (statusFilter === "unread" && !e.isRead) || (statusFilter === "handled" && e.isHandled) || (statusFilter === "unhandled" && !e.isHandled);
    return matchesSearch && matchesStatus;
  });

  const handleMarkRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, isRead: true } : a));
  }, []);

  const handleMarkHandled = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, isRead: true, isHandled: true } : a));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">阳性地块预警</h1>
          <p className="text-sm text-muted-foreground mt-1">阳性地块高亮显示，自动生成预警通知，触发站内信/短信给管理人员</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5"><Bell className="h-3.5 w-3.5" />全部标为已读</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-2xl font-bold text-destructive">{unreadCount}</p><p className="text-xs text-muted-foreground">未处理预警</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10"><Bell className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{alerts.length}</p><p className="text-xs text-muted-foreground">总预警数</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-2/10"><CheckCircle2 className="h-5 w-5 text-chart-2" /></div>
            <div><p className="text-2xl font-bold">{alerts.filter((a) => a.isHandled).length}</p><p className="text-xs text-muted-foreground">已处理</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索样品号、品种、企业、乡镇..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部</SelectItem><SelectItem value="unread">未读</SelectItem><SelectItem value="unhandled">待处理</SelectItem><SelectItem value="handled">已处理</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">预警列表</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">状态</TableHead>
                <TableHead>样品编号</TableHead>
                <TableHead>乡镇</TableHead>
                <TableHead>品种</TableHead>
                <TableHead>企业</TableHead>
                <TableHead>检测结果</TableHead>
                <TableHead>预警时间</TableHead>
                <TableHead>处理状态</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">暂无预警</TableCell></TableRow>
              ) : filtered.map((alert) => (
                <TableRow key={alert.id} className={!alert.isRead ? "bg-destructive/5" : ""}>
                  <TableCell>{!alert.isRead && <span className="inline-block h-2 w-2 rounded-full bg-destructive animate-pulse" />}</TableCell>
                  <TableCell className="font-mono font-medium">{alert.sampleNo}</TableCell>
                  <TableCell>{alert.township}</TableCell>
                  <TableCell>{alert.variety}</TableCell>
                  <TableCell>{alert.enterprise}</TableCell>
                  <TableCell><Badge variant="destructive">阳性</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{alert.alertTime}</TableCell>
                  <TableCell><Badge variant={alert.isHandled ? "default" : "outline"}>{alert.isHandled ? "已处理" : "待处理"}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(alert); handleMarkRead(alert.id); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                        {!alert.isRead && <DropdownMenuItem className="gap-2" onClick={() => handleMarkRead(alert.id)}><Bell className="h-4 w-4" />标记已读</DropdownMenuItem>}
                        {!alert.isHandled && <DropdownMenuItem className="gap-2" onClick={() => handleMarkHandled(alert.id)}><CheckCircle2 className="h-4 w-4" />标记已处理</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Detail */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>预警详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">样品编号</p><p className="font-mono font-medium">{viewingItem.sampleNo}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">乡镇</p><p>{viewingItem.township}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种</p><p>{viewingItem.variety}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">企业</p><p>{viewingItem.enterprise}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">检测结果</p><Badge variant="destructive">阳性</Badge></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">预警时间</p><p>{viewingItem.alertTime}</p></div>
              </div>
              {viewingItem.remark && <div className="space-y-1"><p className="text-sm text-muted-foreground">备注</p><p>{viewingItem.remark}</p></div>}
              <div className="space-y-1"><p className="text-sm text-muted-foreground">处理状态</p><Badge variant={viewingItem.isHandled ? "default" : "outline"}>{viewingItem.isHandled ? "已处理" : "待处理"}</Badge></div>
            </div>
          )}
          <DialogFooter>
            {viewingItem && !viewingItem.isHandled && <Button onClick={() => { handleMarkHandled(viewingItem.id); setViewOpen(false); }}><CheckCircle2 className="h-4 w-4 mr-1" />标记已处理</Button>}
            <Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
