import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Technicians() {
  const { data: technicians, isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/technicians"] 
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Technicians</h1>
          <p className="text-muted-foreground">Manage lab technicians and specialists</p>
        </div>
        <Button className="h-11 px-6 rounded-lg font-semibold" data-testid="button-add-technician">
          <Plus className="w-4 h-4 mr-2" />
          Add Technician
        </Button>
      </div>

      <Card className="p-6 rounded-2xl">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !technicians || technicians.length === 0 ? (
          <EmptyState
            title="No technicians found"
            description="Start managing laboratory technicians"
            icon={Wrench}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Specialization</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Certification</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((tech, index) => (
                  <motion.tr
                    key={tech.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover-elevate"
                    data-testid={`row-technician-${tech.id}`}
                  >
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>{tech.specialization}</TableCell>
                    <TableCell className="font-mono text-sm">{tech.certificationNumber}</TableCell>
                    <TableCell>{tech.email}</TableCell>
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
