"use client";

import { useState, useMemo } from "react";
import {
  Shuffle, Eye, FileText, CheckCircle2, Trash2, MoreHorizontal, Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ---------- 类型定义 ---------- */

interface SamplingDetail {
  id: string;
  serialNo: number;
  fieldName: string;
  area: string;
  company: string;
  cropType: string;
  variety: string;
  location: string;
  status: "pending" | "dispatched"; // 每行独立状态
}

interface SamplingTask {
  id: string;
  taskNo: string;
  taskName: string;
  region: string;
  enterprise: string;
  createdAt: string;
  details: SamplingDetail[];
  varietyCoverage: { variety: string; totalCount: number; sampledCount: number }[];
}

/* ---------- 模拟乡镇明细表数据（数据源） ---------- */

const townshipSourceData: (SamplingDetail & { township: string })[] = [
  { id: "s1", serialNo: 1, fieldName: "A-001地块", area: "15亩", company: "丰源种业有限公司", cropType: "水稻", variety: "杂交水稻Y两优900", township: "城关镇", location: "城关镇东村", status: "pending" },
  { id: "s2", serialNo: 2, fieldName: "A-002地块", area: "20亩", company: "丰源种业有限公司", cropType: "水稻", variety: "杂交水稻Y两优900", township: "城关镇", location: "城关镇西村", status: "pending" },
  { id: "s3", serialNo: 3, fieldName: "B-001地块", area: "12亩", company: "绿丰农业科技有限公司", cropType: "水稻", variety: "C两优华占", township: "河东镇", location: "河东镇南村", status: "pending" },
  { id: "s4", serialNo: 4, fieldName: "B-002地块", area: "18亩", company: "绿丰农业科技有限公司", cropType: "小麦", variety: "济麦22", township: "河东镇", location: "河东镇北村", status: "pending" },
  { id: "s5", serialNo: 5, fieldName: "C-001地块", area: "25亩", company: "金种子农业发展公司", cropType: "玉米", variety: "郑单958", township: "河西镇", location: "河西镇中心", status: "pending" },
  { id: "s6", serialNo: 6, fieldName: "C-002地块", area: "10亩", company: "金种子农业发展公司", cropType: "玉米", variety: "先玉335", township: "河西镇", location: "河西镇东村", status: "pending" },
  { id: "s7", serialNo: 7, fieldName: "D-001地块", area: "22亩", company: "禾盛种业科技有限公司", cropType: "棉花", variety: "鲁棉研28", township: "南阳镇", location: "南阳镇西村", status: "pending" },
  { id: "s8", serialNo: 8, fieldName: "D-002地块", area: "16亩", company: "禾盛种业科技有限公司", cropType: "油菜", variety: "华油杂62", township: "南阳镇", location: "南阳镇南村", status: "pending" },
  { id: "s9", serialNo: 9, fieldName: "E-001地块", area: "30亩", company: "瑞丰农业科技有限公司", cropType: "水稻", variety: "杂交水稻Y两优900", township: "北城镇", location: "北城镇中心", status: "pending" },
  { id: "s10", serialNo: 10, fieldName: "E-002地块", area: "14亩", company: "瑞丰农业科技有限公司", cropType: "小麦", variety: "济麦22", township: "北城镇", location: "北城镇东村", status: "pending" },
  { id: "s11", serialNo: 11, fieldName: "F-001地块", area: "18亩", company: "天禾种业有限责任公司", cropType: "水稻", variety: "C两优华占", township: "西关镇", location: "西关镇北村", status: "pending" },
  { id: "s12", serialNo: 12, fieldName: "F-002地块", area: "20亩", company: "天禾种业有限责任公司", cropType: "玉米", variety: "郑单958", township: "西关镇", location: "西关镇中心", status: "pending" },
];

const regionOptions = ["全部", "城关镇", "河东镇", "河西镇", "南阳镇", "北城镇", "西关镇"];
const enterpriseOptions = ["全部", "丰源种业有限公司", "绿丰农业科技有限公司", "金种子农业发展公司", "禾盛种业科技有限公司", "瑞丰农业科技有限公司", "天禾种业有限责任公司"];
const samplerOptions = ["李明", "王强", "张伟", "赵刚", "刘洋"];

/* ---------- 页面组件 ---------- */

export default function CountySamplingDetailPage() {
  const [tasks, setTasks] = useState<SamplingTask[]>([
    {
      id: "t1",
      taskNo: "YC2024001",
      taskName: "叶片抽检任务第一批",
      region: "全部",
      enterprise: "全部",
      createdAt: "2024-06-15",
      details: [
        { id: "d1", serialNo: 1, fieldName: "A-001地块", area: "15亩", company: "丰源种业有限公司", cropType: "水稻", variety: "杂交水稻Y两优900", location: "城关镇东村", status: "dispatched" },
        { id: "d2", serialNo: 2, fieldName: "B-001地块", area: "12亩", company: "绿丰农业科技有限公司", cropType: "水稻", variety: "C两优华占", location: "河东镇南村", status: "dispatched" },
        { id: "d3", serialNo: 3, fieldName: "C-001地块", area: "25亩", company: "金种子农业发展公司", cropType: "玉米", variety: "郑单958", location: "河西镇中心", status: "dispatched" },
        { id: "d4", serialNo: 4, fieldName: "D-001地块", area: "22亩", company: "禾盛种业科技有限公司", cropType: "棉花", variety: "鲁棉研28", location: "南阳镇西村", status: "dispatched" },
        { id: "d5", serialNo: 5, fieldName: "E-001地块", area: "30亩", company: "瑞丰农业科技有限公司", cropType: "水稻", variety: "杂交水稻Y两优900", location: "北城镇中心", status: "dispatched" },
      ],
      varietyCoverage: [
        { variety: "杂交水稻Y两优900", totalCount: 3, sampledCount: 2 },
        { variety: "C两优华占", totalCount: 2, sampledCount: 1 },
        { variety: "郑单958", totalCount: 2, sampledCount: 1 },
        { variety: "鲁棉研28", totalCount: 1, sampledCount: 1 },
      ],
    },
    {
      id: "t2",
      taskNo: "YC2024002",
      taskName: "叶片抽检任务第二批",
      region: "城关镇",
      enterprise: "丰源种业有限公司",
      createdAt: "2024-07-01",
      details: [
        { id: "d6", serialNo: 1, fieldName: "A-002地块", area: "20亩", company: "丰源种业有限公司", cropType: "水稻", variety: "杂交水稻Y两优900", location: "城关镇西村", status: "pending" },
        { id: "d7", serialNo: 2, fieldName: "F-001地块", area: "18亩", company: "天禾种业有限责任公司", cropType: "水稻", variety: "C两优华占", location: "西关镇北村", status: "pending" },
        { id: "d8", serialNo: 3, fieldName: "B-002地块", area: "18亩", company: "绿丰农业科技有限公司", cropType: "小麦", variety: "济麦22", location: "河东镇北村", status: "pending" },
        { id: "d9", serialNo: 4, fieldName: "C-002地块", area: "10亩", company: "金种子农业发展公司", cropType: "玉米", variety: "先玉335", location: "河西镇东村", status: "pending" },
        { id: "d10", serialNo: 5, fieldName: "E-002地块", area: "14亩", company: "瑞丰农业科技有限公司", cropType: "小麦", variety: "济麦22", location: "北城镇东村", status: "pending" },
      ],
      varietyCoverage: [
        { variety: "杂交水稻Y两优900", totalCount: 3, sampledCount: 1 },
        { variety: "C两优华占", totalCount: 2, sampledCount: 1 },
        { variety: "济麦22", totalCount: 2, sampledCount: 2 },
        { variety: "先玉335", totalCount: 1, sampledCount: 1 },
      ],
    },
  ]);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [genRegion, setGenRegion] = useState("全部");
  const [genEnterprise, setGenEnterprise] = useState("全部");
  const [genSamplePerVariety, setGenSamplePerVariety] = useState("1");
  const [genTaskName, setGenTaskName] = useState("");
  const [previewDetails, setPreviewDetails] = useState<SamplingDetail[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<SamplingTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<SamplingTask | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 单行生成扦样单
  const [samplingFormOpen, setSamplingFormOpen] = useState(false);
  const [samplingTarget, setSamplingTarget] = useState<{ task: SamplingTask; detail: SamplingDetail } | null>(null);
  const [samplingSampler, setSamplingSampler] = useState("");
  const [samplingDeadline, setSamplingDeadline] = useState("");
  const [samplingQuantity, setSamplingQuantity] = useState("");
  const [samplingSuccessOpen, setSamplingSuccessOpen] = useState(false);

  // 批量生成扦样单
  const [batchSamplingTask, setBatchSamplingTask] = useState<SamplingTask | null>(null);
  const [batchSamplingOpen, setBatchSamplingOpen] = useState(false);
  const [batchSampler, setBatchSampler] = useState("");
  const [batchDeadline, setBatchDeadline] = useState("");
  const [batchQuantity, setBatchQuantity] = useState("");

  /* 数据源筛选 */
  const filteredSourceData = useMemo(() => {
    return townshipSourceData.filter((s) => {
      if (genRegion !== "全部" && s.township !== genRegion) return false;
      if (genEnterprise !== "全部" && s.company !== genEnterprise) return false;
      return true;
    });
  }, [genRegion, genEnterprise]);

  const allVarieties = useMemo(() => {
    return [...new Set(filteredSourceData.map((s) => s.variety))];
  }, [filteredSourceData]);

  /* 随机抽检预览 */
  const handlePreviewGenerate = () => {
    const samplePerVariety = parseInt(genSamplePerVariety);
    const selected: SamplingDetail[] = [];

    allVarieties.forEach((variety) => {
      const varietyRecords = filteredSourceData.filter((s) => s.variety === variety);
      const count = Math.min(Math.max(samplePerVariety, 1), varietyRecords.length);
      const shuffled = [...varietyRecords].sort(() => Math.random() - 0.5);
      shuffled.slice(0, count).forEach((s) => {
        selected.push({
          ...s,
          status: "pending" as const,
        });
      });
    });

    selected.forEach((s, i) => { s.serialNo = i + 1; });
    setPreviewDetails(selected);
  };

  /* 确认生成任务 */
  const handleGenerate = () => {
    if (previewDetails.length === 0) return;

    const varietyCoverage = allVarieties.map((v) => {
      const totalCount = filteredSourceData.filter((s) => s.variety === v).length;
      const sampledCount = previewDetails.filter((s) => s.variety === v).length;
      return { variety: v, totalCount, sampledCount };
    });

    const taskSeq = tasks.length + 1;
    const newTask: SamplingTask = {
      id: `t${Date.now()}`,
      taskNo: `YC${new Date().getFullYear()}${String(taskSeq).padStart(3, "0")}`,
      taskName: genTaskName || `叶片抽检任务第${taskSeq}批`,
      region: genRegion,
      enterprise: genEnterprise,
      createdAt: new Date().toISOString().split("T")[0],
      details: previewDetails.map((d) => ({ ...d, id: `d${Date.now()}-${d.serialNo}` })),
      varietyCoverage,
    };

    setTasks((prev) => [newTask, ...prev]);
    setPreviewDetails([]);
    setGenTaskName("");
    setGenerateOpen(false);
  };

  /* 导出CSV */
  const handleExport = (task: SamplingTask) => {
    const headers = ["序号", "地块名称", "面积", "制种公司", "作物种类", "品种", "地块位置", "状态"];
    const rows = task.details.map((d) => [
      d.serialNo, d.fieldName, d.area, d.company, d.cropType, d.variety, d.location,
      d.status === "dispatched" ? "已下发" : "待执行",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${task.taskName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* 打开单行生成扦样单对话框 */
  const openSamplingForm = (task: SamplingTask, detail: SamplingDetail) => {
    setSamplingTarget({ task, detail });
    setSamplingSampler("");
    setSamplingDeadline("");
    setSamplingQuantity("");
    setSamplingFormOpen(true);
  };

  /* 确认生成扦样单（单行） */
  const handleGenerateSamplingForm = () => {
    if (!samplingTarget || !samplingSampler || !samplingDeadline || !samplingQuantity) return;

    const { task, detail } = samplingTarget;

    // 更新该行状态为已下发
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== task.id) return t;
        return {
          ...t,
          details: t.details.map((d) =>
            d.id === detail.id ? { ...d, status: "dispatched" as const } : d
          ),
        };
      })
    );

    // 同步到接样单管理
    try {
      const existing = JSON.parse(localStorage.getItem("inspection_records") || "[]");
      existing.push({
        id: `leaf-${detail.id}-${Date.now()}`,
        receiptNo: `JYD${new Date().getFullYear()}${String(existing.length + 1).padStart(4, "0")}`,
        batchNo: `LP-${new Date().getFullYear()}-${String(detail.serialNo).padStart(3, "0")}`,
        enterpriseName: detail.company,
        cropType: detail.cropType,
        varietyName: detail.variety,
        varietySource: "叶片扦样",
        deliveryMethod: "county",
        samplePerson: samplingSampler,
        sampleQuantity: samplingQuantity,
        sampleDeadline: samplingDeadline,
        deliveryStatus: "pending_sample",
        source: "leaf",
        createdAt: new Date().toISOString().split("T")[0],
      });
      localStorage.setItem("inspection_records", JSON.stringify(existing));
    } catch { /* ignore */ }

    setSamplingFormOpen(false);
    setSamplingSuccessOpen(true);
  };

  /* 删除任务 */
  const handleDelete = () => {
    if (!deletingTask) return;
    setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
    setDeleteOpen(false);
    setDeletingTask(null);
  };

  /* 批量生成扦样单 */
  const handleBatchSamplingSubmit = () => {
    if (!batchSamplingTask || !batchSampler || !batchDeadline || !batchQuantity) return;

    const pendingDetails = batchSamplingTask.details.filter((d) => d.status === "pending");

    // 更新所有待执行行为已下发
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== batchSamplingTask.id) return t;
        return {
          ...t,
          details: t.details.map((d) =>
            d.status === "pending" ? { ...d, status: "dispatched" as const } : d
          ),
        };
      })
    );

    // 批量同步到接样单管理
    try {
      const existing = JSON.parse(localStorage.getItem("inspection_records") || "[]");
      pendingDetails.forEach((detail) => {
        existing.push({
          id: `leaf-${detail.id}-${Date.now()}`,
          receiptNo: `JYD${new Date().getFullYear()}${String(existing.length + 1).padStart(4, "0")}`,
          batchNo: `LP-${new Date().getFullYear()}-${String(detail.serialNo).padStart(3, "0")}`,
          enterpriseName: detail.company,
          cropType: detail.cropType,
          varietyName: detail.variety,
          varietySource: "叶片扦样",
          deliveryMethod: "county",
          samplePerson: batchSampler,
          sampleQuantity: batchQuantity,
          sampleDeadline: batchDeadline,
          deliveryStatus: "pending_sample",
          source: "leaf",
          createdAt: new Date().toISOString().split("T")[0],
        });
      });
      localStorage.setItem("inspection_records", JSON.stringify(existing));
    } catch { /* ignore */ }

    setBatchSamplingOpen(false);
    setBatchSamplingTask(null);
    setBatchSampler("");
    setBatchDeadline("");
    setBatchQuantity("");
  };

  /* 统计 */
  const totalTasks = tasks.length;
  const totalPending = tasks.reduce((acc, t) => acc + t.details.filter((d) => d.status === "pending").length, 0);
  const totalDispatched = tasks.reduce((acc, t) => acc + t.details.filter((d) => d.status === "dispatched").length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">叶片抽检任务管理</h1>
          <p className="text-sm text-muted-foreground mt-1">基于乡镇制种明细表按品种面积比例分层随机抽样，生成叶片抽检任务</p>
        </div>
        <Button onClick={() => { setGenRegion("全部"); setGenEnterprise("全部"); setPreviewDetails([]); setGenTaskName(""); setGenerateOpen(true); }}>
          <Shuffle className="mr-2 h-4 w-4" />
          生成抽检任务
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{totalTasks}</div><div className="text-xs text-muted-foreground">任务总数</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{totalPending}</div><div className="text-xs text-muted-foreground">待执行地块</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{totalDispatched}</div><div className="text-xs text-muted-foreground">已下发地块</div></CardContent></Card>
      </div>

      {/* 任务列表 */}
      {tasks.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">暂无叶片抽检任务，点击上方按钮生成</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const pendingCount = task.details.filter((d) => d.status === "pending").length;
            const dispatchedCount = task.details.filter((d) => d.status === "dispatched").length;
            const taskComplete = pendingCount === 0;

            return (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground font-mono">{task.taskNo}</span>
                        <h3 className="font-semibold text-lg">{task.taskName}</h3>
                        <Badge variant={taskComplete ? "default" : "outline"}>
                          {taskComplete ? "全部已下发" : `${pendingCount}条待执行`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        区域：{task.region} | 企业：{task.enterprise} | 创建：{task.createdAt} | 地块：{task.details.length}块（已下发 {dispatchedCount}，待执行 {pendingCount}）
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setViewingTask(task); setViewOpen(true); }}>
                        <Eye className="mr-1 h-4 w-4" />查看明细
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExport(task)}>
                        <FileText className="mr-1 h-4 w-4" />导出
                      </Button>
                      {!taskComplete && (
                        <Button size="sm" onClick={() => { setBatchSamplingTask(task); setBatchSampler(""); setBatchDeadline(""); setBatchQuantity(""); setBatchSamplingOpen(true); }}>
                          <FileText className="mr-1 h-4 w-4" />批量生成扦样单
                        </Button>
                      )}
                      {!taskComplete && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingTask(task); setDeleteOpen(true); }}>
                              <Trash2 className="mr-2 h-4 w-4" />删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* 品种覆盖情况 */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">品种覆盖情况：</p>
                    <div className="flex flex-wrap gap-2">
                      {task.varietyCoverage.map((vc) => {
                        const actualSampled = task.details.filter((d) => d.variety === vc.variety && d.status === "dispatched").length;
                        return (
                          <Badge
                            key={vc.variety}
                            variant={actualSampled > 0 ? "default" : "outline"}
                            className={actualSampled === 0 ? "border-red-300 text-red-600" : ""}
                          >
                            {actualSampled > 0 ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                            {vc.variety} ({actualSampled}/{vc.totalCount})
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* 预览表格（前3条） */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">序号</TableHead>
                        <TableHead>地块名称</TableHead>
                        <TableHead>面积</TableHead>
                        <TableHead>制种公司</TableHead>
                        <TableHead>作物种类</TableHead>
                        <TableHead>品种</TableHead>
                        <TableHead>地块位置</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {task.details.slice(0, 3).map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>{d.serialNo}</TableCell>
                          <TableCell>{d.fieldName}</TableCell>
                          <TableCell>{d.area}</TableCell>
                          <TableCell>{d.company}</TableCell>
                          <TableCell>{d.cropType}</TableCell>
                          <TableCell>{d.variety}</TableCell>
                          <TableCell>{d.location}</TableCell>
                          <TableCell>
                            <Badge variant={d.status === "dispatched" ? "default" : "outline"}>
                              {d.status === "dispatched" ? "已下发" : "待执行"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {task.details.length > 3 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground text-sm">
                            ... 共 {task.details.length} 条，点击"查看明细"展开全部
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 生成抽检任务对话框 */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              生成叶片抽检任务
            </DialogTitle>
            <DialogDescription>
              系统将基于乡镇制种明细表按品种面积比例分层随机抽样，确保每个品种组合至少抽1个地块。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>项目名称</Label>
              <Input
                placeholder="请输入项目名称"
                value={genTaskName}
                onChange={(e) => setGenTaskName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>区域</Label>
                <Select value={genRegion} onValueChange={(v) => { setGenRegion(v); setPreviewDetails([]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>企业</Label>
                <Select value={genEnterprise} onValueChange={(v) => { setGenEnterprise(v); setPreviewDetails([]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {enterpriseOptions.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>每品种最少抽检地块数</Label>
              <Select value={genSamplePerVariety} onValueChange={setGenSamplePerVariety}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1个地块</SelectItem>
                  <SelectItem value="2">2个地块</SelectItem>
                  <SelectItem value="3">3个地块</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-sm font-medium">数据源概况</p>
              <p className="text-xs text-muted-foreground">
                筛选后乡镇制种明细表共 <span className="font-medium text-foreground">{filteredSourceData.length}</span> 条记录，
                涵盖 <span className="font-medium text-foreground">{allVarieties.length}</span> 个品种（组合）
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {allVarieties.map((v) => {
                  const count = filteredSourceData.filter((s) => s.variety === v).length;
                  return (
                    <Badge key={v} variant="outline" className="text-xs">{v}({count})</Badge>
                  );
                })}
              </div>
            </div>

            {/* 预览结果 */}
            {previewDetails.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">随机抽检预览（{previewDetails.length}个地块）</p>
                  <Button variant="outline" size="sm" onClick={handlePreviewGenerate}>
                    <Shuffle className="mr-1 h-3 w-3" />重新随机
                  </Button>
                </div>
                <div className="max-h-[240px] overflow-y-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">序号</TableHead>
                        <TableHead>地块名称</TableHead>
                        <TableHead>面积</TableHead>
                        <TableHead>制种公司</TableHead>
                        <TableHead>作物</TableHead>
                        <TableHead>品种</TableHead>
                        <TableHead>地块位置</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewDetails.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>{d.serialNo}</TableCell>
                          <TableCell>{d.fieldName}</TableCell>
                          <TableCell>{d.area}</TableCell>
                          <TableCell>{d.company}</TableCell>
                          <TableCell>{d.cropType}</TableCell>
                          <TableCell>{d.variety}</TableCell>
                          <TableCell>{d.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>取消</Button>
            {previewDetails.length === 0 ? (
              <Button onClick={handlePreviewGenerate}>
                <Shuffle className="mr-2 h-4 w-4" />随机抽检
              </Button>
            ) : (
              <Button onClick={handleGenerate}>
                <CheckCircle2 className="mr-2 h-4 w-4" />确认生成
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看明细对话框 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {viewingTask?.taskNo} - {viewingTask?.taskName}
            </DialogTitle>
            <DialogDescription>抽检地块详细信息，每条可单独生成扦样单</DialogDescription>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* 品种覆盖 */}
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium mb-2">品种覆盖情况</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {viewingTask.varietyCoverage.map((vc) => {
                    const actualSampled = viewingTask.details.filter((d) => d.variety === vc.variety && d.status === "dispatched").length;
                    return (
                      <div key={vc.variety} className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${actualSampled === 0 ? "border-red-200 bg-red-50 dark:bg-red-950/20" : "border-green-200 bg-green-50 dark:bg-green-950/20"}`}>
                        <span className="truncate mr-2">{vc.variety}</span>
                        <span className={`font-medium ${actualSampled === 0 ? "text-red-600" : "text-green-700 dark:text-green-400"}`}>
                          {actualSampled}/{vc.totalCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 完整明细表（每行可操作） */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">序号</TableHead>
                    <TableHead>地块名称</TableHead>
                    <TableHead>面积</TableHead>
                    <TableHead>制种公司</TableHead>
                    <TableHead>作物种类</TableHead>
                    <TableHead>品种</TableHead>
                    <TableHead>地块位置</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-32">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingTask.details.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.serialNo}</TableCell>
                      <TableCell>{d.fieldName}</TableCell>
                      <TableCell>{d.area}</TableCell>
                      <TableCell>{d.company}</TableCell>
                      <TableCell>{d.cropType}</TableCell>
                      <TableCell>{d.variety}</TableCell>
                      <TableCell>{d.location}</TableCell>
                      <TableCell>
                        <Badge variant={d.status === "dispatched" ? "default" : "outline"}>
                          {d.status === "dispatched" ? "已下发" : "待执行"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {d.status === "pending" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSamplingForm(viewingTask, d)}
                          >
                            <FileText className="mr-1 h-3 w-3" />生成扦样单
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">已下发</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter className="shrink-0">
            {viewingTask && viewingTask.details.some((d) => d.status === "pending") && (
              <Button onClick={() => { setBatchSamplingTask(viewingTask); setBatchSampler(""); setBatchDeadline(""); setBatchQuantity(""); setBatchSamplingOpen(true); }}>
                <FileText className="mr-2 h-4 w-4" />批量生成扦样单
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 生成扦样单对话框（单行） */}
      <Dialog open={samplingFormOpen} onOpenChange={setSamplingFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              生成扦样单
            </DialogTitle>
            <DialogDescription>
              为「{samplingTarget?.detail.fieldName}」（{samplingTarget?.detail.variety}）生成扦样单，确认后即下发。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-sm"><span className="text-muted-foreground">地块名称：</span>{samplingTarget?.detail.fieldName}</p>
              <p className="text-sm"><span className="text-muted-foreground">面积：</span>{samplingTarget?.detail.area}</p>
              <p className="text-sm"><span className="text-muted-foreground">制种公司：</span>{samplingTarget?.detail.company}</p>
              <p className="text-sm"><span className="text-muted-foreground">作物/品种：</span>{samplingTarget?.detail.cropType} / {samplingTarget?.detail.variety}</p>
              <p className="text-sm"><span className="text-muted-foreground">地块位置：</span>{samplingTarget?.detail.location}</p>
            </div>
            <div className="space-y-2">
              <Label>取样人 <span className="text-destructive">*</span></Label>
              <Select value={samplingSampler} onValueChange={setSamplingSampler}>
                <SelectTrigger><SelectValue placeholder="选择取样人" /></SelectTrigger>
                <SelectContent>
                  {samplerOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>取样截止时间 <span className="text-destructive">*</span></Label>
              <Input type="date" value={samplingDeadline} onChange={(e) => setSamplingDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>取样量 <span className="text-destructive">*</span></Label>
              <Input placeholder="如：2kg" value={samplingQuantity} onChange={(e) => setSamplingQuantity(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSamplingFormOpen(false)}>取消</Button>
            <Button
              onClick={handleGenerateSamplingForm}
              disabled={!samplingSampler || !samplingDeadline || !samplingQuantity}
            >
              <Send className="mr-2 h-4 w-4" />
              确认生成并下发
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 生成成功提示 */}
      <Dialog open={samplingSuccessOpen} onOpenChange={setSamplingSuccessOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              扦样单已生成
            </DialogTitle>
            <DialogDescription>
              扦样单已成功生成并下发，数据已同步至接样单管理页面，取样人可在移动端查看任务。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSamplingSuccessOpen(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量生成扦样单对话框 */}
      <Dialog open={batchSamplingOpen} onOpenChange={setBatchSamplingOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              批量生成扦样单
            </DialogTitle>
            <DialogDescription>
              为「{batchSamplingTask?.taskName}」中所有待执行地块批量生成扦样单，确认后全部下发。
              共 {batchSamplingTask?.details.filter((d) => d.status === "pending").length} 个待执行地块。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>取样人 <span className="text-destructive">*</span></Label>
              <Select value={batchSampler} onValueChange={setBatchSampler}>
                <SelectTrigger><SelectValue placeholder="选择取样人" /></SelectTrigger>
                <SelectContent>
                  {samplerOptions.map((s: string) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>取样截止时间 <span className="text-destructive">*</span></Label>
              <Input type="date" value={batchDeadline} onChange={(e) => setBatchDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>取样量 <span className="text-destructive">*</span></Label>
              <Input placeholder="如：2kg" value={batchQuantity} onChange={(e) => setBatchQuantity(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchSamplingOpen(false)}>取消</Button>
            <Button onClick={handleBatchSamplingSubmit} disabled={!batchSampler || !batchDeadline || !batchQuantity}>
              确认批量生成并下发
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除对话框 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除该叶片抽检任务吗？此操作不可撤回。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
