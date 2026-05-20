"use client";

import { useState, useCallback, useMemo } from "react";
import {
  FileText, Search, Plus, MoreHorizontal, Eye, Pencil, Trash2, Download,
} from "lucide-react";
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

/* 制种企业下拉选项 */
const enterpriseOptions = [
  "丰源种业有限公司",
  "绿丰农业科技有限公司",
  "金穗种业股份有限公司",
  "华农种苗有限公司",
  "农兴种业科技有限公司",
  "穗丰农业发展有限公司",
];

/* 作物种类 */
const cropTypeOptions = ["水稻", "小麦", "玉米", "棉花", "油菜", "大豆", "蔬菜"];

/* 品种选项（按作物种类分组） */
const varietyOptionsMap: Record<string, string[]> = {
  "水稻": ["Y两优900", "Y58S", "R9311", "丰两优4号", "深两优5814", "C两优608"],
  "小麦": ["郑麦9023", "济麦22", "百农207", "西农979", "周麦27"],
  "玉米": ["郑单958", "先玉335", "浚单20", "登海605", "伟科702"],
  "棉花": ["鲁棉研28", "中棉所49", "新陆早45号"],
  "油菜": ["中油杂12", "华油杂62", "沣油737", "浙油50"],
  "大豆": ["中黄13", "齐黄34", "冀豆12"],
  "蔬菜": ["京春娃2号", "中椒6号", "津春4号"],
};

/* 关联基地选项（按企业分组，地块含面积） */
const baseOptionsMap: Record<string, { name: string; location: string; plots: { name: string; area: number }[] }[]> = {
  "丰源种业有限公司": [
    { name: "城关镇A区基地", location: "城关镇工业园区东侧", plots: [{ name: "A-1号地块", area: 50 }, { name: "A-2号地块", area: 40 }, { name: "A-3号地块", area: 30 }] },
    { name: "城关镇B区基地", location: "城关镇西环路南侧", plots: [{ name: "B-1号地块", area: 45 }, { name: "B-2号地块", area: 40 }] },
  ],
  "绿丰农业科技有限公司": [
    { name: "柳林镇C区基地", location: "柳林镇农业示范园内", plots: [{ name: "C-1号地块", area: 60 }, { name: "C-2号地块", area: 55 }, { name: "C-3号地块", area: 50 }, { name: "C-4号地块", area: 35 }] },
  ],
  "金穗种业股份有限公司": [
    { name: "大河镇D区基地", location: "大河镇科技路88号", plots: [{ name: "D-1号地块", area: 55 }, { name: "D-2号地块", area: 50 }, { name: "D-3号地块", area: 45 }] },
    { name: "大河镇E区基地", location: "大河镇现代农业园", plots: [{ name: "E-1号地块", area: 55 }, { name: "E-2号地块", area: 45 }] },
  ],
  "华农种苗有限公司": [
    { name: "沙河镇F区基地", location: "沙河镇产业园区北", plots: [{ name: "F-1号地块", area: 30 }, { name: "F-2号地块", area: 30 }] },
  ],
  "农兴种业科技有限公司": [
    { name: "双河镇G区基地", location: "双河镇农科路12号", plots: [{ name: "G-1号地块", area: 65 }, { name: "G-2号地块", area: 60 }, { name: "G-3号地块", area: 55 }] },
  ],
  "穗丰农业发展有限公司": [
    { name: "城关镇H区基地", location: "城关镇建设路56号", plots: [{ name: "H-1号地块", area: 50 }, { name: "H-2号地块", area: 40 }] },
  ],
};

interface Contract {
  id: string;
  contractNo: string;
  enterpriseName: string;
  cropType: string;
  varieties: string[];
  baseName: string;
  plots: string[];
  baseLocation: string;
  contractArea: string;
  plannedInvestment: string;
  contractStartDate: string;
  contractEndDate: string;
  status: "active" | "expired" | "terminated";
  remark: string;
  createdAt: string;
}

const initialData: Contract[] = [
  { id: "1", contractNo: "HT-2024-001", enterpriseName: "丰源种业有限公司", cropType: "水稻", varieties: ["Y两优900"], baseName: "城关镇A区基地", plots: ["A-1号地块", "A-2号地块"], baseLocation: "城关镇工业园区东侧", contractArea: "90亩", plannedInvestment: "36", contractStartDate: "2024-01-20", contractEndDate: "2024-12-31", status: "active", remark: "", createdAt: "2024-01-20" },
  { id: "2", contractNo: "HT-2024-002", enterpriseName: "绿丰农业科技有限公司", cropType: "小麦", varieties: ["郑麦9023", "济麦22"], baseName: "柳林镇C区基地", plots: ["C-1号地块", "C-2号地块", "C-3号地块"], baseLocation: "柳林镇农业示范园内", contractArea: "165亩", plannedInvestment: "50", contractStartDate: "2024-02-15", contractEndDate: "2025-02-14", status: "active", remark: "", createdAt: "2024-02-15" },
  { id: "3", contractNo: "HT-2024-003", enterpriseName: "金穗种业股份有限公司", cropType: "玉米", varieties: ["郑单958", "先玉335"], baseName: "大河镇D区基地", plots: ["D-1号地块", "D-2号地块"], baseLocation: "大河镇科技路88号", contractArea: "105亩", plannedInvestment: "45", contractStartDate: "2024-03-01", contractEndDate: "2024-11-30", status: "active", remark: "大额合同", createdAt: "2024-03-01" },
  { id: "4", contractNo: "HT-2023-015", enterpriseName: "华农种苗有限公司", cropType: "蔬菜", varieties: ["京春娃2号"], baseName: "沙河镇F区基地", plots: ["F-1号地块"], baseLocation: "沙河镇产业园区北", contractArea: "30亩", plannedInvestment: "18", contractStartDate: "2023-06-10", contractEndDate: "2024-06-09", status: "expired", remark: "", createdAt: "2023-06-10" },
  { id: "5", contractNo: "HT-2024-004", enterpriseName: "农兴种业科技有限公司", cropType: "棉花", varieties: ["鲁棉研28"], baseName: "双河镇G区基地", plots: ["G-1号地块", "G-2号地块", "G-3号地块"], baseLocation: "双河镇农科路12号", contractArea: "180亩", plannedInvestment: "54", contractStartDate: "2024-04-08", contractEndDate: "2024-12-31", status: "active", remark: "", createdAt: "2024-04-08" },
  { id: "6", contractNo: "HT-2023-008", enterpriseName: "穗丰农业发展有限公司", cropType: "油菜", varieties: ["中油杂12", "华油杂62"], baseName: "城关镇H区基地", plots: ["H-1号地块", "H-2号地块"], baseLocation: "城关镇建设路56号", contractArea: "90亩", plannedInvestment: "27", contractStartDate: "2023-09-20", contractEndDate: "2024-09-19", status: "terminated", remark: "因土地征收终止", createdAt: "2023-09-20" },
];

const statusConfig = {
  active: { label: "履行中", variant: "default" as const },
  expired: { label: "已到期", variant: "outline" as const },
  terminated: { label: "已终止", variant: "destructive" as const },
};

type FormData = Omit<Contract, "id" | "createdAt">;
const emptyForm: FormData = {
  contractNo: "", enterpriseName: "", cropType: "", varieties: [], baseName: "", plots: [], baseLocation: "", contractArea: "", plannedInvestment: "", contractStartDate: "", contractEndDate: "", status: "active", remark: "",
};

export default function ContractsPage() {
  const [data, setData] = useState<Contract[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<Contract | null>(null);
  const [deletingItem, setDeletingItem] = useState<Contract | null>(null);

  const today = () => new Date().toISOString().split("T")[0];

  /* 根据选择的企业获取基地列表 */
  const availableBases = useMemo(() => {
    return formData.enterpriseName ? (baseOptionsMap[formData.enterpriseName] || []) : [];
  }, [formData.enterpriseName]);

  /* 根据选择的基地获取地块列表（含面积） */
  const availablePlots = useMemo(() => {
    if (!formData.baseName) return [];
    const base = availableBases.find((b) => b.name === formData.baseName);
    return base ? base.plots : [];
  }, [formData.baseName, availableBases]);

  /* 根据已选地块自动计算制种面积 */
  const computedArea = useMemo(() => {
    if (!formData.baseName || formData.plots.length === 0) return "";
    const total = formData.plots.reduce((sum, plotName) => {
      const plot = availablePlots.find((p) => p.name === plotName);
      return sum + (plot?.area || 0);
    }, 0);
    return total > 0 ? `${total}亩` : "";
  }, [formData.plots, formData.baseName, availablePlots]);

  /* 根据作物种类获取品种列表 */
  const availableVarieties = useMemo(() => {
    return formData.cropType ? (varietyOptionsMap[formData.cropType] || []) : [];
  }, [formData.cropType]);

  const filtered = data.filter((e) => {
    const matchesSearch = e.contractNo.includes(searchTerm) || e.enterpriseName.includes(searchTerm) || e.cropType.includes(searchTerm) || e.varieties.some((v) => v.includes(searchTerm));
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = useCallback(() => {
    if (!formData.contractNo || !formData.enterpriseName || !formData.cropType) return;
    setData((prev) => [{ ...formData, id: Date.now().toString(), createdAt: today() }, ...prev]);
    setFormData(emptyForm);
    setAddOpen(false);
  }, [formData]);

  const handleEdit = useCallback(() => {
    if (!editingId || !formData.contractNo) return;
    setData((prev) => prev.map((item) => item.id === editingId ? { ...item, ...formData } : item));
    setFormData(emptyForm);
    setEditingId(null);
    setEditOpen(false);
  }, [editingId, formData]);

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  const openEdit = (item: Contract) => {
    setFormData({
      contractNo: item.contractNo, enterpriseName: item.enterpriseName, cropType: item.cropType,
      varieties: item.varieties, baseName: item.baseName, plots: item.plots,
      baseLocation: item.baseLocation, contractArea: item.contractArea,
      plannedInvestment: item.plannedInvestment, contractStartDate: item.contractStartDate,
      contractEndDate: item.contractEndDate, status: item.status, remark: item.remark,
    });
    setEditingId(item.id);
    setEditOpen(true);
  };

  const updateForm = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* 企业变更时重置基地、地块、面积、位置 */
  const handleEnterpriseChange = (enterpriseName: string) => {
    setFormData((prev) => ({
      ...prev, enterpriseName, baseName: "", plots: [], baseLocation: "", contractArea: "",
    }));
  };

  /* 基地变更时自动带出位置，面积由地块选择决定 */
  const handleBaseChange = (baseName: string) => {
    const base = (baseOptionsMap[formData.enterpriseName] || []).find((b) => b.name === baseName);
    setFormData((prev) => ({
      ...prev, baseName, baseLocation: base?.location || "", contractArea: "", plots: [],
    }));
  };

  /* 品种多选切换 */
  const handleVarietyToggle = (variety: string) => {
    setFormData((prev) => {
      const exists = prev.varieties.includes(variety);
      return { ...prev, varieties: exists ? prev.varieties.filter((v) => v !== variety) : [...prev.varieties, variety] };
    });
  };

  /* 地块多选切换，同时自动计算制种面积 */
  const handlePlotToggle = (plot: string) => {
    setFormData((prev) => {
      const exists = prev.plots.includes(plot);
      const newPlots = exists ? prev.plots.filter((p) => p !== plot) : [...prev.plots, plot];
      /* 根据选中的地块自动求和面积 */
      const base = (baseOptionsMap[prev.enterpriseName] || []).find((b) => b.name === prev.baseName);
      const total = newPlots.reduce((sum, plotName) => {
        const p = base?.plots.find((item) => item.name === plotName);
        return sum + (p?.area || 0);
      }, 0);
      return { ...prev, plots: newPlots, contractArea: total > 0 ? `${total}亩` : "" };
    });
  };

  /* 渲染品种/地块多选标签 */
  const renderMultiSelect = (
    options: string[],
    selected: string[],
    onToggle: (val: string) => void,
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-md border bg-background">
        {selected.length > 0 ? selected.map((s) => (
          <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => onToggle(s)}>
            {s}
            <span className="text-muted-foreground">&times;</span>
          </Badge>
        )) : <span className="text-sm text-muted-foreground">{placeholder}</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.filter((o) => !selected.includes(o)).map((o) => (
          <Badge key={o} variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => onToggle(o)}>
            + {o}
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">制种合同备案</h1>
          <p className="text-sm text-muted-foreground mt-1">管理制种合同信息、关联企业与地块</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />导出</Button>
          <Button size="sm" className="gap-1.5" onClick={() => { setFormData(emptyForm); setAddOpen(true); }}><Plus className="h-3.5 w-3.5" />新增合同</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索合同号、企业、作物种类、品种..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="合同状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="active">履行中</SelectItem><SelectItem value="expired">已到期</SelectItem><SelectItem value="terminated">已终止</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>合同编号</TableHead>
                <TableHead>制种企业</TableHead>
                <TableHead>作物种类</TableHead>
                <TableHead>品种</TableHead>
                <TableHead>关联基地</TableHead>
                <TableHead>面积</TableHead>
                <TableHead>计划投资(万元)</TableHead>
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
                  <TableCell className="font-mono text-sm">{item.contractNo}</TableCell>
                  <TableCell className="font-medium">{item.enterpriseName}</TableCell>
                  <TableCell>{item.cropType}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.varieties.map((v) => <Badge key={v} variant="outline" className="text-xs">{v}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.baseName}</TableCell>
                  <TableCell>{item.contractArea}</TableCell>
                  <TableCell>{item.plannedInvestment}</TableCell>
                  <TableCell><Badge variant={statusConfig[item.status].variant}>{statusConfig[item.status].label}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" />编辑</DropdownMenuItem>
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

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>新增制种合同备案</DialogTitle><DialogDescription>填写合同基本信息，选择企业后关联基地和地块</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>合同编号 *</Label><Input placeholder="HT-2024-XXX" value={formData.contractNo} onChange={(e) => updateForm("contractNo", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>制种企业 *</Label>
                <Select value={formData.enterpriseName} onValueChange={handleEnterpriseChange}>
                  <SelectTrigger><SelectValue placeholder="请选择制种企业" /></SelectTrigger>
                  <SelectContent>{enterpriseOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>作物种类 *</Label>
                <Select value={formData.cropType} onValueChange={(v) => { updateForm("cropType", v); updateForm("varieties", []); }}>
                  <SelectTrigger><SelectValue placeholder="请选择作物种类" /></SelectTrigger>
                  <SelectContent>{cropTypeOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>品种（多选）*</Label>
                {formData.cropType ? renderMultiSelect(availableVarieties, formData.varieties, handleVarietyToggle, "点击下方品种添加") : (
                  <p className="text-sm text-muted-foreground py-2">请先选择作物种类</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>关联基地</Label>
                <Select value={formData.baseName} onValueChange={handleBaseChange} disabled={!formData.enterpriseName}>
                  <SelectTrigger><SelectValue placeholder={formData.enterpriseName ? "请选择基地" : "请先选择企业"} /></SelectTrigger>
                  <SelectContent>{availableBases.map((b) => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>地块（多选）</Label>
                {formData.baseName ? renderMultiSelect(availablePlots.map((p) => p.name), formData.plots, handlePlotToggle, "点击下方地块添加") : (
                  <p className="text-sm text-muted-foreground py-2">请先选择基地</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>基地位置（自动带出）</Label><Input value={formData.baseLocation} readOnly className="bg-muted" placeholder="选择基地后自动带出" /></div>
              <div className="space-y-2"><Label>制种面积（根据地块自动计算）</Label><Input value={formData.contractArea} readOnly className="bg-muted" placeholder="选择地块后自动计算" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>计划投资（万元）</Label><Input type="number" placeholder="0" value={formData.plannedInvestment} onChange={(e) => updateForm("plannedInvestment", e.target.value)} /></div>
              <div className="space-y-2"><Label>合同开始日期 *</Label><Input type="date" value={formData.contractStartDate} onChange={(e) => updateForm("contractStartDate", e.target.value)} /></div>
              <div className="space-y-2"><Label>合同结束日期 *</Label><Input type="date" value={formData.contractEndDate} onChange={(e) => updateForm("contractEndDate", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Textarea rows={3} value={formData.remark} onChange={(e) => updateForm("remark", e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleAdd} disabled={!formData.contractNo || !formData.enterpriseName || !formData.cropType}>提交备案</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>编辑合同信息</DialogTitle><DialogDescription>修改制种合同备案信息</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>合同编号 *</Label><Input value={formData.contractNo} onChange={(e) => updateForm("contractNo", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>制种企业 *</Label>
                <Select value={formData.enterpriseName} onValueChange={handleEnterpriseChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{enterpriseOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>作物种类 *</Label>
                <Select value={formData.cropType} onValueChange={(v) => { updateForm("cropType", v); updateForm("varieties", []); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{cropTypeOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>品种（多选）</Label>
                {formData.cropType ? renderMultiSelect(availableVarieties, formData.varieties, handleVarietyToggle, "点击下方品种添加") : <p className="text-sm text-muted-foreground py-2">请先选择作物种类</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>关联基地</Label>
                <Select value={formData.baseName} onValueChange={handleBaseChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{availableBases.map((b) => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>地块（多选）</Label>
                {formData.baseName ? renderMultiSelect(availablePlots.map((p) => p.name), formData.plots, handlePlotToggle, "点击下方地块添加") : <p className="text-sm text-muted-foreground py-2">请先选择基地</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>基地位置（自动带出）</Label><Input value={formData.baseLocation} readOnly className="bg-muted" /></div>
              <div className="space-y-2"><Label>制种面积（根据地块自动计算）</Label><Input value={formData.contractArea} readOnly className="bg-muted" placeholder="选择地块后自动计算" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>计划投资（万元）</Label><Input type="number" value={formData.plannedInvestment} onChange={(e) => updateForm("plannedInvestment", e.target.value)} /></div>
              <div className="space-y-2"><Label>合同开始日期</Label><Input type="date" value={formData.contractStartDate} onChange={(e) => updateForm("contractStartDate", e.target.value)} /></div>
              <div className="space-y-2"><Label>合同结束日期</Label><Input type="date" value={formData.contractEndDate} onChange={(e) => updateForm("contractEndDate", e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>合同状态</Label>
              <Select value={formData.status} onValueChange={(v) => updateForm("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">履行中</SelectItem><SelectItem value="expired">已到期</SelectItem><SelectItem value="terminated">已终止</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>备注</Label><Textarea rows={3} value={formData.remark} onChange={(e) => updateForm("remark", e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button><Button onClick={handleEdit} disabled={!formData.contractNo}>保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader><DialogTitle>合同详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">合同编号</p><p className="font-mono">{viewingItem.contractNo}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">制种企业</p><p className="font-medium">{viewingItem.enterpriseName}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">作物种类</p><p>{viewingItem.cropType}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种</p>
                  <div className="flex flex-wrap gap-1">{viewingItem.varieties.map((v) => <Badge key={v} variant="outline" className="text-xs">{v}</Badge>)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">关联基地</p><p>{viewingItem.baseName}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">地块</p>
                  <div className="flex flex-wrap gap-1">{viewingItem.plots.map((p) => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">基地位置</p><p>{viewingItem.baseLocation}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">制种面积</p><p>{viewingItem.contractArea}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">计划投资</p><p>{viewingItem.plannedInvestment}万元</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">合同开始日期</p><p>{viewingItem.contractStartDate}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">合同结束日期</p><p>{viewingItem.contractEndDate}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">状态</p><Badge variant={statusConfig[viewingItem.status].variant}>{statusConfig[viewingItem.status].label}</Badge></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">创建日期</p><p>{viewingItem.createdAt}</p></div>
              </div>
              {viewingItem.remark && <div className="space-y-1"><p className="text-sm text-muted-foreground">备注</p><p>{viewingItem.remark}</p></div>}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除合同「{deletingItem?.contractNo}」吗？此操作不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
