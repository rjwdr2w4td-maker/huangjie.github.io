"use client";

import { useState, useCallback } from "react";
import { Upload, Search, Eye, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SelfTestRecord {
  id: string;
  enterprise: string;
  batchNo: string;
  variety: string;
  testType: string;
  testDate: string;
  result: "合格" | "不合格";
  reportUrl: string;
  submitter: string;
  remark: string;
  createdAt: string;
}

const initialData: SelfTestRecord[] = [
  { id: "1", enterprise: "绿源种业", batchNo: "LY-2024-A01", variety: "Y58S", testType: "纯度检测", testDate: "2024-02-10", result: "合格", reportUrl: "", submitter: "王经理", remark: "", createdAt: "2024-02-12" },
  { id: "2", enterprise: "丰收种业", batchNo: "FS-2024-B03", variety: "杂交水稻Y两优900", testType: "发芽率检测", testDate: "2024-04-15", result: "合格", reportUrl: "", submitter: "张总", remark: "", createdAt: "2024-04-17" },
  { id: "3", enterprise: "金穗种业", batchNo: "JS-2024-C02", variety: "玉米郑单958", testType: "纯度检测", testDate: "2024-05-08", result: "不合格", reportUrl: "", submitter: "刘主管", remark: "纯度未达标，已申请复检", createdAt: "2024-05-10" },
];

export default function SelfTestPage() {
  const [data, setData] = useState<SelfTestRecord[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<SelfTestRecord | null>(null);
  const [deletingItem, setDeletingItem] = useState<SelfTestRecord | null>(null);

  const [formEnterprise, setFormEnterprise] = useState("");
  const [formBatchNo, setFormBatchNo] = useState("");
  const [formVariety, setFormVariety] = useState("");
  const [formTestType, setFormTestType] = useState("纯度检测");
  const [formResult, setFormResult] = useState<"合格" | "不合格">("合格");
  const [formSubmitter, setFormSubmitter] = useState("");
  const [formRemark, setFormRemark] = useState("");

  const resetForm = () => {
    setFormEnterprise(""); setFormBatchNo(""); setFormVariety(""); setFormTestType("纯度检测"); setFormResult("合格"); setFormSubmitter(""); setFormRemark("");
  };

  const filtered = data.filter((e) => {
    return e.enterprise.includes(searchTerm) || e.batchNo.includes(searchTerm) || e.variety.includes(searchTerm) || e.submitter.includes(searchTerm);
  });

  const handleAdd = useCallback(() => {
    const newItem: SelfTestRecord = {
      id: Date.now().toString(),
      enterprise: formEnterprise,
      batchNo: formBatchNo,
      variety: formVariety,
      testType: formTestType,
      testDate: new Date().toISOString().split("T")[0],
      result: formResult,
      reportUrl: "",
      submitter: formSubmitter,
      remark: formRemark,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setData((prev) => [newItem, ...prev]);
    resetForm();
    setAddOpen(false);
  }, [formEnterprise, formBatchNo, formVariety, formTestType, formResult, formSubmitter, formRemark]);

  const handleDelete = useCallback(() => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    setDeleteOpen(false);
  }, [deletingItem]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">企业自检数据上报</h1>
          <p className="text-sm text-muted-foreground mt-1">制种企业上传自检数据，数据进入汇总库但不作为执法依据</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Upload className="h-3.5 w-3.5" />上报自检数据</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader><DialogTitle>上报自检数据</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>企业名称 *</Label><Input placeholder="制种企业" value={formEnterprise} onChange={(e) => setFormEnterprise(e.target.value)} /></div>
                <div className="space-y-2"><Label>批次号 *</Label><Input placeholder="如：LY-2024-A01" value={formBatchNo} onChange={(e) => setFormBatchNo(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>品种 *</Label><Input placeholder="品种名称" value={formVariety} onChange={(e) => setFormVariety(e.target.value)} /></div>
                <div className="space-y-2"><Label>检测类型</Label><Input value={formTestType} onChange={(e) => setFormTestType(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>检测结果</Label><div className="flex gap-2"><Button size="sm" variant={formResult === "合格" ? "default" : "outline"} onClick={() => setFormResult("合格")}>合格</Button><Button size="sm" variant={formResult === "不合格" ? "destructive" : "outline"} onClick={() => setFormResult("不合格")}>不合格</Button></div></div>
                <div className="space-y-2"><Label>提交人</Label><Input placeholder="姓名" value={formSubmitter} onChange={(e) => setFormSubmitter(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>备注</Label><Textarea rows={2} value={formRemark} onChange={(e) => setFormRemark(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button><Button onClick={handleAdd} disabled={!formEnterprise || !formBatchNo || !formVariety}>确认上报</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><Upload className="h-4 w-4 text-primary" /></div><div><p className="text-sm text-muted-foreground">上报总数</p><p className="text-lg font-semibold">{data.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-chart-2/10 p-2"><Upload className="h-4 w-4 text-chart-2" /></div><div><p className="text-sm text-muted-foreground">合格</p><p className="text-lg font-semibold">{data.filter((e) => e.result === "合格").length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-md bg-destructive/10 p-2"><Upload className="h-4 w-4 text-destructive" /></div><div><p className="text-sm text-muted-foreground">不合格</p><p className="text-lg font-semibold text-destructive">{data.filter((e) => e.result === "不合格").length}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索企业、批次号、品种..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>企业</TableHead>
                <TableHead>批次号</TableHead>
                <TableHead>品种</TableHead>
                <TableHead>检测类型</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>提交人</TableHead>
                <TableHead>日期</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>{item.enterprise}</TableCell>
                  <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                  <TableCell>{item.variety}</TableCell>
                  <TableCell>{item.testType}</TableCell>
                  <TableCell><Badge variant={item.result === "不合格" ? "destructive" : "outline"}>{item.result}</Badge></TableCell>
                  <TableCell>{item.submitter}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setViewingItem(item); setViewOpen(true); }}><Eye className="h-4 w-4" />查看详情</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>自检数据详情</DialogTitle></DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">企业</p><p>{viewingItem.enterprise}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">批次号</p><p className="font-mono">{viewingItem.batchNo}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">品种</p><p>{viewingItem.variety}</p></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">检测类型</p><p>{viewingItem.testType}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-sm text-muted-foreground">检测结果</p><Badge variant={viewingItem.result === "不合格" ? "destructive" : "outline"}>{viewingItem.result}</Badge></div>
                <div className="space-y-1"><p className="text-sm text-muted-foreground">提交人</p><p>{viewingItem.submitter}</p></div>
              </div>
              <div className="space-y-1"><p className="text-sm text-muted-foreground">检测日期</p><p>{viewingItem.testDate}</p></div>
              {viewingItem.remark && <div className="space-y-1"><p className="text-sm text-muted-foreground">备注</p><p>{viewingItem.remark}</p></div>}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle><AlertDialogDescription>确定要删除「{deletingItem?.enterprise}」的自检记录吗？此操作不可恢复。</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">确认删除</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
