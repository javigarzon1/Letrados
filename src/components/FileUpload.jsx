import { Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import * as XLSX from "xlsx";
import { parseExcelDate } from "../lib/assignmentLogic";

export function FileUpload({ onFileLoaded }) {
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const queries = jsonData.map((row, index) => {
        const entryDate = parseExcelDate(row["FECHA ALTA"] || row["Fecha Alta"] || new Date());
        const deadline = parseExcelDate(row["FECHA FIN SLA"] || row["Fecha Fin SLA"] || new Date());
        
        return {
          id: `query-${index}-${Date.now()}`,
          ritm: row["ID CONSULTAS"] || row["RITM"] || row["Número"] || `RITM${index}`,
          typology: row["TIPOLOGIA"] || row["Tipología"] || "Sin especificar",
          entryDate,
          deadline,
          isUrgent: row["URGENTE SN"] === "S" || row["Urgente"] === "Sí" || false,
          assignedLawyer: row["NOM LETRADO"] || row["Letrado"] || undefined,
          status: "pending",
          lastAction: row["ULTIMA ACTUACION"] || row["Última Actuación"] || undefined,
          officeName: row["OFICINA"] || undefined
        };
      });

      onFileLoaded(queries);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Card className="p-8 bg-card border-border shadow-medium hover:shadow-large transition-all">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-primary/10 p-4">
          <FileSpreadsheet className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Cargar Archivo Excel
          </h3>
          <p className="text-muted-foreground">
            Sube el archivo exportado desde CaixaBank para iniciar la asignación automática
          </p>
        </div>
        <label htmlFor="file-upload">
          <Button className="cursor-pointer bg-gradient-primary hover:opacity-90 shadow-soft" asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              Seleccionar archivo
            </span>
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
}
