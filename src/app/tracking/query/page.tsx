"use client";

import { useState } from "react";
import { Search, Download, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QueryRecord {
  id: string;
  sampleNo: string;
  variety: string;
  enterprise: string;
  township: string;
  testType: string;
  result: "阴性" | "阳性" | "待检测";
  testDate: string;
  tester: string;
  reportNo: string;
}

const allData: QueryRecord[] = [
  { id: "1", sampleNo: "63-1", variety: "杂交水稻Y两优900", enterprise: "丰收种业", township: "城关镇", testType: "转基因检测", result: "阴性", testDate: "2024-06-07", tester: "张检验", reportNo: "RPT-2024-002" },
  { id: "2", sampleNo: "63-2", variety: "杂交水稻Y两优900", enterprise: "丰收种业", township: "城关镇", testType: "转基因检测", result: "阳性", testDate: "2024-06-07", tester: "张检验", reportNo: "RPT-2024-003" },
  { id: "3", sampleNo: "JY-2024-001", variety: "Y58S", enterprise: "绿源种业", township: "沙河镇", testType: "转基因检测", result: "阴性", testDate: "2024-01-25", tester: "李检验", reportNo: "RPT-2024-001" },
  { id: "4", sampleNo: "58-3", variety: "玉米郑单958", enterprise: "金穗种业", township: "柳林镇", testType: "转基因检测", result: "阳性", testDate: "2024-03-15", tester: "李检验", reportNo: "" },
  { id: "5", sampleNo: "64-1", variety: "小麦郑麦9023", enterprise: "金穗种业", township: "柳林镇", testType: "转基因检测", result: "待检测", testDate: "", tester: "", reportNo: "" },
  { id: "6", sampleNo: "65-1", variety: "玉米郑单958", enterprise: "金穗种业", township: "大河镇", testType: "转基因检测", result: "待检测", testDate: "", tester: "", reportNo: "" },
  { id: "7", sampleNo: "30-1", variety: "杂交水稻C两优608", enterprise: "绿源种业", township: "双河镇", testType: "转基因检测", result: "阴性", testDate: "2024-06-12", tester: "张检验", reportNo: "" },
  { id: "8", sampleNo: "30-2", variety: "杂交水稻C两优608", enterprise: "绿源种业", township: "双河镇", testType: "转基因检测", result: "阴性", testDate: "2024-06-12", tester: "张检验", reportNo: "" },
];

export default function QueryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [townshipFilter, setTownshipFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [varietyFilter, setVarietyFilter] = useState("all");

  const townships = [...new Set(allData.map((d) => d.township))];
  const varieties = [...new Set(allData.map((d) => d.variety))];

  const filtered = allData.filter((e) => {
    const matchesSearch = e.sampleNo.includes(searchTerm) || e.enterprise.includes(searchTerm) || e.tester.includes(searchTerm);
    const matchesTownship = townshipFilter === "all" || e.township === townshipFilter;
    const matchesResult = resultFilter === "all" || e.result === resultFilter;
    const matchesVariety = varietyFilter === "all" || e.variety === varietyFilter;
    return matchesSearch && matchesTownship && matchesResult && matchesVariety;
  });

  const handleExport = () => {
    const headers = ["样品号", "品种", "企业", "乡镇", "检测类型", "结果", "检测日期", "检测人", "报告编号"];
    const rows = filtered.map((e) => [e.sampleNo, e.variety, e.enterprise, e.township, e.testType, e.result, e.testDate, e.tester, e.reportNo]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `检验数据查询_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">检验数据综合查询</h1>
          <p className="text-sm text-muted-foreground mt-1">按时间、乡镇、品种、结果组合查询，支持导出Excel</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}><Download className="h-3.5 w-3.5" />导出CSV</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索样品号、企业、检测人..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={townshipFilter} onValueChange={setTownshipFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="乡镇" /></SelectTrigger><SelectContent><SelectItem value="all">全部乡镇</SelectItem>{townships.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            <Select value={varietyFilter} onValueChange={setVarietyFilter}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="品种" /></SelectTrigger><SelectContent><SelectItem value="all">全部品种</SelectItem>{varieties.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
            <Select value={resultFilter} onValueChange={setResultFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="结果" /></SelectTrigger><SelectContent><SelectItem value="all">全部结果</SelectItem><SelectItem value="阴性">阴性</SelectItem><SelectItem value="阳性">阳性</SelectItem><SelectItem value="待检测">待检测</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>共 {filtered.length} 条记录</span>
        {(townshipFilter !== "all" || resultFilter !== "all" || varietyFilter !== "all" || searchTerm) && (
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setSearchTerm(""); setTownshipFilter("all"); setResultFilter("all"); setVarietyFilter("all"); }}>清除筛选</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>样品号</TableHead>
                <TableHead>品种</TableHead>
                <TableHead>企业</TableHead>
                <TableHead>乡镇</TableHead>
                <TableHead>检测类型</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>检测人</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>报告编号</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">暂无匹配数据</TableCell></TableRow>
              ) : filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm font-medium">{item.sampleNo}</TableCell>
                  <TableCell>{item.variety}</TableCell>
                  <TableCell>{item.enterprise}</TableCell>
                  <TableCell>{item.township}</TableCell>
                  <TableCell>{item.testType}</TableCell>
                  <TableCell><Badge variant={item.result === "阳性" ? "destructive" : item.result === "阴性" ? "outline" : "secondary"}>{item.result}</Badge></TableCell>
                  <TableCell>{item.tester || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.testDate || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{item.reportNo || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
