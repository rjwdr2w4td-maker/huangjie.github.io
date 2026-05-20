"use client";

import { useState, useCallback } from "react";
import { MapPin, Search, Eye, Plus, MoreHorizontal, Shuffle, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SowingTask {
  id: string;
  taskNo: string;
  taskName: string;
  township: string;
  points: { landId: string; landName: string; lat: string; lng: string; variety: string; enterprise: string; sampled: boolean }[];
  sampler: string;
  deadline: string;
  totalPoints: number;
  completedPoints: number;
  status: "in_progress" | "completed";
  createdAt: string;
  remark: string;
}

const townships = ["城关镇", "柳城镇", "沙沟乡", "永丰乡", "兴隆镇", "双龙镇"];

const samplerOptions = ["刘管理", "赵主任", "王检测", "李技术", "张助理"];

const initialData: SowingTask[] = [
  { id: "1", taskNo: "BC-2024-001", taskName: "2024年播种期抽检-第一批", township: "城关镇,柳城镇,沙沟乡", points: [
    { landId: "L001", landName: "城关镇-条田A3", lat: "38.9123", lng: "101.5432", variety: "杂交水稻", enterprise: "丰源种业", sampled: true },
    { landId: "L005", landName: "柳城镇-条田B7", lat: "38.8956", lng: "101.5678", variety: "小麦原种", enterprise: "绿丰农业", sampled: true },
    { landId: "L012", landName: "沙沟乡-条田C2", lat: "38.9345", lng: "101.5123", variety: "玉米制种", enterprise: "金穗种业", sampled: false },
  ], sampler: "刘管理", deadline: "2024-05-15", totalPoints: 3, completedPoints: 2, status: "in_progress", createdAt: "2024-04-10", remark: "每个乡镇至少2个点" },
  { id: "2", taskNo: "BC-2024-002", taskName: "2024年播种期城关镇全覆盖抽检", township: "城关镇", points: [
    { landId: "L001", landName: "城关镇-条田A1", lat: "38.9101", lng: "101.5401", variety: "杂交水稻", enterprise: "丰源种业", sampled: true },
    { landId: "L002", landName: "城关镇-条田A2", lat: "38.9112", lng: "101.5415", variety: "杂交水稻", enterprise: "丰源种业", sampled: true },
    { landId: "L003", landName: "城关镇-条田A3", lat: "38.9123", lng: "101.5432", variety: "小麦原种", enterprise: "绿丰农业", sampled: false },
    { landId: "L004", landName: "城关镇-条田B1", lat: "38.9089", lng: "101.5456", variety: "玉米制种", enterprise: "金穗种业", sampled: true },
  ], sampler: "赵主任", deadline: "2024-05-20", totalPoints: 4, completedPoints: 3, status: "in_progress", createdAt: "2024-04-15", remark: "乡镇全覆盖" },
  { id: "3", taskNo: "BC-2024-003", taskName: "2024年播种期抽检-第二批", township: "永丰乡,兴隆镇,双龙镇", points: [
    { landId: "L020", landName: "永丰乡-条田D1", lat: "38.9201", lng: "101.5801", variety: "杂交水稻", enterprise: "丰源种业", sampled: true },
    { landId: "L025", landName: "兴隆镇-条田E3", lat: "38.9312", lng: "101.5915", variety: "玉米制种", enterprise: "金穗种业", sampled: true },
    { landId: "L030", landName: "双龙镇-条田F5", lat: "38.9423", lng: "101.6032", variety: "小麦原种", enterprise: "绿丰农业", sampled: true },
  ], sampler: "王检测", deadline: "2024-05-25", totalPoints: 3, completedPoints: 3, status: "completed", createdAt: "2024-04-20", remark: "" },
];

const statusConfig = {
  in_progress: { label: "执行中", variant: "default" as const },
  completed: { label: "已结束", variant: "secondary" as const },
};

export default function SowingInspectionPage() {
  const [data, setData] = useState<SowingTask[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<SowingTask | null>(null);
  const [deletingItem, setDeletingItem] = useState<SowingTask | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSelectedTownships, setFormSelectedTownships] = useState<string[]>([]);
  const [formMinPoints, setFormMinPoints] = useState("2");
  const [formSampler, setFormSampler] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formRemark, setFormRemark] = useState("");

  const filtered = data.filter((e) => {
    const matchesSearch = e.taskNo.includes(searchTerm) || e.taskName.includes(searchTerm) || e.township.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleTownship = (name: string) => {
    setFormSelectedTownships(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  };

  /* 随机选点逻辑 */
  const generateRandomPoints = (townshipList: string[], minPerTownship: number) => {
    const allLands: Record<string, { landId: string; landName: string; lat: string; lng: string; variety: string; enterprise: string }[]> = {
      "城关镇": [
        { landId: "L001", landName: "城关镇-条田A1", lat: "38.9101", lng: "101.5401", variety: "杂交水稻", enterprise: "丰源种业" },
        { landId: "L002", landName: "城关镇-条田A2", lat: "38.9112", lng: "101.5415", variety: "杂交水稻", enterprise: "丰源种业" },
        { landId: "L003", landName: "城关镇-条田A3", lat: "38.9123", lng: "101.5432", variety: "小麦原种", enterprise: "绿丰农业" },
        { landId: "L004", landName: "城关镇-条田B1", lat: "38.9089", lng: "101.5456", variety: "玉米制种", enterprise: "金穗种业" },
      ],
      "柳城镇": [
        { landId: "L005", landName: "柳城镇-条田B7", lat: "38.8956", lng: "101.5678", variety: "小麦原种", enterprise: "绿丰农业" },
        { landId: "L006", landName: "柳城镇-条田B8", lat: "38.8967", lng: "101.5690", variety: "杂交水稻", enterprise: "丰源种业" },
        { landId: "L007", landName: "柳城镇-条田C1", lat: "38.8978", lng: "101.5701", variety: "玉米制种", enterprise: "金穗种业" },
      ],
      "沙沟乡": [
        { landId: "L008", landName: "沙沟乡-条田C2", lat: "38.9345", lng: "101.5123", variety: "玉米制种", enterprise: "金穗种业" },
        { landId: "L009", landName: "沙沟乡-条田C3", lat: "38.9356", lng: "101.5134", variety: "杂交水稻", enterprise: "丰源种业" },
      ],
      "永丰乡": [
        { landId: "L010", landName: "永丰乡-条田D1", lat: "38.9200", lng: "101.5800", variety: "小麦原种", enterprise: "绿丰农业" },
        { landId: "L011", landName: "永丰乡-条田D2", lat: "38.9211", lng: "101.5812", variety: "玉米制种", enterprise: "金穗种业" },
      ],
      "兴隆镇": [
        { landId: "L013", landName: "兴隆镇-条田E1", lat: "38.9300", lng: "101.5900", variety: "杂交水稻", enterprise: "丰源种业" },
        { landId: "L014", landName: "兴隆镇-条田E2", lat: "38.9311", lng: "101.5912", variety: "小麦原种", enterprise: "绿丰农业" },
      ],
      "双龙镇": [
        { landId: "L015", landName: "双龙镇-条田F1", lat: "38.9400", lng: "101.6000", variety: "玉米制种", enterprise: "金穗种业" },
      ],
    };

    const selected: SowingTask["points"] = [];
    townshipList.forEach(t => {
      const lands = allLands[t] || [];
      const shuffled = [...lands].sort(() => Math.random() - 0.5);
      const count = Math.min(Math.max(minPerTownship, 1), shuffled.length);
      shuffled.slice(0, count).forEach(l => selected.push({ ...l, sampled: false }));
    });
    return selected;
  };

  const handleCreateTask = useCallback(() => {
    if (!formName || formSelectedTownships.length === 0) return;
    const points = generateRandomPoints(formSelectedTownships, parseInt(formMinPoints) || 2);
    const newItem: SowingTask = {
      id: Date.now().toString(),
      taskNo: `BC-2024-${String(data.length + 1).padStart(3, "0")}`,
      taskName: formName,
      township: formSelectedTownships.join(","),
      points,
      sampler: formSampler,
      deadline: formDeadline,
      totalPoints: points.length,
      completedPoints: 0,
      status: "in_progress",
      createdAt: new Date().toISOString().split("T")[0],
      remark: formRemark,
    };
    setData(prev => [newItem, ...prev]);
    setFormName(""); setFormSelectedTownships([]); setFormMinPoints("2"); setFormSampler(""); setFormDeadline(""); setFormRemark("");
    setAddOpen(false);
  }, [formName, formSelectedTownships, formMinPoints, formSampler, formDeadline, formRemark, data.length]);

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData(prev => prev.filter(item => item.id !== deletingItem.id));
    setDeletingItem(null); setDeleteOpen(false);
  }, [deletingItem]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">播种抽检任务</h1>
          <p className="text-sm text-muted-foreground mt-1">系统随机选点，创建播种期抽检任务并下发执行</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setFormName(""); setFormSelectedTownships([]); setFormMinPoints("2"); setFormSampler(""); setFormDeadline(""); setFormRemark(""); setAddOpen(true); }}><Plus className="h-3.5 w-3.5" />创建抽检任务</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><MapPin className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">任务总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><Send className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">执行中</p><p className="text-lg font-semibold">{data.filter(e => e.status === "in_progress").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-3/10 p-2"><CheckCircle2 className="h-4 w-4 text-chart-3" /></div><div><p className="text-sm text-muted-foreground">已结束</p><p className="text-lg font-semibold">{data.filter(e => e.status === "completed").length}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索任务编号、名称、乡镇..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部</SelectItem><SelectItem value="in_progress">执行中</SelectItem><SelectItem value="completed">已结束</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>任务编号</TableHead>
                <TableHead>任务名称</TableHead>
                <TableHead>乡镇</TableHead>
                <TableHead>取样人</TableHead>
                <TableHead>截止时间</TableHead>
                <TableHead>抽检点数</TableHead>
                <TableHead>完成进度</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{item.taskNo}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{item.taskName}</TableCell>
                  <TableCell className="text-sm max-w-[150px] truncate">{item.township}</TableCell>
                  <TableCell>{item.sampler || "—"}</TableCell>
                  <TableCell>{item.deadline || "—"}</TableCell>
                  <TableCell>{item.totalPoints}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${item.totalPoints > 0 ? (item.completedPoints / item.totalPoints) * 100 : 0}%` }} /></div>
                      <span className="text-xs text-muted-foreground">{item.completedPoints}/{item.totalPoints}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={statusConfig[item.status].variant}>{statusConfig[item.status].label}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => { setDeletingItem(item); setDeleteOpen(true); }}>删除</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建任务 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>创建播种抽检任务</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>任务名称 *</Label><Input placeholder="如：2024年播种期抽检-第一批" value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>选择乡镇 *</Label>
              <div className="grid grid-cols-3 gap-2">
                {townships.map(t => (
                  <label key={t} className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={formSelectedTownships.includes(t)} onCheckedChange={() => toggleTownship(t)} />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>每乡镇最少抽检点数</Label><Input type="number" min={1} value={formMinPoints} onChange={(e) => setFormMinPoints(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>取样人 *</Label>
                <Select value={formSampler} onValueChange={setFormSampler}>
                  <SelectTrigger><SelectValue placeholder="选择取样人" /></SelectTrigger>
                  <SelectContent>
                    {samplerOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>截止时间 *</Label>
                <Input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Textarea rows={2} value={formRemark} onChange={(e) => setFormRemark(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleCreateTask} disabled={!formName || formSelectedTownships.length === 0 || !formSampler || !formDeadline}><Shuffle className="h-4 w-4 mr-1" />随机选点并创建</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0"><DialogTitle>抽检任务详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">任务编号</p><p className="font-mono">{viewingItem.taskNo}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">状态</p><Badge variant={statusConfig[viewingItem.status].variant}>{statusConfig[viewingItem.status].label}</Badge></div>
              </div>
              <div className="space-y-1"><p className="text-sm text-muted-foreground">任务名称</p><p className="font-medium">{viewingItem.taskName}</p></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">涉及乡镇</p><p>{viewingItem.township}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">取样人</p><p>{viewingItem.sampler || "未指派"}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">截止时间</p><p>{viewingItem.deadline || "未设定"}</p></div>
              </div>
              {viewingItem.points.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">抽检样点明细（{viewingItem.completedPoints}/{viewingItem.totalPoints} 已完成）</p>
                  <Table>
                    <TableHeader><TableRow><TableHead>地块编号</TableHead><TableHead>地块名称</TableHead><TableHead>经纬度</TableHead><TableHead>品种</TableHead><TableHead>企业</TableHead><TableHead>状态</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {viewingItem.points.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-sm">{p.landId}</TableCell>
                          <TableCell>{p.landName}</TableCell>
                          <TableCell className="font-mono text-xs">{p.lat}, {p.lng}</TableCell>
                          <TableCell>{p.variety}</TableCell>
                          <TableCell>{p.enterprise}</TableCell>
                          <TableCell><Badge variant={p.sampled ? "default" : "outline"}>{p.sampled ? "已取样" : "待取样"}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {viewingItem.remark && <div className="space-y-1"><p className="text-sm text-muted-foreground">备注</p><p>{viewingItem.remark}</p></div>}
            </div>
          )}
          <DialogFooter className="shrink-0"><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除任务「{deletingItem?.taskNo}」吗？</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
