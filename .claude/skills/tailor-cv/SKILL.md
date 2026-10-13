---
name: tailor-cv
description: Use when adapting Alex's CV to a specific job offer - analyses fit against the offer, reports gaps honestly, and only then generates a tailored one-page PDF from data/cv.json plus private/reserve.json. Triggers on "adapta el CV a esta oferta", "personaliza el CV", "encajo en esta oferta", or when a job posting is pasted with intent to apply.
---

# Personalizador de CV por oferta

Adapta el CV de Alex a una oferta concreta. Dos fases con una decision humana
en medio: nunca generes el PDF sin que Alex lo pida despues de leer el analisis.

## Regla dura: no inventar

Manda sobre cualquier otra consideracion de encaje.

- Todo bullet del CV adaptado debe trazar a una linea de `data/cv.json`,
  `data/cv.en.json` o `private/reserve.json`.
- Reencuadrar puede cambiar las palabras. No el alcance, la escala ni la
  seniority. "Coordine con el equipo de datos" no se convierte en "lidere el
  equipo de datos".
- Las cifras se copian literalmente. Nunca se redondean al alza ni se
  reexpresan en terminos mas favorables.
- Si la oferta pide algo que Alex no tiene, va en los gaps del analisis.
  Jamas se disimula en el PDF.
- Ante la duda de si un hecho esta respaldado, preguntale a Alex. No lo asumas.

## Fase 1 - analisis

No generes ningun archivo en esta fase.

1. Lee la oferta: texto pegado, o descargala si te dan una URL.
2. Carga `data/cv.json`, `data/cv.en.json` y, si existe, `private/reserve.json`.
3. Ejecuta `npm run check:reserve`. Si falla, para: una reserva incoherente
   significa que algun logro no se aplicaria y Alex creeria que si.
4. Produce en el chat:
   - Requisitos de la oferta, separados en imprescindibles y deseables.
   - Lo que cubre, cada punto con la evidencia concreta y de donde sale.
   - Lo que no cubre, explicito y sin suavizar.
   - Angulo de posicionamiento: que destacar primero y por que.
   - Veredicto: aplicar / aplicar con matices / no encaja.
5. Para y espera la decision de Alex.

## Fase 2 - generacion

Solo tras el visto bueno explicito de Alex.

Idioma: por defecto el de la oferta (oferta en ingles, base `cv.en.json`).
Alex puede forzar el otro; una oferta en ingles de una empresa espanola es el
caso tipico.

Slug: `<empresa>-<puesto>` en minusculas y con guiones, por ejemplo
`acme-head-of-operations`. Si la carpeta ya existe, anade sufijo `-YYYY-MM-DD`
en vez de sobrescribir: ese registro es la unica prueba de lo que se envio en
la primera candidatura.

Pasos:

1. Crea `private/variants/<slug>/`.
2. Escribe `oferta.md`: la oferta tal cual, con fecha y fuente (URL o "pegada").
3. Ensambla `private/variants/<slug>/cv.json` partiendo del canonico del idioma
   elegido. Permitido: seleccionar, reordenar, reencuadrar y traer material de
   la reserva. Prohibido: cualquier hecho ausente de ambas fuentes.
4. Genera el PDF:

       node scripts/build-pdf.js --data "private/variants/<slug>/cv.json" --out "private/variants/<slug>/CV_Alejandro_Rodriguez_<Empresa>.pdf"

5. Si la salida avisa de que ocupa mas de una pagina, recorta lo menos
   relevante para esa oferta y repite hasta que quepa.
6. Escribe `analisis.md` con el analisis de la Fase 1 mas la tabla de
   trazabilidad.

## Tabla de trazabilidad

Obligatoria en `analisis.md`. Es la unica verificacion real de que no se ha
inventado nada: como el texto se reescribe, no se puede comprobar comparando
cadenas, asi que la revision la hace Alex de un vistazo.

| Bullet en el CV adaptado | Origen | Texto original |
|---|---|---|
| ... | cv.json experience[1].bullets[0] | ... |
| ... | reserve.json experience["Branch Manager"].extraBullets[2] | ... |

Una fila por cada bullet, proyecto y skill que aparezca en el CV adaptado y no
sea identico al canonico.

## Al terminar

Reporta a Alex: ruta del PDF, que se priorizo y por que, que se dejo fuera, y
los gaps que siguen ahi. Los gaps no desaparecen porque el CV este adaptado:
son lo que le van a preguntar en la entrevista.
