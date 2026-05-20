"use client";

import {
  Building2,
  ClipboardCheck,
  FlaskConical,
  AlertTriangle,
  TrendingUp,
  FileText,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    title: "备案企业数",
    value: "48",
    change: "+3",
    icon: Building2,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "本月抽检任务",
    value: "12",
    change: "+5",
    icon: ClipboardCheck,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    title: "待检测样品",
    value: "36",
    change: "+8",
    icon: FlaskConical,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    title: "阳性预警",
    value: "2",
    change: "+1",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

const recentTasks = [
  { id: "T2024-0089", type: "叶片期抽检", township: "城关镇", status: "执行中", progress: 65 },
  { id: "T2024-0088", type: "播种期抽检", township: "柳林镇", status: "执行中", progress: 40 },
  { id: "T2024-0087", type: "亲本种子抽检", township: "大河镇", status: "待执行", progress: 0 },
  { id: "T2024-0086", type: "叶片期抽检", township: "沙河镇", status: "已完成", progress: 100 },
];

const recentAlerts = [
  {
    sampleNo: "63-1",
    field: "柳林镇-A3-12",
    variety: "杂交水稻 Y两优900",
    result: "阳性",
    time: "2小时前",
  },
  {
    sampleNo: "45-3",
    field: "城关镇-B2-07",
    variety: "杂交玉米 郑单958",
    result: "阳性",
    time: "5小时前",
  },
];

const recentInspections = [
  { sampleNo: "63-2", enterprise: "丰源种业", type: "转基因检测", status: "检测中" },
  { sampleNo: "63-3", enterprise: "丰源种业", type: "转基因检测", status: "待检测" },
  { sampleNo: "44-1", enterprise: "绿丰农业", type: "纯度检测", status: "已完成" },
  { sampleNo: "44-2", enterprise: "绿丰农业", type: "发芽率检测", status: "已完成" },
  { sampleNo: "38-1", enterprise: "金穗种业", type: "转基因检测", status: "检测中" },
];

const townshipStats = [
  { name: "城关镇", total: 156, completed: 142, rate: 91 },
  { name: "柳林镇", total: 98, completed: 85, rate: 87 },
  { name: "大河镇", total: 124, completed: 112, rate: 90 },
  { name: "沙河镇", total: 87, completed: 79, rate: 91 },
  { name: "双河镇", total: 65, completed: 52, rate: 80 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <span className="text-xs text-muted-foreground">较上月 {stat.change}</span>
                    </div>
                  </div>
                  <div className={`rounded-md p-2 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">抽检任务进度</CardTitle>
              <CardDescription>近期抽检任务执行情况</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{task.id}</span>
                      <Badge
                        variant={
                          task.status === "已完成"
                            ? "default"
                            : task.status === "执行中"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{task.type}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{task.township}</span>
                    </div>
                    {task.status !== "待执行" && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress value={task.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{task.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-base">阳性预警</CardTitle>
            </div>
            <CardDescription>最新检测阳性预警信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.sampleNo} className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">样品 {alert.sampleNo}</span>
                    <Badge variant="destructive" className="text-xs">
                      阳性
                    </Badge>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-xs text-muted-foreground">{alert.variety}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {alert.field}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {alert.time}
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                查看全部预警
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Township Stats */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">各乡镇抽检覆盖率</CardTitle>
            <CardDescription>当前抽检周期各乡镇完成情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {townshipStats.map((ts) => (
                <div key={ts.name} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium shrink-0">{ts.name}</span>
                  <div className="flex-1">
                    <Progress value={ts.rate} className="h-2" />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{ts.rate}%</span>
                  <span className="text-xs text-muted-foreground w-20 text-right">
                    {ts.completed}/{ts.total}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inspections */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">最新检测动态</CardTitle>
            </div>
            <CardDescription>实验室检测进度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInspections.map((insp) => (
                <div key={insp.sampleNo} className="flex items-center gap-3">
                  {insp.status === "已完成" ? (
                    <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" />
                  ) : insp.status === "检测中" ? (
                    <Clock className="h-4 w-4 text-chart-1 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{insp.sampleNo}</span>
                      <Badge variant="outline" className="text-xs">
                        {insp.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{insp.enterprise}</p>
                  </div>
                  <Badge
                    variant={
                      insp.status === "已完成" ? "default" : insp.status === "检测中" ? "secondary" : "outline"
                    }
                    className="text-xs shrink-0"
                  >
                    {insp.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-3 justify-start gap-3">
              <FileText className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="text-sm font-medium">创建抽检任务</div>
                <div className="text-xs text-muted-foreground">新建扦样检验任务</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-3 justify-start gap-3">
              <FlaskConical className="h-4 w-4 text-chart-2" />
              <div className="text-left">
                <div className="text-sm font-medium">录入检测结果</div>
                <div className="text-xs text-muted-foreground">录入实验检测数据</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-3 justify-start gap-3">
              <TrendingUp className="h-4 w-4 text-chart-3" />
              <div className="text-left">
                <div className="text-sm font-medium">查看统计报表</div>
                <div className="text-xs text-muted-foreground">抽检结果统计分析</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-3 justify-start gap-3">
              <Building2 className="h-4 w-4 text-chart-4" />
              <div className="text-left">
                <div className="text-sm font-medium">企业备案审核</div>
                <div className="text-xs text-muted-foreground">审核待处理备案</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
