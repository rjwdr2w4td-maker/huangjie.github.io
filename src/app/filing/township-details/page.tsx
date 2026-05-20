"use client";

import { useState, useCallback } from "react";
import {
  ClipboardList, Search, Plus, MoreHorizontal, Eye, Pencil, Trash2, Download, Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TownshipDetail {
  id: string;
  township: string;
  serialNo: number;
  company: string;
  fieldName: string;
  area: string;
  cropType: string;
  variety: string;
  submitter: string;
  remark: string;
  createdAt: string;
}

const townshipOptions = ["城关镇", "柳林镇", "大河镇", "沙河镇", "双河镇", "青山镇", "白水镇"];
const currentTownship = "城关镇";
const currentUser = "李明";

/* 制种公司 → 地块 → 作物 → 品种 映射 */
const companyData: Record<string, {
  plots: { name: string; area: string }[];
  crops: Record<string, string[]>;
}> = {
  "丰源种业有限公司": {
    plots: [
      { name: "A-001地块", area: "15亩" },
      { name: "A-002地块", area: "20亩" },
      { name: "A-005地块", area: "18亩" },
      { name: "A-008地块", area: "12亩" },
    ],
    crops: { "水稻": ["杂交水稻Y两优900", "杂交水稻C两优343", "水稻赣晚籼30号"], "油菜": ["油料作物种子", "油菜华油杂62"] },
  },
  "绿丰农业科技有限公司": {
    plots: [
      { name: "B-003地块", area: "12亩" },
      { name: "B-005地块", area: "16亩" },
    ],
    crops: { "小麦": ["小麦郑麦9023", "小麦百农207"], "玉米": ["玉米郑单958"] },
  },
  "金穗种业股份有限公司": {
    plots: [
      { name: "C-001地块", area: "30亩" },
      { name: "C-003地块", area: "22亩" },
      { name: "C-006地块", area: "10亩" },
    ],
    crops: { "玉米": ["玉米郑单958", "玉米先玉335"], "棉花": ["棉花鲁棉研28"] },
  },
  "华农种苗有限公司": {
    plots: [
      { name: "D-002地块", area: "8亩" },
      { name: "D-004地块", area: "14亩" },
    ],
    crops: { "蔬菜": ["蔬菜种子", "辣椒种子"], "水稻": ["杂交水稻Y两优900"] },
  },
  "农兴种业科技有限公司": {
    plots: [
      { name: "E-001地块", area: "25亩" },
      { name: "E-003地块", area: "9亩" },
    ],
    crops: { "棉花": ["棉花鲁棉研28", "棉花中棉所41"], "油菜": ["油料作物种子"] },
  },
  "穗丰农业发展有限公司": {
    plots: [
      { name: "F-002地块", area: "11亩" },
      { name: "F-005地块", area: "17亩" },
    ],
    crops: { "油菜": ["油料作物种子", "油菜华油杂62"], "小麦": ["小麦郑麦9023"] },
  },
};
const companyOptions = Object.keys(companyData);

const initialData: TownshipDetail[] = [
  { id: "1", township: "城关镇", serialNo: 1, company: "丰源种业有限公司", fieldName: "A-001地块", area: "15亩", cropType: "水稻", variety: "杂交水稻Y两优900", submitter: "李明", remark: "", createdAt: "2024-03-01" },
  { id: "2", township: "城关镇", serialNo: 2, company: "丰源种业有限公司", fieldName: "A-002地块", area: "20亩", cropType: "水稻", variety: "杂交水稻Y两优900", submitter: "李明", remark: "", createdAt: "2024-03-01" },
  { id: "3", township: "柳林镇", serialNo: 1, company: "绿丰农业科技有限公司", fieldName: "B-003地块", area: "12亩", cropType: "小麦", variety: "小麦郑麦9023", submitter: "王强", remark: "", createdAt: "2024-03-05" },
  { id: "4", township: "大河镇", serialNo: 1, company: "金穗种业股份有限公司", fieldName: "C-001地块", area: "30亩", cropType: "玉米", variety: "玉米郑单958", submitter: "张伟", remark: "", createdAt: "2024-03-10" },
  { id: "5", township: "沙河镇", serialNo: 1, company: "华农种苗有限公司", fieldName: "D-002地块", area: "8亩", cropType: "蔬菜", variety: "蔬菜种子", submitter: "赵刚", remark: "", createdAt: "2024-03-12" },
  { id: "6", township: "双河镇", serialNo: 1, company: "农兴种业科技有限公司", fieldName: "E-001地块", area: "25亩", cropType: "棉花", variety: "棉花鲁棉研28", submitter: "刘洋", remark: "", createdAt: "2024-03-15" },
  { id: "7", township: "城关镇", serialNo: 3, company: "穗丰农业发展有限公司", fieldName: "F-002地块", area: "11亩", cropType: "油菜", variety: "油料作物种子", submitter: "李明", remark: "", createdAt: "2024-03-18" },
  { id: "8", township: "大河镇", serialNo: 2, company: "金穗种业股份有限公司", fieldName: "C-003地块", area: "22亩", cropType: "玉米", variety: "玉米郑单958", submitter: "张伟", remark: "", createdAt: "2024-03-20" },
];

type FormData = Omit<TownshipDetail, "id" | "createdAt">;
const emptyForm: FormData = {
  township: currentTownship, serialNo: 1, company: "", fieldName: "", area: "", cropType: "", variety: "", submitter: currentUser, remark: "",
};

export default function TownshipDetailsPage() {
  const [data, setData] = useState<TownshipDetail[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [townshipFilter, setTownshipFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<TownshipDetail | null>(null);
  const [deletingItem, setDeletingItem] = useState<TownshipDetail | null>(null);

  const today = () => new Date().toISOString().split("T")[0];
  const townships = [...new Set(data.map((d) => d.township))];

  /* 级联数据 */
  const availablePlots = formData.company ? (companyData[formData.company]?.plots || []) : [];
  const availableCropTypes = formData.company ? Object.keys(companyData[formData.company]?.crops || {}) : [];
  const availableVarieties = (formData.company && formData.cropType) ? (companyData[formData.company]?.crops[formData.cropType] || []) : [];

  const filtered = data.filter((e) => {
    const matchesSearch = (e.fieldName || "").includes(searchTerm) || (e.company || "").includes(searchTerm) || (e.variety || "").includes(searchTerm) || (e.cropType || "").includes(searchTerm) || (e.submitter || "").includes(searchTerm);
    const matchesTownship = townshipFilter === "all" || e.township === townshipFilter;
    return matchesSearch && matchesTownship;
  });

  const handleAdd = useCallback(() => {
    if (!formData.township || !formData.company || !formData.fieldName) return;
    setData((prev) => [{ ...formData, id: Date.now().toString(), createdAt: today() }, ...prev]);
    setFormData(emptyForm);
    setAddOpen(false);
  }, [formData]);

  const handleEdit = useCallback(() => {
    if (!editingId || !formData.company || !formData.fieldName) return;
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

  const openEdit = (item: TownshipDetail) => {
    setFormData({ township: item.township, serialNo: item.serialNo, company: item.company, fieldName: item.fieldName, area: item.area, cropType: item.cropType, variety: item.variety, submitter: item.submitter, remark: item.remark });
    setEditingId(item.id);
    setEditOpen(true);
  };

  const updateForm = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      /* 制种公司变化 → 重置地块、面积、作物、品种 */
      if (field === "company") {
        next.fieldName = "";
        next.area = "";
        next.cropType = "";
        next.variety = "";
      }
      /* 地块变化 → 自动带出面积 */
      if (field === "fieldName") {
        const companyPlots = companyData[prev.company || ""]?.plots || [];
        const selected = companyPlots.find((p) => p.name === value);
        next.area = selected ? selected.area : "";
      }
      /* 作物变化 → 重置品种 */
      if (field === "cropType") {
        next.variety = "";
      }
      return next;
    });
  };

  const totalArea = data.reduce((sum, d) => sum + parseFloat(d.area) || 0, 0);

  /* 表单组件 */
  const renderForm = (mode: "add" | "edit") => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>乡镇 *</Label>
          <Select value={formData.township} onValueChange={(v) => updateForm("township", v)}>
            <SelectTrigger><SelectValue placeholder="选择乡镇" /></SelectTrigger>
            <SelectContent>
              {townshipOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">默认当前用户所属乡镇</p>
        </div>
        <div className="space-y-2"><Label>序号</Label><Input type="number" min={1} value={formData.serialNo} onChange={(e) => updateForm("serialNo", parseInt(e.target.value) || 1)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>制种公司 *</Label>
          <Select value={formData.company} onValueChange={(v) => updateForm("company", v)}>
            <SelectTrigger><SelectValue placeholder="选择制种公司" /></SelectTrigger>
            <SelectContent>
              {companyOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>地块名称 *</Label>
          <Select value={formData.fieldName} onValueChange={(v) => updateForm("fieldName", v)} disabled={!formData.company}>
            <SelectTrigger><SelectValue placeholder={formData.company ? "选择地块" : "请先选择制种公司"} /></SelectTrigger>
            <SelectContent>
              {availablePlots.map((p) => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>面积</Label>
          <Input value={formData.area} readOnly className="bg-muted" placeholder="选择地块后自动带出" />
        </div>
        <div className="space-y-2">
          <Label>作物种类</Label>
          <Select value={formData.cropType} onValueChange={(v) => updateForm("cropType", v)} disabled={!formData.company}>
            <SelectTrigger><SelectValue placeholder={formData.company ? "选择作物种类" : "请先选择制种公司"} /></SelectTrigger>
            <SelectContent>
              {availableCropTypes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>品种</Label>
          <Select value={formData.variety} onValueChange={(v) => updateForm("variety", v)} disabled={!formData.cropType}>
            <SelectTrigger><SelectValue placeholder={formData.cropType ? "选择品种" : "请先选择作物种类"} /></SelectTrigger>
            <SelectContent>
              {availableVarieties.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>提交人</Label>
          <Input value={formData.submitter} readOnly className="bg-muted" />
          <p className="text-xs text-muted-foreground">默认当前登录用户</p>
        </div>
      </div>
      <div className="space-y-2"><Label>备注</Label><Textarea rows={3} value={formData.remark} onChange={(e) => updateForm("remark", e.target.value)} /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">乡镇制种明细表管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理乡镇上报的制种明细数据，支持批量导入与县级汇总</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><Upload className="h-3.5 w-3.5" />批量导入</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />导出</Button>
          <Button size="sm" className="gap-1.5" onClick={() => { setFormData({ ...emptyForm, township: currentTownship, submitter: currentUser }); setAddOpen(true); }}><Plus className="h-3.5 w-3.5" />新增明细</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><ClipboardList className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">明细总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><ClipboardList className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">涉及乡镇</p><p className="text-lg font-semibold">{townships.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><ClipboardList className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">总面积</p><p className="text-lg font-semibold">{totalArea.toFixed(0)}亩</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索地块、公司、品种、提交人..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={townshipFilter} onValueChange={setTownshipFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="选择乡镇" /></SelectTrigger><SelectContent><SelectItem value="all">全部乡镇</SelectItem>{townships.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>乡镇</TableHead>
                <TableHead>制种公司</TableHead>
                <TableHead>地块名称</TableHead>
                <TableHead>面积</TableHead>
                <TableHead>作物种类</TableHead>
                <TableHead>品种</TableHead>
                <TableHead>提交人</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>{item.township}</TableCell>
                  <TableCell>{item.company}</TableCell>
                  <TableCell className="font-medium">{item.fieldName}</TableCell>
                  <TableCell>{item.area}</TableCell>
                  <TableCell>{item.cropType}</TableCell>
                  <TableCell>{item.variety}</TableCell>
                  <TableCell>{item.submitter}</TableCell>
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

      {/* Add */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader><DialogTitle>新增制种明细</DialogTitle><DialogDescription>填写乡镇制种明细信息</DialogDescription></DialogHeader>
          {renderForm("add")}
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleAdd} disabled={!formData.township || !formData.company || !formData.fieldName}>提交</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader><DialogTitle>编辑制种明细</DialogTitle></DialogHeader>
          {renderForm("edit")}
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button><Button onClick={handleEdit} disabled={!formData.company || !formData.fieldName}>保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader><DialogTitle>明细详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">乡镇</p><p className="font-medium">{viewingItem.township}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">序号</p><p>{viewingItem.serialNo}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">制种公司</p><p className="font-medium">{viewingItem.company}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">地块名称</p><p className="font-medium">{viewingItem.fieldName}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">面积</p><p>{viewingItem.area}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">作物种类</p><p>{viewingItem.cropType}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种</p><p>{viewingItem.variety}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">提交人</p><p>{viewingItem.submitter}</p></div>
              </div>
              {viewingItem.remark && <div className="space-y-1"><p className="text-sm text-muted-foreground">备注</p><p>{viewingItem.remark}</p></div>}
              <div className="space-y-1"><p className="text-sm text-muted-foreground">填报日期</p><p>{viewingItem.createdAt}</p></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定删除该条制种明细吗？此操作不可撤销。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
