"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Search, Eye, Download, MoreHorizontal, PenLine, Archive, CheckCircle, Wheat, Sprout, Leaf } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestElement {
  name: string;
  ctValue: string;
  result: string;
  detectionLimit?: string;
}

interface ReportData {
  reportNo: string;
  title: string;
  sampleInfo: { batchNo: string; cropType: string; variety: string; storageLocation: string; sampleAmount: string };
  testInfo: { testType: string; testMethod: string; instrumentModel: string; testStandard: string };
  testElements: TestElement[];
  conclusion: string;
  tester: string;
  reviewer: string;
  sender: string;
  testDate: string;
  reportDate: string;
  remark: string;
}

interface InspectionReport {
  id: string;
  reportNo: string;
  batchNo: string;
  cropType: string;
  variety: string;
  storageLocation: string;
  testType: string;
  result: "阴性" | "阳性";
  tester: string;
  testDate: string;
  reportData: ReportData | null;
  status: "待审核" | "已签章" | "已归档";
  signImage: string;
  signer: string;
  signDate: string;
  archiveDate: string;
  createdAt: string;
  source: "parent" | "sowing" | "leaf";
}



const mockData: InspectionReport[] = [
  {
    id: "1", reportNo: "JYBG20240001", batchNo: "2024-HP-001", cropType: "水稻", variety: "Y58S", storageLocation: "冷藏柜A-01",
    testType: "转基因检测", result: "阴性", tester: "李检验", testDate: "2024-01-25",
    reportData: {
      reportNo: "JYBG20240001", title: "转基因成分检测报告单",
      sampleInfo: { batchNo: "2024-HP-001", cropType: "水稻", variety: "Y58S", storageLocation: "冷藏柜A-01", sampleAmount: "200g" },
      testInfo: { testType: "转基因检测", testMethod: "实时荧光PCR", instrumentModel: "ABI 7500", testStandard: "农业部2031号公告-19-2013" },
      testElements: [{ name: "CaMV35S", ctValue: "N/A", result: "阴性", detectionLimit: "0.1%" }, { name: "NOS", ctValue: "N/A", result: "阴性", detectionLimit: "0.1%" }],
      conclusion: "样品中未检出CaMV35S启动子、NOS终止子等转基因成分，判定为阴性", tester: "李检验", reviewer: "王审核", sender: "李明", testDate: "2024-01-25", reportDate: "2024-01-26", remark: ""
    },
    status: "已归档", signImage: "", signer: "王审核", signDate: "2024-01-27", archiveDate: "2024-01-28", createdAt: "2024-01-26", source: "parent"
  },
  {
    id: "2", reportNo: "JYBG20240002", batchNo: "2024-HP-002", cropType: "水稻", variety: "杂交水稻Y两优900", storageLocation: "冷藏柜A-02",
    testType: "转基因检测", result: "阳性", tester: "张检验", testDate: "2024-06-07",
    reportData: {
      reportNo: "JYBG20240002", title: "转基因成分检测报告单",
      sampleInfo: { batchNo: "2024-HP-002", cropType: "水稻", variety: "杂交水稻Y两优900", storageLocation: "冷藏柜A-02", sampleAmount: "200g" },
      testInfo: { testType: "转基因检测", testMethod: "实时荧光PCR", instrumentModel: "ABI 7500", testStandard: "农业部2031号公告-19-2013" },
      testElements: [{ name: "CaMV35S", ctValue: "25.3", result: "阳性", detectionLimit: "0.1%" }, { name: "NOS", ctValue: "N/A", result: "阴性", detectionLimit: "0.1%" }, { name: "Bar", ctValue: "N/A", result: "阴性", detectionLimit: "0.1%" }],
      conclusion: "样品中检出CaMV35S启动子转基因成分，Ct值25.3，判定为阳性", tester: "张检验", reviewer: "", sender: "", testDate: "2024-06-07", reportDate: "2024-06-08", remark: "CaMV35S阳性，已触发复检流程"
    },
    status: "待审核", signImage: "", signer: "", signDate: "", archiveDate: "", createdAt: "2024-06-08", source: "parent"
  },
  {
    id: "3", reportNo: "JYBG20240003", batchNo: "2024-HP-004", cropType: "小麦", variety: "郑麦9023", storageLocation: "冷藏柜B-01",
    testType: "转基因检测", result: "阴性", tester: "张检验", testDate: "2024-06-15",
    reportData: {
      reportNo: "JYBG20240003", title: "转基因成分检测报告单",
      sampleInfo: { batchNo: "2024-HP-004", cropType: "小麦", variety: "郑麦9023", storageLocation: "冷藏柜B-01", sampleAmount: "200g" },
      testInfo: { testType: "转基因检测", testMethod: "实时荧光PCR", instrumentModel: "ABI 7500", testStandard: "农业部2031号公告-19-2013" },
      testElements: [{ name: "CaMV35S", ctValue: "N/A", result: "阴性" }, { name: "NOS", ctValue: "N/A", result: "阴性" }],
      conclusion: "样品中未检出转基因成分，判定为阴性", tester: "张检验", reviewer: "王审核", sender: "", testDate: "2024-06-15", reportDate: "2024-06-16", remark: ""
    },
    status: "已签章", signImage: "signed", signer: "王审核", signDate: "2024-06-17", archiveDate: "", createdAt: "2024-06-16", source: "sowing"
  },
];

const statusConfig = {
  "待审核": { label: "待审核", variant: "outline" as const },
  "已签章": { label: "已签章", variant: "default" as const },
  "已归档": { label: "已归档", variant: "secondary" as const },
};

export default function ReportsPage() {
  const [data, setData] = useState<InspectionReport[]>(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("parent");

  const [viewOpen, setViewOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InspectionReport | null>(null);
  const [signingItem, setSigningItem] = useState<InspectionReport | null>(null);
  const [archivingItem, setArchivingItem] = useState<InspectionReport | null>(null);
  const [deletingItem, setDeletingItem] = useState<InspectionReport | null>(null);

  // 电子签名相关
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState("");

  // 从 localStorage 加载检验数据录入提交的报告
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspection_reports") || "[]");
      if (stored.length > 0) {
        setData((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = stored.filter((s: InspectionReport) => !existingIds.has(s.id)).map((s: InspectionReport) => ({
          ...s,
          source: s.source || "parent" as const,
        }));
          return [...newItems, ...prev];
        });
        localStorage.removeItem("inspection_reports");
      }
    } catch { /* ignore */ }
  }, []);

  const filtered = data.filter((e) => {
    const matchesSource = e.source === activeTab;
    const matchesSearch = e.reportNo.includes(searchTerm) || e.batchNo.includes(searchTerm) || e.variety.includes(searchTerm) || e.cropType.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSource && matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  };

  // 电子签名：画布操作
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1B5F61";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => { setIsDrawing(false); };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (!signingItem || !hasSignature || !signerName) return;
    const canvas = canvasRef.current;
    const signImage = canvas?.toDataURL("image/png") || "";
    const today = new Date().toISOString().split("T")[0];
    setData((prev) => prev.map((i) => i.id === signingItem.id ? {
      ...i, status: "已签章" as const, signImage, signer: signerName, signDate: today,
      reportData: i.reportData ? { ...i.reportData, reviewer: signerName } : null,
    } : i));
    setSignOpen(false);
    setSigningItem(null);
    setSignerName("");
    setHasSignature(false);
  };

  const handleArchive = () => {
    if (!archivingItem) return;
    const today = new Date().toISOString().split("T")[0];
    setData((prev) => prev.map((i) => i.id === archivingItem.id ? {
      ...i, status: "已归档" as const, archiveDate: today,
      reportData: i.reportData ? { ...i.reportData, sender: i.signer } : null,
    } : i));
    setArchiveOpen(false);
    setArchivingItem(null);
  };

  const openSignDialog = (item: InspectionReport) => {
    setSigningItem(item);
    setSignerName("");
    setHasSignature(false);
    setSignOpen(true);
    setTimeout(() => { clearSignature(); }, 100);
  };

  const handleExportPDF = (item: InspectionReport) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const rd = item.reportData;
    const elementsHtml = rd?.testElements?.map((el: TestElement) =>
      `<tr><td style="padding:6px 10px;border:1px solid #ddd;">${el.name}</td><td style="padding:6px 10px;border:1px solid #ddd;">${el.ctValue || "N/A"}</td><td style="padding:6px 10px;border:1px solid #ddd;color:${el.result === "阳性" ? "red" : "green"}">${el.result}</td><td style="padding:6px 10px;border:1px solid #ddd;">${el.detectionLimit || "—"}</td></tr>`
    ).join("") || "";

    printWindow.document.write(`<!DOCTYPE html><html><head><title>检验报告 ${item.reportNo}</title><style>body{font-family:SimSun,serif;padding:40px;color:#333}h1{text-align:center;font-size:20px;border-bottom:2px solid #1B5F61;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{padding:6px 10px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5}.section-title{font-weight:bold;border-bottom:1px solid #1B5F61;padding-bottom:4px;margin:16px 0 8px}.conclusion{background:#f9f9f9;padding:12px;border-radius:4px;margin:12px 0}.sign-area{display:flex;justify-content:space-between;margin-top:30px}.sign-box{text-align:center;width:30%}.sign-line{border-top:1px solid #333;margin-top:50px;padding-top:4px}</style></head><body>
<h1>转基因成分检测报告单</h1>
<p style="text-align:center;color:#666">报告编号：${item.reportNo}</p>
<p class="section-title">样品信息</p>
<table><tr><th>批次号</th><td>${rd?.sampleInfo?.batchNo || item.batchNo}</td><th>作物种类</th><td>${rd?.sampleInfo?.cropType || item.cropType}</td></tr>
<tr><th>品种名称</th><td>${rd?.sampleInfo?.variety || item.variety}</td><th>存放点</th><td>${rd?.sampleInfo?.storageLocation || item.storageLocation}</td></tr>
<tr><th>样品量</th><td>${rd?.sampleInfo?.sampleAmount || "200g"}</td><th></th><td></td></tr></table>
<p class="section-title">检测信息</p>
<table><tr><th>检测类型</th><td>${rd?.testInfo?.testType || item.testType}</td><th>检测方法</th><td>${rd?.testInfo?.testMethod || "实时荧光PCR"}</td></tr>
<tr><th>仪器型号</th><td>${rd?.testInfo?.instrumentModel || "ABI 7500"}</td><th>检测依据</th><td>${rd?.testInfo?.testStandard || "农业部2031号公告-19-2013"}</td></tr></table>
<p class="section-title">检测结果</p>
<table><tr><th>元件名称</th><th>Ct值</th><th>结果</th><th>检测限</th></tr>${elementsHtml}</table>
<div class="conclusion"><strong>检测结论：</strong>${rd?.conclusion || `最终结论：${item.result}`}</div>
<div class="sign-area"><div class="sign-box"><div class="sign-line">送样人：${rd?.sender || "—"}</div></div>
<div class="sign-box"><div class="sign-line">检测人：${rd?.tester || item.tester}</div></div>
<div class="sign-box">${item.signImage ? `<img src="${item.signImage}" style="max-height:40px;margin-top:5px" />` : ""}<div class="sign-line">审核人：${rd?.reviewer || item.signer || "待审核"}</div></div></div>
<p style="text-align:center;margin-top:30px;color:#999;font-size:12px">报告日期：${rd?.reportDate || item.createdAt}</p>
</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const tabData = data.filter((e) => e.source === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">检验报告管理</h1>
          <p className="text-sm text-muted-foreground mt-1">审核检验报告，电子签名确认后归档，归档报告可追溯全流程数据</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchTerm(""); setStatusFilter("all"); }}>
        <TabsList>
          <TabsTrigger value="parent" className="gap-1.5"><Wheat className="h-3.5 w-3.5" />亲本种子样品</TabsTrigger>
          <TabsTrigger value="sowing" className="gap-1.5"><Sprout className="h-3.5 w-3.5" />播种样品</TabsTrigger>
          <TabsTrigger value="leaf" className="gap-1.5"><Leaf className="h-3.5 w-3.5" />叶片样品</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><FileText className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">报告总数</p><p className="text-lg font-semibold">{tabData.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-destructive/10 p-2"><FileText className="h-4 w-4 text-destructive" /></div><div><p className="text-sm text-muted-foreground">阳性报告</p><p className="text-lg font-semibold text-destructive">{tabData.filter((e) => e.result === "阳性").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><CheckCircle className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">待审核</p><p className="text-lg font-semibold">{tabData.filter((e) => e.status === "待审核").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><Archive className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">已归档</p><p className="text-lg font-semibold">{tabData.filter((e) => e.status === "已归档").length}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索报告号、批次号、品种、作物种类..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="待审核">待审核</SelectItem><SelectItem value="已签章">已签章</SelectItem><SelectItem value="已归档">已归档</SelectItem></SelectContent></Select>
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
                <TableHead>作物种类</TableHead>
                <TableHead>品种名称</TableHead>
                <TableHead>检测结果</TableHead>
                <TableHead>检测人</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm font-medium">{item.reportNo}</TableCell>
                  <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                  <TableCell><Badge variant="secondary">{item.cropType}</Badge></TableCell>
                  <TableCell>{item.variety}</TableCell>
                  <TableCell><Badge variant={item.result === "阳性" ? "destructive" : "outline"}>{item.result}</Badge></TableCell>
                  <TableCell>{item.tester}</TableCell>
                  <TableCell><Badge variant={statusConfig[item.status].variant}>{statusConfig[item.status].label}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                        {item.status === "待审核" && <DropdownMenuItem className="gap-2" onClick={() => openSignDialog(item)}><PenLine className="h-4 w-4" />审核签章</DropdownMenuItem>}
                        {item.status === "已签章" && <DropdownMenuItem className="gap-2" onClick={() => { setArchivingItem(item); setArchiveOpen(true); }}><Archive className="h-4 w-4" />确认归档</DropdownMenuItem>}
                        <DropdownMenuItem className="gap-2" onClick={() => handleExportPDF(item)}><Download className="h-4 w-4" />导出PDF</DropdownMenuItem>
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
        </TabsContent>
      </Tabs>

      {/* 查看详情（含全流程追溯） */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[750px] flex flex-col max-h-[85vh]">
          <DialogHeader className="shrink-0"><DialogTitle>检验报告详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="flex-1 overflow-y-auto min-h-0 py-4 space-y-6">
              {/* 报告基本信息 */}
              <div className="rounded-lg border bg-card p-5 space-y-4">
                <div className="text-center border-b pb-3">
                  <h3 className="text-lg font-bold">转基因成分检测报告单</h3>
                  <p className="text-sm text-muted-foreground mt-1">报告编号：{viewingItem.reportNo}</p>
                </div>
                {viewingItem.reportData?.sampleInfo && (
                  <div>
                    <p className="text-sm font-semibold border-b pb-1 mb-2">样品信息</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">批次号：</span>{viewingItem.reportData.sampleInfo.batchNo}</div>
                      <div><span className="text-muted-foreground">作物种类：</span>{viewingItem.reportData.sampleInfo.cropType}</div>
                      <div><span className="text-muted-foreground">品种名称：</span>{viewingItem.reportData.sampleInfo.variety}</div>
                      <div><span className="text-muted-foreground">存放点：</span>{viewingItem.reportData.sampleInfo.storageLocation}</div>
                    </div>
                  </div>
                )}
                {viewingItem.reportData?.testInfo && (
                  <div>
                    <p className="text-sm font-semibold border-b pb-1 mb-2">检测信息</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">检测类型：</span>{viewingItem.reportData.testInfo.testType}</div>
                      <div><span className="text-muted-foreground">检测方法：</span>{viewingItem.reportData.testInfo.testMethod}</div>
                      <div><span className="text-muted-foreground">仪器型号：</span>{viewingItem.reportData.testInfo.instrumentModel}</div>
                      <div><span className="text-muted-foreground">检测依据：</span>{viewingItem.reportData.testInfo.testStandard}</div>
                    </div>
                  </div>
                )}
                {viewingItem.reportData?.testElements && viewingItem.reportData.testElements.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold border-b pb-1 mb-2">检测元件</p>
                    <Table>
                      <TableHeader><TableRow><TableHead>元件</TableHead><TableHead>Ct值</TableHead><TableHead>结果</TableHead><TableHead>检测限</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {viewingItem.reportData.testElements.map((el, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono">{el.name}</TableCell>
                            <TableCell>{el.ctValue || "N/A"}</TableCell>
                            <TableCell><Badge variant={el.result === "阳性" ? "destructive" : "outline"}>{el.result}</Badge></TableCell>
                            <TableCell>{el.detectionLimit || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {viewingItem.reportData?.conclusion && (
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-sm font-semibold mb-1">检测结论</p>
                    <p className="text-sm">{viewingItem.reportData.conclusion}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 text-sm border-t pt-3">
                  <div><span className="text-muted-foreground">送样人：</span>{viewingItem.reportData?.sender || "—"}</div>
                  <div><span className="text-muted-foreground">检测人：</span>{viewingItem.reportData?.tester || viewingItem.tester}</div>
                  <div><span className="text-muted-foreground">审核人：</span>{viewingItem.reportData?.reviewer || viewingItem.signer || "待审核"}</div>
                </div>
                {viewingItem.signImage && (
                  <div className="flex items-center gap-3 text-sm border-t pt-3">
                    <span className="text-muted-foreground">电子签名：</span>
                    <img src={viewingItem.signImage} alt="签名" className="h-8 border rounded px-1" />
                    <span className="text-muted-foreground">签名日期：{viewingItem.signDate}</span>
                  </div>
                )}
              </div>


            </div>
          )}
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button>
            <Button onClick={() => { setViewOpen(false); handleExportPDF(viewingItem!); }}><Download className="h-4 w-4 mr-1" />导出PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审核签章 */}
      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>审核签章</DialogTitle><DialogDescription>请审核报告内容后进行电子签名确认</DialogDescription></DialogHeader>
          {signingItem && (
            <div className="space-y-4 py-4">
              <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">报告编号</span><span className="font-mono">{signingItem.reportNo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">批次号</span><span className="font-mono">{signingItem.batchNo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">品种名称</span><span>{signingItem.variety}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">检测结果</span><Badge variant={signingItem.result === "阳性" ? "destructive" : "outline"}>{signingItem.result}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">检测人</span><span>{signingItem.tester}</span></div>
              </div>
              <div className="space-y-2">
                <Label>审核人姓名 *</Label>
                <Input placeholder="请输入审核人姓名" value={signerName} onChange={(e) => setSignerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>电子签名 *</Label>
                  <Button variant="ghost" size="sm" onClick={clearSignature}>清除重签</Button>
                </div>
                <div className="border-2 border-dashed rounded-md bg-white">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={150}
                    className="w-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <p className="text-xs text-muted-foreground">请在上方区域手写签名</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignOpen(false)}>取消</Button>
            <Button onClick={handleSign} disabled={!hasSignature || !signerName}>
              <PenLine className="h-4 w-4 mr-1" />确认签章
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认归档 */}
      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认归档</AlertDialogTitle><AlertDialogDescription>确认将报告「{archivingItem?.reportNo}」归档？归档后报告将不可修改，可在报告归档模块查看全流程追溯数据。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleArchive}>确认归档</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除报告「{deletingItem?.reportNo}」吗？此操作不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
