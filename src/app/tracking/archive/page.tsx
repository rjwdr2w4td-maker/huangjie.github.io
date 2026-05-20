"use client";

import { useState, useCallback, useEffect } from "react";
import { Archive, Search, Eye, Download, MoreHorizontal, Trash2, Clock, FileCheck, ClipboardCheck, FlaskConical, FileText, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ArchivedReport {
  id: string;
  reportNo: string;
  batchNo: string;
  sampleNo: string;
  variety: string;
  enterprise: string;
  cropType: string;
  result: "阴性" | "阳性";
  archiveDate: string;
  archivePerson: string;
  signer: string;
  signDate: string;
  testDate: string;
  tester: string;
  testType: string;
  storageLocation: string;
  source: string;
  status: "archived" | "borrowed";
}

/* 全流程追溯数据 */
interface FlowStep {
  step: string;
  title: string;
  date: string;
  operator: string;
  detail: string;
  icon: React.ReactNode;
}

const getFlowData = (item: ArchivedReport): FlowStep[] => {
  const sourceLabel = item.source === "sowing" ? "播种" : item.source === "leaf" ? "叶片" : "亲本种子";
  return [
    { step: "1", title: "种子备案", date: "2024-05-10", operator: item.enterprise, detail: `品种：${item.variety}，作物种类：${item.cropType}，来源：海南南繁基地`, icon: <FileText className="h-3.5 w-3.5" /> },
    { step: "2", title: "备案审核通过", date: "2024-05-12", operator: "县农业农村局", detail: `审核通过，${sourceLabel}样品生成接样单`, icon: <FileCheck className="h-3.5 w-3.5" /> },
    { step: "3", title: "接样单生成", date: "2024-05-12", operator: "县农业农村局", detail: `送样方式：企业送样，批次号：${item.batchNo}`, icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
    { step: "4", title: "样品接收", date: "2024-05-14", operator: "检验室-王接收", detail: `样品状况：完好，存放点：${item.storageLocation || "冷藏柜A-01"}`, icon: <Archive className="h-3.5 w-3.5" /> },
    { step: "5", title: "检验数据录入", date: item.testDate, operator: item.tester, detail: `检测类型：${item.testType}，最终结论：${item.result}`, icon: <FlaskConical className="h-3.5 w-3.5" /> },
    { step: "6", title: "检验报告生成", date: item.testDate, operator: item.tester, detail: `报告编号：${item.reportNo}`, icon: <FileText className="h-3.5 w-3.5" /> },
    { step: "7", title: "审核签章", date: item.signDate, operator: item.signer, detail: `审核通过，电子签名确认`, icon: <PenLine className="h-3.5 w-3.5" /> },
    { step: "8", title: "报告归档", date: item.archiveDate, operator: item.archivePerson, detail: "归档完成，可追溯全流程数据", icon: <Archive className="h-3.5 w-3.5" /> },
  ];
};

const sourceLabels: Record<string, string> = { parent: "亲本种子", sowing: "播种", leaf: "叶片" };

const initialData: ArchivedReport[] = [
  { id: "1", reportNo: "JYBG20240001", batchNo: "2024-HP-001", sampleNo: "JYD20240001", variety: "Y58S", enterprise: "绿源种业", cropType: "水稻", result: "阴性", archiveDate: "2024-02-01", archivePerson: "张检验", signer: "李审核", signDate: "2024-01-28", testDate: "2024-01-25", tester: "李检验", testType: "转基因检测", storageLocation: "冷藏柜A-01", source: "parent", status: "archived" },
  { id: "2", reportNo: "JYBG20240002", batchNo: "2024-HP-002", sampleNo: "JYD20240002", variety: "杂交水稻Y两优900", enterprise: "丰收种业", cropType: "水稻", result: "阴性", archiveDate: "2024-06-12", archivePerson: "张检验", signer: "王审核", signDate: "2024-06-10", testDate: "2024-06-07", tester: "张检验", testType: "转基因检测", storageLocation: "冷藏柜A-02", source: "parent", status: "archived" },
  { id: "3", reportNo: "JYBG20240003", batchNo: "2024-HP-003", sampleNo: "JYD20240003", variety: "杂交水稻Y两优900", enterprise: "丰收种业", cropType: "水稻", result: "阳性", archiveDate: "2024-06-15", archivePerson: "张检验", signer: "王审核", signDate: "2024-06-13", testDate: "2024-06-09", tester: "张检验", testType: "转基因检测", storageLocation: "冷藏柜B-01", source: "sowing", status: "borrowed" },
  { id: "4", reportNo: "JYBG20240004", batchNo: "2024-HP-004", sampleNo: "JYD20240004", variety: "C两优华占", enterprise: "金穗种业", cropType: "水稻", result: "阴性", archiveDate: "2024-07-20", archivePerson: "李检验", signer: "赵审核", signDate: "2024-07-18", testDate: "2024-07-15", tester: "李检验", testType: "转基因检测", storageLocation: "冷藏柜A-03", source: "leaf", status: "archived" },
];

export default function ArchivePage() {
  const [data, setData] = useState<ArchivedReport[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ArchivedReport | null>(null);
  const [deletingItem, setDeletingItem] = useState<ArchivedReport | null>(null);

  // 从 localStorage 加载已归档的报告
  useEffect(() => {
    try {
      const stored = localStorage.getItem("inspection_reports");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const archived = parsed
            .filter((r: Record<string, unknown>) => r.status === "已归档")
            .map((r: Record<string, unknown>, idx: number) => ({
              id: `ls-${idx}`,
              reportNo: (r.reportNo as string) || "",
              batchNo: (r.batchNo as string) || "",
              sampleNo: (r.batchNo as string) || "",
              variety: (r.variety as string) || "",
              enterprise: (r.enterprise as string) || "—",
              cropType: (r.cropType as string) || "",
              result: ((r.result as string) === "阳性" ? "阳性" : "阴性") as "阴性" | "阳性",
              archiveDate: (r.archiveDate as string) || new Date().toISOString().slice(0, 10),
              archivePerson: (r.archivePerson as string) || "系统归档",
              signer: (r.signer as string) || "",
              signDate: (r.signDate as string) || "",
              testDate: (r.testDate as string) || "",
              tester: (r.tester as string) || "",
              testType: (r.testType as string) || "转基因检测",
              storageLocation: (r.storageLocation as string) || "",
              source: (r.source as string) || "parent",
              status: "archived" as const,
            }));
          setData((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newItems = archived.filter((a: ArchivedReport) => !existingIds.has(a.id));
            return [...prev, ...newItems];
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const filtered = data.filter((e) => {
    const matchesSearch = e.reportNo.includes(searchTerm) || e.sampleNo.includes(searchTerm) || e.variety.includes(searchTerm) || e.enterprise.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesSource = sourceFilter === "all" || e.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  const handleDownload = (item: ArchivedReport) => {
    const flowText = getFlowData(item).map((f) => `${f.step}. ${f.title} (${f.date}) - ${f.operator}: ${f.detail}`).join("\n");
    const content = `报告编号: ${item.reportNo}\n样品号: ${item.sampleNo}\n品种: ${item.variety}\n企业: ${item.enterprise}\n结果: ${item.result}\n归档日期: ${item.archiveDate}\n归档人: ${item.archivePerson}\n\n===== 全流程追溯 =====\n${flowText}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.reportNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">报告归档与查询</h1>
        <p className="text-sm text-muted-foreground mt-1">已归档检验报告查询，支持全流程追溯数据查看与下载</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><Archive className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">归档总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><Archive className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">在库</p><p className="text-lg font-semibold">{data.filter((e) => e.status === "archived").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><Clock className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">借出</p><p className="text-lg font-semibold">{data.filter((e) => e.status === "borrowed").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-5/10 p-2"><FileCheck className="h-4 w-4 text-chart-5" /></div><div><p className="text-sm text-muted-foreground">已签章</p><p className="text-lg font-semibold">{data.filter((e) => e.signer).length}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索报告号、样品号、品种、企业..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="样品来源" /></SelectTrigger><SelectContent><SelectItem value="all">全部来源</SelectItem><SelectItem value="parent">亲本种子</SelectItem><SelectItem value="sowing">播种</SelectItem><SelectItem value="leaf">叶片</SelectItem></SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="archived">在库</SelectItem><SelectItem value="borrowed">借出</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>报告编号</TableHead>
                <TableHead>批次号</TableHead>
                <TableHead>品种</TableHead>
                <TableHead>企业</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>签章人</TableHead>
                <TableHead>归档日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm font-medium">{item.reportNo}</TableCell>
                  <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                  <TableCell>{item.variety}</TableCell>
                  <TableCell>{item.enterprise}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{sourceLabels[item.source] || item.source}</Badge></TableCell>
                  <TableCell><Badge variant={item.result === "阳性" ? "destructive" : "outline"}>{item.result}</Badge></TableCell>
                  <TableCell>{item.signer || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.archiveDate}</TableCell>
                  <TableCell><Badge variant={item.status === "borrowed" ? "secondary" : "outline"}>{item.status === "archived" ? "在库" : "借出"}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情与追溯</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => handleDownload(item)}><Download className="h-4 w-4" />下载</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => { setDeletingItem(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" />删除</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 查看详情 + 全流程追溯 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0"><DialogTitle>报告详情与全流程追溯</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="overflow-y-auto flex-1 min-h-0 space-y-5 py-4">
              {/* 基本信息 */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold border-b pb-2 mb-3">报告基本信息</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><p className="text-xs text-muted-foreground">报告编号</p><p className="font-mono text-primary font-semibold">{viewingItem.reportNo}</p></div>
                  <div><p className="text-xs text-muted-foreground">批次号</p><p className="font-mono font-medium">{viewingItem.batchNo}</p></div>
                  <div><p className="text-xs text-muted-foreground">样品号</p><p className="font-mono">{viewingItem.sampleNo}</p></div>
                  <div><p className="text-xs text-muted-foreground">品种</p><p>{viewingItem.variety}</p></div>
                  <div><p className="text-xs text-muted-foreground">企业</p><p>{viewingItem.enterprise}</p></div>
                  <div><p className="text-xs text-muted-foreground">作物种类</p><p>{viewingItem.cropType}</p></div>
                  <div><p className="text-xs text-muted-foreground">样品来源</p><Badge variant="outline">{sourceLabels[viewingItem.source] || viewingItem.source}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">检测结果</p><Badge variant={viewingItem.result === "阳性" ? "destructive" : "outline"}>{viewingItem.result}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">检测类型</p><p>{viewingItem.testType}</p></div>
                  <div><p className="text-xs text-muted-foreground">存放点</p><p>{viewingItem.storageLocation || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">检测人</p><p>{viewingItem.tester}</p></div>
                  <div><p className="text-xs text-muted-foreground">检测日期</p><p>{viewingItem.testDate}</p></div>
                </div>
              </div>

              {/* 签章与归档 */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold border-b pb-2 mb-3">签章与归档</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><p className="text-xs text-muted-foreground">审核签章人</p><p>{viewingItem.signer || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">签章日期</p><p>{viewingItem.signDate || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">归档人</p><p>{viewingItem.archivePerson}</p></div>
                  <div><p className="text-xs text-muted-foreground">归档日期</p><p>{viewingItem.archiveDate}</p></div>
                  <div><p className="text-xs text-muted-foreground">归档状态</p><Badge variant={viewingItem.status === "borrowed" ? "secondary" : "outline"}>{viewingItem.status === "archived" ? "在库" : "借出"}</Badge></div>
                </div>
              </div>

              {/* 全流程追溯 */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold border-b pb-2 mb-4">全流程追溯</p>
                <div className="space-y-0">
                  {getFlowData(viewingItem).map((flow, idx) => (
                    <div key={flow.step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                          {flow.icon}
                        </div>
                        {idx < getFlowData(viewingItem).length - 1 && <div className="w-0.5 h-10 bg-border" />}
                      </div>
                      <div className="pb-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{flow.title}</p>
                          <span className="text-xs text-muted-foreground">{flow.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{flow.operator}</p>
                        <p className="text-sm mt-0.5">{flow.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button>
            {viewingItem && <Button onClick={() => handleDownload(viewingItem)}><Download className="h-4 w-4 mr-1" />下载报告</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除归档报告「{deletingItem?.reportNo}」吗？此操作不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
