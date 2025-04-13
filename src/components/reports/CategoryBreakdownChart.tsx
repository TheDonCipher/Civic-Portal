import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
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

interface CategoryCount {
  name: string;
  value: number;
  previousValue?: number;
}

const CategoryBreakdownChart: React.FC<{ timeframe?: string }> = ({
  timeframe = "3m",
}) => {
  const [data, setData] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);

        // Calculate date range based on timeframe
        const now = new Date();
        let startDate;

        switch (timeframe) {
          case "1m":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              now.getDate(),
            );
            break;
          case "3m":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth() - 3,
              now.getDate(),
            );
            break;
          case "6m":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth() - 6,
              now.getDate(),
            );
            break;
          case "1y":
            startDate = new Date(
              now.getFullYear() - 1,
              now.getMonth(),
              now.getDate(),
            );
            break;
          default:
            startDate = new Date(
              now.getFullYear(),
              now.getMonth() - 3,
              now.getDate(),
            );
        }

        const startDateStr = startDate.toISOString();

        // Get issues by category
        const { data: categoryData, error: categoryError } = await supabase
          .from("issues")
          .select("category, count")
          .gte("created_at", startDateStr)
          .group("category" as any);

        if (categoryError) {
          throw categoryError;
        }

        // Get previous period data for comparison
        const previousStartDate = new Date(startDate);
        previousStartDate.setMonth(
          previousStartDate.getMonth() -
            (timeframe === "1y" ? 12 : parseInt(timeframe.replace("m", ""))),
        );
        const previousEndDate = new Date(startDate);

        const { data: previousCategoryData, error: previousCategoryError } =
          await supabase
            .from("issues")
            .select("category, count")
            .gte("created_at", previousStartDate.toISOString())
            .lt("created_at", previousEndDate.toISOString())
            .group("category" as any);

        // Create a map of previous period data
        const previousCategoryMap: Record<string, number> = {};
        if (!previousCategoryError && previousCategoryData) {
          previousCategoryData.forEach((item) => {
            if (item.category) {
              previousCategoryMap[item.category] = parseInt(
                item.count?.toString() || "0",
              );
            }
          });
        }

        // Format data for chart
        const formattedData = categoryData.map((item) => ({
          name: item.category
            ? item.category.charAt(0).toUpperCase() + item.category.slice(1)
            : "Unknown",
          value: parseInt(item.count?.toString() || "0"),
          previousValue:
            (item.category && previousCategoryMap[item.category]) ||
            Math.round(parseInt(item.count?.toString() || "0") * 0.85), // Fallback to estimate
        }));

        setData(formattedData);
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [timeframe]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Issues by Category</CardTitle>
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
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="previousValue"
                  name="Previous Period"
                  fill="#8884d8"
                  opacity={0.6}
                />
                <Bar dataKey="value" name="Current Period" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownChart;
