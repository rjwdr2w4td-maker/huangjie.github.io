"use client";

import { useState } from "react";
import { GitBranch, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimelineStep {
  status: "completed" | "current" | "pending";
  label: string;
  date: string;
  detail: string;
}

interface SampleLifecycle {
  sampleNo: string;
  variety: string;
  enterprise: string;
  township: string;
  currentStage: string;
  timeline: TimelineStep[];
}

const lifecycleData: SampleLifecycle[] = [
  {
    sampleNo: "63-1", variety: "杂交水稻Y两优900", enterprise: "丰收种业", township: "城关镇", currentStage: "报告完成",
    timeline: [
      { status: "completed", label: "取样", date: "2024-06-05 09:30", detail: "刘管理执行叶片扦样，对角线法取样2kg" },
      { status: "completed", label: "接收", date: "2024-06-05 14:00", detail: "张检验确认接收，冰箱位置 A-01-03" },
      { status: "completed", label: "检测", date: "2024-06-07 10:00", detail: "转基因检测结果：阴性" },
      { status: "completed", label: "报告", date: "2024-06-10 16:00", detail: "RPT-2024-002 已签章" },
    ],
  },
  {
    sampleNo: "63-2", variety: "杂交水稻Y两优900", enterprise: "丰收种业", township: "城关镇", currentStage: "复检中",
    timeline: [
      { status: "completed", label: "取样", date: "2024-06-05 10:15", detail: "刘管理执行叶片扦样，Z字法取样1.5kg" },
      { status: "completed", label: "接收", date: "2024-06-05 14:05", detail: "张检验确认接收，冰箱位置 A-01-04" },
      { status: "completed", label: "检测", date: "2024-06-07 10:30", detail: "转基因检测结果：阳性（CaMV35S）" },
      { status: "completed", label: "报告", date: "2024-06-10 16:05", detail: "RPT-2024-003 已签章" },
      { status: "current", label: "复检", date: "2024-06-11", detail: "RE-2024-001 复检中，指派刘管理" },
    ],
  },
  {
    sampleNo: "64-1", variety: "小麦郑麦9023", enterprise: "金穗种业", township: "柳林镇", currentStage: "待接收",
    timeline: [
      { status: "completed", label: "取样", date: "2024-06-08 08:45", detail: "陈检测执行播种期扦样" },
      { status: "current", label: "接收", date: "", detail: "待检验室确认接收" },
      { status: "pending", label: "检测", date: "", detail: "" },
      { status: "pending", label: "报告", date: "", detail: "" },
    ],
  },
  {
    sampleNo: "65-1", variety: "玉米郑单958", enterprise: "金穗种业", township: "大河镇", currentStage: "待取样",
    timeline: [
      { status: "current", label: "取样", date: "", detail: "任务已分配，待执行" },
      { status: "pending", label: "接收", date: "", detail: "" },
      { status: "pending", label: "检测", date: "", detail: "" },
      { status: "pending", label: "报告", date: "", detail: "" },
    ],
  },
];

export default function LifecyclePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const filtered = lifecycleData.filter((e) => {
    const matchesSearch = e.sampleNo.includes(searchTerm) || e.variety.includes(searchTerm) || e.enterprise.includes(searchTerm);
    const matchesStage = stageFilter === "all" || e.currentStage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">样品生命周期跟踪</h1>
        <p className="text-sm text-muted-foreground mt-1">按样品序号查询当前状态，可视化时间轴展示取样→接收→检测→报告全流程</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="搜索样品号、品种、企业..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="当前阶段" /></SelectTrigger><SelectContent><SelectItem value="all">全部阶段</SelectItem><SelectItem value="待取样">待取样</SelectItem><SelectItem value="待接收">待接收</SelectItem><SelectItem value="检测中">检测中</SelectItem><SelectItem value="报告完成">报告完成</SelectItem><SelectItem value="复检中">复检中</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">暂无匹配的样品记录</CardContent></Card>
      ) : filtered.map((sample) => (
        <Card key={sample.sampleNo}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2"><GitBranch className="h-4 w-4 text-primary" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{sample.sampleNo}</span>
                    <Badge variant="outline">{sample.currentStage}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{sample.variety} | {sample.enterprise} | {sample.township}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6">
              {sample.timeline.map((step, idx) => (
                <div key={idx} className="relative pb-6 last:pb-0">
                  {/* Line */}
                  {idx < sample.timeline.length - 1 && (
                    <div className="absolute left-[-20px] top-[8px] w-0.5 h-full bg-border" />
                  )}
                  {/* Dot */}
                  <div className={`absolute left-[-24px] top-0 h-4 w-4 rounded-full border-2 ${
                    step.status === "completed" ? "bg-primary border-primary" :
                    step.status === "current" ? "bg-background border-primary ring-2 ring-primary/30" :
                    "bg-background border-muted-foreground/30"
                  }`} />
                  {/* Content */}
                  <div className="ml-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
                        {step.label}
                      </span>
                      {step.status === "completed" && <Badge variant="outline" className="text-xs h-5">已完成</Badge>}
                      {step.status === "current" && <Badge className="text-xs h-5">进行中</Badge>}
                    </div>
                    {step.date && <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>}
                    {step.detail && <p className="text-sm mt-1">{step.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
