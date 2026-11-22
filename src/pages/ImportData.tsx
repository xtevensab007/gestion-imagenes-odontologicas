import { useState } from "react";
import {
  importarCatalogoCie10,
  importarAtenciones,
  type ResultadoImportacion,
} from "../services/importacionesService";

interface FileState {
  name: string;
  records: number;
  status: "idle" | "loaded" | "error";
  warnings: number;
}

export default function ImportData() {
  const [files, setFiles] = useState<{ [key: string]: FileState }>({
    patients: { name: "", records: 0, status: "idle", warnings: 0 },
    cie10: { name: "", records: 0, status: "idle", warnings: 0 },
    images: { name: "", records: 0, status: "idle", warnings: 0 },
  });
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [results, setResults] = useState<ResultadoImportacion[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{
    patients: File | null;
    cie10: File | null;
    images: File | null;
  }>({
    patients: null,
    cie10: null,
    images: null,
  });

  const handleProcess = async () => {
    setProcessing(true);
    setProcessed(false);

    try {
      const resultados = [];

      if (selectedFiles.cie10) {
        const resultado = await importarCatalogoCie10(selectedFiles.cie10);

        resultados.push(resultado);
      }

      if (selectedFiles.patients) {
        const resultado = await importarAtenciones(
          selectedFiles.patients
        );

        resultados.push(resultado);
      }

     console.log("Resultados de importación:", resultados);

setResults(resultados);
setProcessed(true);
    } catch (error) {
      console.error("Error al importar:", error);
      alert(
        error instanceof Error
          ? error.message
          : "No fue posible completar la importación."
      );
    } finally {
      setProcessing(false);
    }
  };


  const allLoaded = Boolean(selectedFiles.cie10 || selectedFiles.patients);

  const cards = [
    {
      key: "patients",
      title: "Archivo de pacientes / atenciones",
      icon: "👥",
      btnLabel: "Seleccionar archivo",
      formats: "XLSX, CSV",
      color: "#eff6ff",
      borderColor: "#bfdbfe",
      iconBg: "#1a3557",
    },
    {
      key: "cie10",
      title: "Catálogo CIE-10",
      icon: "📋",
      btnLabel: "Seleccionar archivo",
      formats: "XLSX, CSV",
      color: "#f0fdf4",
      borderColor: "#bbf7d0",
      iconBg: "#059669",
    },

  ];
  const handleFileChange = (
    key: "patients" | "cie10" | "images",
    file: File | undefined
  ) => {
    if (!file) return;

    setSelectedFiles((prev) => ({
      ...prev,
      [key]: file,
    }));

    setFiles((prev) => ({
      ...prev,
      [key]: {
        name: file.name,
        records: 0,
        status: "loaded",
        warnings: 0,
      },
    }));

    setProcessed(false);
  };
  return (
    <div style={{ padding: "32px 36px", maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">Importar datos</h1>
        <p className="page-subtitle">
  Cargue el catálogo CIE-10 y el archivo de atenciones para importarlos al sistema.
</p>
      </div>

      {processed && (
  <div className="alert alert-success" style={{ marginBottom: 24 }}>
    <div>
      <strong>Importación completada correctamente.</strong>

      {results.map((result) => (
        <div
          key={result.id_importacion}
          style={{ marginTop: 12, fontSize: 13 }}
        >
          <strong>{result.archivo}</strong>
          <p>
            Total: {result.total} |
            Insertados: {result.insertados} |
            Actualizados: {result.actualizados} |
            Omitidos: {result.omitidos} |
            Rechazados: {result.rechazados}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
        {cards.map(card => {
          const fileState = files[card.key];
          return (
            <div key={card.key} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: card.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0,
                }}>
                  {card.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: "#1f2937" }}>{card.title}</h3>
                      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Formatos aceptados: {card.formats}</p>
                    </div>
                    <label
                      className="btn-secondary"
                      style={{ whiteSpace: "nowrap", cursor: "pointer" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>

                      {card.btnLabel}

                      <input
                        type="file"
                        hidden
                        accept={card.key === "cie10" ? ".xls,.xlsx" : ".xls,.xlsx,.csv"}
                        onChange={(e) =>
                          handleFileChange(
                            card.key as "patients" | "cie10" | "images",
                            e.target.files?.[0]
                          )
                        }
                      />
                    </label>
                  </div>

                  {fileState.status === "idle" ? (
                    <div style={{
                      padding: "20px", borderRadius: 10,
                      background: card.color, border: `2px dashed ${card.borderColor}`,
                      textAlign: "center",
                    }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                        Haga clic en "{card.btnLabel}" o arrastre el archivo aquí
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", borderRadius: 10,
                        background: "#f9fafb", border: "1px solid #e5e7eb",
                      }}>
                        <div style={{ color: "#059669" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{fileState.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>Cargado correctamente</p>
                        </div>
                        <button onClick={() => {
                          setFiles(prev => ({
                            ...prev,
                            [card.key]: {
                              name: "",
                              records: 0,
                              status: "idle",
                              warnings: 0,
                            },
                          }));

                          setSelectedFiles(prev => ({
                            ...prev,
                            [card.key as "patients" | "cie10" | "images"]: null,
                          }));

                          setProcessed(false);
                        }} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div className="alert alert-success" style={{ padding: "8px 14px", fontSize: 12 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          Archivo cargado correctamente
                        </div>
                        <div className="alert alert-info" style={{ padding: "8px 14px", fontSize: 12 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                          {fileState.records} {card.key === "images" ? "imágenes" : "registros"} encontrados
                        </div>
                        {fileState.warnings > 0 && (
                          <div className="alert alert-warning" style={{ padding: "8px 14px", fontSize: 12 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            {fileState.warnings} registros requieren revisión
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          className="btn-primary"
          disabled={!allLoaded || processing}
          onClick={handleProcess}
          style={{
            padding: "12px 28px", fontSize: 15, fontWeight: 600,
            opacity: allLoaded && !processing ? 1 : 0.5,
          }}
        >
          {processing ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Procesando...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              Procesar información
            </>
          )}
        </button>
        {!allLoaded && (
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            Seleccione al menos un archivo para continuar
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
