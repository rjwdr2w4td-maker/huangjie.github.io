"use client";

import { useState, useCallback, useRef } from "react";
import {
  FlaskConical, Search, Eye, MoreHorizontal, Plus, Pencil, Trash2, Printer, Download,
  Truck, UserCheck, CheckCircle2, Camera, Clock, Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type DeliveryStatus = "pending_sample" | "ready_to_send" | "sent";

interface ParentInspection {
  id: string;
  sampleSheetNo: string;
  enterpriseName: string;
  cropType: string;
  varietyName: string;
  batchNo: string;
  varietySource: string;
  sampleQuantity: string;
  samplePerson: string;
  sampleDeadline: string;
  remark: string;
  createdAt: string;
  deliveryMethod: "enterprise" | "county";
  deliveryStatus: DeliveryStatus;
  samplingPhoto: string;
  samplingTime: string;
  deliveryPhoto: string;
  deliveryTime: string;
}

const enterpriseOptions = ["丰源种业有限公司", "丰源种业科技有限公司", "绿丰农业发展有限公司", "金穗种业股份有限公司", "华农高科种业有限公司", "兴农种业科技有限公司", "绿丰农业科技有限公司", "农兴种业科技有限公司", "穗丰农业发展有限公司"];
const countyPersonOptions = ["刘管理", "张技术员", "王检验员", "李巡查员", "赵专员"];

const generateSheetNo = (count: number) => {
  const year = new Date().getFullYear();
  return `JYD${year}${String(count + 1).padStart(4, "0")}`;
};

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

const statusConfig: Record<DeliveryStatus, { label: string; variant: "outline" | "secondary" | "default"; color: string }> = {
  pending_sample: { label: "待取样", variant: "outline", color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  ready_to_send: { label: "待送样", variant: "secondary", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  sent: { label: "已送样", variant: "default", color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
};

const cropTypeMap: Record<string, { varieties: { name: string; source: string }[] }> = {
  "水稻": { varieties: [{ name: "Y58S", source: "湖南长沙" }, { name: "Y两优900", source: "湖南长沙" }, { name: "晶两优534", source: "湖北武汉" }] },
  "小麦": { varieties: [{ name: "郑麦9023", source: "河南郑州" }, { name: "百农207", source: "河南新乡" }] },
  "玉米": { varieties: [{ name: "郑单958", source: "河南郑州" }, { name: "先玉335", source: "辽宁沈阳" }] },
  "棉花": { varieties: [{ name: "中棉所41", source: "河南安阳" }] },
  "油菜": { varieties: [{ name: "中油杂12", source: "湖北武汉" }] },
};

/* 模拟图片占位 */
const mockPhotoUrl = (label: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" fill="#e2e8f0"><rect width="200" height="150" rx="8"/><text x="100" y="80" text-anchor="middle" fill="#94a3b8" font-size="14">${label}</text></svg>`)}`;

const initialData: ParentInspection[] = [
  { id: "1", sampleSheetNo: "JYD20240001", enterpriseName: "丰源种业有限公司", cropType: "水稻", varietyName: "Y58S", batchNo: "PS-2024-001", varietySource: "湖南长沙", sampleQuantity: "2kg", samplePerson: "丰源种业有限公司", sampleDeadline: "2024-02-15", remark: "", createdAt: "2024-01-16", deliveryMethod: "enterprise", deliveryStatus: "sent", samplingPhoto: mockPhotoUrl("取样照片"), samplingTime: "2024-01-15 09:30", deliveryPhoto: mockPhotoUrl("送样照片"), deliveryTime: "2024-01-16 14:20" },
  { id: "2", sampleSheetNo: "JYD20240002", enterpriseName: "绿丰农业科技有限公司", cropType: "小麦", varietyName: "郑麦9023", batchNo: "PS-2024-003", varietySource: "河南郑州", sampleQuantity: "1.5kg", samplePerson: "刘管理", sampleDeadline: "2024-02-20", remark: "", createdAt: "2024-02-11", deliveryMethod: "county", deliveryStatus: "ready_to_send", samplingPhoto: mockPhotoUrl("取样照片"), samplingTime: "2024-02-11 10:00", deliveryPhoto: "", deliveryTime: "" },
  { id: "3", sampleSheetNo: "JYD20240003", enterpriseName: "穗丰农业发展有限公司", cropType: "油菜", varietyName: "中油杂12", batchNo: "PS-2024-006", varietySource: "湖北荆州", sampleQuantity: "1.5kg", samplePerson: "穗丰农业发展有限公司", sampleDeadline: "2024-05-13", remark: "", createdAt: "2024-04-13", deliveryMethod: "enterprise", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", deliveryPhoto: "", deliveryTime: "" },
  { id: "4", sampleSheetNo: "JYD20240004", enterpriseName: "华农高科种业有限公司", cropType: "棉花", varietyName: "中棉所41", batchNo: "BN-2024-004", varietySource: "河南安阳", sampleQuantity: "1kg", samplePerson: "华农高科种业有限公司", sampleDeadline: "2024-02-21", remark: "", createdAt: "2024-01-21", deliveryMethod: "enterprise", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", deliveryPhoto: "", deliveryTime: "" },
  { id: "5", sampleSheetNo: "JYD20240005", enterpriseName: "兴农种业科技有限公司", cropType: "油菜", varietyName: "中油杂12", batchNo: "BN-2024-005", varietySource: "湖北武汉", sampleQuantity: "1.5kg", samplePerson: "", sampleDeadline: "", remark: "", createdAt: "2024-01-25", deliveryMethod: "enterprise", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", deliveryPhoto: "", deliveryTime: "" },
];

/* 详情中的照片展示 */
function PhotoBlock({ label, photo, time }: { label: string; photo: string; time: string }) {
  if (!photo && !time) return null;
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {photo && (
        <div className="rounded-md border overflow-hidden bg-muted/30 w-48">
          <img src={photo} alt={label} className="w-full h-32 object-cover" />
        </div>
      )}
      {time && (
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{time}</span>
        </div>
      )}
    </div>
  );
}

export default function ParentInspectionPage() {
  const [data, setData] = useState<ParentInspection[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* 对话框状态 */
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [confirmSampleOpen, setConfirmSampleOpen] = useState(false);
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ParentInspection | null>(null);
  const [deletingItem, setDeletingItem] = useState<ParentInspection | null>(null);
  const [printingItem, setPrintingItem] = useState<ParentInspection | null>(null);
  const [confirmingItem, setConfirmingItem] = useState<ParentInspection | null>(null);

  /* 确认取样表单 */
  const [samplePhotoPreview, setSamplePhotoPreview] = useState("");
  const [sampleTimeInput, setSampleTimeInput] = useState("");
  const sampleFileRef = useRef<HTMLInputElement>(null);

  /* 确认送样表单 */
  const [deliveryPhotoPreview, setDeliveryPhotoPreview] = useState("");
  const [deliveryTimeInput, setDeliveryTimeInput] = useState("");
  const deliveryFileRef = useRef<HTMLInputElement>(null);

  /* 编辑表单 */
  const [editDeliveryMethod, setEditDeliveryMethod] = useState<"enterprise" | "county">("enterprise");
  const [editSamplePerson, setEditSamplePerson] = useState("");
  const [editSampleDeadline, setEditSampleDeadline] = useState("");
  const [editSampleQuantity, setEditSampleQuantity] = useState("");

  /* 新增表单 */
  const [formData, setFormData] = useState({
    enterpriseName: "", cropType: "", varietyName: "", batchNo: "", sampleQuantity: "", samplePerson: "", remark: "",
  });

  const filtered = data.filter((e) => {
    const matchesSearch = e.sampleSheetNo.includes(searchTerm) || e.enterpriseName.includes(searchTerm) || e.varietyName.includes(searchTerm) || e.cropType.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || e.deliveryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* 新增 */
  const handleAdd = useCallback(() => {
    const cropData = cropTypeMap[formData.cropType];
    const varietyData = cropData?.varieties.find((v) => v.name === formData.varietyName);
    const newItem: ParentInspection = {
      id: Date.now().toString(),
      sampleSheetNo: generateSheetNo(data.length),
      enterpriseName: formData.enterpriseName,
      cropType: formData.cropType,
      varietyName: formData.varietyName,
      batchNo: formData.batchNo,
      varietySource: varietyData?.source || "",
      sampleQuantity: formData.sampleQuantity,
      samplePerson: formData.samplePerson,
      sampleDeadline: "",
      remark: formData.remark,
      createdAt: today(),
      deliveryMethod: "enterprise",
      deliveryStatus: "pending_sample",
      samplingPhoto: "", samplingTime: "", deliveryPhoto: "", deliveryTime: "",
    };
    setData((prev) => [newItem, ...prev]);
    setAddOpen(false);
  }, [formData, data.length]);

  /* 编辑 */
  const handleEdit = useCallback(() => {
    if (!editingId) return;
    setData((prev) => prev.map((item) => item.id === editingId ? {
      ...item,
      deliveryMethod: editDeliveryMethod,
      samplePerson: editDeliveryMethod === "enterprise" ? item.enterpriseName : editSamplePerson,
      sampleDeadline: editSampleDeadline,
      sampleQuantity: editSampleQuantity,
    } : item));
    setEditingId(null);
    setEditOpen(false);
  }, [editingId, editDeliveryMethod, editSamplePerson, editSampleDeadline, editSampleQuantity]);

  /* 删除 */
  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  /* 确认取样 */
  const handleConfirmSample = useCallback(() => {
    if (!confirmingItem) return;
    setData((prev) => prev.map((item) => item.id === confirmingItem.id ? {
      ...item,
      deliveryStatus: "ready_to_send" as DeliveryStatus,
      samplingPhoto: samplePhotoPreview || mockPhotoUrl("取样照片"),
      samplingTime: sampleTimeInput || now(),
    } : item));
    setConfirmingItem(null);
    setConfirmSampleOpen(false);
    setSamplePhotoPreview("");
    setSampleTimeInput("");
  }, [confirmingItem, samplePhotoPreview, sampleTimeInput]);

  /* 确认送样 */
  const handleConfirmDelivery = useCallback(() => {
    if (!confirmingItem) return;
    setData((prev) => prev.map((item) => item.id === confirmingItem.id ? {
      ...item,
      deliveryStatus: "sent" as DeliveryStatus,
      deliveryPhoto: deliveryPhotoPreview || mockPhotoUrl("送样照片"),
      deliveryTime: deliveryTimeInput || now(),
    } : item));
    setConfirmingItem(null);
    setConfirmDeliveryOpen(false);
    setDeliveryPhotoPreview("");
    setDeliveryTimeInput("");
  }, [confirmingItem, deliveryPhotoPreview, deliveryTimeInput]);

  /* 文件选择处理 */
  const handleFileSelect = (type: "sample" | "delivery", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "sample") setSamplePhotoPreview(url);
    else setDeliveryPhotoPreview(url);
  };

  const openEdit = (item: ParentInspection) => {
    setEditingId(item.id);
    setEditDeliveryMethod(item.deliveryMethod);
    setEditSamplePerson(item.samplePerson);
    setEditSampleDeadline(item.sampleDeadline);
    setEditSampleQuantity(item.sampleQuantity);
    setEditOpen(true);
  };

  const openConfirmSample = (item: ParentInspection) => {
    setConfirmingItem(item);
    setSamplePhotoPreview("");
    setSampleTimeInput(now());
    setConfirmSampleOpen(true);
  };

  const openConfirmDelivery = (item: ParentInspection) => {
    setConfirmingItem(item);
    setDeliveryPhotoPreview("");
    setDeliveryTimeInput(now());
    setConfirmDeliveryOpen(true);
  };

  const updateForm = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "cropType") updated.varietyName = "";
      return updated;
    });
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    const cfg = statusConfig[status];
    return <Badge variant={cfg.variant} className={`${cfg.color} gap-1`}>
      {status === "sent" && <CheckCircle2 className="h-3 w-3" />}
      {cfg.label}
    </Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">接样单管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理接样单信息，跟踪取样与送样状态</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />导出</Button>
          <Button size="sm" className="gap-1.5" onClick={() => {
            setFormData({ enterpriseName: "", cropType: "", varietyName: "", batchNo: "", sampleQuantity: "", samplePerson: "", remark: "" });
            setAddOpen(true);
          }}><Plus className="h-3.5 w-3.5" />新增接样单</Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><FlaskConical className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">待取样</p><p className="text-lg font-semibold">{data.filter((e) => e.deliveryStatus === "pending_sample").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-yellow-100 p-2"><FlaskConical className="h-4 w-4 text-yellow-600" /></div><div><p className="text-sm text-muted-foreground">待送样</p><p className="text-lg font-semibold">{data.filter((e) => e.deliveryStatus === "ready_to_send").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><FlaskConical className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">已送样</p><p className="text-lg font-semibold">{data.filter((e) => e.deliveryStatus === "sent").length}</p></div></CardContent></Card>
      </div>

      {/* 搜索与筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索接样单号、企业、品种..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="送样状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="pending_sample">待取样</SelectItem><SelectItem value="ready_to_send">待送样</SelectItem><SelectItem value="sent">已送样</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">序号</TableHead>
                  <TableHead>接样单号</TableHead>
                  <TableHead>企业名称</TableHead>
                  <TableHead>作物种类</TableHead>
                  <TableHead>品种名称</TableHead>
                  <TableHead>批次号</TableHead>
                  <TableHead>送样方式</TableHead>
                  <TableHead>送样人</TableHead>
                  <TableHead>取样量</TableHead>
                  <TableHead>送样状态</TableHead>
                  <TableHead className="w-16">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{item.sampleSheetNo}</TableCell>
                    <TableCell className="font-medium">{item.enterpriseName}</TableCell>
                    <TableCell><Badge variant="secondary">{item.cropType}</Badge></TableCell>
                    <TableCell>{item.varietyName}</TableCell>
                    <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                    <TableCell>
                      {item.deliveryMethod === "enterprise" ? (
                        <Badge variant="outline" className="gap-1"><Truck className="h-3 w-3" />企业送样</Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1"><UserCheck className="h-3 w-3" />县级取样</Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.samplePerson || "—"}</TableCell>
                    <TableCell>{item.sampleQuantity || "—"}</TableCell>
                    <TableCell>{getStatusBadge(item.deliveryStatus)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                          {item.deliveryStatus === "pending_sample" && (
                            <>
                              <DropdownMenuItem className="gap-2" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" />编辑</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => openConfirmSample(item)}><Camera className="h-4 w-4" />确认取样</DropdownMenuItem>
                            </>
                          )}
                          {item.deliveryStatus === "ready_to_send" && (
                            <DropdownMenuItem className="gap-2" onClick={() => openConfirmDelivery(item)}><Truck className="h-4 w-4" />确认送样</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2" onClick={() => { setPrintingItem(item); setPrintOpen(true); }}><Printer className="h-4 w-4" />打印</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive" onClick={() => { setDeletingItem(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" />删除</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========== 新增接样单 ========== */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>新增接样单</DialogTitle><DialogDescription>手动创建接样单，编号系统自动生成</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">系统自动生成编号</p>
              <p className="font-mono text-primary text-lg font-semibold mt-1">{generateSheetNo(data.length)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>企业名称 *</Label><Select value={formData.enterpriseName} onValueChange={(v) => updateForm("enterpriseName", v)}><SelectTrigger><SelectValue placeholder="选择企业" /></SelectTrigger><SelectContent>{enterpriseOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>作物种类 *</Label><Select value={formData.cropType} onValueChange={(v) => updateForm("cropType", v)}><SelectTrigger><SelectValue placeholder="选择作物种类" /></SelectTrigger><SelectContent>{Object.keys(cropTypeMap).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>品种名称 *</Label><Select value={formData.varietyName} onValueChange={(v) => updateForm("varietyName", v)} disabled={!formData.cropType}><SelectTrigger><SelectValue placeholder={formData.cropType ? "选择品种" : "请先选择作物种类"} /></SelectTrigger><SelectContent>{(cropTypeMap[formData.cropType]?.varieties || []).map((v) => <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>批次号</Label><Input placeholder="关联亲本种子备案批次号" value={formData.batchNo} onChange={(e) => updateForm("batchNo", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>取样量</Label><Input placeholder="如：2kg" value={formData.sampleQuantity} onChange={(e) => updateForm("sampleQuantity", e.target.value)} /></div>
              <div className="space-y-2"><Label>取样人</Label><Input value={formData.samplePerson} onChange={(e) => updateForm("samplePerson", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Textarea rows={3} value={formData.remark} onChange={(e) => updateForm("remark", e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleAdd} disabled={!formData.enterpriseName || !formData.cropType || !formData.varietyName}>生成接样单</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 编辑 — 仅修改送样方式、送样人、取样时间、取样量 ========== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>编辑接样单</DialogTitle><DialogDescription>仅可修改送样方式、送样人、取样时间和取样量</DialogDescription></DialogHeader>
          {editingId && (() => {
            const currentItem = data.find((d) => d.id === editingId);
            return currentItem ? (
              <div className="grid gap-5 py-4">
                <div className="rounded-md border bg-primary/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-primary">接样单基本信息（不可修改）</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">接样单号：</span><span className="font-mono font-medium">{currentItem.sampleSheetNo}</span></div>
                    <div><span className="text-muted-foreground">制种企业：</span><span className="font-medium">{currentItem.enterpriseName}</span></div>
                    <div><span className="text-muted-foreground">作物种类：</span><span>{currentItem.cropType}</span></div>
                    <div><span className="text-muted-foreground">品种名称：</span><span>{currentItem.varietyName}</span></div>
                    <div><span className="text-muted-foreground">品种来源：</span><span>{currentItem.varietySource || "—"}</span></div>
                    <div><span className="text-muted-foreground">批次号：</span><span className="font-mono">{currentItem.batchNo}</span></div>
                  </div>
                </div>
                <div className="rounded-md border p-4 space-y-4">
                  <p className="text-sm font-semibold">修改送样信息</p>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">送样方式</Label>
                    <RadioGroup value={editDeliveryMethod} onValueChange={(v) => setEditDeliveryMethod(v as "enterprise" | "county")} className="space-y-3">
                      <div className="flex items-start space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setEditDeliveryMethod("enterprise")}>
                        <RadioGroupItem value="enterprise" id="edit-enterprise" className="mt-0.5" />
                        <div className="space-y-1"><Label htmlFor="edit-enterprise" className="font-medium flex items-center gap-1.5"><Truck className="h-4 w-4" />企业送样</Label><p className="text-sm text-muted-foreground">企业自行将样品送至检验室</p></div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setEditDeliveryMethod("county")}>
                        <RadioGroupItem value="county" id="edit-county" className="mt-0.5" />
                        <div className="space-y-1"><Label htmlFor="edit-county" className="font-medium flex items-center gap-1.5"><UserCheck className="h-4 w-4" />县级人员取样</Label><p className="text-sm text-muted-foreground">县级人员到现场取样</p></div>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>送样人</Label>
                    {editDeliveryMethod === "enterprise" ? (
                      <>
                        <Input value={currentItem.enterpriseName} disabled className="bg-muted/50" />
                        <p className="text-xs text-muted-foreground">企业送样模式下，送样人默认为企业</p>
                      </>
                    ) : (
                      <Select value={editSamplePerson} onValueChange={setEditSamplePerson}>
                        <SelectTrigger><SelectValue placeholder="选择取样人" /></SelectTrigger>
                        <SelectContent>{countyPersonOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>取样量</Label><Input placeholder="如：2kg" value={editSampleQuantity} onChange={(e) => setEditSampleQuantity(e.target.value)} /></div>
                    <div className="space-y-2"><Label>取样截止时间</Label><Input type="date" value={editSampleDeadline} onChange={(e) => setEditSampleDeadline(e.target.value)} /></div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button><Button onClick={handleEdit} disabled={editDeliveryMethod === "county" && !editSamplePerson}>保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 确认取样（上传照片和时间） ========== */}
      <Dialog open={confirmSampleOpen} onOpenChange={setConfirmSampleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>确认取样</DialogTitle><DialogDescription>上传取样照片并记录取样时间，确认后状态变为"待送样"</DialogDescription></DialogHeader>
          <div className="grid gap-5 py-4">
            {confirmingItem && (
              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">接样单号：</span>
                <span className="font-mono font-semibold text-primary ml-1">{confirmingItem.sampleSheetNo}</span>
                <span className="text-muted-foreground ml-3">品种：</span>
                <span className="font-medium ml-1">{confirmingItem.cropType} - {confirmingItem.varietyName}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>取样照片 *</Label>
              <div className="flex items-center gap-3">
                <input ref={sampleFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect("sample", e)} />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => sampleFileRef.current?.click()}><Camera className="h-4 w-4" />选择照片</Button>
                {samplePhotoPreview && <span className="text-xs text-muted-foreground">已选择照片</span>}
              </div>
              {samplePhotoPreview && (
                <div className="rounded-md border overflow-hidden w-48"><img src={samplePhotoPreview} alt="取样照片预览" className="w-full h-32 object-cover" /></div>
              )}
            </div>
            <div className="space-y-2">
              <Label>取样时间 *</Label>
              <Input type="datetime-local" value={sampleTimeInput} onChange={(e) => setSampleTimeInput(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmSampleOpen(false); setSamplePhotoPreview(""); }}>取消</Button>
            <Button onClick={handleConfirmSample} disabled={!samplePhotoPreview || !sampleTimeInput}>确认取样</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 确认送样（上传照片和时间） ========== */}
      <Dialog open={confirmDeliveryOpen} onOpenChange={setConfirmDeliveryOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>确认送样</DialogTitle><DialogDescription>上传送样照片并记录送样时间，确认后状态变为"已送样"</DialogDescription></DialogHeader>
          <div className="grid gap-5 py-4">
            {confirmingItem && (
              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">接样单号：</span>
                <span className="font-mono font-semibold text-primary ml-1">{confirmingItem.sampleSheetNo}</span>
                <span className="text-muted-foreground ml-3">品种：</span>
                <span className="font-medium ml-1">{confirmingItem.cropType} - {confirmingItem.varietyName}</span>
              </div>
            )}
            {/* 展示已有的取样信息 */}
            {confirmingItem && confirmingItem.samplingPhoto && (
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">取样信息</p>
                <div className="flex items-start gap-4">
                  <div className="rounded-md overflow-hidden w-36"><img src={confirmingItem.samplingPhoto} alt="取样照片" className="w-full h-24 object-cover" /></div>
                  <div className="flex items-center gap-1.5 text-sm"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span>取样时间：{confirmingItem.samplingTime}</span></div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>送样照片 *</Label>
              <div className="flex items-center gap-3">
                <input ref={deliveryFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect("delivery", e)} />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => deliveryFileRef.current?.click()}><Camera className="h-4 w-4" />选择照片</Button>
                {deliveryPhotoPreview && <span className="text-xs text-muted-foreground">已选择照片</span>}
              </div>
              {deliveryPhotoPreview && (
                <div className="rounded-md border overflow-hidden w-48"><img src={deliveryPhotoPreview} alt="送样照片预览" className="w-full h-32 object-cover" /></div>
              )}
            </div>
            <div className="space-y-2">
              <Label>送样时间 *</Label>
              <Input type="datetime-local" value={deliveryTimeInput} onChange={(e) => setDeliveryTimeInput(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmDeliveryOpen(false); setDeliveryPhotoPreview(""); }}>取消</Button>
            <Button onClick={handleConfirmDelivery} disabled={!deliveryPhotoPreview || !deliveryTimeInput}>确认送样</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 查看详情 — 根据状态展示照片 ========== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[80vh]">
          <DialogHeader className="shrink-0"><DialogTitle>接样单详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-5 py-4 overflow-y-auto flex-1 min-h-0">
              {/* 标题区 */}
              <div className="rounded-md bg-primary/5 border p-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-primary">亲本种子接样单</h3>
                  <p className="font-mono text-2xl font-semibold mt-1">{viewingItem.sampleSheetNo}</p>
                  <div className="mt-2">{getStatusBadge(viewingItem.deliveryStatus)}</div>
                </div>
              </div>

              {/* 基本信息 */}
              <div className="rounded-md border p-4 space-y-3">
                <p className="text-sm font-semibold border-b pb-2">基本信息</p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
                  <div><span className="text-muted-foreground">制种企业</span><p className="font-medium mt-0.5">{viewingItem.enterpriseName}</p></div>
                  <div><span className="text-muted-foreground">作物种类</span><p className="mt-0.5"><Badge variant="secondary">{viewingItem.cropType}</Badge></p></div>
                  <div><span className="text-muted-foreground">品种名称</span><p className="font-medium mt-0.5">{viewingItem.varietyName}</p></div>
                  <div><span className="text-muted-foreground">品种来源</span><p className="mt-0.5">{viewingItem.varietySource || "—"}</p></div>
                  <div><span className="text-muted-foreground">批次号</span><p className="font-mono mt-0.5">{viewingItem.batchNo}</p></div>
                  <div><span className="text-muted-foreground">取样量</span><p className="mt-0.5">{viewingItem.sampleQuantity || "—"}</p></div>
                </div>
              </div>

              {/* 送样信息 */}
              <div className="rounded-md border p-4 space-y-3">
                <p className="text-sm font-semibold border-b pb-2">送样信息</p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">送样方式</span>
                    <p className="mt-0.5">
                      {viewingItem.deliveryMethod === "enterprise" ? <Badge variant="outline" className="gap-1"><Truck className="h-3 w-3" />企业送样</Badge> : <Badge variant="outline" className="gap-1"><UserCheck className="h-3 w-3" />县级取样</Badge>}
                    </p>
                  </div>
                  <div><span className="text-muted-foreground">送样人</span><p className="font-medium mt-0.5">{viewingItem.samplePerson || "—"}</p></div>
                  <div><span className="text-muted-foreground">取样截止时间</span><p className="mt-0.5">{viewingItem.sampleDeadline || "—"}</p></div>
                </div>
              </div>

              {/* 取样信息 — 待送样和已送样展示 */}
              {(viewingItem.deliveryStatus === "ready_to_send" || viewingItem.deliveryStatus === "sent") && (
                <div className="rounded-md border p-4 space-y-3">
                  <p className="text-sm font-semibold border-b pb-2">取样信息</p>
                  <div className="flex items-start gap-6">
                    <PhotoBlock label="取样照片" photo={viewingItem.samplingPhoto} time={viewingItem.samplingTime} />
                  </div>
                </div>
              )}

              {/* 送样信息 — 已送样展示 */}
              {viewingItem.deliveryStatus === "sent" && (
                <div className="rounded-md border p-4 space-y-3">
                  <p className="text-sm font-semibold border-b pb-2">送样信息</p>
                  <div className="flex items-start gap-6">
                    <PhotoBlock label="送样照片" photo={viewingItem.deliveryPhoto} time={viewingItem.deliveryTime} />
                  </div>
                </div>
              )}

              {/* 其他 */}
              <div className="rounded-md border p-4 space-y-3">
                <p className="text-sm font-semibold border-b pb-2">其他信息</p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
                  <div><span className="text-muted-foreground">创建日期</span><p className="mt-0.5">{viewingItem.createdAt}</p></div>
                </div>
                {viewingItem.remark && <div className="text-sm"><span className="text-muted-foreground">备注：</span><span>{viewingItem.remark}</span></div>}
              </div>
            </div>
          )}
          <DialogFooter className="shrink-0"><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 打印预览 ========== */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader><DialogTitle>打印预览</DialogTitle><DialogDescription>预览并打印接样单</DialogDescription></DialogHeader>
          {printingItem && (
            <div className="rounded-md border p-6 space-y-4 print:border-0 print:p-0">
              <div className="text-center">
                <h3 className="text-xl font-bold">亲本种子接样单</h3>
                <p className="text-sm text-muted-foreground mt-1">转基因成分检测接样单</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                <div><span className="text-muted-foreground">接样单号：</span><span className="font-mono font-medium">{printingItem.sampleSheetNo}</span></div>
                <div><span className="text-muted-foreground">制种企业：</span><span className="font-medium">{printingItem.enterpriseName}</span></div>
                <div><span className="text-muted-foreground">作物种类：</span><span>{printingItem.cropType}</span></div>
                <div><span className="text-muted-foreground">品种名称：</span><span>{printingItem.varietyName}</span></div>
                <div><span className="text-muted-foreground">品种来源：</span><span>{printingItem.varietySource || "—"}</span></div>
                <div><span className="text-muted-foreground">批次号：</span><span className="font-mono">{printingItem.batchNo}</span></div>
                <div><span className="text-muted-foreground">取样量：</span><span>{printingItem.sampleQuantity}</span></div>
                <div><span className="text-muted-foreground">送样方式：</span><span>{printingItem.deliveryMethod === "enterprise" ? "企业送样" : "县级人员取样"}</span></div>
                <div><span className="text-muted-foreground">送样人：</span><span>{printingItem.samplePerson || "—"}</span></div>
                <div><span className="text-muted-foreground">取样截止时间：</span><span>{printingItem.sampleDeadline || "—"}</span></div>
              </div>
              {printingItem.samplingTime && (
                <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                  <div><span className="text-muted-foreground">取样时间：</span><span>{printingItem.samplingTime}</span></div>
                  <div><span className="text-muted-foreground">送样时间：</span><span>{printingItem.deliveryTime || "—"}</span></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                <div><span className="text-muted-foreground">制表日期：</span><span>{printingItem.createdAt}</span></div>
                <div><span className="text-muted-foreground">制表人：</span><span>县级管理人员</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintOpen(false)}>取消</Button>
            <Button variant="outline" className="gap-1.5" onClick={() => window.print()}><Printer className="h-4 w-4" />打印</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== 删除 ========== */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除接样单「{deletingItem?.sampleSheetNo}」吗？此操作不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
