"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Archive, Refrigerator, FileText, Camera, Eye, AlertTriangle } from "lucide-react";

interface SampleArchive {
  id: string;
  sampleNo: string; // 样品编号
  source: "亲本种子" | "叶片抽检";
  sampleType: string; // 样品类型
  company: string;
  variety: string;
  township: string;
  fridgeLocation: string; // 冰箱存档位置
  archiveDate: string;
  retainUntil: string; // 留存到期日
  status: "在存" | "已销毁" | "即将到期";
  inspectionResult?: "阴性" | "阳性";
  hasReport: boolean;
  photoCount: number;
  reportCount: number;
}

const mockArchives: SampleArchive[] = [
  { id: "1", sampleNo: "JYD-2026-0001", source: "亲本种子", sampleType: "亲本种子", company: "隆平高科", variety: "Y58S", township: "新民镇", fridgeLocation: "A-01-01", archiveDate: "2026-03-15", retainUntil: "2026-09-15", status: "在存", inspectionResult: "阴性", hasReport: true, photoCount: 3, reportCount: 1 },
  { id: "2", sampleNo: "JYD-2026-0002", source: "亲本种子", sampleType: "亲本种子", company: "荃银高科", variety: "荃9311A", township: "永安镇", fridgeLocation: "A-01-02", archiveDate: "2026-03-16", retainUntil: "2026-09-16", status: "在存", inspectionResult: "阴性", hasReport: true, photoCount: 2, reportCount: 1 },
  { id: "3", sampleNo: "63-1", source: "叶片抽检", sampleType: "叶片样品", company: "隆平高科", variety: "Y58S/恢28", township: "新民镇", fridgeLocation: "B-03-05", archiveDate: "2026-05-01", retainUntil: "2026-11-01", status: "在存", inspectionResult: "阴性", hasReport: true, photoCount: 5, reportCount: 2 },
  { id: "4", sampleNo: "63-2", source: "叶片抽检", sampleType: "叶片样品", company: "隆平高科", variety: "Y58S/恢28", township: "新民镇", fridgeLocation: "B-03-06", archiveDate: "2026-05-01", retainUntil: "2026-11-01", status: "在存", inspectionResult: "阳性", hasReport: true, photoCount: 6, reportCount: 2 },
  { id: "5", sampleNo: "67-5", source: "叶片抽检", sampleType: "叶片样品", company: "大北农", variety: "京9A/恢68", township: "永安镇", fridgeLocation: "B-04-01", archiveDate: "2026-05-02", retainUntil: "2026-11-02", status: "在存", inspectionResult: "阴性", hasReport: true, photoCount: 4, reportCount: 1 },
  { id: "6", sampleNo: "JYD-2026-0003", source: "亲本种子", sampleType: "亲本种子", company: "大北农", variety: "京9A", township: "和平镇", fridgeLocation: "A-02-01", archiveDate: "2026-03-20", retainUntil: "2026-09-20", status: "即将到期", inspectionResult: "阴性", hasReport: true, photoCount: 2, reportCount: 1 },
  { id: "7", sampleNo: "67-8", source: "叶片抽检", sampleType: "叶片样品", company: "荃银高科", variety: "荃9311A/QR16", township: "永安镇", fridgeLocation: "B-04-03", archiveDate: "2026-04-28", retainUntil: "2026-10-28", status: "在存", inspectionResult: "阴性", hasReport: true, photoCount: 3, reportCount: 1 },
  { id: "8", sampleNo: "JYD-2025-0012", source: "亲本种子", sampleType: "亲本种子", company: "隆平高科", variety: "深51A", township: "新民镇", fridgeLocation: "A-03-01", archiveDate: "2025-03-10", retainUntil: "2025-09-10", status: "已销毁", inspectionResult: "阴性", hasReport: true, photoCount: 2, reportCount: 1 },
];

export default function SampleArchivePage() {
  const [archives, setArchives] = useState<SampleArchive[]>(mockArchives);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<SampleArchive | null>(null);
  const [activeTab, setActiveTab] = useState("samples");

  const filteredArchives = archives.filter((a) => {
    const matchSearch =
      !search ||
      a.sampleNo.includes(search) ||
      a.company.includes(search) ||
      a.variety.includes(search) ||
      a.fridgeLocation.includes(search);
    const matchSource = sourceFilter === "all" || a.source === sourceFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchSource && matchStatus;
  });

  const inStorage = archives.filter((a) => a.status === "在存").length;
  const expiring = archives.filter((a) => a.status === "即将到期").length;
  const positiveArchives = archives.filter((a) => a.inspectionResult === "阳性").length;

  const handleDestroy = (id: string) => {
    setArchives(archives.map((a) => a.id === id ? { ...a, status: "已销毁" as const } : a));
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "在存": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
      case "已销毁": return "bg-muted text-muted-foreground";
      case "即将到期": return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">样品存档</h1>
        <p className="text-muted-foreground mt-1">
          叶片抽检扦样单、结果报告单、取样现场照片、检测结果存档管理，叶片样品存入冰箱留存一个生产季
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="samples">样品存档</TabsTrigger>
          <TabsTrigger value="documents">档案管理</TabsTrigger>
        </TabsList>

        <TabsContent value="samples" className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">在存样品</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inStorage}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">即将到期</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-amber-600">{expiring}</div>
                  {expiring > 0 && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">阳性样品</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{positiveArchives}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">冰箱位置数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Refrigerator className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{new Set(archives.filter(a => a.status !== "已销毁").map(a => a.fridgeLocation.split("-")[0])).size}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索筛选 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索样品编号、公司、品种、冰箱位置..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="来源类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部来源</SelectItem>
                    <SelectItem value="亲本种子">亲本种子</SelectItem>
                    <SelectItem value="叶片抽检">叶片抽检</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="存档状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="在存">在存</SelectItem>
                    <SelectItem value="即将到期">即将到期</SelectItem>
                    <SelectItem value="已销毁">已销毁</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 存档列表 */}
          <Card>
            <CardHeader>
              <CardTitle>样品存档列表</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>样品编号</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>制种公司</TableHead>
                    <TableHead>品种</TableHead>
                    <TableHead>冰箱位置</TableHead>
                    <TableHead>存档日期</TableHead>
                    <TableHead>留存到期</TableHead>
                    <TableHead>检测结果</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArchives.map((archive) => (
                    <TableRow key={archive.id}>
                      <TableCell className="font-medium">{archive.sampleNo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{archive.source}</Badge>
                      </TableCell>
                      <TableCell>{archive.company}</TableCell>
                      <TableCell>{archive.variety}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Refrigerator className="h-3 w-3" />
                          {archive.fridgeLocation}
                        </span>
                      </TableCell>
                      <TableCell>{archive.archiveDate}</TableCell>
                      <TableCell>{archive.retainUntil}</TableCell>
                      <TableCell>
                        {archive.inspectionResult ? (
                          <Badge variant={archive.inspectionResult === "阳性" ? "destructive" : "outline"} className={archive.inspectionResult === "阴性" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : ""}>
                            {archive.inspectionResult}
                          </Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor(archive.status)}>
                          {archive.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedArchive(archive); setDetailDialog(true); }}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          {archive.status === "即将到期" && (
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDestroy(archive.id)}>
                              销毁
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredArchives.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        暂无匹配的存档数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>档案管理</CardTitle>
              <p className="text-sm text-muted-foreground">扦样单、检测结果报告单、取样现场照片、检测结果等文档归档</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <div className="font-medium">扦样单</div>
                    <div className="text-2xl font-bold mt-2">24</div>
                    <div className="text-xs text-muted-foreground mt-1">已归档</div>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Camera className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <div className="font-medium">现场照片</div>
                    <div className="text-2xl font-bold mt-2">156</div>
                    <div className="text-xs text-muted-foreground mt-1">已上传</div>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Archive className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <div className="font-medium">检测报告</div>
                    <div className="text-2xl font-bold mt-2">18</div>
                    <div className="text-xs text-muted-foreground mt-1">已生成</div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  批量导出档案
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 详情对话框 */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>样品存档详情</DialogTitle>
          </DialogHeader>
          {selectedArchive && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">样品编号：</span><span className="font-medium">{selectedArchive.sampleNo}</span></div>
                <div><span className="text-muted-foreground">来源：</span><span className="font-medium">{selectedArchive.source}</span></div>
                <div><span className="text-muted-foreground">制种公司：</span><span className="font-medium">{selectedArchive.company}</span></div>
                <div><span className="text-muted-foreground">品种：</span><span className="font-medium">{selectedArchive.variety}</span></div>
                <div><span className="text-muted-foreground">乡镇：</span><span className="font-medium">{selectedArchive.township}</span></div>
                <div>
                  <span className="text-muted-foreground">冰箱位置：</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Refrigerator className="h-3 w-3" />
                    {selectedArchive.fridgeLocation}
                  </span>
                </div>
                <div><span className="text-muted-foreground">存档日期：</span>{selectedArchive.archiveDate}</div>
                <div><span className="text-muted-foreground">留存到期：</span>{selectedArchive.retainUntil}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">检测结果：</span>
                {selectedArchive.inspectionResult ? (
                  <Badge variant={selectedArchive.inspectionResult === "阳性" ? "destructive" : "outline"}>
                    {selectedArchive.inspectionResult}
                  </Badge>
                ) : "—"}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">存档状态：</span>
                <Badge variant="outline" className={statusColor(selectedArchive.status)}>
                  {selectedArchive.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>报告 {selectedArchive.reportCount} 份</span>
                </div>
                <div className="flex items-center gap-1">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span>照片 {selectedArchive.photoCount} 张</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
