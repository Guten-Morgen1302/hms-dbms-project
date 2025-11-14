import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus } from "lucide-react";
import type { Department } from "@shared/schema";
import { motion } from "framer-motion";

export default function Departments() {
  const { data: departments, isLoading } = useQuery<Department[]>({ 
    queryKey: ["/api/departments"] 
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Departments</h1>
          <p className="text-muted-foreground">Manage hospital departments and divisions</p>
        </div>
        <Button className="h-11 px-6 rounded-lg font-semibold" data-testid="button-add-department">
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      <Card className="p-6 rounded-2xl">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !departments || departments.length === 0 ? (
          <EmptyState
            title="No departments found"
            description="Start organizing your hospital by creating departments"
            icon={Building2}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Floor</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept, index) => (
                  <motion.tr
                    key={dept.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover-elevate"
                    data-testid={`row-department-${dept.id}`}
                  >
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.floor ? `Floor ${dept.floor}` : "N/A"}</TableCell>
                    <TableCell>{dept.description || "No description"}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
