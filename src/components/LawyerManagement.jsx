import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Users, Calendar, AlertCircle, Building2, FileText, Mail, Edit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { TypologyEditDialog } from "./TypologyEditDialog";

export function LawyerManagement({ lawyers, queries, onUpdateLawyer }) {
  const [sendingEmail, setSendingEmail] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [editingTypologies, setEditingTypologies] = useState(null);

  const handleSendEmail = async (lawyer) => {
    const lawyerQueries = queries.filter(
      (q) => q.assignedLawyerEmail === lawyer.email
    );

    if (lawyerQueries.length === 0) {
      toast.error("Este letrado no tiene consultas asignadas");
      return;
    }

    setSendingEmail(lawyer.id);

    try {
      const { error } = await supabase.functions.invoke("send-lawyer-notification", {
        body: {
          lawyerName: lawyer.name,
          lawyerEmail: lawyer.email,
          queries: lawyerQueries.map(q => ({
            ritm: q.ritm,
            typology: q.typology,
            isUrgent: q.isUrgent,
            deadline: q.deadline.toISOString(),
            status: q.status
          })),
          isAutomatic: false
        },
      });

      if (error) throw error;

      toast.success(
        <div className="space-y-1">
          <div className="font-semibold">Email enviado correctamente</div>
          <div className="text-sm">
            Se ha notificado a {lawyer.name} sobre {lawyerQueries.length} consulta(s)
          </div>
          <div className="text-xs text-muted-foreground">
            Rocío y Andrea han recibido la confirmación
          </div>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error al enviar el email. Por favor, inténtalo de nuevo.");
    } finally {
      setSendingEmail(null);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendiente",
      in_process: "En Proceso",
      completed: "Finalizada",
      reclassified: "Reclasificada",
      elevated: "Elevada COpS",
      info_requested: "Info. Solicitada"
    };
    return labels[status];
  };

  const getStatusVariant = (status) => {
    const variants = {
      pending: "warning",
      in_process: "default",
      completed: "success",
      reclassified: "secondary",
      elevated: "warning",
      info_requested: "secondary"
    };
    return variants[status];
  };

  const handleSaveTypologies = (lawyerId, typologies) => {
    onUpdateLawyer(lawyerId, { typologies });
    toast.success("Tipologías actualizadas correctamente");
  };

  const handleToggleActive = (lawyer) => {
    const newPercentage = lawyer.workPercentage > 0 ? 0 : 100;
    onUpdateLawyer(lawyer.id, { workPercentage: newPercentage });
    toast.success(newPercentage > 0 ? "Letrado activado" : "Letrado desactivado");
  };

  const handleSendAllEmails = async () => {
    const lawyersWithQueries = lawyers.filter(lawyer => {
      const lawyerQueries = queries.filter(q => q.assignedLawyerEmail === lawyer.email);
      return lawyerQueries.length > 0;
    });

    if (lawyersWithQueries.length === 0) {
      toast.error("No hay letrados con consultas asignadas");
      return;
    }

    setSendingAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const lawyer of lawyersWithQueries) {
      const lawyerQueries = queries.filter(q => q.assignedLawyerEmail === lawyer.email);
      
      try {
        const { error } = await supabase.functions.invoke("send-lawyer-notification", {
          body: {
            lawyerName: lawyer.name,
            lawyerEmail: lawyer.email,
            queries: lawyerQueries.map(q => ({
              ritm: q.ritm,
              typology: q.typology,
              isUrgent: q.isUrgent,
              deadline: q.deadline.toISOString(),
              status: q.status
            })),
            isAutomatic: false
          },
        });

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error sending email to ${lawyer.name}:`, error);
        errorCount++;
      }
    }

    setSendingAll(false);

    if (successCount > 0) {
      toast.success(
        <div className="space-y-1">
          <div className="font-semibold">Emails enviados correctamente</div>
          <div className="text-sm">
            Se notificó a {successCount} letrado(s)
          </div>
          {errorCount > 0 && (
            <div className="text-xs text-destructive">
              {errorCount} email(s) fallaron
            </div>
          )}
        </div>,
        { duration: 5000 }
      );
    } else {
      toast.error("Error al enviar los emails");
    }
  };

  return (
    <Card className="p-6 bg-card border-border shadow-medium">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Gestión de Letrados</h2>
          </div>
          <Button
            onClick={handleSendAllEmails}
            disabled={sendingAll}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            {sendingAll ? "Enviando..." : "Enviar Emails a Todos"}
          </Button>
        </div>

        <div className="space-y-4">
          {lawyers.map((lawyer) => {
            const lawyerQueries = queries.filter(
              q => q.assignedLawyerEmail === lawyer.email
            );

            return (
            <Card key={lawyer.id} className="p-4 bg-muted/30 border-border">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{lawyer.name}</h3>
                      <Badge variant={lawyer.workPercentage > 0 ? "default" : "secondary"}>
                        {lawyer.workPercentage > 0 ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{lawyer.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={lawyer.canHandleUrgent ? "default" : "secondary"}>
                      {lawyer.canHandleUrgent ? "Urgentes: Sí" : "Urgentes: No"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-border">
                  <Label htmlFor={`active-${lawyer.id}`} className="text-sm font-medium">
                    Estado del letrado
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {lawyer.workPercentage > 0 ? "Activo" : "Inactivo"}
                    </span>
                    <Switch
                      id={`active-${lawyer.id}`}
                      checked={lawyer.workPercentage > 0}
                      onCheckedChange={() => handleToggleActive(lawyer)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`percentage-${lawyer.id}`} className="text-sm font-medium">
                      Porcentaje de asignación: {lawyer.workPercentage}%
                    </Label>
                  </div>
                  <Slider
                    id={`percentage-${lawyer.id}`}
                    value={[lawyer.workPercentage]}
                    onValueChange={(value) => 
                      onUpdateLawyer(lawyer.id, { workPercentage: value[0] })
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor={`urgent-${lawyer.id}`} className="text-sm">
                    Puede asumir consultas urgentes
                  </Label>
                  <Switch
                    id={`urgent-${lawyer.id}`}
                    checked={lawyer.canHandleUrgent}
                    onCheckedChange={(checked) =>
                      onUpdateLawyer(lawyer.id, { canHandleUrgent: checked })
                    }
                  />
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Tipologías:</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTypologies(lawyer)}
                      className="gap-2 h-8"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.typologies.map((typology, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {typology}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-primary/5 rounded-md p-3">
                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            Consultas asignadas: <span className="text-primary">{lawyerQueries.length}</span>
                          </p>
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-4 space-y-3">
                          {lawyerQueries.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              No hay consultas asignadas
                            </p>
                          ) : (
                            lawyerQueries.map((query) => (
                              <Card key={query.id} className="p-4 bg-background border-border">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-primary text-base">{query.ritm}</p>
                                      <p className="text-sm text-muted-foreground">{query.typology}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Badge variant={getStatusVariant(query.status)}>
                                        {getStatusLabel(query.status)}
                                      </Badge>
                                      {query.isUrgent && (
                                        <Badge variant="destructive" className="gap-1">
                                          <AlertCircle className="h-3 w-3" />
                                          Urgente
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Fecha Alta</p>
                                        <p className="font-medium">
                                          {format(query.entryDate, "dd/MM/yyyy", { locale: es })}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-destructive" />
                                      <div>
                                        <p className="text-xs text-muted-foreground">Fecha Fin SLA</p>
                                        <p className="font-medium">
                                          {format(query.deadline, "dd/MM/yyyy", { locale: es })}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {query.officeName && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Building2 className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <span className="text-xs text-muted-foreground">Oficina: </span>
                                        <span className="font-medium">{query.officeName}</span>
                                      </div>
                                    </div>
                                  )}

                                  {query.lastAction && (
                                    <div className="flex items-start gap-2 text-sm pt-2 border-t border-border">
                                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">Última Actuación:</p>
                                        <p className="text-sm">{query.lastAction}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  
                  <Button
                    onClick={() => handleSendEmail(lawyer)}
                    disabled={sendingEmail === lawyer.id || lawyerQueries.length === 0}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Mail className="h-4 w-4" />
                    {sendingEmail === lawyer.id ? "Enviando..." : `Enviar Email (${lawyerQueries.length} consultas)`}
                  </Button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      </div>

      {editingTypologies && (
        <TypologyEditDialog
          lawyer={editingTypologies}
          open={!!editingTypologies}
          onOpenChange={(open) => !open && setEditingTypologies(null)}
          onSave={(typologies) => handleSaveTypologies(editingTypologies.id, typologies)}
        />
      )}
    </Card>
  );
}