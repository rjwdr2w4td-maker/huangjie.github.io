"use client";

import { useState, useCallback, useRef } from "react";
import {
  ClipboardCheck, Search, Eye, MoreHorizontal, Trash2, Printer,
  Truck, UserCheck, Camera, Clock, Image as ImageIcon,
  FlaskConical, FileText, CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

type DeliveryStatus = "pending_sample" | "ready_to_send" | "sent";
type SamplingMethod = "plot" | "seeder";

interface SubTask {
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
  // 送样信息
  deliveryPhoto: string;
  deliveryTime: string;
  // 快检结果（待送样时可填写）
  testMethod: "strip" | "portable" | "";
  testResult: string;
  testPhoto: string;
  remark: string;
  createdAt: string;
}

const samplingMethodConfig: Record<SamplingMethod, { label: string }> = {
  plot: { label: "地块取样" },
  seeder: { label: "播种机取样" },
};

const deliveryStatusConfig: Record<DeliveryStatus, { label: string; variant: "outline" | "secondary" | "default"; color: string }> = {
  pending_sample: { label: "待取样", variant: "outline", color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  ready_to_send: { label: "待送样", variant: "secondary", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  sent: { label: "已送样", variant: "default", color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
};

const testMethodConfig: Record<string, string> = {
  strip: "试纸条",
  portable: "便携设备",
};

const initialData: SubTask[] = [
  { id: "1", relatedTaskNo: "BJ-2024-001", enterpriseName: "丰源种业有限公司", cropType: "玉米", varietyName: "郑单958", plotLocation: "城关镇-东郊基地A3地块", township: "城关镇", samplingMethod: "plot", specificLocation: "A3-01号地块东南角", sampler: "李明", deadline: "2024-04-10", sampleQuantity: "2kg", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", deliveryPhoto: "", deliveryTime: "", testMethod: "", testResult: "", testPhoto: "", remark: "", createdAt: "2024-04-02" },
  { id: "2", relatedTaskNo: "BJ-2024-001", enterpriseName: "丰源种业有限公司", cropType: "玉米", varietyName: "郑单958", plotLocation: "城关镇-东郊基地A5地块", township: "城关镇", samplingMethod: "seeder", specificLocation: "A5-03号播种机旁", sampler: "李明", deadline: "2024-04-10", sampleQuantity: "1.5kg", deliveryStatus: "ready_to_send", samplingPhoto: "/placeholder-sampling.jpg", samplingTime: "2024-04-03 09:15", deliveryPhoto: "", deliveryTime: "", testMethod: "strip", testResult: "阴性", testPhoto: "/placeholder-test.jpg", remark: "", createdAt: "2024-04-02" },
  { id: "3", relatedTaskNo: "BJ-2024-001", enterpriseName: "绿丰农业发展有限公司", cropType: "水稻", varietyName: "Y两优900", plotLocation: "城关镇-西郊基地B2地块", township: "城关镇", samplingMethod: "plot", specificLocation: "B2-02号地块西北角", sampler: "王强", deadline: "2024-04-10", sampleQuantity: "2kg", deliveryStatus: "ready_to_send", samplingPhoto: "/placeholder-sampling.jpg", samplingTime: "2024-04-03 10:30", deliveryPhoto: "", deliveryTime: "", testMethod: "portable", testResult: "待检测", testPhoto: "", remark: "", createdAt: "2024-04-02" },
  { id: "4", relatedTaskNo: "BJ-2024-002", enterpriseName: "金穗种业股份有限公司", cropType: "玉米", varietyName: "先玉335", plotLocation: "柳林镇-南阳基地C1地块", township: "柳林镇", samplingMethod: "plot", specificLocation: "C1-01号地块东侧", sampler: "王强", deadline: "2024-04-15", sampleQuantity: "1.8kg", deliveryStatus: "sent", samplingPhoto: "/placeholder-sampling.jpg", samplingTime: "2024-04-05 14:20", deliveryPhoto: "/placeholder-delivery.jpg", deliveryTime: "2024-04-06 08:30", testMethod: "strip", testResult: "阴性", testPhoto: "/placeholder-test.jpg", remark: "", createdAt: "2024-04-05" },
  { id: "5", relatedTaskNo: "BJ-2024-002", enterpriseName: "华农高科种业有限公司", cropType: "水稻", varietyName: "丰两优4号", plotLocation: "柳林镇-南阳基地C3地块", township: "柳林镇", samplingMethod: "seeder", specificLocation: "C3-02号播种机旁", sampler: "张伟", deadline: "2024-04-15", sampleQuantity: "2kg", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", deliveryPhoto: "", deliveryTime: "", testMethod: "", testResult: "", testPhoto: "", remark: "", createdAt: "2024-04-05" },
  { id: "6", relatedTaskNo: "BJ-2024-002", enterpriseName: "金穗种业股份有限公司", cropType: "玉米", varietyName: "先玉335", plotLocation: "柳林镇-南阳基地C2地块", township: "柳林镇", samplingMethod: "plot", specificLocation: "C2-03号地块南侧", sampler: "张伟", deadline: "2024-04-15", sampleQuantity: "2kg", deliveryStatus: "pending_sample", samplingPhoto: "", samplingTime: "", deliveryPhoto: "", deliveryTime: "", testMethod: "", testResult: "", testPhoto: "", remark: "", createdAt: "2024-04-05" },
  { id: "7", relatedTaskNo: "BJ-2024-003", enterpriseName: "兴农种业科技有限公司", cropType: "油菜", varietyName: "秦优7号", plotLocation: "大河镇-河北基地D1地块", township: "大河镇", samplingMethod: "plot", specificLocation: "D1-01号地块中央", sampler: "赵刚", deadline: "2024-04-20", sampleQuantity: "1.5kg", deliveryStatus: "sent", samplingPhoto: "/placeholder-sampling.jpg", samplingTime: "2024-04-10 11:00", deliveryPhoto: "/placeholder-delivery.jpg", deliveryTime: "2024-04-11 09:15", testMethod: "portable", testResult: "阳性", testPhoto: "/placeholder-test.jpg", remark: "快检阳性，需复检", createdAt: "2024-04-08" },
  { id: "8", relatedTaskNo: "BJ-2024-003", enterpriseName: "兴农种业科技有限公司", cropType: "油菜", varietyName: "秦优7号", plotLocation: "大河镇-河北基地D2地块", township: "大河镇", samplingMethod: "seeder", specificLocation: "D2-01号播种机旁", sampler: "赵刚", deadline: "2024-04-20", sampleQuantity: "1.8kg", deliveryStatus: "ready_to_send", samplingPhoto: "/placeholder-sampling.jpg", samplingTime: "2024-04-10 15:30", deliveryPhoto: "", deliveryTime: "", testMethod: "strip", testResult: "阴性", testPhoto: "/placeholder-test.jpg", remark: "", createdAt: "2024-04-08" },
];

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);
const today = () => new Date().toISOString().split("T")[0];

/* 照片展示组件 */
function PhotoBlock({ label, photo, time }: { label: string; photo: string; time: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {photo ? (
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center border">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          {time && <p className="text-sm mt-1">{time}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">暂无</p>
      )}
    </div>
  );
}

export default function SamplingTasksPage() {
  const [data, setData] = useState<SubTask[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 查看
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<SubTask | null>(null);

  // 确认取样
  const [samplingOpen, setSamplingOpen] = useState(false);
  const [samplingItem, setSamplingItem] = useState<SubTask | null>(null);
  const [samplingPhotoFile, setSamplingPhotoFile] = useState("");
  const [samplingTimeVal, setSamplingTimeVal] = useState("");

  // 确认送样
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [deliveryItem, setDeliveryItem] = useState<SubTask | null>(null);
  const [deliveryPhotoFile, setDeliveryPhotoFile] = useState("");
  const [deliveryTimeVal, setDeliveryTimeVal] = useState("");

  // 填写快检结果
  const [testResultOpen, setTestResultOpen] = useState(false);
  const [testResultItem, setTestResultItem] = useState<SubTask | null>(null);
  const [editTestMethod, setEditTestMethod] = useState<"strip" | "portable" | "">("");
  const [editTestResult, setEditTestResult] = useState("");
  const [editTestPhoto, setEditTestPhoto] = useState("");

  // 删除
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SubTask | null>(null);

  // 打印
  const [printOpen, setPrintOpen] = useState(false);
  const [printingItem, setPrintingItem] = useState<SubTask | null>(null);

  const filtered = data.filter((e) => {
    const matchesSearch =
      e.relatedTaskNo.includes(searchTerm) ||
      e.enterpriseName.includes(searchTerm) ||
      e.cropType.includes(searchTerm) ||
      e.varietyName.includes(searchTerm) ||
      e.plotLocation.includes(searchTerm) ||
      e.township.includes(searchTerm) ||
      e.specificLocation.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || e.deliveryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: data.length,
    pending: data.filter((e) => e.deliveryStatus === "pending_sample").length,
    ready: data.filter((e) => e.deliveryStatus === "ready_to_send").length,
    sent: data.filter((e) => e.deliveryStatus === "sent").length,
  };

  /* 确认取样 */
  const handleConfirmSampling = useCallback(() => {
    if (!samplingItem) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === samplingItem.id
          ? { ...item, deliveryStatus: "ready_to_send" as DeliveryStatus, samplingPhoto: samplingPhotoFile || "/placeholder-sampling.jpg", samplingTime: samplingTimeVal || now() }
          : item
      )
    );
    setSamplingOpen(false);
    setSamplingItem(null);
    setSamplingPhotoFile("");
    setSamplingTimeVal("");
  }, [samplingItem, samplingPhotoFile, samplingTimeVal]);

  /* 确认送样 */
  const handleConfirmDelivery = useCallback(() => {
    if (!deliveryItem) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === deliveryItem.id
          ? { ...item, deliveryStatus: "sent" as DeliveryStatus, deliveryPhoto: deliveryPhotoFile || "/placeholder-delivery.jpg", deliveryTime: deliveryTimeVal || now() }
          : item
      )
    );
    setDeliveryOpen(false);
    setDeliveryItem(null);
    setDeliveryPhotoFile("");
    setDeliveryTimeVal("");
  }, [deliveryItem, deliveryPhotoFile, deliveryTimeVal]);

  /* 保存快检结果 */
  const handleSaveTestResult = useCallback(() => {
    if (!testResultItem) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === testResultItem.id
          ? { ...item, testMethod: editTestMethod, testResult: editTestResult, testPhoto: editTestPhoto || (editTestMethod ? "/placeholder-test.jpg" : "") }
          : item
      )
    );
    setTestResultOpen(false);
    setTestResultItem(null);
    setEditTestMethod("");
    setEditTestResult("");
    setEditTestPhoto("");
  }, [testResultItem, editTestMethod, editTestResult, editTestPhoto]);

  /* 删除 */
  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  /* 打印 */
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>抽检任务单</title>
      <style>body{font-family:sans-serif;padding:24px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px;text-align:left} th{background:#f5f5f5}</style>
      </head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">抽检任务跟踪</h1>
          <p className="text-sm text-muted-foreground mt-1">播种抽检任务自动拆分的子任务，跟踪取样、送样与快检进度</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2"><ClipboardCheck className="h-4 w-4 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">任务总数</p><p className="text-lg font-semibold">{stats.total}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-md bg-chart-4/10 p-2"><Clock className="h-4 w-4 text-chart-4" /></div>
            <div><p className="text-sm text-muted-foreground">待取样</p><p className="text-lg font-semibold">{stats.pending}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-md bg-yellow-100 p-2"><Truck className="h-4 w-4 text-yellow-700" /></div>
            <div><p className="text-sm text-muted-foreground">待送样</p><p className="text-lg font-semibold">{stats.ready}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-md bg-chart-2/10 p-2"><CheckCircle2 className="h-4 w-4 text-chart-2" /></div>
            <div><p className="text-sm text-muted-foreground">已送样</p><p className="text-lg font-semibold">{stats.sent}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索与筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="搜索任务号、企业、作物、品种、地块、乡镇..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending_sample">待取样</SelectItem>
                <SelectItem value="ready_to_send">待送样</SelectItem>
                <SelectItem value="sent">已送样</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead>取样方式</TableHead>
                <TableHead>具体位置</TableHead>
                <TableHead>取样人</TableHead>
                <TableHead>截止时间</TableHead>
                <TableHead>取样数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{item.relatedTaskNo}</TableCell>
                  <TableCell>{item.enterpriseName}</TableCell>
                  <TableCell>{item.cropType}</TableCell>
                  <TableCell>{item.varietyName}</TableCell>
                  <TableCell className="max-w-[160px] truncate" title={item.plotLocation}>{item.plotLocation}</TableCell>
                  <TableCell>{item.township}</TableCell>
                  <TableCell><Badge variant="outline">{samplingMethodConfig[item.samplingMethod].label}</Badge></TableCell>
                  <TableCell className="max-w-[140px] truncate" title={item.specificLocation}>{item.specificLocation}</TableCell>
                  <TableCell>{item.sampler}</TableCell>
                  <TableCell>{item.deadline}</TableCell>
                  <TableCell>{item.sampleQuantity}</TableCell>
                  <TableCell>
                    <Badge variant={deliveryStatusConfig[item.deliveryStatus].variant} className={deliveryStatusConfig[item.deliveryStatus].color}>
                      {deliveryStatusConfig[item.deliveryStatus].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                        {item.deliveryStatus === "pending_sample" && (
                          <DropdownMenuItem className="gap-2" onClick={() => { setSamplingItem(item); setSamplingTimeVal(now()); setSamplingOpen(true); }}><UserCheck className="h-4 w-4" />确认取样</DropdownMenuItem>
                        )}
                        {item.deliveryStatus === "ready_to_send" && (
                          <>
                            <DropdownMenuItem className="gap-2" onClick={() => { setDeliveryItem(item); setDeliveryTimeVal(now()); setDeliveryOpen(true); }}><Truck className="h-4 w-4" />确认送样</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => { setTestResultItem(item); setEditTestMethod(item.testMethod); setEditTestResult(item.testResult); setEditTestPhoto(item.testPhoto); setTestResultOpen(true); }}><FlaskConical className="h-4 w-4" />填写快检结果</DropdownMenuItem>
                          </>
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
        <DialogContent className="sm:max-w-[640px] max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0"><DialogTitle>任务详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="overflow-y-auto flex-1 min-h-0 space-y-6 py-4">
              {/* 基本信息 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2">基本信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-3">
                  <div><p className="text-sm text-muted-foreground">关联任务编号</p><p className="font-mono">{viewingItem.relatedTaskNo}</p></div>
                  <div><p className="text-sm text-muted-foreground">企业名称</p><p>{viewingItem.enterpriseName}</p></div>
                  <div><p className="text-sm text-muted-foreground">作物种类</p><p>{viewingItem.cropType}</p></div>
                  <div><p className="text-sm text-muted-foreground">品种名称</p><p>{viewingItem.varietyName}</p></div>
                  <div><p className="text-sm text-muted-foreground">所在地块</p><p>{viewingItem.plotLocation}</p></div>
                  <div><p className="text-sm text-muted-foreground">所属乡镇</p><p>{viewingItem.township}</p></div>
                  <div><p className="text-sm text-muted-foreground">取样方式</p><Badge variant="outline">{samplingMethodConfig[viewingItem.samplingMethod].label}</Badge></div>
                  <div><p className="text-sm text-muted-foreground">具体位置</p><p>{viewingItem.specificLocation}</p></div>
                  <div><p className="text-sm text-muted-foreground">取样人</p><p>{viewingItem.sampler}</p></div>
                  <div><p className="text-sm text-muted-foreground">截止时间</p><p>{viewingItem.deadline}</p></div>
                  <div><p className="text-sm text-muted-foreground">取样数量</p><p>{viewingItem.sampleQuantity}</p></div>
                  <div><p className="text-sm text-muted-foreground">状态</p><Badge variant={deliveryStatusConfig[viewingItem.deliveryStatus].variant} className={deliveryStatusConfig[viewingItem.deliveryStatus].color}>{deliveryStatusConfig[viewingItem.deliveryStatus].label}</Badge></div>
                  <div><p className="text-sm text-muted-foreground">创建日期</p><p>{viewingItem.createdAt}</p></div>
                </div>
              </div>

              {/* 取样信息 */}
              {(viewingItem.deliveryStatus === "ready_to_send" || viewingItem.deliveryStatus === "sent") && (
                <div>
                  <p className="text-sm font-semibold border-b pb-2">取样信息</p>
                  <div className="mt-3 space-y-3">
                    <PhotoBlock label="取样照片" photo={viewingItem.samplingPhoto} time={viewingItem.samplingTime} />
                  </div>
                </div>
              )}

              {/* 送样信息 */}
              {viewingItem.deliveryStatus === "sent" && (
                <div>
                  <p className="text-sm font-semibold border-b pb-2">送样信息</p>
                  <div className="mt-3 space-y-3">
                    <PhotoBlock label="送样照片" photo={viewingItem.deliveryPhoto} time={viewingItem.deliveryTime} />
                  </div>
                </div>
              )}

              {/* 快检结果 */}
              {viewingItem.testMethod && (
                <div>
                  <p className="text-sm font-semibold border-b pb-2">快检结果</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-3">
                    <div><p className="text-sm text-muted-foreground">检测方式</p><p>{testMethodConfig[viewingItem.testMethod]}</p></div>
                    <div><p className="text-sm text-muted-foreground">检测结果</p><p>{viewingItem.testResult}</p></div>
                  </div>
                  {viewingItem.testPhoto && (
                    <div className="mt-3">
                      <PhotoBlock label="检测照片" photo={viewingItem.testPhoto} time="" />
                    </div>
                  )}
                </div>
              )}

              {viewingItem.remark && (
                <div>
                  <p className="text-sm font-semibold border-b pb-2">备注</p>
                  <p className="mt-2 text-sm">{viewingItem.remark}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="shrink-0"><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认取样 */}
      <Dialog open={samplingOpen} onOpenChange={setSamplingOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>确认取样</DialogTitle></DialogHeader>
          {samplingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">关联任务</p><p className="font-mono">{samplingItem.relatedTaskNo}</p></div>
                <div><p className="text-muted-foreground">企业</p><p>{samplingItem.enterpriseName}</p></div>
                <div><p className="text-muted-foreground">品种</p><p>{samplingItem.varietyName}</p></div>
                <div><p className="text-muted-foreground">地块</p><p>{samplingItem.plotLocation}</p></div>
              </div>
              <div className="space-y-2">
                <Label>取样照片 *</Label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSamplingPhotoFile("/placeholder-sampling.jpg")}>
                    <Camera className="h-4 w-4" />上传照片
                  </Button>
                  {samplingPhotoFile && <span className="text-sm text-muted-foreground">已上传</span>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>取样时间</Label>
                <Input type="datetime-local" value={samplingTimeVal.slice(0, 16)} onChange={(e) => setSamplingTimeVal(e.target.value.replace("T", " ") + ":00")} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSamplingOpen(false)}>取消</Button>
            <Button onClick={handleConfirmSampling} disabled={!samplingPhotoFile}>确认取样</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认送样 */}
      <Dialog open={deliveryOpen} onOpenChange={setDeliveryOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>确认送样</DialogTitle></DialogHeader>
          {deliveryItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">关联任务</p><p className="font-mono">{deliveryItem.relatedTaskNo}</p></div>
                <div><p className="text-muted-foreground">企业</p><p>{deliveryItem.enterpriseName}</p></div>
                <div><p className="text-muted-foreground">品种</p><p>{deliveryItem.varietyName}</p></div>
                <div><p className="text-muted-foreground">地块</p><p>{deliveryItem.plotLocation}</p></div>
              </div>
              <div className="bg-muted/50 p-3 rounded-md space-y-2">
                <p className="text-sm font-medium">取样信息</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>取样时间：{deliveryItem.samplingTime}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>送样照片 *</Label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDeliveryPhotoFile("/placeholder-delivery.jpg")}>
                    <Camera className="h-4 w-4" />上传照片
                  </Button>
                  {deliveryPhotoFile && <span className="text-sm text-muted-foreground">已上传</span>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>送样时间</Label>
                <Input type="datetime-local" value={deliveryTimeVal.slice(0, 16)} onChange={(e) => setDeliveryTimeVal(e.target.value.replace("T", " ") + ":00")} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliveryOpen(false)}>取消</Button>
            <Button onClick={handleConfirmDelivery} disabled={!deliveryPhotoFile}>确认送样</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 填写快检结果 */}
      <Dialog open={testResultOpen} onOpenChange={setTestResultOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>填写快检结果</DialogTitle></DialogHeader>
          {testResultItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">关联任务</p><p className="font-mono">{testResultItem.relatedTaskNo}</p></div>
                <div><p className="text-muted-foreground">企业</p><p>{testResultItem.enterpriseName}</p></div>
                <div><p className="text-muted-foreground">品种</p><p>{testResultItem.varietyName}</p></div>
                <div><p className="text-muted-foreground">地块</p><p>{testResultItem.plotLocation}</p></div>
              </div>
              <div className="space-y-3">
                <Label>检测方式 *</Label>
                <RadioGroup value={editTestMethod} onValueChange={(v) => setEditTestMethod(v as "strip" | "portable")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="strip" id="strip" />
                    <Label htmlFor="strip" className="font-normal">试纸条</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="portable" id="portable" />
                    <Label htmlFor="portable" className="font-normal">便携设备</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>检测结果</Label>
                <Select value={editTestResult} onValueChange={setEditTestResult}>
                  <SelectTrigger><SelectValue placeholder="选择结果" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="阴性">阴性</SelectItem>
                    <SelectItem value="阳性">阳性</SelectItem>
                    <SelectItem value="待检测">待检测</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>检测照片</Label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditTestPhoto("/placeholder-test.jpg")}>
                    <Camera className="h-4 w-4" />上传照片
                  </Button>
                  {editTestPhoto && <span className="text-sm text-muted-foreground">已上传</span>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea rows={2} placeholder="可选填写备注" value={testResultItem.remark} onChange={(e) => {
                  const val = e.target.value;
                  setTestResultItem({ ...testResultItem, remark: val });
                }} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestResultOpen(false)}>取消</Button>
            <Button onClick={handleSaveTestResult} disabled={!editTestMethod}>保存结果</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 打印 */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0"><DialogTitle>打印预览</DialogTitle></DialogHeader>
          {printingItem && (
            <div className="overflow-y-auto flex-1 min-h-0 py-4" ref={printRef}>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold">抽检任务单</h2>
              </div>
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr><td className="border p-2 bg-muted/50 w-32">关联任务编号</td><td className="border p-2">{printingItem.relatedTaskNo}</td><td className="border p-2 bg-muted/50 w-32">企业名称</td><td className="border p-2">{printingItem.enterpriseName}</td></tr>
                  <tr><td className="border p-2 bg-muted/50">作物种类</td><td className="border p-2">{printingItem.cropType}</td><td className="border p-2 bg-muted/50">品种名称</td><td className="border p-2">{printingItem.varietyName}</td></tr>
                  <tr><td className="border p-2 bg-muted/50">所在地块</td><td className="border p-2">{printingItem.plotLocation}</td><td className="border p-2 bg-muted/50">所属乡镇</td><td className="border p-2">{printingItem.township}</td></tr>
                  <tr><td className="border p-2 bg-muted/50">取样方式</td><td className="border p-2">{samplingMethodConfig[printingItem.samplingMethod].label}</td><td className="border p-2 bg-muted/50">具体位置</td><td className="border p-2">{printingItem.specificLocation}</td></tr>
                  <tr><td className="border p-2 bg-muted/50">取样人</td><td className="border p-2">{printingItem.sampler}</td><td className="border p-2 bg-muted/50">截止时间</td><td className="border p-2">{printingItem.deadline}</td></tr>
                  <tr><td className="border p-2 bg-muted/50">取样数量</td><td className="border p-2">{printingItem.sampleQuantity}</td><td className="border p-2 bg-muted/50"></td><td className="border p-2"></td></tr>
                  <tr><td className="border p-2 bg-muted/50">状态</td><td className="border p-2">{deliveryStatusConfig[printingItem.deliveryStatus].label}</td><td className="border p-2 bg-muted/50">创建日期</td><td className="border p-2">{printingItem.createdAt}</td></tr>
                  {printingItem.samplingTime && <tr><td className="border p-2 bg-muted/50">取样时间</td><td className="border p-2" colSpan={3}>{printingItem.samplingTime}</td></tr>}
                  {printingItem.deliveryTime && <tr><td className="border p-2 bg-muted/50">送样时间</td><td className="border p-2" colSpan={3}>{printingItem.deliveryTime}</td></tr>}
                  {printingItem.testMethod && <tr><td className="border p-2 bg-muted/50">快检方式</td><td className="border p-2">{testMethodConfig[printingItem.testMethod]}</td><td className="border p-2 bg-muted/50">快检结果</td><td className="border p-2">{printingItem.testResult}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setPrintOpen(false)}>关闭</Button>
            <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-1.5" />打印</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除任务「{deletingItem?.relatedTaskNo}」的子任务吗？此操作不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
