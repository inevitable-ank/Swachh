"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Navigation, TrendingUp, Users, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Issue Map View
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore civic issues across your community with interactive mapping
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Issues
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mapData.length}</div>
            <p className="text-xs text-muted-foreground">Reported across the area</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Areas
            </CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <Navigation className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(mapData.map(issue => issue.location.split(',')[0])).size}
            </div>
            <p className="text-xs text-muted-foreground">Different locations</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Activity
            </CardTitle>
            <div className="p-2 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mapData.filter(issue => {
                const issueDate = new Date(issue.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return issueDate > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Map Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Interactive Map
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on markers to view issue details
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <Skeleton className="w-full h-[500px] rounded-lg" />
              ) : (
                <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
                  <DynamicMap issues={mapData} selectedId={selectedIssue} onSelect={setSelectedIssue} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                Recent Issues
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest reported issues in your area
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[450px] overflow-y-auto">
                {loading ? (
                  <div className="space-y-4 p-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3"
                      >
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y">
                    {mapData.slice(0, 10).map((issue, index) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 ${
                          selectedIssue === issue.id 
                            ? "bg-primary/10 border-l-4 border-primary" 
                            : "hover:border-l-2 hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedIssue(issue.id === selectedIssue ? null : issue.id)}
                      >
                        <h3 className="font-medium line-clamp-1 mb-2">{issue.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={issue.category === 'Road' ? 'default' : 
                                    issue.category === 'Water' ? 'secondary' :
                                    issue.category === 'Sanitation' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {issue.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {issue.location}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(
                mapData.reduce((acc, issue) => {
                  acc[issue.category] = (acc[issue.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, count], index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium text-sm">{category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
