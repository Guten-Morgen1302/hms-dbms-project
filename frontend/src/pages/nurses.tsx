import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCog, Plus, Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Nurses() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: nurses, isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/nurses"] 
  });

  const filteredNurses = nurses?.filter(nurse =>
    nurse.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Nurses</h1>
          <p className="text-muted-foreground">Manage nursing staff and assignments</p>
        </div>
        <Button className="h-11 px-6 rounded-lg font-semibold" data-testid="button-add-nurse">
          <Plus className="w-4 h-4 mr-2" />
          Add Nurse
        </Button>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search nurses..."
              className="pl-10 h-11 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredNurses.length === 0 ? (
          <EmptyState
            title="No nurses found"
            description={searchTerm ? "Try adjusting your search" : "Start managing nursing staff"}
            icon={UserCog}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">License Number</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Shift</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wide">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNurses.map((nurse, index) => (
                  <motion.tr
                    key={nurse.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover-elevate"
                    data-testid={`row-nurse-${nurse.id}`}
                  >
                    <TableCell className="font-medium">{nurse.name}</TableCell>
                    <TableCell className="font-mono text-sm">{nurse.licenseNumber}</TableCell>
                    <TableCell className="capitalize">{nurse.shift || "Not assigned"}</TableCell>
                    <TableCell>{nurse.email}</TableCell>
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
