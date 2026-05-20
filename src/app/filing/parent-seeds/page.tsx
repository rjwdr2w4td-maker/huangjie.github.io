"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Sprout, Search, Plus, MoreHorizontal, Eye, Pencil, Trash2, Download, Upload, Clock, CheckCircle2, XCircle, FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

/* 审核状态 */
type ReviewStatus = "待审核" | "已通过" | "已退回";

const statusConfig: Record<ReviewStatus, { label: string; color: "bg-yellow-100 text-yellow-800" | "bg-green-100 text-green-800" | "bg-red-100 text-red-800"; icon: typeof Clock }> = {
  "待审核": { label: "待审核", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  "已通过": { label: "已通过", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  "已退回": { label: "已退回", color: "bg-red-100 text-red-800", icon: XCircle },
};

/* 作物种类与品种数据 */
const cropTypes = ["水稻", "小麦", "玉米", "棉花", "油菜"];

interface VarietyInfo {
  name: string;
  source: string;
}

const varietyMap: Record<string, VarietyInfo[]> = {
  "水稻": [
    { name: "Y58S", source: "湖南长沙" },
    { name: "R9311", source: "湖北武汉" },
    { name: "丰两优1号", source: "安徽合肥" },
    { name: "晶两优534", source: "四川成都" },
    { name: "隆两优华占", source: "湖南长沙" },
  ],
  "小麦": [
    { name: "郑麦9023", source: "河南郑州" },
    { name: "济麦22", source: "山东济南" },
    { name: "百农207", source: "河南新乡" },
    { name: "西农979", source: "陕西杨凌" },
  ],
  "玉米": [
    { name: "郑单958", source: "河南郑州" },
    { name: "先玉335", source: "辽宁沈阳" },
    { name: "登海605", source: "山东莱州" },
    { name: "京科968", source: "北京海淀" },
  ],
  "棉花": [
    { name: "鲁棉研28", source: "山东聊城" },
    { name: "中棉所41", source: "河南安阳" },
    { name: "新陆早45", source: "新疆石河子" },
  ],
  "油菜": [
    { name: "中油杂12", source: "湖北荆州" },
    { name: "华油杂62", source: "湖北武汉" },
    { name: "沣油737", source: "湖南长沙" },
  ],
};

/* 品种来源映射（根据品种名称快速查找来源） */
const varietySourceLookup: Record<string, string> = {};
Object.values(varietyMap).forEach((varieties) => {
  varieties.forEach((v) => {
    varietySourceLookup[v.name] = v.source;
  });
});

/* 生产地点映射（按品种自动带出） */
const productionLocationMap: Record<string, string> = {
  "Y58S": "城关镇工业园区A区",
  "R9311": "城关镇工业园区A区",
  "丰两优1号": "柳林镇农业示范园",
  "晶两优534": "柳林镇农业示范园",
  "隆两优华占": "双河镇农科路12号",
  "郑麦9023": "柳林镇农业示范园",
  "济麦22": "大河镇科技路88号",
  "百农207": "大河镇科技路88号",
  "西农979": "城关镇建设路56号",
  "郑单958": "大河镇科技路88号",
  "先玉335": "双河镇农科路12号",
  "登海605": "柳林镇农业示范园",
  "京科968": "城关镇建设路56号",
  "鲁棉研28": "双河镇农科路12号",
  "中棉所41": "城关镇工业园区A区",
  "新陆早45": "大河镇科技路88号",
  "中油杂12": "城关镇建设路56号",
  "华油杂62": "城关镇工业园区A区",
  "沣油737": "柳林镇农业示范园",
};

interface ParentSeed {
  id: string;
  cropType: string;
  varietyName: string;
  batchNo: string;
  source: string;
  quantity: string;
  unit: string;
  productionLocation: string;
  estimatedArea: string;
  estimatedInvestment: string;
  attachmentName: string;
  remark: string;
  status: ReviewStatus;
  rejectReason: string;
  createdAt: string;
}

const initialData: ParentSeed[] = [
  { id: "1", cropType: "水稻", varietyName: "Y58S", batchNo: "PS-2024-001", source: "湖南长沙", quantity: "500", unit: "kg", productionLocation: "城关镇工业园区A区", estimatedArea: "200亩", estimatedInvestment: "15", attachmentName: "购种发票.pdf", remark: "", status: "已通过", rejectReason: "", createdAt: "2024-01-15" },
  { id: "2", cropType: "水稻", varietyName: "R9311", batchNo: "PS-2024-002", source: "湖北武汉", quantity: "300", unit: "kg", productionLocation: "城关镇工业园区A区", estimatedArea: "150亩", estimatedInvestment: "10", attachmentName: "", remark: "待送检", status: "待审核", rejectReason: "", createdAt: "2024-01-16" },
  { id: "3", cropType: "小麦", varietyName: "郑麦9023", batchNo: "PS-2024-003", source: "河南郑州", quantity: "800", unit: "kg", productionLocation: "柳林镇农业示范园", estimatedArea: "300亩", estimatedInvestment: "22", attachmentName: "品种权证明.pdf", remark: "", status: "已通过", rejectReason: "", createdAt: "2024-02-10" },
  { id: "4", cropType: "玉米", varietyName: "郑单958", batchNo: "PS-2024-004", source: "河南郑州", quantity: "200", unit: "kg", productionLocation: "大河镇科技路88号", estimatedArea: "80亩", estimatedInvestment: "5", attachmentName: "", remark: "新备案", status: "待审核", rejectReason: "", createdAt: "2024-03-05" },
  { id: "5", cropType: "棉花", varietyName: "鲁棉研28", batchNo: "PS-2024-005", source: "山东聊城", quantity: "600", unit: "kg", productionLocation: "双河镇农科路12号", estimatedArea: "250亩", estimatedInvestment: "18", attachmentName: "购种发票.pdf", remark: "", status: "已退回", rejectReason: "品种权证明缺失，请补充后重新提交", createdAt: "2024-04-03" },
  { id: "6", cropType: "油菜", varietyName: "中油杂12", batchNo: "PS-2024-006", source: "湖北荆州", quantity: "150", unit: "kg", productionLocation: "城关镇建设路56号", estimatedArea: "60亩", estimatedInvestment: "4", attachmentName: "", remark: "", status: "待审核", rejectReason: "", createdAt: "2024-04-12" },
];

type FormData = Omit<ParentSeed, "id" | "createdAt" | "status" | "rejectReason">;
const emptyForm: FormData = {
  cropType: "", varietyName: "", batchNo: "", source: "", quantity: "", unit: "kg", productionLocation: "", estimatedArea: "", estimatedInvestment: "", attachmentName: "", remark: "",
};

export default function ParentSeedsPage() {
  const [data, setData] = useState<ParentSeed[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ParentSeed | null>(null);
  const [deletingItem, setDeletingItem] = useState<ParentSeed | null>(null);

  /* 根据作物种类筛选可选品种 */
  const availableVarieties = useMemo(() => {
    if (!formData.cropType) return [];
    return varietyMap[formData.cropType] || [];
  }, [formData.cropType]);

  const filteredData = useMemo(() => {
    return data.filter((e) => {
      const matchesSearch =
        e.varietyName.includes(searchTerm) ||
        e.batchNo.includes(searchTerm) ||
        e.cropType.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  /* 作物种类变更 */
  const handleCropTypeChange = useCallback((cropType: string) => {
    setFormData((prev) => ({
      ...prev,
      cropType,
      varietyName: "",
      source: "",
      productionLocation: "",
    }));
  }, []);

  /* 品种变更 → 自动带出来源和生产地点 */
  const handleVarietyChange = useCallback((varietyName: string) => {
    const source = varietySourceLookup[varietyName] || "";
    const productionLocation = productionLocationMap[varietyName] || "";
    setFormData((prev) => ({
      ...prev,
      varietyName,
      source,
      productionLocation,
    }));
  }, []);

  const handleAdd = useCallback(() => {
    const newItem: ParentSeed = {
      ...formData,
      id: String(Date.now()),
      status: "待审核",
      rejectReason: "",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setData((prev) => [newItem, ...prev]);
    setAddOpen(false);
    setFormData(emptyForm);
  }, [formData]);

  const handleEdit = useCallback(() => {
    if (!editingId) return;
    setData((prev) =>
      prev.map((item) => {
        if (item.id === editingId) {
          return { ...item, ...formData, status: "待审核" as ReviewStatus, rejectReason: "" };
        }
        return item;
      })
    );
    setEditOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  }, [editingId, formData]);

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeleteOpen(false);
    setDeletingItem(null);
  }, [deletingItem]);

  const openEdit = useCallback((item: ParentSeed) => {
    setFormData({
      cropType: item.cropType,
      varietyName: item.varietyName,
      batchNo: item.batchNo,
      source: item.source,
      quantity: item.quantity,
      unit: item.unit,
      productionLocation: item.productionLocation,
      estimatedArea: item.estimatedArea,
      estimatedInvestment: item.estimatedInvestment,
      attachmentName: item.attachmentName,
      remark: item.remark,
    });
    setEditingId(item.id);
    setEditOpen(true);
  }, []);

  const pendingCount = data.filter((d) => d.status === "待审核").length;
  const passedCount = data.filter((d) => d.status === "已通过").length;
  const rejectedCount = data.filter((d) => d.status === "已退回").length;
  const totalCount = data.length;

  const canEdit = (item: ParentSeed) => item.status === "待审核" || item.status === "已退回";
  const canDelete = (item: ParentSeed) => item.status !== "已通过";

  const renderFormFields = () => (
    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label>作物种类 *</Label>
        <Select value={formData.cropType} onValueChange={handleCropTypeChange}>
          <SelectTrigger><SelectValue placeholder="请选择作物种类" /></SelectTrigger>
          <SelectContent>
            {cropTypes.map((ct) => (
              <SelectItem key={ct} value={ct}>{ct}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>品种名称 *</Label>
        <Select value={formData.varietyName} onValueChange={handleVarietyChange} disabled={!formData.cropType}>
          <SelectTrigger><SelectValue placeholder={formData.cropType ? "请选择品种" : "请先选择作物种类"} /></SelectTrigger>
          <SelectContent>
            {availableVarieties.map((v) => (
              <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>品种来源（自动带出）</Label>
        <Input value={formData.source} readOnly className="bg-muted" placeholder="选择品种后自动带出" />
      </div>
      <div className="space-y-2">
        <Label>批次号 *</Label>
        <Input value={formData.batchNo} onChange={(e) => setFormData((prev) => ({ ...prev, batchNo: e.target.value }))} placeholder="如 PS-2024-007" />
      </div>
      <div className="space-y-2">
        <Label>数量 *</Label>
        <div className="flex gap-2">
          <Input type="number" value={formData.quantity} onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))} placeholder="数量" className="flex-1" />
          <Select value={formData.unit} onValueChange={(v) => setFormData((prev) => ({ ...prev, unit: v }))}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="吨">吨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>生产地点（自动带出）</Label>
        <Input value={formData.productionLocation} readOnly className="bg-muted" placeholder="选择品种后自动带出" />
      </div>
      <div className="space-y-2">
        <Label>预计播种面积</Label>
        <Input value={formData.estimatedArea} onChange={(e) => setFormData((prev) => ({ ...prev, estimatedArea: e.target.value }))} placeholder="如 200亩" />
      </div>
      <div className="space-y-2">
        <Label>预计投资（万元）</Label>
        <Input type="number" value={formData.estimatedInvestment} onChange={(e) => setFormData((prev) => ({ ...prev, estimatedInvestment: e.target.value }))} placeholder="如 15" />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>上传附件（购种发票、品种权证明等）</Label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => {
            const fileName = "品种权证明.pdf";
            setFormData((prev) => ({ ...prev, attachmentName: prev.attachmentName ? prev.attachmentName + "、" + fileName : fileName }));
          }}>
            <Upload className="h-4 w-4 mr-1" />选择文件
          </Button>
          {formData.attachmentName && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{formData.attachmentName}</span>
              <button className="text-destructive hover:text-destructive/80" onClick={() => setFormData((prev) => ({ ...prev, attachmentName: "" }))}>x</button>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-2">
        <Label>备注</Label>
        <Textarea rows={2} value={formData.remark} onChange={(e) => setFormData((prev) => ({ ...prev, remark: e.target.value }))} placeholder="补充说明" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">亲本种子信息备案</h1>
        <p className="text-sm text-muted-foreground mt-1">制种企业填报亲本种子品种、批次、来源及数量等信息，提交后进入待审核状态</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><Sprout className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">备案总数</p><p className="text-lg font-semibold">{totalCount}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-yellow-100 p-2"><Clock className="h-4 w-4 text-yellow-700" /></div><div><p className="text-sm text-muted-foreground">待审核</p><p className="text-lg font-semibold text-yellow-700">{pendingCount}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-green-100 p-2"><CheckCircle2 className="h-4 w-4 text-green-700" /></div><div><p className="text-sm text-muted-foreground">已通过</p><p className="text-lg font-semibold text-green-700">{passedCount}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-red-100 p-2"><XCircle className="h-4 w-4 text-red-700" /></div><div><p className="text-sm text-muted-foreground">已退回</p><p className="text-lg font-semibold text-red-700">{rejectedCount}</p></div></CardContent></Card>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索品种、批次号、作物种类..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-28"><SelectValue placeholder="审核状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="待审核">待审核</SelectItem>
              <SelectItem value="已通过">已通过</SelectItem>
              <SelectItem value="已退回">已退回</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}><Download className="h-4 w-4 mr-1" />导出</Button>
          <Button size="sm" onClick={() => { setFormData(emptyForm); setAddOpen(true); }}><Plus className="h-4 w-4 mr-1" />新增备案</Button>
        </div>
      </div>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>作物种类</TableHead>
                <TableHead>品种名称</TableHead>
                <TableHead>批次号</TableHead>
                <TableHead>品种来源</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>生产地点</TableHead>
                <TableHead>预计面积</TableHead>
                <TableHead>预计投资(万元)</TableHead>
                <TableHead>附件</TableHead>
                <TableHead>审核状态</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead className="w-12">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, idx) => {
                const sc = statusConfig[item.status];
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell><Badge variant="secondary" className="border-0 text-xs">{item.cropType}</Badge></TableCell>
                    <TableCell className="font-medium">{item.varietyName}</TableCell>
                    <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>{item.quantity}{item.unit}</TableCell>
                    <TableCell className="text-sm">{item.productionLocation}</TableCell>
                    <TableCell>{item.estimatedArea}</TableCell>
                    <TableCell className="text-right">{item.estimatedInvestment}</TableCell>
                    <TableCell>{item.attachmentName ? <span className="text-primary text-sm">{item.attachmentName}</span> : <span className="text-muted-foreground text-sm">无</span>}</TableCell>
                    <TableCell><Badge variant="secondary" className={`${sc.color} border-0 text-xs`}>{sc.label}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{item.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                          {canEdit(item) && (
                            <DropdownMenuItem className="gap-2" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" />编辑</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {canDelete(item) && (
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => { setDeletingItem(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" />删除</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredData.length === 0 && (
                <TableRow><TableCell colSpan={13} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 新增对话框 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>新增亲本种子备案</DialogTitle><DialogDescription>填写亲本种子品种、批次、来源及数量信息，提交后将进入待审核状态</DialogDescription></DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
            <Button onClick={handleAdd} disabled={!formData.cropType || !formData.varietyName || !formData.batchNo || !formData.quantity}>提交备案（待审核）</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>编辑亲本种子备案</DialogTitle><DialogDescription>修改后需重新提交审核</DialogDescription></DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={handleEdit}>保存并重新提交审核</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看详情对话框 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>亲本种子备案详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">作物种类</p><p><Badge variant="secondary" className="border-0">{viewingItem.cropType}</Badge></p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种名称</p><p className="font-medium">{viewingItem.varietyName}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">批次号</p><p className="font-mono">{viewingItem.batchNo}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种来源</p><p>{viewingItem.source}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">数量</p><p>{viewingItem.quantity} {viewingItem.unit}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">生产地点</p><p>{viewingItem.productionLocation}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">预计播种面积</p><p>{viewingItem.estimatedArea}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">预计投资（万元）</p><p className="font-medium">{viewingItem.estimatedInvestment}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">附件</p><p>{viewingItem.attachmentName || "无"}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">审核状态</p><Badge variant="secondary" className={`${statusConfig[viewingItem.status].color} border-0`}>{viewingItem.status}</Badge></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">创建日期</p><p>{viewingItem.createdAt}</p></div>
              </div>
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

      {/* 删除确认 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除批次号为「{deletingItem?.batchNo}」的亲本种子备案记录吗？此操作不可撤销。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
