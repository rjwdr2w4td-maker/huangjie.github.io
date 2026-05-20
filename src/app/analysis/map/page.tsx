"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Layers, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockPoints = [
  { id: "1", lat: 30.5728, lng: 104.0668, township: "朝阳镇", variety: "玉米郑单958", result: "positive", sampleNo: "63-1" },
  { id: "2", lat: 30.5828, lng: 104.0768, township: "朝阳镇", variety: "玉米郑单958", result: "negative", sampleNo: "63-2" },
  { id: "3", lat: 30.5528, lng: 104.0468, township: "河西镇", variety: "水稻宜香优2115", result: "negative", sampleNo: "45-1" },
  { id: "4", lat: 30.5628, lng: 104.0868, township: "朝阳镇", variety: "玉米郑单958", result: "negative", sampleNo: "QB-001" },
  { id: "5", lat: 30.5928, lng: 104.0568, township: "东山乡", variety: "小麦绵麦367", result: "negative", sampleNo: "QB-002" },
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<typeof mockPoints[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">抽检结果可视化地图</h1>
        <p className="text-sm text-muted-foreground mt-1">在地图上显示抽检点位，颜色区分阴性/阳性，点击查看详情</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div ref={mapRef} className="relative h-[560px] bg-muted/30">
              {/* Simulated map with plotted points */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">地图视图</p>
                  <p className="text-xs mt-1">集成地图SDK后显示抽检点位</p>
                </div>
              </div>

              {/* Simulated point markers */}
              <div className="absolute inset-0">
                {mockPoints.map((point, idx) => {
                  const top = 20 + (idx * 18) % 60;
                  const left = 15 + (idx * 22) % 70;
                  return (
                    <button
                      key={point.id}
                      className={`absolute w-5 h-5 rounded-full border-2 border-white shadow-md transition-transform hover:scale-125 ${
                        point.result === "positive" ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ top: `${top}%`, left: `${left}%` }}
                      onClick={() => setSelectedPoint(point)}
                      title={point.sampleNo}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur rounded-md border p-3 text-xs space-y-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" />阴性</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive" />阳性</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">抽检概况</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">总抽检点</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" />阴性</span>
                <span className="font-semibold text-primary">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" />阳性</span>
                <span className="font-semibold text-destructive">1</span>
              </div>
            </CardContent>
          </Card>

          {selectedPoint && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">选中点位</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">样品编号</span><span className="font-mono">{selectedPoint.sampleNo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">乡镇</span><span>{selectedPoint.township}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">品种</span><span>{selectedPoint.variety}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">结果</span>
                  <Badge variant={selectedPoint.result === "positive" ? "destructive" : "default"}>
                    {selectedPoint.result === "positive" ? "阳性" : "阴性"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
