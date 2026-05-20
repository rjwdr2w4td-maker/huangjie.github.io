"use client";

import { useState, useCallback } from "react";
import { FlaskConical, Search, Eye, MoreHorizontal, AlertTriangle, FileText, Wheat, Sprout, Leaf } from "lucide-react";
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
  result: "阴性" | "阳性" | "未检测";
}

interface TestResult {
  id: string;
  batchNo: string;
  cropType: string;
  variety: string;
  storageLocation: string;
  testType: "转基因检测" | "纯度检测" | "发芽率检测";
  elements: TestElement[];
  result: "阴性" | "阳性" | "待检测";
  testMethod: string;
  instrumentModel: string;
  tester: string;
  testDate: string;
  fridgeLocation: string;
  photoUrl: string;
  remark: string;
  sender: string;
  sampleQuantity: string;
  reportGenerated: boolean;
  createdAt: string;
  source: "parent" | "sowing" | "leaf";
}

/* 可选批次号（来源于样品接收页面已接收的样品） */
interface BatchOption {
  batchNo: string;
  cropType: string;
  variety: string;
  storageLocation: string;
}

const batchOptions: BatchOption[] = [
  { batchNo: "2024-HP-001", cropType: "水稻", variety: "Y58S", storageLocation: "冷藏柜A-01" },
  { batchNo: "2024-HP-002", cropType: "水稻", variety: "杂交水稻Y两优900", storageLocation: "冷藏柜A-02" },
  { batchNo: "2024-HP-003", cropType: "水稻", variety: "9311", storageLocation: "冷藏柜A-03" },
  { batchNo: "2024-HP-004", cropType: "小麦", variety: "郑麦9023", storageLocation: "冷藏柜B-01" },
  { batchNo: "2024-HP-005", cropType: "玉米", variety: "郑单958", storageLocation: "冷藏柜B-02" },
  { batchNo: "2024-HP-006", cropType: "水稻", variety: "华占", storageLocation: "冷藏柜A-04" },
  { batchNo: "2024-HP-007", cropType: "玉米", variety: "先玉335", storageLocation: "冷藏柜B-03" },
  { batchNo: "2024-HP-008", cropType: "小麦", variety: "济麦22", storageLocation: "冷藏柜B-04" },
];

const availableElements = ["CaMV35S", "NOS", "Bar", "Cry1Ab", "Cry1Ac", "EPSPS", "PAT", "FMV35S"];

const initialData: TestResult[] = [
  { id: "1", batchNo: "2024-HP-002", cropType: "水稻", variety: "杂交水稻Y两优900", storageLocation: "冷藏柜A-02", testType: "转基因检测", elements: [{ name: "CaMV35S", ctValue: "N/A", result: "阴性" }, { name: "NOS", ctValue: "N/A", result: "阴性" }, { name: "Bar", ctValue: "N/A", result: "阴性" }], result: "阴性", testMethod: "实时荧光PCR", instrumentModel: "ABI 7500", tester: "张检验", testDate: "2024-06-07", fridgeLocation: "A-01-03", photoUrl: "", remark: "", sender: "李明", sampleQuantity: "1.5kg", reportGenerated: false, createdAt: "2024-06-07", source: "parent" },
  { id: "2", batchNo: "2024-HP-002", cropType: "水稻", variety: "杂交水稻Y两优900", storageLocation: "冷藏柜A-02", testType: "转基因检测", elements: [{ name: "CaMV35S", ctValue: "25.3", result: "阳性" }, { name: "NOS", ctValue: "N/A", result: "阴性" }, { name: "Bar", ctValue: "N/A", result: "阴性" }], result: "阳性", testMethod: "实时荧光PCR", instrumentModel: "ABI 7500", tester: "张检验", testDate: "2024-06-07", fridgeLocation: "A-01-04", photoUrl: "", remark: "CaMV35S阳性，整体判定阳性", sender: "李明", sampleQuantity: "1.5kg", reportGenerated: true, createdAt: "2024-06-07", source: "parent" },
  { id: "3", batchNo: "2024-HP-001", cropType: "水稻", variety: "Y58S", storageLocation: "冷藏柜A-01", testType: "转基因检测", elements: [{ name: "CaMV35S", ctValue: "N/A", result: "阴性" }, { name: "NOS", ctValue: "N/A", result: "阴性" }], result: "阴性", testMethod: "实时荧光PCR", instrumentModel: "ABI 7500", tester: "李检验", testDate: "2024-01-25", fridgeLocation: "B-02-01", photoUrl: "", remark: "", sender: "王强", sampleQuantity: "2kg", reportGenerated: false, createdAt: "2024-01-25", source: "parent" },
  { id: "4", batchNo: "2024-HP-004", cropType: "小麦", variety: "郑麦9023", storageLocation: "冷藏柜B-01", testType: "转基因检测", elements: [], result: "待检测", testMethod: "", instrumentModel: "", tester: "", testDate: "", fridgeLocation: "", photoUrl: "", remark: "", sender: "", sampleQuantity: "1.8kg", reportGenerated: false, createdAt: "2024-06-08", source: "sowing" },
  { id: "5", batchNo: "2024-HP-005", cropType: "玉米", variety: "郑单958", storageLocation: "冷藏柜B-02", testType: "转基因检测", elements: [], result: "待检测", testMethod: "", instrumentModel: "", tester: "", testDate: "", fridgeLocation: "", photoUrl: "", remark: "", sender: "", sampleQuantity: "2.2kg", reportGenerated: true, createdAt: "2024-06-10", source: "sowing" },
  { id: "6", batchNo: "2024-YP-001", cropType: "水稻", variety: "华占", storageLocation: "冷藏柜C-01", testType: "转基因检测", elements: [{ name: "CaMV35S", ctValue: "N/A", result: "阴性" }, { name: "NOS", ctValue: "N/A", result: "阴性" }], result: "阴性", testMethod: "实时荧光PCR", instrumentModel: "ABI 7500", tester: "王检验", testDate: "2024-07-01", fridgeLocation: "C-01-01", photoUrl: "", remark: "", sender: "张伟", sampleQuantity: "1.0kg", reportGenerated: false, createdAt: "2024-07-01", source: "leaf" },
  { id: "7", batchNo: "2024-YP-002", cropType: "玉米", variety: "先玉335", storageLocation: "冷藏柜C-02", testType: "转基因检测", elements: [{ name: "Bar", ctValue: "22.1", result: "阳性" }], result: "阳性", testMethod: "实时荧光PCR", instrumentModel: "Bio-Rad CFX96", tester: "赵检验", testDate: "2024-07-03", fridgeLocation: "C-02-01", photoUrl: "", remark: "Bar元件阳性", sender: "张伟", sampleQuantity: "1.2kg", reportGenerated: true, createdAt: "2024-07-03", source: "leaf" },
  { id: "8", batchNo: "2024-YP-003", cropType: "小麦", variety: "济麦22", storageLocation: "冷藏柜C-03", testType: "转基因检测", elements: [], result: "待检测", testMethod: "", instrumentModel: "", tester: "", testDate: "", fridgeLocation: "", photoUrl: "", remark: "", sender: "", sampleQuantity: "1.5kg", reportGenerated: false, createdAt: "2024-07-05", source: "leaf" },
];

const resultConfig = {
  "阴性": { label: "阴性", variant: "outline" as const },
  "阳性": { label: "阳性", variant: "destructive" as const },
  "待检测": { label: "待检测", variant: "secondary" as const },
};

export default function DataEntryPage() {
  const [data, setData] = useState<TestResult[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("parent");

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<TestResult | null>(null);
  const [editingItem, setEditingItem] = useState<TestResult | null>(null);
  const [deletingItem, setDeletingItem] = useState<TestResult | null>(null);

  // Form state
  const [formBatchNo, setFormBatchNo] = useState("");
  const [formCropType, setFormCropType] = useState("");
  const [formVariety, setFormVariety] = useState("");
  const [formStorageLocation, setFormStorageLocation] = useState("");
  const [formTestType, setFormTestType] = useState<"转基因检测" | "纯度检测" | "发芽率检测">("转基因检测");
  const [formTestMethod, setFormTestMethod] = useState("实时荧光PCR");
  const [formInstrument, setFormInstrument] = useState("ABI 7500");
  const [formTester, setFormTester] = useState("");
  const [formFridge, setFormFridge] = useState("");
  const [formRemark, setFormRemark] = useState("");
  const [formElements, setFormElements] = useState<TestElement[]>([]);
  const [addElementName, setAddElementName] = useState("");

  // 报告生成相关状态
  const [reportOpen, setReportOpen] = useState(false);
  const [reportItem, setReportItem] = useState<TestResult | null>(null);

  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [reportRaw, setReportRaw] = useState("");
  const [reportEditing, setReportEditing] = useState(false);
  const [reportEditContent, setReportEditContent] = useState("");

  const filtered = data.filter((e) => {
    const matchesSource = e.source === activeTab;
    const matchesSearch = e.batchNo.includes(searchTerm) || e.variety.includes(searchTerm) || e.cropType.includes(searchTerm);
    const matchesResult = resultFilter === "all" || e.result === resultFilter;
    return matchesSource && matchesSearch && matchesResult;
  });

  /* 自动计算整体结论：任一元件阳性则整体判定为"阳性" */
  const calculateResult = (elements: TestElement[]): "阴性" | "阳性" | "待检测" => {
    if (elements.length === 0) return "待检测";
    if (elements.some(el => el.result === "阳性")) return "阳性";
    if (elements.every(el => el.result === "阴性")) return "阴性";
    return "待检测";
  };

  /* 选择批次号后自动带出 */
  const handleBatchSelect = useCallback((batchNo: string) => {
    setFormBatchNo(batchNo);
    const found = batchOptions.find(b => b.batchNo === batchNo);
    if (found) {
      setFormCropType(found.cropType);
      setFormVariety(found.variety);
      setFormStorageLocation(found.storageLocation);
    } else {
      setFormCropType("");
      setFormVariety("");
      setFormStorageLocation("");
    }
  }, []);

  const addElement = () => {
    if (!addElementName) return;
    if (formElements.some(e => e.name === addElementName)) return;
    setFormElements([...formElements, { name: addElementName, ctValue: "", result: "未检测" }]);
    setAddElementName("");
  };

  const updateElement = (index: number, field: keyof TestElement, value: string) => {
    const updated = [...formElements];
    (updated[index] as unknown as Record<string, string>)[field] = value;
    setFormElements(updated);
  };

  const removeElement = (index: number) => {
    setFormElements(formElements.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormBatchNo(""); setFormCropType(""); setFormVariety(""); setFormStorageLocation("");
    setFormTestType("转基因检测");
    setFormTestMethod("实时荧光PCR"); setFormInstrument("ABI 7500");
    setFormTester(""); setFormFridge(""); setFormRemark(""); setFormElements([]);
  };

  const handleEdit = useCallback(() => {
    if (!editingItem) return;
    const result = calculateResult(formElements);
    setData((prev) => prev.map((item) => item.id === editingItem.id ? {
      ...item, batchNo: formBatchNo, cropType: formCropType, variety: formVariety,
      storageLocation: formStorageLocation, testType: formTestType,
      elements: [...formElements], result,
      testMethod: formTestMethod, instrumentModel: formInstrument,
      tester: formTester, fridgeLocation: formFridge, remark: formRemark,
    } : item));
    resetForm();
    setEditingItem(null);
    setEditOpen(false);
    if (result === "阳性") {
      alert(`⚠️ 预警：批次 ${formBatchNo} 检测结果为阳性，系统将自动通知县级管理人员并触发复检流程！`);
    }
  }, [editingItem, formBatchNo, formCropType, formVariety, formStorageLocation, formTestType, formTestMethod, formInstrument, formTester, formFridge, formRemark, formElements]);

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  const openEdit = (item: TestResult) => {
    setEditingItem(item);
    setFormBatchNo(item.batchNo); setFormCropType(item.cropType);
    setFormVariety(item.variety); setFormStorageLocation(item.storageLocation);
    setFormTestType(item.testType); setFormTestMethod(item.testMethod);
    setFormInstrument(item.instrumentModel); setFormTester(item.tester);
    setFormFridge(item.fridgeLocation); setFormRemark(item.remark);
    setFormElements([...item.elements]);
    setEditOpen(true);
  };

  const handleGenerateReport = useCallback((item: TestResult) => {
    setReportItem(item);
    setReportEditing(false);

    const year = new Date().getFullYear();
    const seq = String(data.filter(d => d.reportGenerated).length + 1).padStart(4, "0");
    const reportNo = `JYBG${year}${seq}`;

    const positiveElements = item.elements.filter(e => e.result === "阳性");
    const conclusion = positiveElements.length > 0
      ? `样品中检出${positiveElements.map(e => e.name).join("、")}转基因成分，判定为阳性`
      : "样品中未检出转基因成分，判定为阴性";

    const report = {
      reportNo,
      title: "转基因成分检测报告单",
      sampleInfo: {
        batchNo: item.batchNo,
        cropType: item.cropType,
        variety: item.variety,
        storageLocation: item.storageLocation,
        sampleAmount: item.sampleQuantity || "1.0kg",
      },
      testInfo: {
        testType: item.testType,
        testMethod: item.testMethod,
        instrumentModel: item.instrumentModel,
        testStandard: "农业部2031号公告-19-2013",
      },
      testElements: item.elements.map(e => ({
        name: e.name,
        ctValue: e.ctValue,
        result: e.result,
        detectionLimit: "0.1%",
      })),
      conclusion,
      sender: item.sender || "",
      tester: item.tester,
      reviewer: "",
      testDate: item.testDate,
      reportDate: item.testDate,
      remark: item.fridgeLocation ? `样品存放位置：${item.fridgeLocation}` : "",
    };

    setReportData(report);
    setReportRaw(JSON.stringify(report, null, 2));
    setReportEditContent(JSON.stringify(report, null, 2));
    setReportOpen(true);
  }, [data]);

  const handleConfirmReport = useCallback(() => {
    if (!reportItem) return;
    // 将报告数据存入 localStorage 供检验报告列表页面读取
    const existing = JSON.parse(localStorage.getItem("inspection_reports") || "[]");
    const reportNo = (reportData as Record<string, string>)?.reportNo || `JYBG${new Date().getFullYear()}${String(existing.length + 1).padStart(4, "0")}`;
    const newReport = {
      id: Date.now().toString(),
      reportNo,
      batchNo: reportItem.batchNo,
      cropType: reportItem.cropType,
      variety: reportItem.variety,
      storageLocation: reportItem.storageLocation,
      testType: reportItem.testType,
      result: reportItem.result,
      tester: reportItem.tester,
      testDate: reportItem.testDate,
      reportData: reportEditing ? JSON.parse(reportEditContent) : reportData,
      status: "待审核" as const,
      createdAt: new Date().toISOString().split("T")[0],
      source: reportItem.source,
    };
    existing.push(newReport);
    localStorage.setItem("inspection_reports", JSON.stringify(existing));
    setReportOpen(false);
    alert("报告已生成并提交至检验报告列表待审核！");
  }, [reportItem, reportData, reportEditing, reportEditContent]);

  const tabData = data.filter((e) => e.source === activeTab);
  const positiveCount = tabData.filter((e) => e.result === "阳性").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">检验数据录入</h1>
          <p className="text-sm text-muted-foreground mt-1">录入转基因检测数据，任一元件阳性则整体判定为阳性</p>
        </div>

      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchTerm(""); setResultFilter("all"); }}>
        <TabsList>
          <TabsTrigger value="parent" className="gap-1.5"><Wheat className="h-3.5 w-3.5" />亲本种子样品</TabsTrigger>
          <TabsTrigger value="sowing" className="gap-1.5"><Sprout className="h-3.5 w-3.5" />播种样品</TabsTrigger>
          <TabsTrigger value="leaf" className="gap-1.5"><Leaf className="h-3.5 w-3.5" />叶片样品</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><FlaskConical className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">检测总数</p><p className="text-lg font-semibold">{tabData.length}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><FlaskConical className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">阴性</p><p className="text-lg font-semibold">{tabData.filter((e) => e.result === "阴性").length}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-destructive/10 p-2"><AlertTriangle className="h-4 w-4 text-destructive" /></div><div><p className="text-sm text-muted-foreground">阳性</p><p className="text-lg font-semibold text-destructive">{positiveCount}</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><FlaskConical className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">待检测</p><p className="text-lg font-semibold">{tabData.filter((e) => e.result === "待检测").length}</p></div></CardContent></Card>
          </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索批次号、品种、作物种类..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={resultFilter} onValueChange={setResultFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="检测结果" /></SelectTrigger><SelectContent><SelectItem value="all">全部结果</SelectItem><SelectItem value="阴性">阴性</SelectItem><SelectItem value="阳性">阳性</SelectItem><SelectItem value="待检测">待检测</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>批次号</TableHead>
                <TableHead>作物种类</TableHead>
                <TableHead>品种名称</TableHead>
                <TableHead>存放点</TableHead>
                <TableHead>检测元件</TableHead>
                <TableHead>检测方法</TableHead>
                <TableHead>检测人</TableHead>
                <TableHead>最终结论</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                  <TableCell><Badge variant="secondary">{item.cropType}</Badge></TableCell>
                  <TableCell>{item.variety}</TableCell>
                  <TableCell className="text-sm">{item.storageLocation || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {item.elements.length > 0
                      ? item.elements.map(el => `${el.name}:${el.result}`).join(" | ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{item.testMethod || "—"}</TableCell>
                  <TableCell>{item.tester || "—"}</TableCell>
                  <TableCell><Badge variant={resultConfig[item.result].variant}>{resultConfig[item.result].label}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => openEdit(item)}><FlaskConical className="h-4 w-4" />录入/编辑</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => handleGenerateReport(item)} disabled={item.result === "待检测"}><FileText className="h-4 w-4" />生成报告单</DropdownMenuItem>
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

      {/* 编辑检测记录 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>编辑检测记录</DialogTitle><DialogDescription>修改检测数据，保存后系统将自动重新计算最终结论</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>批次号</Label>
                <Select value={formBatchNo} onValueChange={handleBatchSelect}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {batchOptions.map(b => <SelectItem key={b.batchNo} value={b.batchNo}>{b.batchNo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>作物种类</Label>
                <Input value={formCropType} readOnly className="bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>品种名称</Label>
                <Input value={formVariety} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>存放点</Label>
                <Input value={formStorageLocation} readOnly className="bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>检测方法</Label><Select value={formTestMethod} onValueChange={setFormTestMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="实时荧光PCR">实时荧光PCR</SelectItem><SelectItem value="常规PCR">常规PCR</SelectItem><SelectItem value="试纸条快检">试纸条快检</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>仪器型号</Label><Select value={formInstrument} onValueChange={setFormInstrument}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ABI 7500">ABI 7500</SelectItem><SelectItem value="Bio-Rad CFX96">Bio-Rad CFX96</SelectItem><SelectItem value="Roche LightCycler 480">Roche LightCycler 480</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>检测人</Label><Input value={formTester} onChange={(e) => setFormTester(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>冰箱存档位置</Label><Input value={formFridge} onChange={(e) => setFormFridge(e.target.value)} /></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>检测元件</Label>
                <div className="flex items-center gap-2">
                  <Select value={addElementName} onValueChange={setAddElementName}><SelectTrigger className="w-36 h-8"><SelectValue placeholder="选择元件" /></SelectTrigger><SelectContent>{availableElements.filter(e => !formElements.some(fe => fe.name === e)).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select>
                  <Button size="sm" variant="outline" onClick={addElement} disabled={!addElementName}>添加</Button>
                </div>
              </div>
              {formElements.map((el, idx) => (
                <div key={el.name} className="flex items-center gap-3 rounded-md border p-2">
                  <span className="font-mono text-sm w-24">{el.name}</span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input placeholder="Ct值" value={el.ctValue} onChange={(e) => updateElement(idx, "ctValue", e.target.value)} className="h-8" />
                    <Select value={el.result} onValueChange={(v) => updateElement(idx, "result", v)}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="阴性">阴性</SelectItem><SelectItem value="阳性">阳性</SelectItem><SelectItem value="未检测">未检测</SelectItem></SelectContent></Select>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-8" onClick={() => removeElement(idx)}>移除</Button>
                </div>
              ))}
              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">系统自动计算最终结论：</span>
                <Badge variant={resultConfig[calculateResult(formElements)].variant} className="ml-2">{resultConfig[calculateResult(formElements)].label}</Badge>
              </div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Textarea rows={2} value={formRemark} onChange={(e) => setFormRemark(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button><Button onClick={handleEdit}>保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[650px] flex flex-col max-h-[80vh]">
          <DialogHeader className="shrink-0"><DialogTitle>检测记录详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">批次号</p><p className="font-mono">{viewingItem.batchNo}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">作物种类</p><p><Badge variant="secondary">{viewingItem.cropType}</Badge></p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种名称</p><p>{viewingItem.variety}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">存放点</p><p>{viewingItem.storageLocation || "—"}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">检测类型</p><p>{viewingItem.testType}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">检测方法</p><p>{viewingItem.testMethod || "—"}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">仪器型号</p><p>{viewingItem.instrumentModel || "—"}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">检测人</p><p>{viewingItem.tester || "—"}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">检测日期</p><p>{viewingItem.testDate || "—"}</p></div>
              </div>
              {viewingItem.fridgeLocation && (
                <div className="space-y-1"><p className="text-sm text-muted-foreground">冰箱存档位置</p><p className="font-mono">{viewingItem.fridgeLocation}</p></div>
              )}
              {viewingItem.elements.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">检测元件详情</p>
                  <div className="space-y-1">
                    {viewingItem.elements.map(el => (
                      <div key={el.name} className="flex items-center gap-3 rounded-md border p-2 text-sm">
                        <span className="font-mono w-24">{el.name}</span>
                        <span className="text-muted-foreground">Ct值：{el.ctValue || "N/A"}</span>
                        <Badge variant={el.result === "阳性" ? "destructive" : "outline"}>{el.result}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-md bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">最终结论（任一元件阳性则整体阳性）：</span>
                <Badge variant={resultConfig[viewingItem.result].variant} className="ml-2 text-base">{resultConfig[viewingItem.result].label}</Badge>
              </div>
              {viewingItem.remark && <div className="space-y-1"><p className="text-sm text-muted-foreground">备注</p><p>{viewingItem.remark}</p></div>}
            </div>
          )}
          <DialogFooter className="shrink-0"><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除批次「{deletingItem?.batchNo}」的检测记录吗？</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 生成报告单 */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-[750px] flex flex-col max-h-[85vh]">
          <DialogHeader className="shrink-0">
            <DialogTitle>生成转基因成分检测报告单</DialogTitle>
            <DialogDescription>基于检测数据调用大模型自动生成报告，可修改后确认提交</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 py-4">
            {reportData ? (
              <div className="space-y-4">
                {/* 报告预览区 */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-lg font-bold">转基因成分检测报告单</h2>
                    <p className="text-sm text-muted-foreground mt-1">报告编号：{(reportData as Record<string, string>).reportNo || "—"}</p>
                  </div>
                  {(reportData as Record<string, Record<string, string>>).sampleInfo && (
                    <div>
                      <p className="text-sm font-semibold border-b pb-1 mb-2">样品信息</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">批次号：</span>{(reportData as Record<string, Record<string, string>>).sampleInfo.batchNo}</div>
                        <div><span className="text-muted-foreground">作物种类：</span>{(reportData as Record<string, Record<string, string>>).sampleInfo.cropType}</div>
                        <div><span className="text-muted-foreground">品种名称：</span>{(reportData as Record<string, Record<string, string>>).sampleInfo.variety}</div>
                        <div><span className="text-muted-foreground">存放点：</span>{(reportData as Record<string, Record<string, string>>).sampleInfo.storageLocation}</div>
                      </div>
                    </div>
                  )}
                  {(reportData as Record<string, Record<string, string>>).testInfo && (
                    <div>
                      <p className="text-sm font-semibold border-b pb-1 mb-2">检测信息</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">检测类型：</span>{(reportData as Record<string, Record<string, string>>).testInfo.testType}</div>
                        <div><span className="text-muted-foreground">检测方法：</span>{(reportData as Record<string, Record<string, string>>).testInfo.testMethod}</div>
                        <div><span className="text-muted-foreground">仪器型号：</span>{(reportData as Record<string, Record<string, string>>).testInfo.instrumentModel}</div>
                        <div><span className="text-muted-foreground">检测依据：</span>{(reportData as Record<string, Record<string, string>>).testInfo.testStandard}</div>
                      </div>
                    </div>
                  )}
                  {Array.isArray((reportData as Record<string, unknown>).testElements) && (
                    <div>
                      <p className="text-sm font-semibold border-b pb-1 mb-2">检测元件</p>
                      <Table>
                        <TableHeader><TableRow><TableHead>元件名称</TableHead><TableHead>Ct值</TableHead><TableHead>结果</TableHead><TableHead>检测限</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {((reportData as Record<string, Record<string, string>[]>).testElements).map((el, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-mono">{el.name}</TableCell>
                              <TableCell>{el.ctValue}</TableCell>
                              <TableCell><Badge variant={el.result === "阳性" ? "destructive" : "outline"}>{el.result}</Badge></TableCell>
                              <TableCell>{el.detectionLimit || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {(reportData as Record<string, string>).conclusion && (
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-sm font-semibold mb-1">检测结论</p>
                      <p className="text-sm">{(reportData as Record<string, string>).conclusion}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
                    <div><span className="text-muted-foreground">送样人：</span>{(reportData as Record<string, string>).sender || "—"}</div>
                    <div><span className="text-muted-foreground">检测人：</span>{(reportData as Record<string, string>).tester}</div>
                    <div><span className="text-muted-foreground">审核人：</span>{(reportData as Record<string, string>).reviewer || "待审核"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">检测日期：</span>{(reportData as Record<string, string>).testDate}</div>
                    <div><span className="text-muted-foreground">报告日期：</span>{(reportData as Record<string, string>).reportDate}</div>
                  </div>
                  {(reportData as Record<string, string>).remark && (
                    <div className="text-sm"><span className="text-muted-foreground">备注：</span>{(reportData as Record<string, string>).remark}</div>
                  )}
                </div>

                {/* 编辑切换 */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setReportEditing(!reportEditing)}>
                    {reportEditing ? "预览模式" : "编辑报告内容"}
                  </Button>
                  {reportEditing && <p className="text-xs text-muted-foreground">编辑JSON格式报告数据，修改后点击确认提交</p>}
                </div>
                {reportEditing && (
                  <Textarea
                    className="font-mono text-xs min-h-[300px]"
                    value={reportEditContent}
                    onChange={(e) => setReportEditContent(e.target.value)}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">{reportRaw || "生成失败"}</div>
            )}
          </div>
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setReportOpen(false)}>取消</Button>
            <Button onClick={handleConfirmReport} disabled={!reportData}>
              确认提交至检验报告
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
