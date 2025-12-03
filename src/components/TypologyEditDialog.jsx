import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

const AVAILABLE_TYPOLOGIES = [
  "Todo",
  "Mercantil",
  "Laboral",
  "Societario",
  "Concursal",
  "Fiscal",
  "Penal",
  "Civil",
  "Administrativo",
  "Procesal",
];

export function TypologyEditDialog({ lawyer, open, onOpenChange, onSave }) {
  const [selectedTypologies, setSelectedTypologies] = useState(
    lawyer?.typologies || []
  );

  const handleToggleTypology = (typology) => {
    setSelectedTypologies((prev) => {
      if (prev.includes(typology)) {
        return prev.filter((t) => t !== typology);
      } else {
        return [...prev, typology];
      }
    });
  };

  const handleSave = () => {
    if (selectedTypologies.length === 0) {
      return;
    }
    onSave(selectedTypologies);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Editar Tipologías - {lawyer?.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecciona las tipologías que puede gestionar este letrado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {AVAILABLE_TYPOLOGIES.map((typology) => (
              <div key={typology} className="flex items-center space-x-3">
                <Checkbox
                  id={`typology-${typology}`}
                  checked={selectedTypologies.includes(typology)}
                  onCheckedChange={() => handleToggleTypology(typology)}
                />
                <Label
                  htmlFor={`typology-${typology}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {typology}
                </Label>
              </div>
            ))}
          </div>
          {selectedTypologies.length === 0 && (
            <p className="text-sm text-destructive mt-2">
              Debe seleccionar al menos una tipología
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={selectedTypologies.length === 0}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}