"use client";

import { BarChart3, PieChart, Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* Simple inline bar/pie chart using pure CSS — no chart library dependency */

const townshipStats = [
  { name: "朝阳镇", total: 45, qualified: 43, rate: 95.6 },
  { name: "河西镇", total: 38, qualified: 37, rate: 97.4 },
  { name: "东山乡", total: 22, qualified: 22, rate: 100 },
  { name: "南湖镇", total: 15, qualified: 14, rate: 93.3 },
];

const varietyStats = [
  { name: "玉米郑单958", total: 30, qualified: 28, rate: 93.3 },
  { name: "水稻宜香优2115", total: 25, qualified: 25, rate: 100 },
  { name: "小麦绵麦367", total: 20, qualified: 20, rate: 100 },
  { name: "玉米川单189", total: 15, qualified: 14, rate: 93.3 },
  { name: "水稻冈优188", total: 10, qualified: 10, rate: 100 },
];

const companyStats = [
  { name: "丰源种业", total: 35, qualified: 33, rate: 94.3 },
  { name: "绿丰农业", total: 28, qualified: 28, rate: 100 },
  { name: "金穗种业", total: 20, qualified: 20, rate: 100 },
  { name: "德农种业", total: 17, qualified: 16, rate: 94.1 },
];

const overallRate = 96.2;
const maxTotal = Math.max(...townshipStats.map((s) => s.total));

function BarGroup({ stats, maxVal }: { stats: typeof townshipStats; maxVal: number }) {
  return (
    <div className="space-y-3">
      {stats.map((s) => (
        <div key={s.name} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{s.name}</span>
            <span className="text-muted-foreground">{s.qualified}/{s.total} ({s.rate}%)</span>
          </div>
          <div className="flex h-4 rounded-sm overflow-hidden bg-muted">
            <div className="bg-primary transition-all" style={{ width: `${(s.qualified / maxVal) * 100}%` }} />
            <div className="bg-destructive/70 transition-all" style={{ width: `${((s.total - s.qualified) / maxVal) * 100}%` }} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />合格</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-destructive/70 inline-block" />不合格</span>
      </div>
    </div>
  );
}

function DonutChart({ rate }: { rate: number }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - rate / 100);
  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" className="text-muted" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={radius} fill="none" stroke="currentColor" className="text-primary" strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{rate}%</span>
        <span className="text-xs text-muted-foreground">综合合格率</span>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const handleExport = () => {
    const allStats = [
      ["类别", "名称", "总数", "合格数", "合格率(%)"],
      ...townshipStats.map((s) => ["乡镇", s.name, String(s.total), String(s.qualified), String(s.rate)]),
      ...varietyStats.map((s) => ["品种", s.name, String(s.total), String(s.qualified), String(s.rate)]),
      ...companyStats.map((s) => ["企业", s.name, String(s.total), String(s.qualified), String(s.rate)]),
    ];
    const csv = allStats.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `统计分析报表_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">统计分析报表</h1>
          <p className="text-sm text-muted-foreground mt-1">按乡镇、品种组合、制种公司统计合格率，自动生成图表，支持导出</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}><Download className="h-3.5 w-3.5" />导出报表</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10"><BarChart3 className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">120</p>
              <p className="text-xs text-muted-foreground">总抽检样品数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10"><TrendingUp className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">116</p>
              <p className="text-xs text-muted-foreground">合格样品数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10"><PieChart className="h-5 w-5 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">不合格样品数</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">各乡镇抽检合格率</CardTitle></CardHeader>
          <CardContent><BarGroup stats={townshipStats} maxVal={maxTotal} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">综合合格率</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <DonutChart rate={overallRate} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">品种组合合格率</CardTitle></CardHeader>
          <CardContent><BarGroup stats={varietyStats} maxVal={Math.max(...varietyStats.map((s) => s.total))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">制种公司合格率</CardTitle></CardHeader>
          <CardContent><BarGroup stats={companyStats} maxVal={Math.max(...companyStats.map((s) => s.total))} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
