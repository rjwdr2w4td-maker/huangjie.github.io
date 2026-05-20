"use client";

import { useState, useCallback } from "react";
import { Wheat, Sprout, Leaf, Search, Eye, FileText, AlertTriangle, Archive, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ─── 类型 ─── */
interface RetestRecord {
  id: string;
  retestNo: string;
  batchNo: string;
  enterpriseName: string;
  cropType: string;
  varietyName: string;
  initialResult: string;
  initialTester: string;
  initialTestDate: string;
  retestResult: string;
  retester: string;
  retestDate: string;
  status: "pending" | "in_progress" | "completed";
  source: "parent" | "sowing" | "leaf";
  retestElements?: { name: string; ctValue: string; result: string }[];
  initialElements?: { name: string; ctValue: string; result: string }[];
  remark?: string;
  penaltyGenerated?: boolean;
  archived?: boolean;
}

const statusConfig: Record<string, { label: string; variant: "secondary" | "default" | "outline" }> = {
  pending: { label: "待复检", variant: "secondary" },
  in_progress: { label: "复检中", variant: "default" },
  completed: { label: "复检完成", variant: "outline" },
};

const resultVariant = (r: string) => r === "阳性" ? "destructive" as const : "secondary" as const;

/* ─── Mock ─── */
const mockData: RetestRecord[] = [
  {
    id: "1", retestNo: "FJ20240001", batchNo: "2024-HP-002", enterpriseName: "绿丰种业",
    cropType: "水稻", varietyName: "杂交水稻Y两优900", initialResult: "阳性",
    initialTester: "张检验", initialTestDate: "2024-06-07",
    retestResult: "阳性", retester: "李复检", retestDate: "2024-06-15",
    status: "completed", source: "parent", penaltyGenerated: true, archived: false,
    initialElements: [{ name: "CaMV35S", ctValue: "25.3", result: "阳性" }, { name: "NOS", ctValue: "N/A", result: "阴性" }],
    retestElements: [{ name: "CaMV35S", ctValue: "24.8", result: "阳性" }, { name: "NOS", ctValue: "N/A", result: "阴性" }],
  },
  {
    id: "2", retestNo: "FJ20240002", batchNo: "2024-BZ-003", enterpriseName: "金穗农业",
    cropType: "玉米", varietyName: "郑单958", initialResult: "阳性",
    initialTester: "王检验", initialTestDate: "2024-06-10",
    retestResult: "", retester: "", retestDate: "",
    status: "pending", source: "sowing",
    initialElements: [{ name: "Bar", ctValue: "22.1", result: "阳性" }],
  },
  {
    id: "3", retestNo: "FJ20240003", batchNo: "2024-YP-001", enterpriseName: "禾盛种业",
    cropType: "水稻", varietyName: "宜香优2115", initialResult: "阳性",
    initialTester: "赵检验", initialTestDate: "2024-07-03",
    retestResult: "", retester: "孙复检", retestDate: "",
    status: "in_progress", source: "leaf",
    initialElements: [{ name: "Bar", ctValue: "23.5", result: "阳性" }],
  },
  {
    id: "4", retestNo: "FJ20240004", batchNo: "2024-HP-005", enterpriseName: "绿丰种业",
    cropType: "小麦", varietyName: "绵麦367", initialResult: "阳性",
    initialTester: "张检验", initialTestDate: "2024-08-01",
    retestResult: "阴性", retester: "李复检", retestDate: "2024-08-10",
    status: "completed", source: "parent", penaltyGenerated: false, archived: true,
    initialElements: [{ name: "CaMV35S", ctValue: "28.9", result: "阳性" }],
    retestElements: [{ name: "CaMV35S", ctValue: "N/A", result: "阴性" }],
  },
  {
    id: "5", retestNo: "FJ20240005", batchNo: "2024-BZ-006", enterpriseName: "天源种业",
    cropType: "玉米", varietyName: "中科玉505", initialResult: "阳性",
    initialTester: "王检验", initialTestDate: "2024-08-05",
    retestResult: "", retester: "", retestDate: "",
    status: "pending", source: "sowing",
    initialElements: [{ name: "NOS", ctValue: "21.7", result: "阳性" }],
  },
  {
    id: "6", retestNo: "FJ20240006", batchNo: "2024-YP-004", enterpriseName: "丰收种业",
    cropType: "油菜", varietyName: "蓉油18", initialResult: "阳性",
    initialTester: "赵检验", initialTestDate: "2024-08-08",
    retestResult: "", retester: "孙复检", retestDate: "",
    status: "in_progress", source: "leaf",
    initialElements: [{ name: "CaMV35S", ctValue: "26.2", result: "阳性" }, { name: "Bar", ctValue: "23.1", result: "阳性" }],
  },
  {
    id: "7", retestNo: "FJ20240007", batchNo: "2024-HP-008", enterpriseName: "绿源农业",
    cropType: "水稻", varietyName: "宜香优2115", initialResult: "阳性",
    initialTester: "周检验", initialTestDate: "2024-09-01",
    retestResult: "阳性", retester: "吴复检", retestDate: "2024-09-10",
    status: "completed", source: "parent", penaltyGenerated: false,
    initialElements: [{ name: "CaMV35S", ctValue: "24.8", result: "阳性" }],
    retestElements: [{ name: "CaMV35S", ctValue: "25.1", result: "阳性" }, { name: "NOS", ctValue: "22.3", result: "阳性" }],
  },
  {
    id: "8", retestNo: "FJ20240008", batchNo: "2024-BZ-009", enterpriseName: "金穗种业",
    cropType: "小麦", varietyName: "绵麦367", initialResult: "阳性",
    initialTester: "钱检验", initialTestDate: "2024-09-05",
    retestResult: "阴性", retester: "郑复检", retestDate: "2024-09-15",
    status: "completed", source: "sowing", archived: false,
    initialElements: [{ name: "Bar", ctValue: "28.1", result: "阳性" }],
    retestElements: [{ name: "Bar", ctValue: "N/A", result: "阴性" }, { name: "NOS", ctValue: "N/A", result: "阴性" }],
  },
  {
    id: "9", retestNo: "FJ20240009", batchNo: "2024-YP-010", enterpriseName: "天源种业",
    cropType: "玉米", varietyName: "正大999", initialResult: "阳性",
    initialTester: "孙检验", initialTestDate: "2024-09-10",
    retestResult: "", retester: "", retestDate: "",
    status: "pending", source: "leaf",
    initialElements: [{ name: "CaMV35S", ctValue: "23.5", result: "阳性" }],
  },
  {
    id: "10", retestNo: "FJ20240010", batchNo: "2024-HP-011", enterpriseName: "丰乐种业",
    cropType: "水稻", varietyName: "C两优华占", initialResult: "阳性",
    initialTester: "李检验", initialTestDate: "2024-09-15",
    retestResult: "", retester: "", retestDate: "",
    status: "pending", source: "parent",
    initialElements: [{ name: "NOS", ctValue: "20.9", result: "阳性" }, { name: "Bar", ctValue: "24.6", result: "阳性" }],
  },
];

export default function RetestPage() {
  const [data, setData] = useState<RetestRecord[]>(mockData);
  const [activeTab, setActiveTab] = useState("parent");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* 详情 */
  const [viewingItem, setViewingItem] = useState<RetestRecord | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  /* 生成复检任务 */
  const [taskItem, setTaskItem] = useState<RetestRecord | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskRetester, setTaskRetester] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");

  /* 录入复检结果 */
  const [resultItem, setResultItem] = useState<RetestRecord | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultValue, setResultValue] = useState("");
  const [resultTester, setResultTester] = useState("");
  const [resultDate, setResultDate] = useState("");
  const [resultRemark, setResultRemark] = useState("");

  const staffList = ["李复检", "孙复检", "周复检", "吴复检"];

  /* 过滤 */
  const filtered = data.filter(d => {
    if (d.source !== activeTab) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search && !(d.retestNo || "").includes(search) && !(d.batchNo || "").includes(search) && !(d.enterpriseName || "").includes(search) && !(d.varietyName || "").includes(search)) return false;
    return true;
  });

  const tabCounts = { parent: data.filter(d => d.source === "parent").length, sowing: data.filter(d => d.source === "sowing").length, leaf: data.filter(d => d.source === "leaf").length };
  const pendingCount = filtered.filter(d => d.status === "pending").length;
  const inProgressCount = filtered.filter(d => d.status === "in_progress").length;
  const completedCount = filtered.filter(d => d.status === "completed").length;

  /* 操作 */
  const handleGenerateTask = useCallback(() => {
    if (!taskItem) return;
    setData(prev => prev.map(d => d.id === taskItem.id ? { ...d, status: "in_progress" as const, retester: taskRetester } : d));
    setTaskOpen(false);
    setTaskItem(null);
    setTaskRetester("");
    setTaskDeadline("");
  }, [taskItem, taskRetester, taskDeadline]);

  const handleSaveResult = useCallback(() => {
    if (!resultItem) return;
    setData(prev => prev.map(d => d.id === resultItem.id ? { ...d, status: "completed" as const, retestResult: resultValue, retester: resultTester || d.retester, retestDate: resultDate, remark: resultRemark } : d));
    setResultOpen(false);
    setResultItem(null);
    setResultValue("");
    setResultTester("");
    setResultDate("");
    setResultRemark("");
  }, [resultItem, resultValue, resultTester, resultDate, resultRemark]);

  /* 处罚文书预览编辑 */
  const [penaltyConfirmItem, setPenaltyConfirmItem] = useState<RetestRecord | null>(null);
  const [penaltyConfirmOpen, setPenaltyConfirmOpen] = useState(false);
  const [penaltyDocNo, setPenaltyDocNo] = useState("");
  const [penaltyEnterprise, setPenaltyEnterprise] = useState("");
  const [penaltyLegalPerson, setPenaltyLegalPerson] = useState("");
  const [penaltyAddress, setPenaltyAddress] = useState("");
  const [penaltyViolationFact, setPenaltyViolationFact] = useState("");
  const [penaltyLawBasis, setPenaltyLawBasis] = useState("");
  const [penaltyDecision, setPenaltyDecision] = useState("");
  const [penaltyFine, setPenaltyFine] = useState("");
  const [penaltyDeadline, setPenaltyDeadline] = useState("");
  const [penaltyOrg, setPenaltyOrg] = useState("XX县农业农村局");

  /* 报告归档确认 */
  const [archiveConfirmItem, setArchiveConfirmItem] = useState<RetestRecord | null>(null);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const openPenaltyConfirm = (item: RetestRecord) => {
    setPenaltyConfirmItem(item);
    const docsCount = JSON.parse(localStorage.getItem("penalty_documents") || "[]").length;
    setPenaltyDocNo(`CWS${new Date().getFullYear()}${String(docsCount + 1).padStart(4, "0")}`);
    setPenaltyEnterprise(item.enterpriseName);
    setPenaltyLegalPerson("");
    setPenaltyAddress("");
    setPenaltyViolationFact(`该企业生产的${item.cropType}品种${item.varietyName}（批次号：${item.batchNo}），经初次检测和复检均检出转基因阳性成分，违反了《农业转基因生物安全管理条例》相关规定。`);
    setPenaltyLawBasis("《农业转基因生物安全管理条例》第四十五条；《种子法》第四十六条");
    setPenaltyDecision("责令停止生产、经营该品种种子，没收违法生产的种子及违法所得");
    setPenaltyFine("");
    setPenaltyDeadline("");
    setPenaltyOrg("XX县农业农村局");
    setPenaltyConfirmOpen(true);
  };
  const openArchiveConfirm = (item: RetestRecord) => { setArchiveConfirmItem(item); setArchiveConfirmOpen(true); };

  const handleGeneratePenalty = () => {
    if (!penaltyConfirmItem) return;
    const existing = JSON.parse(localStorage.getItem("penalty_documents") || "[]");
    existing.push({
      id: `CF${Date.now()}`,
      docNo: penaltyDocNo,
      enterpriseName: penaltyEnterprise,
      legalPerson: penaltyLegalPerson,
      address: penaltyAddress,
      batchNo: penaltyConfirmItem.batchNo,
      cropType: penaltyConfirmItem.cropType,
      varietyName: penaltyConfirmItem.varietyName,
      retestNo: penaltyConfirmItem.retestNo,
      initialResult: penaltyConfirmItem.initialResult,
      retestResult: penaltyConfirmItem.retestResult,
      violationFact: penaltyViolationFact,
      lawBasis: penaltyLawBasis,
      penaltyDecision: penaltyDecision,
      fine: penaltyFine,
      deadline: penaltyDeadline,
      penaltyOrg: penaltyOrg,
      source: penaltyConfirmItem.source,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    localStorage.setItem("penalty_documents", JSON.stringify(existing));
    setData(prev => prev.map(d => d.id === penaltyConfirmItem.id ? { ...d, penaltyGenerated: true } : d));
    setPenaltyConfirmOpen(false);
    setPenaltyConfirmItem(null);
  };

  const handleArchive = () => {
    if (!archiveConfirmItem) return;
    setData(prev => prev.map(d => d.id === archiveConfirmItem.id ? { ...d, archived: true } : d));
    setArchiveConfirmOpen(false);
    setArchiveConfirmItem(null);
  };

  const openViewDialog = (item: RetestRecord) => { setViewingItem(item); setViewOpen(true); };
  const openTaskDialog = (item: RetestRecord) => { setTaskItem(item); setTaskOpen(true); };
  const openResultDialog = (item: RetestRecord) => {
    setResultItem(item);
    setResultTester(item.retester);
    setResultDate(new Date().toISOString().slice(0, 10));
    setResultOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">复检管理</h1>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSearch(""); setStatusFilter("all"); }}>
        <TabsList>
          <TabsTrigger value="parent"><Wheat className="h-4 w-4 mr-1" />亲本种子样品 ({tabCounts.parent})</TabsTrigger>
          <TabsTrigger value="sowing"><Sprout className="h-4 w-4 mr-1" />播种样品 ({tabCounts.sowing})</TabsTrigger>
          <TabsTrigger value="leaf"><Leaf className="h-4 w-4 mr-1" />叶片样品 ({tabCounts.leaf})</TabsTrigger>
        </TabsList>

        {(["parent", "sowing", "leaf"] as const).map(tab => (
          <TabsContent key={tab} value={tab}>
            {/* 统计 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">待复检</p><p className="text-2xl font-bold">{pendingCount}</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">复检中</p><p className="text-2xl font-bold">{inProgressCount}</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">复检完成</p><p className="text-2xl font-bold">{completedCount}</p></CardContent></Card>
            </div>

            {/* 搜索/筛选 */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索编号、企业、品种..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="状态筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待复检</SelectItem>
                  <SelectItem value="in_progress">复检中</SelectItem>
                  <SelectItem value="completed">复检完成</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 表格 */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">序号</TableHead>
                      <TableHead>复检编号</TableHead>
                      <TableHead>批次号</TableHead>
                      <TableHead>企业名称</TableHead>
                      <TableHead>作物种类</TableHead>
                      <TableHead>品种名称</TableHead>
                      <TableHead>初次检测结果</TableHead>
                      <TableHead>初次检测人</TableHead>
                      <TableHead>初次检测时间</TableHead>
                      <TableHead>复检结果</TableHead>
                      <TableHead>复检人</TableHead>
                      <TableHead>复检时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="w-24">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={14} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
                    ) : filtered.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{item.retestNo}</TableCell>
                        <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                        <TableCell>{item.enterpriseName}</TableCell>
                        <TableCell>{item.cropType}</TableCell>
                        <TableCell>{item.varietyName}</TableCell>
                        <TableCell><Badge variant={resultVariant(item.initialResult)}>{item.initialResult}</Badge></TableCell>
                        <TableCell>{item.initialTester}</TableCell>
                        <TableCell>{item.initialTestDate}</TableCell>
                        <TableCell>{item.retestResult ? <Badge variant={resultVariant(item.retestResult)}>{item.retestResult}</Badge> : "—"}</TableCell>
                        <TableCell>{item.retester || "—"}</TableCell>
                        <TableCell>{item.retestDate || "—"}</TableCell>
                        <TableCell><Badge variant={statusConfig[item.status].variant}>{statusConfig[item.status].label}</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(item)}><Eye className="h-4 w-4 mr-2" />查看详情</DropdownMenuItem>
                              {item.status === "pending" && (
                                <DropdownMenuItem onClick={() => openTaskDialog(item)}><FileText className="h-4 w-4 mr-2" />生成复检任务</DropdownMenuItem>
                              )}
                              {item.status === "in_progress" && (
                                <DropdownMenuItem onClick={() => openResultDialog(item)}><FileText className="h-4 w-4 mr-2" />录入复检结果</DropdownMenuItem>
                              )}
                              {item.status === "completed" && item.retestResult === "阳性" && !item.penaltyGenerated && (
                                <DropdownMenuItem onClick={() => openPenaltyConfirm(item)}><AlertTriangle className="h-4 w-4 mr-2" />生成处罚文书</DropdownMenuItem>
                              )}
                              {item.status === "completed" && item.retestResult === "阴性" && !item.archived && (
                                <DropdownMenuItem onClick={() => openArchiveConfirm(item)}><Archive className="h-4 w-4 mr-2" />报告归档</DropdownMenuItem>
                              )}
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
        ))}
      </Tabs>

      {/* ── 查看详情 ── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0"><DialogTitle>复检详情</DialogTitle><DialogDescription>复检编号：{viewingItem?.retestNo}</DialogDescription></DialogHeader>
          {viewingItem && (
            <div className="overflow-y-auto flex-1 min-h-0 space-y-4">
              {/* 基本信息 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2 mb-3">基本信息</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">复检编号：</span>{viewingItem.retestNo}</div>
                  <div><span className="text-muted-foreground">批次号：</span>{viewingItem.batchNo}</div>
                  <div><span className="text-muted-foreground">企业名称：</span>{viewingItem.enterpriseName}</div>
                  <div><span className="text-muted-foreground">作物种类：</span>{viewingItem.cropType}</div>
                  <div><span className="text-muted-foreground">品种名称：</span>{viewingItem.varietyName}</div>
                  <div><span className="text-muted-foreground">状态：</span><Badge variant={statusConfig[viewingItem.status].variant}>{statusConfig[viewingItem.status].label}</Badge></div>
                </div>
              </div>
              {/* 初次检测 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2 mb-3">初次检测结果</p>
                <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                  <div><span className="text-muted-foreground">检测人：</span>{viewingItem.initialTester}</div>
                  <div><span className="text-muted-foreground">检测时间：</span>{viewingItem.initialTestDate}</div>
                  <div><span className="text-muted-foreground">检测结论：</span><Badge variant={resultVariant(viewingItem.initialResult)}>{viewingItem.initialResult}</Badge></div>
                </div>
                {viewingItem.initialElements && viewingItem.initialElements.length > 0 && (
                  <Table>
                    <TableHeader><TableRow><TableHead>检测元件</TableHead><TableHead>Ct值</TableHead><TableHead>结果</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {viewingItem.initialElements.map((el, i) => (
                        <TableRow key={i}><TableCell>{el.name}</TableCell><TableCell>{el.ctValue}</TableCell><TableCell><Badge variant={resultVariant(el.result)}>{el.result}</Badge></TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              {/* 复检结果 */}
              {viewingItem.status !== "pending" && (
                <div>
                  <p className="text-sm font-semibold border-b pb-2 mb-3">复检结果</p>
                  {viewingItem.status === "in_progress" ? (
                    <p className="text-sm text-muted-foreground">复检进行中，复检人：{viewingItem.retester}</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                        <div><span className="text-muted-foreground">复检人：</span>{viewingItem.retester}</div>
                        <div><span className="text-muted-foreground">复检时间：</span>{viewingItem.retestDate}</div>
                        <div><span className="text-muted-foreground">复检结论：</span><Badge variant={resultVariant(viewingItem.retestResult)}>{viewingItem.retestResult}</Badge></div>
                      </div>
                      {viewingItem.retestElements && viewingItem.retestElements.length > 0 && (
                        <Table>
                          <TableHeader><TableRow><TableHead>检测元件</TableHead><TableHead>Ct值</TableHead><TableHead>结果</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {viewingItem.retestElements.map((el, i) => (
                              <TableRow key={i}><TableCell>{el.name}</TableCell><TableCell>{el.ctValue}</TableCell><TableCell><Badge variant={resultVariant(el.result)}>{el.result}</Badge></TableCell></TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </>
                  )}
                  {viewingItem.remark && <p className="text-sm mt-2"><span className="text-muted-foreground">备注：</span>{viewingItem.remark}</p>}
                </div>
              )}
              {/* 流程时间轴 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2 mb-3">流程记录</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-muted-foreground" />初次检测完成 — {viewingItem.initialTestDate}，检测人：{viewingItem.initialTester}</div>
                  {viewingItem.status !== "pending" && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />复检任务生成 — 复检人：{viewingItem.retester}</div>}
                  {viewingItem.status === "completed" && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />复检完成 — {viewingItem.retestDate}，结论：{viewingItem.retestResult}</div>}
                  {viewingItem.penaltyGenerated && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-destructive" />已生成处罚文书</div>}
                  {viewingItem.archived && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-600" />已归档</div>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="shrink-0"><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 生成复检任务 ── */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>生成复检任务</DialogTitle><DialogDescription>复检编号：{taskItem?.retestNo}</DialogDescription></DialogHeader>
          {taskItem && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded text-sm space-y-1">
                <p>企业：{taskItem.enterpriseName}</p>
                <p>品种：{taskItem.varietyName}（{taskItem.cropType}）</p>
                <p>初次结果：<Badge variant="destructive">{taskItem.initialResult}</Badge></p>
              </div>
              <div className="space-y-2">
                <Label>复检人 *</Label>
                <Select value={taskRetester} onValueChange={setTaskRetester}>
                  <SelectTrigger><SelectValue placeholder="选择复检人" /></SelectTrigger>
                  <SelectContent>{staffList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>复检截止时间 *</Label>
                <Input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskOpen(false)}>取消</Button>
            <Button disabled={!taskRetester || !taskDeadline} onClick={handleGenerateTask}>确认生成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 录入复检结果 ── */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>录入复检结果</DialogTitle><DialogDescription>复检编号：{resultItem?.retestNo}</DialogDescription></DialogHeader>
          {resultItem && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded text-sm space-y-1">
                <p>企业：{resultItem.enterpriseName}</p>
                <p>品种：{resultItem.varietyName}</p>
                <p>初次结果：<Badge variant="destructive">{resultItem.initialResult}</Badge></p>
              </div>
              <div className="space-y-2">
                <Label>复检结果 *</Label>
                <Select value={resultValue} onValueChange={setResultValue}>
                  <SelectTrigger><SelectValue placeholder="选择复检结果" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="阳性">阳性</SelectItem>
                    <SelectItem value="阴性">阴性</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>复检人</Label>
                <Input value={resultTester} onChange={e => setResultTester(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>复检日期</Label>
                <Input type="date" value={resultDate} onChange={e => setResultDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea value={resultRemark} onChange={e => setResultRemark(e.target.value)} placeholder="可选填写" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultOpen(false)}>取消</Button>
            <Button disabled={!resultValue || !resultDate} onClick={handleSaveResult}>确认保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 生成处罚文书 - 预览编辑 */}
      <Dialog open={penaltyConfirmOpen} onOpenChange={setPenaltyConfirmOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>处罚文书预览</DialogTitle>
            <DialogDescription>请确认以下处罚文书内容，可修改后确认生成</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-2">
            {/* 文书标题 */}
            <div className="text-center border-b pb-3">
              <h2 className="text-lg font-bold">行政处罚决定书</h2>
              <p className="text-sm text-muted-foreground mt-1">文号：<Input className="inline-block w-48 h-7 text-sm" value={penaltyDocNo} onChange={e => setPenaltyDocNo(e.target.value)} /></p>
            </div>
            {/* 当事人信息 */}
            <div className="space-y-3">
              <p className="text-sm font-semibold border-b pb-1">当事人信息</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">企业名称</Label><Input value={penaltyEnterprise} onChange={e => setPenaltyEnterprise(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">法定代表人</Label><Input value={penaltyLegalPerson} onChange={e => setPenaltyLegalPerson(e.target.value)} placeholder="请填写" /></div>
                <div className="space-y-1 col-span-2"><Label className="text-xs">地址</Label><Input value={penaltyAddress} onChange={e => setPenaltyAddress(e.target.value)} placeholder="请填写" /></div>
              </div>
            </div>
            {/* 违法事实 */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold">违法事实</Label>
              <Textarea rows={4} value={penaltyViolationFact} onChange={e => setPenaltyViolationFact(e.target.value)} />
            </div>
            {/* 处罚依据 */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold">处罚依据</Label>
              <Textarea rows={2} value={penaltyLawBasis} onChange={e => setPenaltyLawBasis(e.target.value)} />
            </div>
            {/* 处罚决定 */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold">处罚决定</Label>
              <Textarea rows={3} value={penaltyDecision} onChange={e => setPenaltyDecision(e.target.value)} />
            </div>
            {/* 罚款及期限 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">罚款金额（元）</Label><Input value={penaltyFine} onChange={e => setPenaltyFine(e.target.value)} placeholder="如无罚款则留空" /></div>
              <div className="space-y-1"><Label className="text-xs">履行期限</Label><Input type="date" value={penaltyDeadline} onChange={e => setPenaltyDeadline(e.target.value)} /></div>
            </div>
            {/* 执法机关 */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold">执法机关</Label>
              <Input value={penaltyOrg} onChange={e => setPenaltyOrg(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setPenaltyConfirmOpen(false)}>取消</Button>
            <Button onClick={handleGeneratePenalty}>确认生成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 报告归档确认 */}
      <AlertDialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认归档报告</AlertDialogTitle>
            <AlertDialogDescription>
              确认将 <strong>{archiveConfirmItem?.enterpriseName}</strong> 的 <strong>{archiveConfirmItem?.cropType} {archiveConfirmItem?.varietyName}</strong>（批次号：{archiveConfirmItem?.batchNo}）复检报告归档？复检结果为阴性，归档后将同步至报告归档模块。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>确认归档</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
