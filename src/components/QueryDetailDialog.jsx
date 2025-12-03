import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Calendar, Clock, User, FileText, Building, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig = {
  pending: { label: "Pendiente", variant: "warning" },
  in_process: { label: "En Proceso", variant: "default" },
  completed: { label: "Finalizada", variant: "success" },
  reclassified: { label: "Reclasificada", variant: "secondary" },
  elevated: { label: "Elevada COpS", variant: "secondary" },
  info_requested: { label: "Solicitada información", variant: "secondary" }
};

export function QueryDetailDialog({ query, open, onOpenChange }) {
  if (!query) return null;

  const formatDate = (date) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    }
    return "Fecha inválida";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detalles de la Consulta
          </DialogTitle>
          <DialogDescription>
            Información completa de la consulta {query.ritm}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">{query.ritm}</h3>
                <p className="text-sm text-muted-foreground mt-1">{query.typology}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={statusConfig[query.status]?.variant || "default"}>
                  {statusConfig[query.status]?.label || query.status}
                </Badge>
                {query.isUrgent && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    URGENTE
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Fecha de entrada</p>
                    <p className="text-sm text-muted-foreground">{formatDate(query.entryDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Fecha de vencimiento</p>
                    <p className="text-sm text-muted-foreground">{formatDate(query.deadline)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {query.assignedLawyer && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Letrado asignado</p>
                      <p className="text-sm text-muted-foreground">{query.assignedLawyer}</p>
                      {query.assignedLawyerEmail && (
                        <p className="text-xs text-muted-foreground">{query.assignedLawyerEmail}</p>
                      )}
                    </div>
                  </div>
                )}
                {query.officeName && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Oficina</p>
                      <p className="text-sm text-muted-foreground">{query.officeName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {query.lastAction && (
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">Última actuación</h4>
                <p className="text-sm text-muted-foreground">{query.lastAction}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-card p-3 rounded-lg border border-border">
                <p className="text-muted-foreground mb-1">Estado</p>
                <p className="font-medium text-foreground">{statusConfig[query.status]?.label || query.status}</p>
              </div>
              <div className="bg-card p-3 rounded-lg border border-border">
                <p className="text-muted-foreground mb-1">Prioridad</p>
                <p className="font-medium text-foreground">{query.isUrgent ? "Urgente" : "Normal"}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
