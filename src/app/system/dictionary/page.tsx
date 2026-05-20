"use client";

import { useState, useCallback } from "react";
import { BookOpen, Search, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface DictItem {
  id: string;
  category: string;
  code: string;
  label: string;
  value: string;
  sort: number;
  remark: string;
  status: "active" | "disabled";
}

const initialData: DictItem[] = [
  { id: "1", category: "品种类型", code: "VARIETY_CORN", label: "玉米", value: "corn", sort: 1, remark: "玉米类品种", status: "active" },
  { id: "2", category: "品种类型", code: "VARIETY_RICE", label: "水稻", value: "rice", sort: 2, remark: "水稻类品种", status: "active" },
  { id: "3", category: "品种类型", code: "VARIETY_WHEAT", label: "小麦", value: "wheat", sort: 3, remark: "小麦类品种", status: "active" },
  { id: "4", category: "样品状态", code: "STATUS_PENDING", label: "待取样", value: "pending", sort: 1, remark: "", status: "active" },
  { id: "5", category: "样品状态", code: "STATUS_SAMPLED", label: "已取样", value: "sampled", sort: 2, remark: "", status: "active" },
  { id: "6", category: "样品状态", code: "STATUS_RECEIVED", label: "已接收", value: "received", sort: 3, remark: "", status: "active" },
  { id: "7", category: "样品状态", code: "STATUS_TESTING", label: "检测中", value: "testing", sort: 4, remark: "", status: "active" },
  { id: "8", category: "样品状态", code: "STATUS_DONE", label: "报告完成", value: "done", sort: 5, remark: "", status: "active" },
  { id: "9", category: "检测结果", code: "RESULT_NEG", label: "阴性(合格)", value: "negative", sort: 1, remark: "未检出转基因成分", status: "active" },
  { id: "10", category: "检测结果", code: "RESULT_POS", label: "阳性(不合格)", value: "positive", sort: 2, remark: "检出转基因成分", status: "active" },
  { id: "11", category: "抽检类型", code: "TYPE_PARENT", label: "亲本种子抽检", value: "parent", sort: 1, remark: "", status: "active" },
  { id: "12", category: "抽检类型", code: "TYPE_SOWING", label: "播种期抽检", value: "sowing", sort: 2, remark: "", status: "active" },
  { id: "13", category: "抽检类型", code: "TYPE_LEAF", label: "叶片期抽检", value: "leaf", sort: 3, remark: "", status: "active" },
  { id: "14", category: "乡镇", code: "TW_CLZ", label: "朝阳镇", value: "chaoyang", sort: 1, remark: "", status: "active" },
  { id: "15", category: "乡镇", code: "TW_HXZ", label: "河西镇", value: "hexi", sort: 2, remark: "", status: "active" },
  { id: "16", category: "乡镇", code: "TW_DSX", label: "东山乡", value: "dongshan", sort: 3, remark: "", status: "disabled" },
];

export default function DictionaryPage() {
  const [data, setData] = useState<DictItem[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DictItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<DictItem | null>(null);

  const [formCategory, setFormCategory] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formSort, setFormSort] = useState("1");
  const [formRemark, setFormRemark] = useState("");

  const resetForm = () => {
    setFormCategory(""); setFormCode(""); setFormLabel(""); setFormValue(""); setFormSort("1"); setFormRemark("");
  };

  const categories = Array.from(new Set(data.map((d) => d.category)));
  const filtered = data.filter((e) => {
    const matchesSearch = e.label.includes(searchTerm) || e.code.includes(searchTerm) || e.value.includes(searchTerm);
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = useCallback(() => {
    const newItem: DictItem = {
      id: Date.now().toString(),
      category: formCategory,
      code: formCode,
      label: formLabel,
      value: formValue,
      sort: parseInt(formSort) || 1,
      remark: formRemark,
      status: "active",
    };
    setData((prev) => [...prev, newItem]);
    resetForm();
    setAddOpen(false);
  }, [formCategory, formCode, formLabel, formValue, formSort, formRemark]);

  const handleEdit = useCallback(() => {
    if (!editingItem) return;
    setData((prev) => prev.map((item) => item.id === editingItem.id ? {
      ...item,
      category: formCategory,
      code: formCode,
      label: formLabel,
      value: formValue,
      sort: parseInt(formSort) || 1,
      remark: formRemark,
    } : item));
    resetForm();
    setEditingItem(null);
    setEditOpen(false);
  }, [editingItem, formCategory, formCode, formLabel, formValue, formSort, formRemark]);

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  const handleToggleStatus = useCallback((item: DictItem) => {
    setData((prev) => prev.map((i) => i.id === item.id ? { ...i, status: i.status === "active" ? "disabled" as const : "active" as const } : i));
  }, []);

  const openEdit = (item: DictItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormCode(item.code);
    setFormLabel(item.label);
    setFormValue(item.value);
    setFormSort(String(item.sort));
    setFormRemark(item.remark);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">数据字典</h1>
          <p className="text-sm text-muted-foreground mt-1">管理系统中的枚举值和基础数据配置</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />新增字典项</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>新增字典项</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>分类 *</Label><Input placeholder="如：品种类型" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} /></div>
                <div className="space-y-2"><Label>编码 *</Label><Input placeholder="如：VARIETY_CORN" value={formCode} onChange={(e) => setFormCode(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>显示名 *</Label><Input placeholder="如：玉米" value={formLabel} onChange={(e) => setFormLabel(e.target.value)} /></div>
                <div className="space-y-2"><Label>值 *</Label><Input placeholder="如：corn" value={formValue} onChange={(e) => setFormValue(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>排序</Label><Input type="number" value={formSort} onChange={(e) => setFormSort(e.target.value)} /></div>
                <div className="space-y-2"><Label>备注</Label><Input placeholder="选填" value={formRemark} onChange={(e) => setFormRemark(e.target.value)} /></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleAdd} disabled={!formCategory || !formCode || !formLabel || !formValue}>确认新增</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><BookOpen className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">字典总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><BookOpen className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">分类数</p><p className="text-lg font-semibold">{categories.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><BookOpen className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">已禁用</p><p className="text-lg font-semibold">{data.filter((e) => e.status === "disabled").length}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索名称、编码、值..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="分类" /></SelectTrigger><SelectContent><SelectItem value="all">全部分类</SelectItem>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>编码</TableHead>
                <TableHead>显示名</TableHead>
                <TableHead>值</TableHead>
                <TableHead className="w-16">排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>备注</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{item.code}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell className="font-mono text-xs">{item.value}</TableCell>
                  <TableCell>{item.sort}</TableCell>
                  <TableCell><Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status === "active" ? "启用" : "禁用"}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">{item.remark || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" />编辑</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => handleToggleStatus(item)}>{item.status === "active" ? "禁用" : "启用"}</DropdownMenuItem>
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

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingItem(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>编辑字典项</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>分类 *</Label><Input value={formCategory} onChange={(e) => setFormCategory(e.target.value)} /></div>
              <div className="space-y-2"><Label>编码 *</Label><Input value={formCode} onChange={(e) => setFormCode(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>显示名 *</Label><Input value={formLabel} onChange={(e) => setFormLabel(e.target.value)} /></div>
              <div className="space-y-2"><Label>值 *</Label><Input value={formValue} onChange={(e) => setFormValue(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>排序</Label><Input type="number" value={formSort} onChange={(e) => setFormSort(e.target.value)} /></div>
              <div className="space-y-2"><Label>备注</Label><Input value={formRemark} onChange={(e) => setFormRemark(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button><Button onClick={handleEdit} disabled={!formCategory || !formCode || !formLabel || !formValue}>保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除字典项「{deletingItem?.label}」吗？关联的业务数据可能受影响，此操作不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
