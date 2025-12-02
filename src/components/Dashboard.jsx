import { Card } from "./ui/card";
import { FileCheck, Users, AlertCircle, Clock } from "lucide-react";

export function Dashboard({ queries, lawyers }) {
  const totalQueries = queries.length;
  const urgentQueries = queries.filter(q => q.isUrgent).length;
  const assignedQueries = queries.filter(q => q.assignedLawyer).length;
  const activeLawyers = lawyers.filter(l => l.workPercentage > 0).length;

  const stats = [
    {
      title: "Total Consultas",
      value: totalQueries,
      icon: FileCheck,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Consultas Urgentes",
      value: urgentQueries,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      title: "Asignadas",
      value: assignedQueries,
      icon: Clock,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Letrados Activos",
      value: activeLawyers,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6 bg-card border-border shadow-soft hover:shadow-medium transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`rounded-full ${stat.bgColor} p-3`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
