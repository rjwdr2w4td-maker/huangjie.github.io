"use client";

import { useState, useCallback } from "react";
import { Smartphone, Plus, Pencil, Trash2, MoreHorizontal, Upload } from "lucide-react";
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

interface AppVersion {
  id: string;
  version: string;
  platform: "android" | "ios";
  buildNumber: number;
  updateType: "强制更新" | "推荐更新" | "静默更新";
  changelog: string;
  downloadUrl: string;
  status: "published" | "draft";
  publishedAt: string;
  createdAt: string;
}

const initialData: AppVersion[] = [
  { id: "1", version: "2.3.0", platform: "android", buildNumber: 230, updateType: "推荐更新", changelog: "1. 新增叶片期抽检任务导航功能\n2. 优化拍照水印精度\n3. 修复离线数据同步偶发失败问题", downloadUrl: "https://example.com/app/seed-monitor-2.3.0.apk", status: "published", publishedAt: "2024-06-10", createdAt: "2024-06-08" },
  { id: "2", version: "2.3.0", platform: "ios", buildNumber: 230, updateType: "推荐更新", changelog: "1. 新增叶片期抽检任务导航功能\n2. 优化拍照水印精度", downloadUrl: "https://apps.apple.com/app/seed-monitor", status: "published", publishedAt: "2024-06-10", createdAt: "2024-06-08" },
  { id: "3", version: "2.2.1", platform: "android", buildNumber: 221, updateType: "强制更新", changelog: "1. 修复扦样单提交数据丢失问题\n2. 安全补丁更新", downloadUrl: "https://example.com/app/seed-monitor-2.2.1.apk", status: "published", publishedAt: "2024-05-20", createdAt: "2024-05-18" },
  { id: "4", version: "2.4.0", platform: "android", buildNumber: 240, updateType: "推荐更新", changelog: "1. 新增样品条码扫码接收功能\n2. 优化地图加载速度", downloadUrl: "", status: "draft", publishedAt: "-", createdAt: "2024-06-14" },
];

const typeConfig = {
  "强制更新": { variant: "destructive" as const },
  "推荐更新": { variant: "default" as const },
  "静默更新": { variant: "secondary" as const },
};

export default function AppVersionPage() {
  const [data, setData] = useState<AppVersion[]>(initialData);
  const [platformFilter, setPlatformFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppVersion | null>(null);
  const [deletingItem, setDeletingItem] = useState<AppVersion | null>(null);

  const [formVersion, setFormVersion] = useState("");
  const [formPlatform, setFormPlatform] = useState<AppVersion["platform"]>("android");
  const [formBuildNumber, setFormBuildNumber] = useState("");
  const [formUpdateType, setFormUpdateType] = useState<AppVersion["updateType"]>("推荐更新");
  const [formChangelog, setFormChangelog] = useState("");
  const [formDownloadUrl, setFormDownloadUrl] = useState("");

  const resetForm = () => {
    setFormVersion(""); setFormPlatform("android"); setFormBuildNumber(""); setFormUpdateType("推荐更新"); setFormChangelog(""); setFormDownloadUrl("");
  };

  const filtered = data.filter((e) => platformFilter === "all" || e.platform === platformFilter);

  const handleAdd = useCallback(() => {
    const newItem: AppVersion = {
      id: Date.now().toString(),
      version: formVersion,
      platform: formPlatform,
      buildNumber: parseInt(formBuildNumber) || 0,
      updateType: formUpdateType,
      changelog: formChangelog,
      downloadUrl: formDownloadUrl,
      status: "draft",
      publishedAt: "-",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setData((prev) => [newItem, ...prev]);
    resetForm();
    setAddOpen(false);
  }, [formVersion, formPlatform, formBuildNumber, formUpdateType, formChangelog, formDownloadUrl]);

  const handleEdit = useCallback(() => {
    if (!editingItem) return;
    setData((prev) => prev.map((item) => item.id === editingItem.id ? {
      ...item,
      version: formVersion,
      platform: formPlatform,
      buildNumber: parseInt(formBuildNumber) || 0,
      updateType: formUpdateType,
      changelog: formChangelog,
      downloadUrl: formDownloadUrl,
    } : item));
    resetForm();
    setEditingItem(null);
    setEditOpen(false);
  }, [editingItem, formVersion, formPlatform, formBuildNumber, formUpdateType, formChangelog, formDownloadUrl]);

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  const handlePublish = useCallback((item: AppVersion) => {
    setData((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "published" as const, publishedAt: new Date().toISOString().split("T")[0] } : i));
  }, []);

  const openEdit = (item: AppVersion) => {
    setEditingItem(item);
    setFormVersion(item.version);
    setFormPlatform(item.platform);
    setFormBuildNumber(String(item.buildNumber));
    setFormUpdateType(item.updateType);
    setFormChangelog(item.changelog);
    setFormDownloadUrl(item.downloadUrl);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">APP版本管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理移动端APP版本发布与更新策略</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />新增版本</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader><DialogTitle>新增版本</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>版本号 *</Label><Input placeholder="如：2.4.0" value={formVersion} onChange={(e) => setFormVersion(e.target.value)} /></div>
                <div className="space-y-2"><Label>平台 *</Label><Select value={formPlatform} onValueChange={(v) => setFormPlatform(v as AppVersion["platform"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="android">Android</SelectItem><SelectItem value="ios">iOS</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>构建号 *</Label><Input type="number" placeholder="240" value={formBuildNumber} onChange={(e) => setFormBuildNumber(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>更新类型 *</Label><Select value={formUpdateType} onValueChange={(v) => setFormUpdateType(v as AppVersion["updateType"])}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="强制更新">强制更新</SelectItem><SelectItem value="推荐更新">推荐更新</SelectItem><SelectItem value="静默更新">静默更新</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>更新日志 *</Label><Textarea placeholder="1. 新增功能xxx&#10;2. 修复bug xxx" rows={4} value={formChangelog} onChange={(e) => setFormChangelog(e.target.value)} /></div>
              <div className="space-y-2"><Label>下载地址</Label><Input placeholder="APK下载链接" value={formDownloadUrl} onChange={(e) => setFormDownloadUrl(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleAdd} disabled={!formVersion || !formBuildNumber || !formChangelog}>确认新增</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><Smartphone className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">版本总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><Upload className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">已发布</p><p className="text-lg font-semibold">{data.filter((e) => e.status === "published").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><Smartphone className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">草稿</p><p className="text-lg font-semibold">{data.filter((e) => e.status === "draft").length}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <Select value={platformFilter} onValueChange={setPlatformFilter}><SelectTrigger className="w-40"><SelectValue placeholder="平台" /></SelectTrigger><SelectContent><SelectItem value="all">全部平台</SelectItem><SelectItem value="android">Android</SelectItem><SelectItem value="ios">iOS</SelectItem></SelectContent></Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>版本号</TableHead>
                <TableHead>平台</TableHead>
                <TableHead>构建号</TableHead>
                <TableHead>更新类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>发布日期</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono font-medium">{item.version}</TableCell>
                  <TableCell><Badge variant="outline">{item.platform === "android" ? "Android" : "iOS"}</Badge></TableCell>
                  <TableCell>{item.buildNumber}</TableCell>
                  <TableCell><Badge variant={typeConfig[item.updateType].variant}>{item.updateType}</Badge></TableCell>
                  <TableCell><Badge variant={item.status === "published" ? "default" : "secondary"}>{item.status === "published" ? "已发布" : "草稿"}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.publishedAt}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" />编辑</DropdownMenuItem>
                        {item.status === "draft" && <DropdownMenuItem className="gap-2" onClick={() => handlePublish(item)}><Upload className="h-4 w-4" />发布</DropdownMenuItem>}
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
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>编辑版本</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>版本号 *</Label><Input value={formVersion} onChange={(e) => setFormVersion(e.target.value)} /></div>
              <div className="space-y-2"><Label>平台</Label><Select value={formPlatform} onValueChange={(v) => setFormPlatform(v as AppVersion["platform"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="android">Android</SelectItem><SelectItem value="ios">iOS</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>构建号</Label><Input type="number" value={formBuildNumber} onChange={(e) => setFormBuildNumber(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>更新类型</Label><Select value={formUpdateType} onValueChange={(v) => setFormUpdateType(v as AppVersion["updateType"])}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="强制更新">强制更新</SelectItem><SelectItem value="推荐更新">推荐更新</SelectItem><SelectItem value="静默更新">静默更新</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>更新日志</Label><Textarea rows={4} value={formChangelog} onChange={(e) => setFormChangelog(e.target.value)} /></div>
            <div className="space-y-2"><Label>下载地址</Label><Input value={formDownloadUrl} onChange={(e) => setFormDownloadUrl(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button><Button onClick={handleEdit} disabled={!formVersion}>保存修改</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除版本 {deletingItem?.version} ({deletingItem?.platform === "android" ? "Android" : "iOS"}) 吗？此操作不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
