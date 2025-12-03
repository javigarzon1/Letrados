import { Clock, AlertCircle, User, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { QueryDetailDialog } from "./QueryDetailDialog";

const statusConfig = {
  pending: { label: "Pendiente", variant: "warning" },
  in_process: { label: "En Proceso", variant: "default" },
  completed: { label: "Finalizada", variant: "success" },
  reclassified: { label: "Reclasificada", variant: "secondary" },
  elevated: { label: "Elevada COpS", variant: "secondary" },
  info_requested: { label: "Solicitada información", variant: "secondary" }
};

export function QueryCard({ query, onStatusChange }) {
  const [showDetails, setShowDetails] = useState(false);
  const now = new Date();
  const timeToDeadline = query.deadline.getTime() - now.getTime();
  const hoursToDeadline = Math.floor(timeToDeadline / (1000 * 60 * 60));
  const isNearDeadline = hoursToDeadline <= 2 && hoursToDeadline >= 0;

  return (
    <>
      <Card className={`p-4 bg-card border shadow-soft hover:shadow-medium transition-all ${
        query.isUrgent ? "border-l-4 border-l-destructive" : ""
      }`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 
                  className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors"
                  onClick={() => setShowDetails(true)}
                >
                  {query.ritm}
                </h4>
                {query.isUrgent && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    URGENTE
                  </Badge>
                )}
                {isNearDeadline && !query.isUrgent && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Vencimiento próximo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{query.typology}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Entrada: {query.entryDate instanceof Date && !isNaN(query.entryDate.getTime()) 
                ? format(query.entryDate, "dd/MM/yyyy HH:mm", { locale: es })
                : "Fecha inválida"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Vence: {query.deadline instanceof Date && !isNaN(query.deadline.getTime())
                ? format(query.deadline, "dd/MM/yyyy HH:mm", { locale: es })
                : "Fecha inválida"}</span>
            </div>
          </div>

          {query.assignedLawyer && (
            <div 
              className="flex items-center gap-2 text-sm bg-muted/50 rounded-md p-2 hover:bg-muted cursor-pointer transition-colors"
              onClick={() => setShowDetails(true)}
            >
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{query.assignedLawyer}</span>
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <Select
              value={query.status}
              onValueChange={(value) => onStatusChange(query.id, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      
      <QueryDetailDialog 
        query={query}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
}
