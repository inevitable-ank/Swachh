"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DynamicMap = dynamic(() => import("@/components/dynamicMap"), {
  ssr: false,
});

export default function MapPage() {
  const [mapData, setMapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/map");
        if (!res.ok) throw new Error("Failed to fetch issues");

        const data = await res.json();

        const formatted = data.map((issue: any) => ({
          id: issue._id, 
          title: issue.title,
          latitude: issue.latitude,
          longitude: issue.longitude,
          location: issue.location,
          category: issue.category,
          createdAt: issue.createdAt,
          status: issue.status,
        }));

        setMapData(formatted);
      } catch (err) {
        console.error("Error loading issues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);



  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Reported Issues - Map View</h1>
        <p className="text-muted-foreground mt-1">Visualize civic issues by location</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton className="w-full h-[500px] rounded-lg" />
          ) : (
            <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden border">
              <DynamicMap issues={mapData} selectedId={selectedIssue} onSelect={setSelectedIssue} />
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[450px] overflow-y-auto">
                {loading ? (
                  <div className="space-y-4 p-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y">
                    {mapData.slice(0, 10).map((issue) => (
                      <div
                        key={issue.id}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${selectedIssue === issue.id ? "bg-muted/70  border-red-700" : ""
                          }`}
                        onClick={() => setSelectedIssue(issue.id === selectedIssue ? null : issue.id)}
                      >
                        <h3 className="font-medium line-clamp-1">{issue.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {issue.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {issue.location}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
