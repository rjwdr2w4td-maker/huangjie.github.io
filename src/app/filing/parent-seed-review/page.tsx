"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ShieldCheck, Search, CheckCircle2, XCircle, Eye, FileText, Clock, Send, Truck, UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ReviewStatus = "待审核" | "已通过" | "已退回";

interface ParentSeedRecord {
  id: string;
  enterpriseName: string;
  varietyName: string;
  batchNo: string;
  source: string;
  quantity: string;
  unit: string;
  productionLocation: string;
  estimatedArea: string;
  estimatedInvestment: string;
  cropType: string;
  attachmentName: string;
  remark: string;
  status: ReviewStatus;
  rejectReason: string;
  createdAt: string;
  /* 审核通过后生成接样单 */
  inspectionFormNo: string;
  inspectionFormDate: string;
  /* 送样方式 */
  deliveryMethod?: "enterprise" | "county";
  /* 县级取样人 */
  samplePerson?: string;
  /* 取样量 */
  sampleQuantity?: string;
  /* 取样截止时间 */
  sampleDeadline?: string;
  /* 是否已同步到接样单管理 */
  syncedToInspection?: boolean;
  /* 送样状态：是否已送样（由小程序提交判断） */
  deliveryStatus?: "未送样" | "已送样";
}

const countyPersonOptions = ["刘管理", "陈检测", "王检验", "张技术员", "李巡查员"];

const initialData: ParentSeedRecord[] = [
  { id: "1", enterpriseName: "丰源种业有限公司", varietyName: "Y58S", batchNo: "PS-2024-001", source: "湖南长沙", quantity: "500", unit: "kg", productionLocation: "城关镇工业园区A区", estimatedArea: "200亩", estimatedInvestment: "15", cropType: "水稻", attachmentName: "购种发票.pdf", remark: "", status: "已通过", rejectReason: "", createdAt: "2024-01-15", inspectionFormNo: "JYD20240001", inspectionFormDate: "2024-01-16", deliveryMethod: "enterprise", samplePerson: "丰源种业有限公司", sampleQuantity: "2kg", sampleDeadline: "2024-02-15", syncedToInspection: true, deliveryStatus: "已送样" },
  { id: "2", enterpriseName: "丰源种业有限公司", varietyName: "R9311", batchNo: "PS-2024-002", source: "湖北武汉", quantity: "300", unit: "kg", productionLocation: "城关镇工业园区A区", estimatedArea: "150亩", estimatedInvestment: "8", cropType: "水稻", attachmentName: "", remark: "待送检", status: "待审核", rejectReason: "", createdAt: "2024-01-16", inspectionFormNo: "", inspectionFormDate: "" },
  { id: "3", enterpriseName: "绿丰农业科技有限公司", varietyName: "郑麦9023", batchNo: "PS-2024-003", source: "河南郑州", quantity: "800", unit: "kg", productionLocation: "柳林镇农业示范园", estimatedArea: "300亩", estimatedInvestment: "20", cropType: "小麦", attachmentName: "品种权证明.pdf", remark: "", status: "已通过", rejectReason: "", createdAt: "2024-02-10", inspectionFormNo: "JYD20240002", inspectionFormDate: "2024-02-11", deliveryMethod: "county", samplePerson: "刘管理", sampleQuantity: "2kg", sampleDeadline: "2024-02-20", syncedToInspection: true, deliveryStatus: "已送样" },
  { id: "4", enterpriseName: "金穗种业股份有限公司", varietyName: "郑单958", batchNo: "PS-2024-004", source: "河南新乡", quantity: "200", unit: "kg", productionLocation: "大河镇科技路88号", estimatedArea: "80亩", estimatedInvestment: "5", cropType: "玉米", attachmentName: "", remark: "新备案", status: "待审核", rejectReason: "", createdAt: "2024-03-05", inspectionFormNo: "", inspectionFormDate: "" },
  { id: "5", enterpriseName: "农兴种业科技有限公司", varietyName: "鲁棉研28", batchNo: "PS-2024-005", source: "山东聊城", quantity: "600", unit: "kg", productionLocation: "双河镇农科路12号", estimatedArea: "250亩", estimatedInvestment: "18", cropType: "棉花", attachmentName: "购种发票.pdf", remark: "", status: "已退回", rejectReason: "品种权证明缺失，请补充后重新提交", createdAt: "2024-04-03", inspectionFormNo: "", inspectionFormDate: "" },
  { id: "6", enterpriseName: "穗丰农业发展有限公司", varietyName: "中油杂12", batchNo: "PS-2024-006", source: "湖北荆州", quantity: "150", unit: "kg", productionLocation: "城关镇建设路56号", estimatedArea: "60亩", estimatedInvestment: "3", cropType: "油菜", attachmentName: "", remark: "", status: "已通过", rejectReason: "", createdAt: "2024-04-12", inspectionFormNo: "JYD20240003", inspectionFormDate: "2024-04-13", deliveryMethod: "enterprise", samplePerson: "穗丰农业发展有限公司", sampleQuantity: "1.5kg", sampleDeadline: "2024-05-13", syncedToInspection: true, deliveryStatus: "未送样" },
];

export default function ParentSeedReviewPage() {
  const [data, setData] = useState<ParentSeedRecord[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ParentSeedRecord | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<ParentSeedRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [approvingItem, setApprovingItem] = useState<ParentSeedRecord | null>(null);

  /* 生成接样单对话框 */
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generatingItem, setGeneratingItem] = useState<ParentSeedRecord | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"enterprise" | "county">("enterprise");
  const [samplePerson, setSamplePerson] = useState("");
  const [sampleQuantity, setSampleQuantity] = useState("");
  const [sampleDeadline, setSampleDeadline] = useState("");
  const [syncedNotice, setSyncedNotice] = useState(false);

  const filteredData = useMemo(() => {
    return data.filter((e) => {
      const matchesSearch =
        e.enterpriseName.includes(searchTerm) ||
        e.varietyName.includes(searchTerm) ||
        e.batchNo.includes(searchTerm) ||
        e.cropType.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  /* 生成接样单编号：JYD+年份+4位流水号 */
  const generateInspectionFormNo = useCallback(() => {
    const year = new Date().getFullYear();
    const existingCount = data.filter((d) => d.inspectionFormNo.startsWith(`JYD${year}`)).length;
    const seq = String(existingCount + 1).padStart(4, "0");
    return `JYD${year}${seq}`;
  }, [data]);

  /* 审核通过 */
  const handleApprove = useCallback(() => {
    if (!approvingItem) return;
    const formNo = generateInspectionFormNo();
    const today = new Date().toISOString().split("T")[0];
    setData((prev) =>
      prev.map((item) =>
        item.id === approvingItem.id
          ? { ...item, status: "已通过" as ReviewStatus, inspectionFormNo: formNo, inspectionFormDate: today }
          : item
      )
    );
    setConfirmApproveOpen(false);
    setApprovingItem(null);
  }, [approvingItem, generateInspectionFormNo]);

  /* 审核不通过 */
  const handleReject = useCallback(() => {
    if (!rejectingItem || !rejectReason.trim()) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === rejectingItem.id
          ? { ...item, status: "已退回" as ReviewStatus, rejectReason: rejectReason.trim() }
          : item
      )
    );
    setRejectOpen(false);
    setRejectingItem(null);
    setRejectReason("");
  }, [rejectingItem, rejectReason]);

  /* 生成接样单并同步 */
  const handleGenerateInspection = useCallback(() => {
    if (!generatingItem) return;
    const isEnterpriseValid = deliveryMethod === "enterprise" && sampleQuantity && sampleDeadline;
    const isCountyValid = deliveryMethod === "county" && samplePerson && sampleQuantity && sampleDeadline;
    if (!isEnterpriseValid && !isCountyValid) return;

    setData((prev) =>
      prev.map((item) =>
        item.id === generatingItem.id
          ? {
              ...item,
              deliveryMethod,
              samplePerson: deliveryMethod === "enterprise" ? generatingItem.enterpriseName : samplePerson,
              sampleQuantity,
              sampleDeadline,
              syncedToInspection: true,
              deliveryStatus: "未送样" as const,
            }
          : item
      )
    );
    setSyncedNotice(true);
    setTimeout(() => setSyncedNotice(false), 5000);
    setGenerateOpen(false);
    setGeneratingItem(null);
    setDeliveryMethod("enterprise");
    setSamplePerson("");
    setSampleQuantity("");
    setSampleDeadline("");
  }, [generatingItem, deliveryMethod, samplePerson, sampleQuantity, sampleDeadline]);

  const openGenerateDialog = (item: ParentSeedRecord) => {
    setGeneratingItem(item);
    setDeliveryMethod(item.deliveryMethod || "enterprise");
    setSamplePerson(item.samplePerson || "");
    setSampleQuantity(item.sampleQuantity || "");
    setSampleDeadline(item.sampleDeadline || "");
    setGenerateOpen(true);
  };

  const pendingCount = data.filter((d) => d.status === "待审核").length;
  const approvedCount = data.filter((d) => d.status === "已通过").length;
  const rejectedCount = data.filter((d) => d.status === "已退回").length;

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "待审核": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0 text-xs">{status}</Badge>;
      case "已通过": return <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 text-xs">{status}</Badge>;
      case "已退回": return <Badge variant="secondary" className="bg-red-100 text-red-800 border-0 text-xs">{status}</Badge>;
    }
  };

  const getCropTypeBadge = (cropType: string) => {
    const colorMap: Record<string, string> = {
      "水稻": "bg-blue-100 text-blue-800",
      "小麦": "bg-amber-100 text-amber-800",
      "玉米": "bg-yellow-100 text-yellow-800",
      "棉花": "bg-pink-100 text-pink-800",
      "油菜": "bg-lime-100 text-lime-800",
    };
    return <Badge variant="secondary" className={`${colorMap[cropType] || "bg-muted text-muted-foreground"} border-0 text-xs`}>{cropType}</Badge>;
  };



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">亲本种子审核</h1>
        <p className="text-sm text-muted-foreground mt-1">县级管理人员审核企业提交的亲本种子备案，通过后生成《接样单》</p>
      </div>

      {syncedNotice && (
        <div className="rounded-md bg-chart-2/10 border border-chart-2/20 p-3 text-sm text-chart-2 flex items-center gap-2">
          <Send className="h-4 w-4" />
          接样单已同步至【接样单管理】页面，相关人员可查看接样任务
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><ShieldCheck className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">审核总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-yellow-100 p-2"><Clock className="h-4 w-4 text-yellow-700" /></div><div><p className="text-sm text-muted-foreground">待审核</p><p className="text-lg font-semibold text-yellow-700">{pendingCount}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-green-100 p-2"><CheckCircle2 className="h-4 w-4 text-green-700" /></div><div><p className="text-sm text-muted-foreground">已通过</p><p className="text-lg font-semibold text-green-700">{approvedCount}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-red-100 p-2"><XCircle className="h-4 w-4 text-red-700" /></div><div><p className="text-sm text-muted-foreground">已退回</p><p className="text-lg font-semibold text-red-700">{rejectedCount}</p></div></CardContent></Card>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索企业、品种、批次号、作物种类..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="审核状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="待审核">待审核</SelectItem>
              <SelectItem value="已通过">已通过</SelectItem>
              <SelectItem value="已退回">已退回</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">序号</TableHead>
                  <TableHead>制种企业</TableHead>
                  <TableHead>作物种类</TableHead>
                  <TableHead>品种名称</TableHead>
                  <TableHead>批次号</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>生产地点</TableHead>
                  <TableHead>预计投资(万元)</TableHead>
                  <TableHead>审核状态</TableHead>
                  <TableHead>接样单号</TableHead>
                  <TableHead>创建日期</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.enterpriseName}</TableCell>
                    <TableCell>{getCropTypeBadge(item.cropType)}</TableCell>
                    <TableCell>{item.varietyName}</TableCell>
                    <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>{item.quantity}{item.unit}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{item.productionLocation}</TableCell>
                    <TableCell className="text-right">{item.estimatedInvestment}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="font-mono text-sm">{item.inspectionFormNo || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="查看详情" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        {item.status === "待审核" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" title="审核通过" onClick={() => { setApprovingItem(item); setConfirmApproveOpen(true); }}><CheckCircle2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" title="审核不通过" onClick={() => { setRejectingItem(item); setRejectReason(""); setRejectOpen(true); }}><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        {item.status === "已通过" && item.inspectionFormNo && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="生成接样单" onClick={() => openGenerateDialog(item)}><FileText className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow><TableCell colSpan={13} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 查看详情 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>亲本种子备案详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">制种企业</p><p className="font-medium">{viewingItem.enterpriseName}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">作物种类</p>{getCropTypeBadge(viewingItem.cropType)}</div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种名称</p><p className="font-medium">{viewingItem.varietyName}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">批次号</p><p className="font-mono">{viewingItem.batchNo}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种来源</p><p>{viewingItem.source}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">数量</p><p>{viewingItem.quantity} {viewingItem.unit}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">生产地点</p><p>{viewingItem.productionLocation}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">预计播种面积</p><p>{viewingItem.estimatedArea}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">预计投资(万元)</p><p className="font-medium text-primary">{viewingItem.estimatedInvestment}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">附件</p><p>{viewingItem.attachmentName || "无"}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">审核状态</p>{getStatusBadge(viewingItem.status)}</div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">创建日期</p><p>{viewingItem.createdAt}</p></div>
              </div>
              {viewingItem.inspectionFormNo && (
                <>
                  <Separator />
                  <div className="rounded-md border bg-primary/5 p-4 space-y-3">
                    <p className="text-sm font-semibold text-primary">接样单信息</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">接样单编号：</span><span className="font-mono font-medium">{viewingItem.inspectionFormNo}</span></div>
                      <div><span className="text-muted-foreground">生成日期：</span>{viewingItem.inspectionFormDate}</div>
                      <div>
                        <span className="text-muted-foreground">送样方式：</span>
                        {viewingItem.deliveryMethod === "enterprise" ? (
                          <Badge variant="outline" className="gap-1 ml-1"><Truck className="h-3 w-3" />企业送样</Badge>
                        ) : viewingItem.deliveryMethod === "county" ? (
                          <Badge variant="outline" className="gap-1 ml-1"><UserCheck className="h-3 w-3" />县级取样</Badge>
                        ) : (
                          <span className="text-muted-foreground">未选择</span>
                        )}
                      </div>
                      {viewingItem.samplePerson && (
                        <>
                          <div><span className="text-muted-foreground">取样人：</span>{viewingItem.samplePerson}</div>
                          <div><span className="text-muted-foreground">取样量：</span>{viewingItem.sampleQuantity}</div>
                          <div><span className="text-muted-foreground">截止时间：</span>{viewingItem.sampleDeadline}</div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
              {viewingItem.rejectReason && (
                <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm text-destructive font-medium">退回原因</p>
                  <p className="text-sm">{viewingItem.rejectReason}</p>
                </div>
              )}
              {viewingItem.remark && <div className="space-y-1"><p className="text-sm text-muted-foreground">备注</p><p className="text-sm">{viewingItem.remark}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 审核通过确认 */}
      <Dialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>审核通过确认</DialogTitle><DialogDescription>确认通过后将自动生成《接样单》编号</DialogDescription></DialogHeader>
          {approvingItem && (
            <div className="space-y-3 rounded-md border bg-muted/30 p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">企业：</span>{approvingItem.enterpriseName}</div>
                <div><span className="text-muted-foreground">作物种类：</span>{approvingItem.cropType}</div>
                <div><span className="text-muted-foreground">品种：</span>{approvingItem.varietyName}</div>
                <div><span className="text-muted-foreground">批次号：</span>{approvingItem.batchNo}</div>
                <div><span className="text-muted-foreground">品种来源：</span>{approvingItem.source}</div>
                <div><span className="text-muted-foreground">数量：</span>{approvingItem.quantity}{approvingItem.unit}</div>
                <div><span className="text-muted-foreground">生产地点：</span>{approvingItem.productionLocation}</div>
                <div><span className="text-muted-foreground">预计投资：</span>{approvingItem.estimatedInvestment}万元</div>
              </div>
              <Separator />
              <div className="text-sm">
                <span className="text-muted-foreground">将生成接样单编号：</span>
                <span className="font-mono font-medium text-primary">{generateInspectionFormNo()}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmApproveOpen(false)}>取消</Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">确认通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审核不通过 */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>审核不通过</DialogTitle><DialogDescription>填写不通过原因，退回给企业修改后重新提交</DialogDescription></DialogHeader>
          {rejectingItem && (
            <div className="space-y-3">
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">企业：</span>{rejectingItem.enterpriseName}</div>
                  <div><span className="text-muted-foreground">作物种类：</span>{rejectingItem.cropType}</div>
                  <div><span className="text-muted-foreground">品种：</span>{rejectingItem.varietyName}</div>
                  <div><span className="text-muted-foreground">批次号：</span>{rejectingItem.batchNo}</div>
                  <div><span className="text-muted-foreground">品种来源：</span>{rejectingItem.source}</div>
                  <div><span className="text-muted-foreground">数量：</span>{rejectingItem.quantity}{rejectingItem.unit}</div>
                  <div><span className="text-muted-foreground">生产地点：</span>{rejectingItem.productionLocation}</div>
                  <div><span className="text-muted-foreground">预计投资：</span>{rejectingItem.estimatedInvestment}万元</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>退回原因 *</Label>
                <Textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="请填写不通过的具体原因，以便企业修改后重新提交" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>取消</Button>
            <Button onClick={handleReject} disabled={!rejectReason.trim()} className="bg-red-600 hover:bg-red-700 text-white">确认退回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 生成接样单 */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>生成接样单</DialogTitle>
            <DialogDescription>选择送样方式并生成接样单，数据将同步至接样单管理页面</DialogDescription>
          </DialogHeader>
          {generatingItem && (
            <div className="grid gap-5 py-4">
              {/* 接样单基本信息 */}
              <div className="rounded-md border bg-primary/5 p-4 space-y-2">
                <p className="text-sm font-semibold text-primary">接样单信息</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">接样单编号：</span><span className="font-mono font-medium">{generatingItem.inspectionFormNo}</span></div>
                  <div><span className="text-muted-foreground">生成日期：</span>{generatingItem.inspectionFormDate}</div>
                  <div><span className="text-muted-foreground">制种企业：</span>{generatingItem.enterpriseName}</div>
                  <div><span className="text-muted-foreground">作物种类：</span>{generatingItem.cropType}</div>
                  <div><span className="text-muted-foreground">品种名称：</span>{generatingItem.varietyName}</div>
                  <div><span className="text-muted-foreground">批次号：</span><span className="font-mono">{generatingItem.batchNo}</span></div>
                  <div><span className="text-muted-foreground">品种来源：</span>{generatingItem.source}</div>
                  <div><span className="text-muted-foreground">数量：</span>{generatingItem.quantity}{generatingItem.unit}</div>
                </div>
              </div>

              {/* 送样方式选择 */}
              <div className="rounded-md border p-4 space-y-3">
                <Label className="text-base font-semibold">送样方式 *</Label>
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={(v) => setDeliveryMethod(v as "enterprise" | "county")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setDeliveryMethod("enterprise")}>
                    <RadioGroupItem value="enterprise" id="gen-enterprise" className="mt-0.5" />
                    <div className="space-y-1">
                      <Label htmlFor="gen-enterprise" className="font-medium flex items-center gap-1.5"><Truck className="h-4 w-4" />企业送样</Label>
                      <p className="text-sm text-muted-foreground">企业自行将样品送至检验室，系统发送接样单通知给企业</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setDeliveryMethod("county")}>
                    <RadioGroupItem value="county" id="gen-county" className="mt-0.5" />
                    <div className="space-y-1">
                      <Label htmlFor="gen-county" className="font-medium flex items-center gap-1.5"><UserCheck className="h-4 w-4" />县级人员取样</Label>
                      <p className="text-sm text-muted-foreground">县级人员到现场取样，接样单同步至取样人移动端APP</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* 取样信息 — 两种方式都展示 */}
              <div className="rounded-md border p-4 space-y-4">
                <p className="text-sm font-semibold flex items-center gap-1.5"><UserCheck className="h-4 w-4" />取样信息</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>取样人 *</Label>
                    {deliveryMethod === "enterprise" ? (
                      <Input value={generatingItem.enterpriseName} disabled className="bg-muted/50" />
                    ) : (
                      <Select value={samplePerson} onValueChange={setSamplePerson}>
                        <SelectTrigger><SelectValue placeholder="选择取样人" /></SelectTrigger>
                        <SelectContent>{countyPersonOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                    {deliveryMethod === "enterprise" && <p className="text-xs text-muted-foreground">企业送样模式下，取样人默认为企业</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>取样量 *</Label>
                    <Input placeholder="如：2kg" value={sampleQuantity} onChange={(e) => setSampleQuantity(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>取样截止时间 *</Label>
                  <Input type="date" value={sampleDeadline} onChange={(e) => setSampleDeadline(e.target.value)} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>取消</Button>
            <Button onClick={handleGenerateInspection} disabled={(!sampleQuantity || !sampleDeadline) || (deliveryMethod === "county" && !samplePerson)}>
              <Send className="h-4 w-4 mr-1" />生成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
