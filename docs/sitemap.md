# Sitemap

```mermaid
flowchart TD
  I["Inicio #/inicio"] --> D["Docentes y asignaturas #/docentes"]
  I --> P1["Reservar 1: materia y docente #/reservar/1"]
  I --> L["Mis reservas #/reservas"]
  D --> P1
  P1 --> P2["2: modalidad y horario #/reservar/2"]
  P2 --> P3["3: motivo #/reservar/3"]
  P3 --> P4["4: revisar #/reservar/4"]
  P4 --> C["Confirmación #/confirmacion/:id"]
  C --> L
  C --> I
  L -->|Modificar| P1
  L -->|Cancelar| X["Diálogo de confirmación"]
  X --> L
```

La navegación principal (Inicio, Docentes, Reservar, Mis reservas) está en todas las pantallas. Si se entra por URL a un paso sin completar los anteriores, la app redirige al primero incompleto.
