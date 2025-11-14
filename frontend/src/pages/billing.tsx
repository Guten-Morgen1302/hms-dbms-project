import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { CreditCard, Plus } from "lucide-react";
import type { Bill } from "@shared/schema";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/format";

export default function Billing() {
  const { data: bills, isLoading } = useQuery<Bill[]>({ 
    queryKey: ["/api/bills"] 
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Billing</h1>
          <p className="text-muted-foreground">Manage invoices and payments</p>
        </div>
        <Button className="h-11 px-6 rounded-lg font-semibold" data-testid="button-add-bill">
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : !bills || bills.length === 0 ? (
        <Card className="p-6 rounded-2xl">
          <EmptyState
            title="No bills found"
            description="Start managing invoices and payments"
            icon={CreditCard}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill, index) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 rounded-2xl hover-elevate" data-testid={`card-bill-${bill.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Invoice</p>
                    <p className="text-lg font-bold">#{bill.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <StatusBadge status={bill.status as any} />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-semibold">{formatINR(bill.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paid</span>
                    <span className="font-semibold text-chart-2">{formatINR(bill.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-sm font-medium">Balance</span>
                    <span className="font-bold">
                      {formatINR(Number(bill.totalAmount) - Number(bill.paidAmount))}
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="sm" data-testid={`button-view-bill-${bill.id}`}>
                  View Details
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
