---
name: tailor-cv
description: Use when adapting Alex's CV to a specific job offer - analyses fit against the offer, reports gaps honestly, and only then generates a tailored one-page PDF from data/cv.json plus private/reserve.json. Triggers on "adapta el CV a esta oferta", "personaliza el CV", "encajo en esta oferta", or when a job posting is pasted with intent to apply.
---

# Personalizador de CV por oferta

Adapta el CV de Alex a una oferta concreta. Dos fases con una decision humana
en medio.

**La peticion que activa esta skill no es el visto bueno.** "Adapta el CV a
esta oferta" es la entrada de la Fase 1, no una autorizacion para generar nada.
Alex tiene que leer el analisis y decir que si despues. Sin esa segunda
respuesta suya, no se crea ningun archivo.

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

## Regla dura: el repositorio es publico

`github.com/AlexRoga08/cv-web` es publico. Las variantes revelan a que empresas
aplica Alex y cuando; la reserva contiene detalle interno de su empleador
actual.

- Todo lo que escribas sobre una candidatura va **dentro de `private/`**, que
  esta en `.gitignore`. Nunca en la raiz, `docs/`, `assets/` ni ninguna otra
  carpeta del repo.
- Nunca commitees nada de `private/`, ni lo cites entero en un mensaje que
  acabe en un sitio publico.
- `build-pdf.js` rechaza un `--out` que caiga dentro del repo y fuera de
  `private/`, pero esa red solo cubre el PDF: los `.md` que escribas tu no la
  tienen.

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

Solo tras el visto bueno explicito de Alex, dado despues de leer el analisis.

Idioma: por defecto el de la oferta (oferta en ingles, base `cv.en.json`).
Alex puede forzar el otro; una oferta en ingles de una empresa espanola es el
caso tipico.

La reserva esta escrita con las claves del canonico **espanol**. Para una
variante en ingles, mapea cada entrada a su equivalente por posicion:
`experience[i]` y `skills[i]` estan en el mismo orden en los dos idiomas, y
`npm run check:reserve` falla si dejan de estarlo. Traduce el texto del bullet
que traigas de la reserva; no lo pegues en castellano dentro de un CV ingles.

Slug: `<empresa>-<puesto>` en minusculas y con guiones, por ejemplo
`acme-head-of-operations`. Si la carpeta ya existe, anade sufijo `-YYYY-MM-DD`
en vez de sobrescribir: ese registro es la unica prueba de lo que se envio en
la primera candidatura.

Pasos, en este orden:

1. Crea `private/variants/<slug>/`.
2. Escribe `oferta.md`: la oferta tal cual, con fecha y fuente (URL o "pegada").
3. Ensambla `private/variants/<slug>/cv.json` partiendo del canonico del idioma
   elegido. Permitido: seleccionar, reordenar, reencuadrar y traer material de
   la reserva. Prohibido: cualquier hecho ausente de ambas fuentes.
4. Escribe `analisis.md` con el analisis de la Fase 1 y la tabla de
   trazabilidad. **Antes de generar el PDF, no despues**: la tabla es lo que
   demuestra que el paso 3 no invento nada, y escribirla obliga a revisar cada
   linea mientras aun es barato corregirla.
5. Genera el PDF:

       node scripts/build-pdf.js --data "private/variants/<slug>/cv.json" --out "private/variants/<slug>/CV_Alejandro_Rodriguez_<Empresa>.pdf"

   El generador rechaza datos mal formados y avisa si el contenido pasa de una
   pagina. Si avisa, recorta lo menos relevante para esa oferta, **actualiza la
   tabla de trazabilidad** y repite hasta que quepa.

## Tabla de trazabilidad

Obligatoria en `analisis.md`. Es la unica verificacion real de que no se ha
inventado nada: como el texto se reescribe, no se puede comprobar comparando
cadenas, asi que la revision la hace Alex de un vistazo. La columna "Texto
original" debe poder encontrarse con un grep en `data/cv.json` o
`private/reserve.json`; si no aparece, el bullet esta inventado.

| Bullet en el CV adaptado | Origen | Texto original |
|---|---|---|
| ... | cv.json experience[1].bullets[0] | ... |
| ... | reserve.json experience["Branch Manager"].extraBullets[2] | ... |

Una fila por cada bullet, proyecto y skill que aparezca en el CV adaptado y no
sea identico al canonico.

## Al terminar

Reporta a Alex:

- Ruta del PDF y del `analisis.md`.
- Que se priorizo y por que, y que se dejo fuera.
- Los gaps que siguen ahi. No desaparecen porque el CV este adaptado: son lo
  que le van a preguntar en la entrevista.
- Pidele explicitamente que **lea la tabla de trazabilidad antes de enviar el
  CV**. Nadie mas lo va a comprobar.
