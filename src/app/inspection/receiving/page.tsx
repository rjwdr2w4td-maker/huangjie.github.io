"use client";

import { useState, useCallback } from "react";
import {
  PackageSearch, Search, Eye, MoreHorizontal, CheckCircle2, Inbox, ClipboardCheck, Clock, CheckCheck,
  Sprout, Leaf, Wheat,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SampleSource = "parent_seed" | "sowing" | "leaf";

interface SampleReception {
  id: string;
  batchNo: string;
  sampleSheetNo: string;
  cropType: string;
  varietyName: string;
  varietySource: string;
  sender: string;
  senderType: "enterprise" | "county";
  receivePerson: string;
  sampleCondition: "intact" | "abnormal" | "";
  storageLocation: string;
  receiveDate: string;
  status: "pending" | "received";
  createdAt: string;
  enterpriseName: string;
  source: SampleSource;
  samplingMethod?: "plot" | "seeder";  // 播种样品专用
  sampleQuantity?: string;              // 播种样品专用
}

// 亲本种子样品数据
const parentSeedData: SampleReception[] = [
  { id: "p1", batchNo: "BN-HP-001", sampleSheetNo: "JYD20240001", cropType: "水稻", varietyName: "Y58S", varietySource: "湖南长沙", sender: "丰源种业科技有限公司", senderType: "enterprise", receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "", status: "pending", createdAt: "2024-01-15", enterpriseName: "丰源种业科技有限公司", source: "parent_seed" },
  { id: "p2", batchNo: "BN-HP-002", sampleSheetNo: "JYD20240002", cropType: "小麦", varietyName: "郑麦9023", varietySource: "河南郑州", sender: "刘管理", senderType: "county", receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "", status: "pending", createdAt: "2024-01-18", enterpriseName: "绿丰农业发展有限公司", source: "parent_seed" },
  { id: "p3", batchNo: "BN-HP-003", sampleSheetNo: "JYD20240003", cropType: "玉米", varietyName: "郑单958", varietySource: "河南郑州", sender: "金穗种业股份有限公司", senderType: "enterprise", receivePerson: "张检验", sampleCondition: "intact", storageLocation: "A-01-03", receiveDate: "2024-01-22", status: "received", createdAt: "2024-01-21", enterpriseName: "金穗种业股份有限公司", source: "parent_seed" },
  { id: "p4", batchNo: "BN-HP-004", sampleSheetNo: "JYD20240004", cropType: "油菜", varietyName: "中油杂12", varietySource: "湖北武汉", sender: "陈检测", senderType: "county", receivePerson: "李检验", sampleCondition: "intact", storageLocation: "B-02-01", receiveDate: "2024-01-25", status: "received", createdAt: "2024-01-25", enterpriseName: "兴农种业科技有限公司", source: "parent_seed" },
  { id: "p5", batchNo: "BN-HP-005", sampleSheetNo: "JYD20240005", cropType: "水稻", varietyName: "Y两优900", varietySource: "湖南长沙", sender: "丰源种业科技有限公司", senderType: "enterprise", receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "", status: "pending", createdAt: "2024-01-28", enterpriseName: "丰源种业科技有限公司", source: "parent_seed" },
];

// 播种样品数据
const sowingData: SampleReception[] = [
  { id: "s1", batchNo: "BN-BZ-001", sampleSheetNo: "", cropType: "水稻", varietyName: "丰两优4号", varietySource: "安徽合肥", sender: "王管理", senderType: "county", receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "", status: "pending", createdAt: "2024-03-10", enterpriseName: "皖丰种业有限公司", source: "sowing", samplingMethod: "plot", sampleQuantity: "1.5kg" },
  { id: "s2", batchNo: "BN-BZ-002", sampleSheetNo: "", cropType: "玉米", varietyName: "先玉335", varietySource: "辽宁沈阳", sender: "赵管理", senderType: "county", receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "", status: "pending", createdAt: "2024-03-15", enterpriseName: "辽丰种业有限公司", source: "sowing", samplingMethod: "seeder", sampleQuantity: "2.0kg" },
  { id: "s3", batchNo: "BN-BZ-003", sampleSheetNo: "", cropType: "水稻", varietyName: "深两优5814", varietySource: "广东广州", sender: "李管理", senderType: "county", receivePerson: "张检验", sampleCondition: "intact", storageLocation: "C-01-02", receiveDate: "2024-04-02", status: "received", createdAt: "2024-04-01", enterpriseName: "粤丰农业科技有限公司", source: "sowing", samplingMethod: "plot", sampleQuantity: "1.8kg" },
  { id: "s4", batchNo: "BN-BZ-004", sampleSheetNo: "", cropType: "玉米", varietyName: "郑单958", varietySource: "河南郑州", sender: "张管理", senderType: "county", receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "", status: "pending", createdAt: "2024-03-20", enterpriseName: "金穗种业股份有限公司", source: "sowing", samplingMethod: "seeder", sampleQuantity: "1.6kg" },
  { id: "s5", batchNo: "BN-BZ-005", sampleSheetNo: "", cropType: "水稻", varietyName: "Y两优900", varietySource: "湖南长沙", sender: "刘管理", senderType: "county", receivePerson: "李检验", sampleCondition: "intact", storageLocation: "C-02-01", receiveDate: "2024-04-10", status: "received", createdAt: "2024-04-08", enterpriseName: "丰源种业科技有限公司", source: "sowing", samplingMethod: "plot", sampleQuantity: "2.2kg" },
];

// 叶片样品数据
const leafData: SampleReception[] = [
  { id: "l1", batchNo: "BN-YP-001", sampleSheetNo: "JYD2024YP01", cropType: "水稻", varietyName: "C两优343", varietySource: "湖南长沙", sender: "刘管理", senderType: "county", receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "", status: "pending", createdAt: "2024-05-20", enterpriseName: "湘丰种业有限公司", source: "leaf" },
  { id: "l2", batchNo: "BN-YP-002", sampleSheetNo: "JYD2024YP02", cropType: "水稻", varietyName: "陵两优268", varietySource: "湖南衡阳", sender: "陈管理", senderType: "county", receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "", status: "pending", createdAt: "2024-05-22", enterpriseName: "衡丰农业发展有限公司", source: "leaf" },
  { id: "l3", batchNo: "BN-YP-003", sampleSheetNo: "JYD2024YP03", cropType: "玉米", varietyName: "迪卡517", varietySource: "甘肃张掖", sender: "张管理", senderType: "county", receivePerson: "李检验", sampleCondition: "abnormal", storageLocation: "D-03-01", receiveDate: "2024-06-05", status: "received", createdAt: "2024-06-04", enterpriseName: "甘丰种业有限公司", source: "leaf" },
  { id: "l4", batchNo: "BN-YP-004", sampleSheetNo: "JYD2024YP04", cropType: "水稻", varietyName: "株两优819", varietySource: "湖南株洲", sender: "王管理", senderType: "county", receivePerson: "张检验", sampleCondition: "intact", storageLocation: "D-03-02", receiveDate: "2024-06-10", status: "received", createdAt: "2024-06-09", enterpriseName: "株洲种业公司", source: "leaf" },
];

const allSyncedData = [...parentSeedData, ...sowingData, ...leafData];

const conditionConfig: Record<string, { label: string; variant: "default" | "destructive" }> = {
  intact: { label: "完好", variant: "default" },
  abnormal: { label: "异常", variant: "destructive" },
};

const senderTypeConfig: Record<string, { label: string; variant: "outline" | "secondary" }> = {
  enterprise: { label: "企业", variant: "outline" as const },
  county: { label: "县级", variant: "secondary" as const },
};

const samplingMethodConfig: Record<string, string> = {
  plot: "地块取样",
  seeder: "播种机取样",
};

export default function ReceivingPage() {
  const [data, setData] = useState<SampleReception[]>(allSyncedData);
  const [activeTab, setActiveTab] = useState<SampleSource>("parent_seed");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchReceiveOpen, setBatchReceiveOpen] = useState(false);
  const [singleReceiveOpen, setSingleReceiveOpen] = useState(false);
  const [receivingItem, setReceivingItem] = useState<SampleReception | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<SampleReception | null>(null);

  // 批量接收表单
  const [batchForm, setBatchForm] = useState({ receivePerson: "", storageLocation: "" });

  // 单个接收表单
  const [singleForm, setSingleForm] = useState({ receivePerson: "", sampleCondition: "" as "intact" | "abnormal" | "", storageLocation: "", receiveDate: "" });

  const today = () => new Date().toISOString().split("T")[0];

  // 当前 tab 数据
  const tabData = data.filter((e) => e.source === activeTab);
  const pendingItems = tabData.filter((e) => e.status === "pending");
  const receivedItems = tabData.filter((e) => e.status === "received");

  const filtered = tabData.filter((e) => {
    const matchesSearch = e.batchNo.includes(searchTerm) || e.sampleSheetNo.includes(searchTerm) || e.varietyName.includes(searchTerm) || e.cropType.includes(searchTerm) || e.enterpriseName.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 统计卡片按 tab
  const tabStats = {
    parent_seed: { total: data.filter((e) => e.source === "parent_seed").length, pending: data.filter((e) => e.source === "parent_seed" && e.status === "pending").length, received: data.filter((e) => e.source === "parent_seed" && e.status === "received").length },
    sowing: { total: data.filter((e) => e.source === "sowing").length, pending: data.filter((e) => e.source === "sowing" && e.status === "pending").length, received: data.filter((e) => e.source === "sowing" && e.status === "received").length },
    leaf: { total: data.filter((e) => e.source === "leaf").length, pending: data.filter((e) => e.source === "leaf" && e.status === "pending").length, received: data.filter((e) => e.source === "leaf" && e.status === "received").length },
  };
  const currentStats = tabStats[activeTab];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingFilteredIds = filtered.filter((e) => e.status === "pending").map((e) => e.id);
    if (pendingFilteredIds.every((id) => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingFilteredIds));
    }
  };

  const handleSingleReceive = useCallback(() => {
    if (!receivingItem) return;
    setData((prev) => prev.map((item) =>
      item.id === receivingItem.id
        ? {
            ...item,
            status: "received" as const,
            receivePerson: singleForm.receivePerson,
            sampleCondition: singleForm.sampleCondition,
            storageLocation: singleForm.storageLocation,
            receiveDate: singleForm.receiveDate || today(),
          }
        : item
    ));
    setSingleReceiveOpen(false);
    setReceivingItem(null);
    setSingleForm({ receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: "" });
  }, [receivingItem, singleForm]);

  const handleBatchReceive = useCallback(() => {
    if (selectedIds.size === 0 || !batchForm.receivePerson) return;
    setData((prev) => prev.map((item) =>
      selectedIds.has(item.id)
        ? {
            ...item,
            status: "received" as const,
            receivePerson: batchForm.receivePerson,
            sampleCondition: "intact" as const,
            storageLocation: batchForm.storageLocation,
            receiveDate: today(),
          }
        : item
    ));
    setSelectedIds(new Set());
    setBatchReceiveOpen(false);
    setBatchForm({ receivePerson: "", storageLocation: "" });
  }, [selectedIds, batchForm]);

  const openSingleReceive = (item: SampleReception) => {
    if (item.status !== "pending") return;
    setReceivingItem(item);
    setSingleForm({ receivePerson: "", sampleCondition: "", storageLocation: "", receiveDate: today() });
    setSingleReceiveOpen(true);
  };

  // 切换 tab 时重置筛选和选中
  const handleTabChange = (value: string) => {
    setActiveTab(value as SampleSource);
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">样品接收</h1>
          <p className="text-sm text-muted-foreground mt-1">接样单数据自动同步至此，确认接收并录入样品状况和存放信息</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button size="sm" className="gap-1.5" onClick={() => {
              setBatchForm({ receivePerson: "", storageLocation: "" });
              setBatchReceiveOpen(true);
            }}>
              <CheckCircle2 className="h-3.5 w-3.5" />批量接收 ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><PackageSearch className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">样品总数</p><p className="text-lg font-semibold">{currentStats.total}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-4/10 p-2"><Inbox className="h-4 w-4 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">待接收</p><p className="text-lg font-semibold">{currentStats.pending}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><ClipboardCheck className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">已接收</p><p className="text-lg font-semibold">{currentStats.received}</p></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="parent_seed" className="gap-1.5"><Wheat className="h-4 w-4" />亲本种子样品</TabsTrigger>
          <TabsTrigger value="sowing" className="gap-1.5"><Sprout className="h-4 w-4" />播种样品</TabsTrigger>
          <TabsTrigger value="leaf" className="gap-1.5"><Leaf className="h-4 w-4" />叶片样品</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索批次号、接样单号、品种、企业..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="状态" /></SelectTrigger><SelectContent><SelectItem value="all">全部状态</SelectItem><SelectItem value="pending">待接收</SelectItem><SelectItem value="received">已接收</SelectItem></SelectContent></Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={filtered.filter((e) => e.status === "pending").length > 0 && filtered.filter((e) => e.status === "pending").every((e) => selectedIds.has(e.id))}
                          onCheckedChange={toggleSelectAll}
                          disabled={filtered.filter((e) => e.status === "pending").length === 0}
                        />
                      </TableHead>
                      <TableHead className="w-12">序号</TableHead>
                      <TableHead>批次号</TableHead>
                      {activeTab !== "sowing" && <TableHead>接样单编号</TableHead>}
                      <TableHead>作物种类</TableHead>
                      <TableHead>品种名称</TableHead>
                      <TableHead>品种来源</TableHead>
                      {activeTab === "sowing" && <TableHead>取样方式</TableHead>}
                      {activeTab === "sowing" && <TableHead>取样数量</TableHead>}
                      <TableHead>送样人</TableHead>
                      <TableHead>接收人</TableHead>
                      <TableHead>样品状况</TableHead>
                      <TableHead>存放点</TableHead>
                      <TableHead>接收日期</TableHead>
                      <TableHead className="w-16">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={activeTab === "sowing" ? 13 : 12} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
                    ) : filtered.map((item, index) => (
                      <TableRow key={item.id} className={item.status === "pending" ? "bg-chart-4/5" : ""}>
                        <TableCell>
                          {item.status === "pending" && (
                            <Checkbox
                              checked={selectedIds.has(item.id)}
                              onCheckedChange={() => toggleSelect(item.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                        {activeTab !== "sowing" && <TableCell className="font-mono text-sm font-medium">{item.sampleSheetNo}</TableCell>}
                        <TableCell><Badge variant="secondary">{item.cropType}</Badge></TableCell>
                        <TableCell className="font-medium">{item.varietyName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.varietySource}</TableCell>
                        {activeTab === "sowing" && <TableCell>{item.samplingMethod ? <Badge variant="outline">{samplingMethodConfig[item.samplingMethod]}</Badge> : "—"}</TableCell>}
                        {activeTab === "sowing" && <TableCell className="font-mono text-sm">{item.sampleQuantity || "—"}</TableCell>}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={senderTypeConfig[item.senderType].variant} className="text-xs">
                              {senderTypeConfig[item.senderType].label}
                            </Badge>
                            <span className="text-sm">{item.sender}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.receivePerson || "—"}</TableCell>
                        <TableCell>
                          {item.sampleCondition ? (
                            <Badge variant={conditionConfig[item.sampleCondition].variant}>
                              {conditionConfig[item.sampleCondition].label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.storageLocation || "—"}</TableCell>
                        <TableCell className="text-sm">{item.receiveDate || "—"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
                              {item.status === "pending" && (
                                <DropdownMenuItem className="gap-2" onClick={() => openSingleReceive(item)}><CheckCircle2 className="h-4 w-4" />确认接收</DropdownMenuItem>
                              )}
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
        </TabsContent>
      </Tabs>

      {/* 查看详情 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>样品详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4">
              <div className="rounded-md bg-muted/50 p-4">
                <div className="grid grid-cols-2 gap-3">
                  {viewingItem.source !== "sowing" && (
                    <div><p className="text-sm text-muted-foreground">接样单编号</p><p className="font-mono text-primary font-semibold">{viewingItem.sampleSheetNo}</p></div>
                  )}
                  <div><p className="text-sm text-muted-foreground">批次号</p><p className="font-mono font-medium">{viewingItem.batchNo}</p></div>
                  {viewingItem.source === "sowing" && viewingItem.samplingMethod && (
                    <div><p className="text-sm text-muted-foreground">取样方式</p><Badge variant="outline">{samplingMethodConfig[viewingItem.samplingMethod]}</Badge></div>
                  )}
                  {viewingItem.source === "sowing" && viewingItem.sampleQuantity && (
                    <div><p className="text-sm text-muted-foreground">取样数量</p><p className="font-mono font-medium">{viewingItem.sampleQuantity}</p></div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">作物种类</p><Badge variant="secondary">{viewingItem.cropType}</Badge></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种名称</p><p className="font-medium">{viewingItem.varietyName}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种来源</p><p>{viewingItem.varietySource}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">企业名称</p><p>{viewingItem.enterpriseName}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">送样人</p>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={senderTypeConfig[viewingItem.senderType].variant} className="text-xs">{senderTypeConfig[viewingItem.senderType].label}</Badge>
                    <span>{viewingItem.sender}</span>
                  </div>
                </div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">接收人</p><p>{viewingItem.receivePerson || "—"}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">样品状况</p>
                  {viewingItem.sampleCondition ? <Badge variant={conditionConfig[viewingItem.sampleCondition].variant}>{conditionConfig[viewingItem.sampleCondition].label}</Badge> : <span className="text-muted-foreground">—</span>}
                </div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">存放点</p><p className="font-mono">{viewingItem.storageLocation || "—"}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">接收日期</p><p>{viewingItem.receiveDate || "—"}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">状态</p><Badge variant={viewingItem.status === "pending" ? "outline" : "default"}>{viewingItem.status === "pending" ? "待接收" : "已接收"}</Badge></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">同步时间</p><p>{viewingItem.createdAt}</p></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 单个接收 */}
      <Dialog open={singleReceiveOpen} onOpenChange={setSingleReceiveOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>确认接收样品</DialogTitle><DialogDescription>录入接收信息后确认样品入库</DialogDescription></DialogHeader>
          {receivingItem && (
            <div className="grid gap-4 py-4">
              <div className="rounded-md bg-muted/50 p-3 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">接样单号：</span><span className="font-mono font-medium">{receivingItem.sampleSheetNo}</span></div>
                <div><span className="text-muted-foreground">批次号：</span><span className="font-mono">{receivingItem.batchNo}</span></div>
                <div><span className="text-muted-foreground">品种：</span><span>{receivingItem.varietyName}</span></div>
                <div><span className="text-muted-foreground">送样人：</span><span>{receivingItem.sender}</span></div>
              </div>
              <div className="space-y-2">
                <Label>接收人 *</Label>
                <Input placeholder="当前系统操作人" value={singleForm.receivePerson} onChange={(e) => setSingleForm((p) => ({ ...p, receivePerson: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>样品状况 *</Label>
                <Select value={singleForm.sampleCondition} onValueChange={(v) => setSingleForm((p) => ({ ...p, sampleCondition: v as "intact" | "abnormal" }))}>
                  <SelectTrigger><SelectValue placeholder="请选择样品状况" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intact">完好</SelectItem>
                    <SelectItem value="abnormal">异常</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>存放点 *</Label>
                <Input placeholder="如：A-01-03" value={singleForm.storageLocation} onChange={(e) => setSingleForm((p) => ({ ...p, storageLocation: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>接收日期</Label>
                <Input type="date" value={singleForm.receiveDate} onChange={(e) => setSingleForm((p) => ({ ...p, receiveDate: e.target.value }))} />
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setSingleReceiveOpen(false)}>取消</Button><Button onClick={handleSingleReceive} disabled={!singleForm.receivePerson || !singleForm.sampleCondition || !singleForm.storageLocation}><CheckCheck className="h-4 w-4 mr-1" />确认接收</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量接收 */}
      <Dialog open={batchReceiveOpen} onOpenChange={setBatchReceiveOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>批量确认接收</DialogTitle><DialogDescription>已选择 {selectedIds.size} 个样品，统一录入接收信息</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-md bg-chart-2/5 border border-chart-2/20 p-3 text-sm">
              <p className="font-medium">已选样品：{selectedIds.size} 个</p>
              <p className="text-muted-foreground mt-1">批量接收将统一设置接收人、存放点前缀和接收日期，样品状况默认为"完好"</p>
            </div>
            <div className="space-y-2">
              <Label>接收人 *</Label>
              <Input placeholder="当前系统操作人" value={batchForm.receivePerson} onChange={(e) => setBatchForm((p) => ({ ...p, receivePerson: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>存放点前缀</Label>
              <Input placeholder="如：A-01，系统自动追加序号" value={batchForm.storageLocation} onChange={(e) => setBatchForm((p) => ({ ...p, storageLocation: e.target.value }))} />
              <p className="text-xs text-muted-foreground">如输入 A-01，则存放点依次为 A-01-01、A-01-02...</p>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBatchReceiveOpen(false)}>取消</Button><Button onClick={handleBatchReceive} disabled={!batchForm.receivePerson}><CheckCheck className="h-4 w-4 mr-1" />确认批量接收</Button></DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
