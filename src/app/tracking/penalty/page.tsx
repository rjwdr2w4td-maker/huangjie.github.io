"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Eye, Printer, FileWarning, Building2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PenaltyDoc {
  id: string;
  docNo: string;
  enterpriseName: string;
  batchNo: string;
  cropType: string;
  varietyName: string;
  retestNo: string;
  initialResult: string;
  retestResult: string;
  violationType: string;
  penaltyType: string;
  source: string;
  createdAt: string;
  legalBasis?: string;
  penaltyDetail?: string;
  fineAmount?: string;
  deadline?: string;
  issuer?: string;
  status?: "draft" | "issued";
}

const defaultMockData: PenaltyDoc[] = [
  {
    id: "1", docNo: "CWS20240001", enterpriseName: "绿丰种业", batchNo: "2024-HP-002",
    cropType: "水稻", varietyName: "杂交水稻Y两优900", retestNo: "FJ20240001",
    initialResult: "阳性", retestResult: "阳性", violationType: "转基因成分阳性",
    penaltyType: "责令停止生产、经营", source: "parent", createdAt: "2024-06-20",
    legalBasis: "《中华人民共和国种子法》第四十六条、第七十七条",
    penaltyDetail: "该企业生产的杂交水稻Y两优900种子经初次检测及复检均检出CaMV35S启动子转基因成分，判定为阳性。违反了《中华人民共和国种子法》相关规定。",
    fineAmount: "50000", deadline: "2024-07-20", issuer: "XX县农业农村局", status: "issued",
  },
];

export default function PenaltyPage() {
  const [data, setData] = useState<PenaltyDoc[]>(defaultMockData);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const [viewingItem, setViewingItem] = useState<PenaltyDoc | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  /* 从 localStorage 加载复检管理生成的文书 */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("penalty_documents") || "[]");
    if (stored.length > 0) {
      setData(prev => {
        const existingIds = new Set(prev.map(d => d.docNo));
        const newItems = stored.filter((s: PenaltyDoc) => !existingIds.has(s.docNo));
        return [...prev, ...newItems];
      });
    }
  }, []);

  const filtered = data.filter(d => {
    if (sourceFilter !== "all" && d.source !== sourceFilter) return false;
    if (search && !(d.docNo || "").includes(search) && !(d.enterpriseName || "").includes(search) && !(d.batchNo || "").includes(search)) return false;
    return true;
  });

  const handleIssue = useCallback((item: PenaltyDoc) => {
    setData(prev => prev.map(d => d.id === item.id ? { ...d, status: "issued" as const } : d));
  }, []);

  const handlePrint = useCallback((item: PenaltyDoc) => {
    const printHtml = `
      <html><head><title>行政处罚决定书</title>
      <style>
        body { font-family: "SimSun", serif; margin: 40px 60px; line-height: 2; font-size: 14px; }
        h1 { text-align: center; font-size: 22px; margin-bottom: 30px; letter-spacing: 4px; }
        .doc-no { text-align: right; font-size: 12px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; text-indent: 2em; }
        .sign { margin-top: 60px; text-align: right; }
        .sign p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td, th { border: 1px solid #000; padding: 6px 10px; text-align: center; font-size: 13px; }
        th { background: #f0f0f0; }
      </style></head><body>
      <h1>行政处罚决定书</h1>
      <div class="doc-no">${item.docNo}</div>
      <div class="section">
        <p>当事人：${item.enterpriseName}</p>
      </div>
      <div class="section">
        <p>经本机关调查核实，当事人生产/经营的${item.cropType}品种"${item.varietyName}"（批次号：${item.batchNo}），经初次检测及复检，均检出${item.violationType}。</p>
      </div>
      <div class="section">
        <p><strong>检测情况：</strong></p>
        <table>
          <tr><th>检测阶段</th><th>检测编号</th><th>检测结论</th></tr>
          <tr><td>初次检测</td><td>${item.batchNo}</td><td>${item.initialResult}</td></tr>
          <tr><td>复检</td><td>${item.retestNo}</td><td>${item.retestResult}</td></tr>
        </table>
      </div>
      <div class="section">
        <p>${item.penaltyDetail || `上述行为违反了${item.legalBasis || "《中华人民共和国种子法》相关规定"}，构成生产、经营假种子的违法行为。`}</p>
      </div>
      <div class="section">
        <p><strong>处罚决定：</strong></p>
        <p>1. ${item.penaltyType}；</p>
        ${item.fineAmount ? `<p>2. 处以罚款人民币${item.fineAmount}元；</p>` : ""}
        <p>${item.deadline ? `限于${item.deadline}前履行上述处罚决定。` : ""}</p>
      </div>
      <div class="section">
        <p>如对本处罚决定不服，可自收到本决定书之日起六十日内向上一级农业农村主管部门申请行政复议，或在六个月内依法向人民法院提起行政诉讼。</p>
      </div>
      <div class="sign">
        <p>处罚机关：${item.issuer || "XX县农业农村局"}</p>
        <p>日期：${item.createdAt}</p>
      </div>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(printHtml); w.document.close(); w.print(); }
  }, []);

  const openViewDialog = (item: PenaltyDoc) => { setViewingItem(item); setViewOpen(true); };

  const issuedCount = data.filter(d => d.status === "issued").length;
  const draftCount = data.filter(d => d.status !== "issued").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">处罚文书</h1>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">文书总数</p><p className="text-2xl font-bold">{data.length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">待下达</p><p className="text-2xl font-bold">{draftCount}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">已下达</p><p className="text-2xl font-bold">{issuedCount}</p></CardContent></Card>
      </div>

      {/* 搜索/筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索文书编号、企业、批次号..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="来源筛选" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部来源</SelectItem>
            <SelectItem value="parent">亲本种子</SelectItem>
            <SelectItem value="sowing">播种样品</SelectItem>
            <SelectItem value="leaf">叶片样品</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>文书编号</TableHead>
                <TableHead>企业名称</TableHead>
                <TableHead>批次号</TableHead>
                <TableHead>作物种类</TableHead>
                <TableHead>品种名称</TableHead>
                <TableHead>违法行为</TableHead>
                <TableHead>处罚类型</TableHead>
                <TableHead>罚款金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-24">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
              ) : filtered.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{item.docNo}</TableCell>
                  <TableCell>{item.enterpriseName}</TableCell>
                  <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                  <TableCell>{item.cropType}</TableCell>
                  <TableCell>{item.varietyName}</TableCell>
                  <TableCell><Badge variant="destructive">{item.violationType}</Badge></TableCell>
                  <TableCell>{item.penaltyType}</TableCell>
                  <TableCell>{item.fineAmount ? `¥${item.fineAmount}` : "—"}</TableCell>
                  <TableCell>
                    {item.status === "issued" ? <Badge variant="outline">已下达</Badge> : <Badge variant="secondary">待下达</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="查看" onClick={() => openViewDialog(item)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title="打印" onClick={() => handlePrint(item)}><Printer className="h-4 w-4" /></Button>
                      {item.status !== "issued" && (
                        <Button variant="ghost" size="icon" title="下达" onClick={() => handleIssue(item)}><Scale className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 查看详情 */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0"><DialogTitle>处罚文书详情</DialogTitle><DialogDescription>{viewingItem?.docNo}</DialogDescription></DialogHeader>
          {viewingItem && (
            <div className="overflow-y-auto flex-1 min-h-0 space-y-4">
              {/* 文书信息 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2 mb-3 flex items-center gap-2"><FileWarning className="h-4 w-4" />文书信息</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">文书编号：</span>{viewingItem.docNo}</div>
                  <div><span className="text-muted-foreground">状态：</span>{viewingItem.status === "issued" ? <Badge variant="outline">已下达</Badge> : <Badge variant="secondary">待下达</Badge>}</div>
                  <div><span className="text-muted-foreground">生成日期：</span>{viewingItem.createdAt}</div>
                  <div><span className="text-muted-foreground">处罚机关：</span>{viewingItem.issuer || "XX县农业农村局"}</div>
                </div>
              </div>
              {/* 当事人信息 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2 mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" />当事人信息</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">企业名称：</span>{viewingItem.enterpriseName}</div>
                  <div><span className="text-muted-foreground">批次号：</span>{viewingItem.batchNo}</div>
                  <div><span className="text-muted-foreground">作物种类：</span>{viewingItem.cropType}</div>
                  <div><span className="text-muted-foreground">品种名称：</span>{viewingItem.varietyName}</div>
                </div>
              </div>
              {/* 违法事实 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2 mb-3 flex items-center gap-2"><Scale className="h-4 w-4" />违法事实</p>
                <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                  <div><span className="text-muted-foreground">违法行为：</span><Badge variant="destructive">{viewingItem.violationType}</Badge></div>
                  <div><span className="text-muted-foreground">法律依据：</span>{viewingItem.legalBasis || "《中华人民共和国种子法》"}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                  <div><span className="text-muted-foreground">初次检测结果：</span><Badge variant="destructive">{viewingItem.initialResult}</Badge></div>
                  <div><span className="text-muted-foreground">复检结果：</span><Badge variant="destructive">{viewingItem.retestResult}</Badge></div>
                </div>
                {viewingItem.penaltyDetail && <p className="text-sm bg-muted p-3 rounded mt-2">{viewingItem.penaltyDetail}</p>}
              </div>
              {/* 处罚决定 */}
              <div>
                <p className="text-sm font-semibold border-b pb-2 mb-3">处罚决定</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">处罚类型：</span>{viewingItem.penaltyType}</div>
                  <div><span className="text-muted-foreground">罚款金额：</span>{viewingItem.fineAmount ? `¥${viewingItem.fineAmount}` : "—"}</div>
                  {viewingItem.deadline && <div><span className="text-muted-foreground">履行期限：</span>{viewingItem.deadline}</div>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="shrink-0 flex gap-2">
            <Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button>
            <Button onClick={() => { if (viewingItem) handlePrint(viewingItem); }}><Printer className="h-4 w-4 mr-1" />打印文书</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
