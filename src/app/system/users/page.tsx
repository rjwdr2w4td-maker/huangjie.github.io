"use client";

import { useState, useCallback } from "react";
import { Users, Search, Eye, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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

interface SysUser {
  id: string;
  username: string;
  realName: string;
  role: "县级管理员" | "乡镇管理人员" | "检验室人员" | "制种企业" | "系统管理员";
  township: string;
  phone: string;
  status: "active" | "disabled";
  lastLogin: string;
  createdAt: string;
}

const initialData: SysUser[] = [
  { id: "1", username: "admin", realName: "系统管理员", role: "系统管理员", township: "-", phone: "13800000001", status: "active", lastLogin: "2024-06-15 09:00", createdAt: "2024-01-01" },
  { id: "2", username: "liu_mg", realName: "刘管理", role: "县级管理员", township: "县农业农村局", phone: "13800000002", status: "active", lastLogin: "2024-06-14 16:30", createdAt: "2024-01-05" },
  { id: "3", username: "chen_jc", realName: "陈检测", role: "乡镇管理人员", township: "柳林镇", phone: "13800000003", status: "active", lastLogin: "2024-06-13 11:00", createdAt: "2024-01-10" },
  { id: "4", username: "zhang_jy", realName: "张检验", role: "检验室人员", township: "-", phone: "13800000004", status: "active", lastLogin: "2024-06-12 14:20", createdAt: "2024-02-01" },
  { id: "5", username: "wang_qy", realName: "王经理", role: "制种企业", township: "-", phone: "13800000005", status: "active", lastLogin: "2024-05-20 10:00", createdAt: "2024-02-15" },
  { id: "6", username: "li_mg", realName: "李管理", role: "乡镇管理人员", township: "城关镇", phone: "13800000006", status: "disabled", lastLogin: "2024-03-01 08:30", createdAt: "2024-01-12" },
];

const roleConfig = {
  "县级管理员": { label: "县级管理员", variant: "default" as const },
  "乡镇管理人员": { label: "乡镇管理人员", variant: "secondary" as const },
  "检验室人员": { label: "检验室人员", variant: "outline" as const },
  "制种企业": { label: "制种企业", variant: "outline" as const },
  "系统管理员": { label: "系统管理员", variant: "default" as const },
};

export default function UsersPage() {
  const [data, setData] = useState<SysUser[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<SysUser | null>(null);
  const [editingItem, setEditingItem] = useState<SysUser | null>(null);
  const [deletingItem, setDeletingItem] = useState<SysUser | null>(null);

  const [formUsername, setFormUsername] = useState("");
  const [formRealName, setFormRealName] = useState("");
  const [formRole, setFormRole] = useState<SysUser["role"]>("乡镇管理人员");
  const [formTownship, setFormTownship] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const resetForm = () => {
    setFormUsername(""); setFormRealName(""); setFormRole("乡镇管理人员"); setFormTownship(""); setFormPhone("");
  };

  const filtered = data.filter((e) => {
    const matchesSearch = e.username.includes(searchTerm) || e.realName.includes(searchTerm) || e.phone.includes(searchTerm);
    const matchesRole = roleFilter === "all" || e.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAdd = useCallback(() => {
    const newItem: SysUser = {
      id: Date.now().toString(),
      username: formUsername,
      realName: formRealName,
      role: formRole,
      township: formTownship || "-",
      phone: formPhone,
      status: "active",
      lastLogin: "-",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setData((prev) => [newItem, ...prev]);
    resetForm();
    setAddOpen(false);
  }, [formUsername, formRealName, formRole, formTownship, formPhone]);

  const handleEdit = useCallback(() => {
    if (!editingItem) return;
    setData((prev) => prev.map((item) => item.id === editingItem.id ? {
      ...item,
      realName: formRealName,
      role: formRole,
      township: formTownship || "-",
      phone: formPhone,
    } : item));
    resetForm();
    setEditingItem(null);
    setEditOpen(false);
  }, [editingItem, formRealName, formRole, formTownship, formPhone]);

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  const handleToggleStatus = useCallback((item: SysUser) => {
    setData((prev) => prev.map((i) => i.id === item.id ? { ...i, status: i.status === "active" ? "disabled" as const : "active" as const } : i));
  }, []);

  const openEdit = (item: SysUser) => {
    setEditingItem(item);
    setFormUsername(item.username);
    setFormRealName(item.realName);
    setFormRole(item.role);
    setFormTownship(item.township === "-" ? "" : item.township);
    setFormPhone(item.phone);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">用户权限管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理系统用户账号、角色权限分配</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />新增用户</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>新增用户</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>用户名 *</Label><Input placeholder="登录账号" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} /></div>
                <div className="space-y-2"><Label>姓名 *</Label><Input placeholder="真实姓名" value={formRealName} onChange={(e) => setFormRealName(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>角色 *</Label><Select value={formRole} onValueChange={(v) => setFormRole(v as SysUser["role"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="县级管理员">县级管理员</SelectItem><SelectItem value="乡镇管理人员">乡镇管理人员</SelectItem><SelectItem value="检验室人员">检验室人员</SelectItem><SelectItem value="制种企业">制种企业</SelectItem><SelectItem value="系统管理员">系统管理员</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>所属乡镇/单位</Label><Input placeholder="如：柳林镇" value={formTownship} onChange={(e) => setFormTownship(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>联系电话</Label><Input placeholder="手机号" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleAdd} disabled={!formUsername || !formRealName}>确认新增</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><Users className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">用户总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><Users className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">活跃用户</p><p className="text-lg font-semibold">{data.filter((e) => e.status === "active").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><Users className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">已禁用</p><p className="text-lg font-semibold">{data.filter((e) => e.status === "disabled").length}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索用户名、姓名、手机号..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="角色" /></SelectTrigger><SelectContent><SelectItem value="all">全部角色</SelectItem><SelectItem value="县级管理员">县级管理员</SelectItem><SelectItem value="乡镇管理人员">乡镇管理人员</SelectItem><SelectItem value="检验室人员">检验室人员</SelectItem><SelectItem value="制种企业">制种企业</SelectItem><SelectItem value="系统管理员">系统管理员</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>所属单位</TableHead>
                <TableHead>联系电话</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{item.username}</TableCell>
                  <TableCell>{item.realName}</TableCell>
                  <TableCell><Badge variant={roleConfig[item.role].variant}>{item.role}</Badge></TableCell>
                  <TableCell>{item.township}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell><Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status === "active" ? "活跃" : "禁用"}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
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

      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>用户详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">用户名</p><p className="font-mono">{viewingItem.username}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">姓名</p><p>{viewingItem.realName}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">角色</p><Badge variant={roleConfig[viewingItem.role].variant}>{viewingItem.role}</Badge></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">状态</p><Badge variant={viewingItem.status === "active" ? "default" : "secondary"}>{viewingItem.status === "active" ? "活跃" : "禁用"}</Badge></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">所属单位</p><p>{viewingItem.township}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">联系电话</p><p>{viewingItem.phone}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">创建日期</p><p>{viewingItem.createdAt}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">最后登录</p><p>{viewingItem.lastLogin}</p></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingItem(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>编辑用户</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>姓名 *</Label><Input value={formRealName} onChange={(e) => setFormRealName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>角色 *</Label><Select value={formRole} onValueChange={(v) => setFormRole(v as SysUser["role"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="县级管理员">县级管理员</SelectItem><SelectItem value="乡镇管理人员">乡镇管理人员</SelectItem><SelectItem value="检验室人员">检验室人员</SelectItem><SelectItem value="制种企业">制种企业</SelectItem><SelectItem value="系统管理员">系统管理员</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>所属乡镇/单位</Label><Input value={formTownship} onChange={(e) => setFormTownship(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>联系电话</Label><Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button><Button onClick={handleEdit} disabled={!formRealName}>保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除用户「{deletingItem?.realName}」吗？此操作不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
