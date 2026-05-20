"use client";

import { useState, useCallback, useRef } from "react";
import {
  ClipboardCheck, Search, Eye, MoreHorizontal, Trash2, Printer,
  Truck, UserCheck, Camera, Clock, Image as ImageIcon,
  Leaf, CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type DeliveryStatus = "pending_sample" | "ready_to_send" | "sent";
type SamplingMethod = "diagonal" | "zigzag";

interface LeafSample {
  id: string;
  relatedTaskNo: string;
  enterpriseName: string;
  cropType: string;
  varietyName: string;
  plotLocation: string;
  township: string;
  samplingMethod: SamplingMethod;
  specificLocation: string;
  sampler: string;
  deadline: string;
  sampleQuantity: string;
  deliveryStatus: DeliveryStatus;
  // 取样信息
  samplingPhoto: string;
  samplingTime: string;
  maleLeafCount: string;
  femaleLeafCount: string;
  // 送样信息
  deliveryPhoto: string;
  deliveryTime: string;
  remark: string;
  createdAt: string;
}

const samplingMethodConfig: Record<SamplingMethod, { label: string }> = {
  diagonal: { label: "对角线法" },
  zigzag: { label: "Z字法" },
};

const deliveryStatusConfig: Record<DeliveryStatus, { label: string; variant: "outline" | "secondary" | "default"; color: string }> = {
  pending_sample: { label: "待取样", variant: "outline", color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  ready_to_send: { label: "待送样", variant: "secondary", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  sent: { label: "已送样", variant: "default", color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
};

const samplerList = ["李明", "王强", "张伟", "赵刚", "陈超", "刘军"];

const initialData: LeafSample[] = [
  { id: "1", relatedTaskNo: "YC2024001", enterpriseName: "金源种业", cropType: "水稻", varietyName: "杂交水稻Y两优900", plotLocation: "城关镇A-01地块", township: "城关镇", samplingMethod: "diagonal", specificLocation: "城关镇A-01地块东侧", sampler: "李明", deadline: "2024-07-15", sampleQuantity: "1.5kg", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", maleLeafCount: "", femaleLeafCount: "", deliveryPhoto: "", deliveryTime: "", remark: "", createdAt: "2024-07-01" },
  { id: "2", relatedTaskNo: "YC2024001", enterpriseName: "金源种业", cropType: "水稻", varietyName: "杂交水稻Y两优900", plotLocation: "城关镇A-03地块", township: "城关镇", samplingMethod: "zigzag", specificLocation: "城关镇A-03地块南侧", sampler: "李明", deadline: "2024-07-15", sampleQuantity: "1.8kg", deliveryStatus: "ready_to_send", samplingPhoto: "photo_s2.jpg", samplingTime: "2024-07-10 09:30", maleLeafCount: "30", femaleLeafCount: "25", deliveryPhoto: "", deliveryTime: "", remark: "", createdAt: "2024-07-01" },
  { id: "3", relatedTaskNo: "YC2024001", enterpriseName: "丰乐种业", cropType: "水稻", varietyName: "C两优华占", plotLocation: "白泥镇B-02地块", township: "白泥镇", samplingMethod: "diagonal", specificLocation: "白泥镇B-02地块西北角", sampler: "王强", deadline: "2024-07-20", sampleQuantity: "2.0kg", deliveryStatus: "sent", samplingPhoto: "photo_s3.jpg", samplingTime: "2024-07-12 14:00", maleLeafCount: "35", femaleLeafCount: "28", deliveryPhoto: "photo_d3.jpg", deliveryTime: "2024-07-13 10:00", remark: "", createdAt: "2024-07-01" },
  { id: "4", relatedTaskNo: "YC2024002", enterpriseName: "隆平高科", cropType: "水稻", varietyName: "隆两优534", plotLocation: "大乌江镇C-01地块", township: "大乌江镇", samplingMethod: "zigzag", specificLocation: "大乌江镇C-01地块北侧", sampler: "张伟", deadline: "2024-07-25", sampleQuantity: "1.5kg", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", maleLeafCount: "", femaleLeafCount: "", deliveryPhoto: "", deliveryTime: "", remark: "", createdAt: "2024-07-05" },
  { id: "5", relatedTaskNo: "YC2024002", enterpriseName: "荃银高科", cropType: "水稻", varietyName: "荃优丝苗", plotLocation: "龙溪镇D-03地块", township: "龙溪镇", samplingMethod: "diagonal", specificLocation: "龙溪镇D-03地块中央", sampler: "赵刚", deadline: "2024-07-25", sampleQuantity: "1.8kg", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", maleLeafCount: "", femaleLeafCount: "", deliveryPhoto: "", deliveryTime: "", remark: "", createdAt: "2024-07-05" },
  { id: "6", relatedTaskNo: "YC2024002", enterpriseName: "丰乐种业", cropType: "水稻", varietyName: "C两优华占", plotLocation: "构皮滩镇E-02地块", township: "构皮滩镇", samplingMethod: "diagonal", specificLocation: "构皮滩镇E-02地块西侧", sampler: "陈超", deadline: "2024-07-25", sampleQuantity: "2.0kg", deliveryStatus: "ready_to_send", samplingPhoto: "photo_s6.jpg", samplingTime: "2024-07-18 08:45", maleLeafCount: "32", femaleLeafCount: "27", deliveryPhoto: "", deliveryTime: "", remark: "叶片略黄", createdAt: "2024-07-05" },
  { id: "7", relatedTaskNo: "YC2024003", enterpriseName: "金源种业", cropType: "水稻", varietyName: "杂交水稻Y两优900", plotLocation: "松烟镇F-01地块", township: "松烟镇", samplingMethod: "zigzag", specificLocation: "松烟镇F-01地块东南角", sampler: "刘军", deadline: "2024-08-01", sampleQuantity: "1.5kg", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", maleLeafCount: "", femaleLeafCount: "", deliveryPhoto: "", deliveryTime: "", remark: "", createdAt: "2024-07-10" },
  { id: "8", relatedTaskNo: "YC2024003", enterpriseName: "隆平高科", cropType: "水稻", varietyName: "隆两优534", plotLocation: "关兴镇G-02地块", township: "关兴镇", samplingMethod: "diagonal", specificLocation: "关兴镇G-02地块南侧", sampler: "李明", deadline: "2024-08-01", sampleQuantity: "1.8kg", deliveryStatus: "sent", samplingPhoto: "photo_s8.jpg", samplingTime: "2024-07-20 10:15", maleLeafCount: "28", femaleLeafCount: "22", deliveryPhoto: "photo_d8.jpg", deliveryTime: "2024-07-21 09:00", remark: "", createdAt: "2024-07-10" },
];

export default function LeafInspectionPage() {
  const [data, setData] = useState<LeafSample[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 查看详情
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<LeafSample | null>(null);

  // 确认取样
  const [samplingOpen, setSamplingOpen] = useState(false);
  const [samplingItem, setSamplingItem] = useState<LeafSample | null>(null);
  const [samplingPhoto, setSamplingPhoto] = useState("");
  const [samplingTime, setSamplingTime] = useState("");
  const [maleLeafCount, setMaleLeafCount] = useState("");
  const [femaleLeafCount, setFemaleLeafCount] = useState("");

  // 确认送样
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [deliveryItem, setDeliveryItem] = useState<LeafSample | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  // 删除
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<LeafSample | null>(null);

  // 打印
  const [printOpen, setPrintOpen] = useState(false);
  const [printingItem, setPrintingItem] = useState<LeafSample | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = data.filter(e => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || (e.relatedTaskNo || "").toLowerCase().includes(s)
      || (e.enterpriseName || "").toLowerCase().includes(s)
      || (e.cropType || "").toLowerCase().includes(s)
      || (e.varietyName || "").toLowerCase().includes(s)
      || (e.plotLocation || "").toLowerCase().includes(s);
    const matchStatus = statusFilter === "all" || e.deliveryStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = data.filter(e => e.deliveryStatus === "pending_sample").length;
  const readyCount = data.filter(e => e.deliveryStatus === "ready_to_send").length;
  const sentCount = data.filter(e => e.deliveryStatus === "sent").length;

  const openViewDialog = (item: LeafSample) => { setViewingItem(item); setViewOpen(true); };

  const openSamplingDialog = (item: LeafSample) => {
    setSamplingItem(item);
    setSamplingPhoto(item.samplingPhoto || "");
    setSamplingTime(item.samplingTime || "");
    setMaleLeafCount(item.maleLeafCount || "");
    setFemaleLeafCount(item.femaleLeafCount || "");
    setSamplingOpen(true);
  };

  const handleSamplingConfirm = () => {
    if (!samplingItem) return;
    setData(prev => prev.map(e => e.id === samplingItem.id ? {
      ...e, deliveryStatus: "ready_to_send" as DeliveryStatus,
      samplingPhoto, samplingTime, maleLeafCount, femaleLeafCount,
    } : e));
    setSamplingOpen(false); setSamplingItem(null);
  };

  const openDeliveryDialog = (item: LeafSample) => {
    setDeliveryItem(item);
    setDeliveryPhoto(item.deliveryPhoto || "");
    setDeliveryTime(item.deliveryTime || "");
    setDeliveryOpen(true);
  };

  const handleDeliveryConfirm = () => {
    if (!deliveryItem) return;
    setData(prev => prev.map(e => e.id === deliveryItem.id ? {
      ...e, deliveryStatus: "sent" as DeliveryStatus,
      deliveryPhoto, deliveryTime,
    } : e));
    setDeliveryOpen(false); setDeliveryItem(null);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setData(prev => prev.filter(e => e.id !== deletingItem.id));
    setDeletingItem(null); setDeleteOpen(false);
  };

  const handlePrint = () => {
    if (printRef.current) { const w = window.open("", "_blank"); if (w) { w.document.write(printRef.current.innerHTML); w.document.close(); w.print(); } }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">叶片扦样单</h1>
          <p className="text-sm text-muted-foreground mt-1">管理叶片期扦样记录，支持对角线法和Z字法取样</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><Leaf className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">扦样总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><Clock className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">待取样</p><p className="text-lg font-semibold">{pendingCount}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-yellow-100 p-2"><Truck className="h-4 w-4 text-yellow-700" /></div><div><p className="text-sm text-muted-foreground">待送样</p><p className="text-lg font-semibold">{readyCount}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-3/10 p-2"><CheckCircle2 className="h-4 w-4 text-chart-3" /></div><div><p className="text-sm text-muted-foreground">已送样</p><p className="text-lg font-semibold">{sentCount}</p></div></CardContent></Card>
      </div>

      {/* 搜索筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索关联任务编号、企业、品种、地块..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="pending_sample">待取样</SelectItem><SelectItem value="ready_to_send">待送样</SelectItem><SelectItem value="sent">已送样</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      {/* 列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>关联任务编号</TableHead>
                <TableHead>企业名称</TableHead>
                <TableHead>作物种类</TableHead>
                <TableHead>品种名称</TableHead>
                <TableHead>所在地块</TableHead>
                <TableHead>所属乡镇</TableHead>
                <TableHead>具体位置</TableHead>
                <TableHead>取样人</TableHead>
                <TableHead>截止时间</TableHead>
                <TableHead>取样量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={14} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id} className={item.deliveryStatus === "pending_sample" ? "bg-muted/30" : ""}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{item.relatedTaskNo}</TableCell>
                  <TableCell>{item.enterpriseName}</TableCell>
                  <TableCell>{item.cropType}</TableCell>
                  <TableCell>{item.varietyName}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{item.plotLocation}</TableCell>
                  <TableCell>{item.township}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{item.specificLocation}</TableCell>
                  <TableCell>{item.sampler}</TableCell>
                  <TableCell>{item.deadline}</TableCell>
                  <TableCell>{item.sampleQuantity}</TableCell>
                  <TableCell><Badge className={deliveryStatusConfig[item.deliveryStatus].color}>{deliveryStatusConfig[item.deliveryStatus].label}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => openViewDialog(item)}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                        {item.deliveryStatus === "pending_sample" && (
                          <DropdownMenuItem className="gap-2" onClick={() => openSamplingDialog(item)}><Camera className="h-4 w-4" />确认取样</DropdownMenuItem>
                        )}
                        {item.deliveryStatus === "ready_to_send" && (
                          <DropdownMenuItem className="gap-2" onClick={() => openDeliveryDialog(item)}><Truck className="h-4 w-4" />确认送样</DropdownMenuItem>
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
        </CardContent>
      </Card>

      {/* 查看详情 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0"><DialogTitle>叶片扦样单详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="overflow-y-auto flex-1 min-h-0 space-y-4 py-2">
              {/* 基本信息 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2">基本信息</p>
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  <div><span className="text-muted-foreground">关联任务编号：</span>{viewingItem.relatedTaskNo}</div>
                  <div><span className="text-muted-foreground">企业名称：</span>{viewingItem.enterpriseName}</div>
                  <div><span className="text-muted-foreground">作物种类：</span>{viewingItem.cropType}</div>
                  <div><span className="text-muted-foreground">品种名称：</span>{viewingItem.varietyName}</div>
                  <div><span className="text-muted-foreground">所在地块：</span>{viewingItem.plotLocation}</div>
                  <div><span className="text-muted-foreground">所属乡镇：</span>{viewingItem.township}</div>
                  <div><span className="text-muted-foreground">具体位置：</span>{viewingItem.specificLocation}</div>
                  <div><span className="text-muted-foreground">取样人：</span>{viewingItem.sampler}</div>
                  <div><span className="text-muted-foreground">截止时间：</span>{viewingItem.deadline}</div>
                  <div><span className="text-muted-foreground">取样量：</span>{viewingItem.sampleQuantity}</div>
                  <div><span className="text-muted-foreground">状态：</span><Badge className={deliveryStatusConfig[viewingItem.deliveryStatus].color}>{deliveryStatusConfig[viewingItem.deliveryStatus].label}</Badge></div>
                </div>
              </div>
              {/* 取样信息 */}
              {viewingItem.deliveryStatus !== "pending_sample" && (
                <div>
                  <p className="text-sm font-semibold border-b pb-2">取样信息</p>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div><span className="text-muted-foreground">取样方式：</span>{samplingMethodConfig[viewingItem.samplingMethod].label}</div>
                    <div><span className="text-muted-foreground">取样时间：</span>{viewingItem.samplingTime || "—"}</div>
                    <div><span className="text-muted-foreground">父本叶片数：</span>{viewingItem.maleLeafCount || "—"}</div>
                    <div><span className="text-muted-foreground">母本叶片数：</span>{viewingItem.femaleLeafCount || "—"}</div>
                    <div><span className="text-muted-foreground">取样照片：</span>{viewingItem.samplingPhoto ? <span className="text-primary">已上传</span> : "未上传"}</div>
                  </div>
                </div>
              )}
              {/* 送样信息 */}
              {viewingItem.deliveryStatus === "sent" && (
                <div>
                  <p className="text-sm font-semibold border-b pb-2">送样信息</p>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div><span className="text-muted-foreground">送样时间：</span>{viewingItem.deliveryTime || "—"}</div>
                    <div><span className="text-muted-foreground">送样照片：</span>{viewingItem.deliveryPhoto ? <span className="text-primary">已上传</span> : "未上传"}</div>
                  </div>
                </div>
              )}
              {viewingItem.remark && (
                <div><span className="text-sm text-muted-foreground">备注：</span><span className="text-sm">{viewingItem.remark}</span></div>
              )}
            </div>
          )}
          <DialogFooter className="shrink-0"><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认取样 */}
      <Dialog open={samplingOpen} onOpenChange={setSamplingOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>确认取样</DialogTitle><DialogDescription>上传取样照片和时间，录入叶片数量信息</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>取样照片 *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
                <p className="mt-1 text-sm text-muted-foreground">点击上传取样现场照片</p>
              </div>
            </div>
            <div className="space-y-2"><Label>取样时间 *</Label><Input type="datetime-local" value={samplingTime} onChange={(e) => setSamplingTime(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>父本叶片数 *</Label><Input type="number" placeholder="请输入父本叶片数" value={maleLeafCount} onChange={(e) => setMaleLeafCount(e.target.value)} /></div>
              <div className="space-y-2"><Label>母本叶片数 *</Label><Input type="number" placeholder="请输入母本叶片数" value={femaleLeafCount} onChange={(e) => setFemaleLeafCount(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>备注</Label><Textarea rows={2} placeholder="可选填写备注信息" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSamplingOpen(false)}>取消</Button><Button onClick={handleSamplingConfirm} disabled={!samplingTime || !maleLeafCount || !femaleLeafCount}>确认取样</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认送样 */}
      <Dialog open={deliveryOpen} onOpenChange={setDeliveryOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>确认送样</DialogTitle><DialogDescription>上传送样照片和时间</DialogDescription></DialogHeader>
          {deliveryItem && (
            <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1 mb-4">
              <p className="font-medium">取样信息</p>
              <p className="text-muted-foreground">取样时间：{deliveryItem.samplingTime}</p>
              <p className="text-muted-foreground">父本叶片数：{deliveryItem.maleLeafCount} | 母本叶片数：{deliveryItem.femaleLeafCount}</p>
            </div>
          )}
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>送样照片 *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera className="h-6 w-6 mx-auto text-muted-foreground" />
                <p className="mt-1 text-sm text-muted-foreground">点击上传送样现场照片</p>
              </div>
            </div>
            <div className="space-y-2"><Label>送样时间 *</Label><Input type="datetime-local" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDeliveryOpen(false)}>取消</Button><Button onClick={handleDeliveryConfirm} disabled={!deliveryTime}>确认送样</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 打印 */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0"><DialogTitle>打印叶片扦样单</DialogTitle></DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0">
            <div ref={printRef} className="p-6 text-sm">
              {printingItem && (
                <div className="space-y-4">
                  <h2 className="text-center text-lg font-bold">叶片扦样单</h2>
                  <table className="w-full border-collapse border border-border">
                    <tbody>
                      <tr><td className="border border-border p-2 w-1/3 text-muted-foreground">关联任务编号</td><td className="border border-border p-2">{printingItem.relatedTaskNo}</td><td className="border border-border p-2 text-muted-foreground">企业名称</td><td className="border border-border p-2">{printingItem.enterpriseName}</td></tr>
                      <tr><td className="border border-border p-2 text-muted-foreground">作物种类</td><td className="border border-border p-2">{printingItem.cropType}</td><td className="border border-border p-2 text-muted-foreground">品种名称</td><td className="border border-border p-2">{printingItem.varietyName}</td></tr>
                      <tr><td className="border border-border p-2 text-muted-foreground">所在地块</td><td className="border border-border p-2">{printingItem.plotLocation}</td><td className="border border-border p-2 text-muted-foreground">所属乡镇</td><td className="border border-border p-2">{printingItem.township}</td></tr>
                      <tr><td className="border border-border p-2 text-muted-foreground">取样方式</td><td className="border border-border p-2">{samplingMethodConfig[printingItem.samplingMethod].label}</td><td className="border border-border p-2 text-muted-foreground">具体位置</td><td className="border border-border p-2">{printingItem.specificLocation}</td></tr>
                      <tr><td className="border border-border p-2 text-muted-foreground">取样人</td><td className="border border-border p-2">{printingItem.sampler}</td><td className="border border-border p-2 text-muted-foreground">截止时间</td><td className="border border-border p-2">{printingItem.deadline}</td></tr>
                      <tr><td className="border border-border p-2 text-muted-foreground">取样量</td><td className="border border-border p-2">{printingItem.sampleQuantity}</td><td className="border border-border p-2 text-muted-foreground">状态</td><td className="border border-border p-2">{deliveryStatusConfig[printingItem.deliveryStatus].label}</td></tr>
                      {printingItem.samplingTime && (
                        <tr><td className="border border-border p-2 text-muted-foreground">取样时间</td><td className="border border-border p-2">{printingItem.samplingTime}</td><td className="border border-border p-2 text-muted-foreground">父本叶片数</td><td className="border border-border p-2">{printingItem.maleLeafCount}</td></tr>
                      )}
                      {printingItem.samplingTime && (
                        <tr><td className="border border-border p-2 text-muted-foreground">母本叶片数</td><td className="border border-border p-2">{printingItem.femaleLeafCount}</td><td className="border border-border p-2 text-muted-foreground"></td><td className="border border-border p-2"></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="shrink-0"><Button variant="outline" onClick={() => setPrintOpen(false)}>关闭</Button><Button onClick={handlePrint}>打印</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除该叶片扦样记录吗？</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
