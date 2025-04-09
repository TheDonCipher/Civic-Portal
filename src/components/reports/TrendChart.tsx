import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyData {
  month: string;
  created: number;
  resolved: number;
}

const TrendChart: React.FC<{ timeframe?: string }> = ({ timeframe = "6m" }) => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);

        const monthsBack =
          timeframe === "1m"
            ? 1
            : timeframe === "3m"
              ? 3
              : timeframe === "6m"
                ? 6
                : 12;

        // Try to use RPC function if available
        const { data: monthlyData, error: monthlyError } = await supabase.rpc(
          "get_monthly_issue_stats",
          { months_back: monthsBack },
        );

        if (monthlyError) {
          console.warn("Error fetching monthly trends via RPC:", monthlyError);
          // Generate monthly data manually if RPC fails
          const manualData = await generateMonthlyData(monthsBack);
          setData(manualData);
        } else if (monthlyData) {
          setData(monthlyData);
        }
      } catch (err) {
        console.error("Error fetching monthly trend data:", err);
        setError("Failed to load trend data");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [timeframe]);

  // Fallback function to generate monthly data if RPC fails
  const generateMonthlyData = async (
    monthsBack: number,
  ): Promise<MonthlyData[]> => {
    const result: MonthlyData[] = [];
    const now = new Date();

    for (let i = 0; i < monthsBack; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);

      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      // Format month name
      const monthName =
        month.toLocaleString("default", { month: "short" }) +
        " " +
        month.getFullYear();

      // Get created issues count for this month
      const { count: createdCount, error: createdError } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      // Get resolved issues count for this month
      const { count: resolvedCount, error: resolvedError } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved")
        .gte("updated_at", startOfMonth.toISOString())
        .lte("updated_at", endOfMonth.toISOString());

      result.push({
        month: monthName,
        created: createdError ? 0 : createdCount || 0,
        resolved: resolvedError ? 0 : resolvedCount || 0,
      });
    }

    // Reverse to show oldest to newest
    return result.reverse();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Issue Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        ) : error ? (
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Issues Created"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Issues Resolved"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendChart;
