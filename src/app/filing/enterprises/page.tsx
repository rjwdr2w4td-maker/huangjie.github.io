"use client";

import { useState } from "react";
import {
  Building2,
  Search,
  Eye,
  Download,
  Database,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Enterprise {
  id: string;
  name: string;
  unifiedSocialCode: string;
  legalPerson: string;
  contactPhone: string;
  address: string;
  businessScope: string;
  registeredCapital: string;
  establishedDate: string;
  baseName: string;
  baseLocation: string;
  cropTypes: string[];
  varieties: string[];
  syncTime: string;
  createdAt: string;
}

/* 数据从种业大数据平台同步，只读展示 */
const syncedData: Enterprise[] = [
  { id: "1", name: "丰源种业有限公司", unifiedSocialCode: "91620000MA71X2KL3D", legalPerson: "王建国", contactPhone: "138****5678", address: "城关镇工业园区A区", businessScope: "水稻、玉米种子生产", registeredCapital: "500万元", establishedDate: "2018-03-15", baseName: "丰源水稻基地", baseLocation: "城关镇东郊村", cropTypes: ["水稻", "玉米"], varieties: ["Y58S", "丰两优4号", "郑单958"], syncTime: "2024-12-01 08:30", createdAt: "2024-01-15" },
  { id: "2", name: "绿丰农业科技有限公司", unifiedSocialCode: "91620000MA72Y3LM4E", legalPerson: "李明辉", contactPhone: "139****4321", address: "柳林镇农业示范园", businessScope: "小麦种子生产与销售", registeredCapital: "800万元", establishedDate: "2016-07-20", baseName: "绿丰小麦基地", baseLocation: "柳林镇南阳村", cropTypes: ["小麦"], varieties: ["郑麦9023", "百农207"], syncTime: "2024-12-01 08:30", createdAt: "2024-02-20" },
  { id: "3", name: "金穗种业股份有限公司", unifiedSocialCode: "91620000MA73Z4MN5F", legalPerson: "张伟", contactPhone: "137****8765", address: "大河镇科技路88号", businessScope: "杂交水稻种子生产", registeredCapital: "1200万元", establishedDate: "2015-01-08", baseName: "金穗杂交稻基地", baseLocation: "大河镇西河村", cropTypes: ["水稻"], varieties: ["Y58S", "晶两优534", "隆两优华占"], syncTime: "2024-12-01 08:30", createdAt: "2024-03-10" },
  { id: "4", name: "华农种苗有限公司", unifiedSocialCode: "91620000MA74A5NO6G", legalPerson: "陈志强", contactPhone: "136****2345", address: "沙河镇产业园区", businessScope: "蔬菜种子生产", registeredCapital: "300万元", establishedDate: "2020-05-12", baseName: "华农蔬菜基地", baseLocation: "沙河镇北园村", cropTypes: ["油菜"], varieties: ["中油杂19"], syncTime: "2024-12-01 08:30", createdAt: "2024-03-18" },
  { id: "5", name: "农兴种业科技有限公司", unifiedSocialCode: "91620000MA75B6OP7H", legalPerson: "刘学文", contactPhone: "135****6789", address: "双河镇农科路12号", businessScope: "棉花种子生产加工", registeredCapital: "600万元", establishedDate: "2017-09-03", baseName: "农兴棉花基地", baseLocation: "双河镇东坝村", cropTypes: ["棉花"], varieties: ["中棉所63", "鲁棉研28"], syncTime: "2024-12-01 08:30", createdAt: "2024-04-05" },
  { id: "6", name: "穗丰农业发展有限公司", unifiedSocialCode: "91620000MA76C7PQ8I", legalPerson: "赵国平", contactPhone: "133****1234", address: "城关镇建设路56号", businessScope: "油料作物种子生产", registeredCapital: "450万元", establishedDate: "2019-11-25", baseName: "穗丰油菜基地", baseLocation: "城关镇南湖村", cropTypes: ["油菜", "水稻"], varieties: ["中油杂19", "丰两优4号"], syncTime: "2024-12-01 08:30", createdAt: "2024-04-12" },
  { id: "7", name: "禾盛种业有限责任公司", unifiedSocialCode: "91620000MA77D8QR9J", legalPerson: "孙德明", contactPhone: "131****5678", address: "柳林镇工业园B区", businessScope: "玉米、大豆种子生产", registeredCapital: "750万元", establishedDate: "2014-06-18", baseName: "禾盛玉米基地", baseLocation: "柳林镇北沟村", cropTypes: ["玉米"], varieties: ["郑单958", "先玉335"], syncTime: "2024-12-01 08:30", createdAt: "2024-05-08" },
  { id: "8", name: "恒丰种苗科技有限公司", unifiedSocialCode: "91620000MA78E9RS0K", legalPerson: "周正国", contactPhone: "132****9012", address: "大河镇现代农业园", businessScope: "水稻种子研发与生产", registeredCapital: "1000万元", establishedDate: "2013-02-28", baseName: "恒丰水稻基地", baseLocation: "大河镇东城村", cropTypes: ["水稻", "小麦"], varieties: ["Y58S", "晶两优534", "郑麦9023", "百农207"], syncTime: "2024-12-01 08:30", createdAt: "2024-05-20" },
];

export default function EnterprisesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Enterprise | null>(null);

  const filtered = syncedData.filter((e) =>
    e.name.includes(searchTerm) ||
    e.unifiedSocialCode.includes(searchTerm) ||
    e.legalPerson.includes(searchTerm) ||
    e.businessScope.includes(searchTerm) ||
    e.baseName.includes(searchTerm) ||
    e.baseLocation.includes(searchTerm) ||
    e.cropTypes.some(c => c.includes(searchTerm)) ||
    e.varieties.some(v => v.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">制种企业信息</h1>
          <p className="text-sm text-muted-foreground mt-1">
            数据来源于种业大数据平台同步，仅供查看
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 py-1 px-3">
            <Database className="h-3.5 w-3.5" />
            种业大数据同步
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            导出
          </Button>
        </div>
      </div>

      {/* Data source info */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">最近同步时间：{syncedData[0]?.syncTime}</p>
            <p className="text-xs text-muted-foreground mt-0.5">共同步 {syncedData.length} 家制种企业信息</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Database className="h-3.5 w-3.5" />
            手动同步
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索企业名称、基地、作物种类、品种..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">序号</TableHead>
                <TableHead>企业名称</TableHead>
                <TableHead>基地名称</TableHead>
                <TableHead>基地位置</TableHead>
                <TableHead>关联作物种类</TableHead>
                <TableHead>关联品种</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead className="w-16">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((enterprise, index) => (
                  <TableRow key={enterprise.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{enterprise.name}</TableCell>
                    <TableCell>{enterprise.baseName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{enterprise.baseLocation}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {enterprise.cropTypes.map((ct) => (
                          <Badge key={ct} variant="secondary" className="text-xs">{ct}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {enterprise.varieties.slice(0, 2).map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                        ))}
                        {enterprise.varieties.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{enterprise.varieties.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{enterprise.createdAt}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => { setViewingItem(enterprise); setViewOpen(true); }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>企业详情</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">企业名称</p>
                  <p className="font-medium">{viewingItem.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">统一社会信用代码</p>
                  <p className="font-mono text-sm">{viewingItem.unifiedSocialCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">法定代表人</p>
                  <p className="font-medium">{viewingItem.legalPerson}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">联系电话</p>
                  <p className="font-mono text-sm">{viewingItem.contactPhone}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">企业地址</p>
                <p>{viewingItem.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">经营范围</p>
                <p>{viewingItem.businessScope}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">注册资本</p>
                  <p>{viewingItem.registeredCapital}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">成立日期</p>
                  <p>{viewingItem.establishedDate}</p>
                </div>
              </div>

              {/* 基地信息 */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">基地与品种信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">基地名称</p>
                    <p className="font-medium">{viewingItem.baseName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">基地位置</p>
                    <p className="font-medium">{viewingItem.baseLocation}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">关联作物种类</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingItem.cropTypes.map((ct) => (
                      <Badge key={ct} variant="secondary">{ct}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">关联品种</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingItem.varieties.map((v) => (
                      <Badge key={v} variant="outline">{v}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-t pt-4">
                <div className="space-y-1">
                  <p>创建日期</p>
                  <p className="text-foreground">{viewingItem.createdAt}</p>
                </div>
                <div className="space-y-1">
                  <p>数据同步时间</p>
                  <p className="text-foreground">{viewingItem.syncTime}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
