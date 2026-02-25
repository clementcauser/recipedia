import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: StatCardProps) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className={cn("p-2 w-fit rounded-xl", bgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground font-medium">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
