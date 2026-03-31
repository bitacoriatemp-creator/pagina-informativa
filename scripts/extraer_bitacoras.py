"""
BitacorIA - Extractor de Notas de Bitácora desde PDFs de Tesis
Escanea 21 PDFs buscando patrones de bitácora de obra reales
"""
import fitz  # PyMuPDF
import os, re, json

PDF_DIR = r"C:\BitacorIA_Data\Tesis_Bitacoras"
OUTPUT = r"C:\BitacorIA_Data\Tesis_Bitacoras\extraccion_bitacoras.json"

# Palabras clave para filtrar páginas relevantes
KEYWORDS = [
    r"nota\s*(de\s*)?bit[aá]cora", r"nota\s*no\.\s*\d+", r"incidencia",
    r"orden\s*de\s*cambio", r"se\s*ordena\s*al\s*contratista",
    r"estimaci[oó]n\s*n[oú]m", r"suspensi[oó]n\s*(de\s*)?obra",
    r"residente\s*de\s*obra", r"supervisor\s*de\s*obra",
    r"bit[aá]cora\s*de\s*obra", r"formato\s*de\s*bit[aá]cora",
    r"anotaci[oó]n", r"acta\s*de", r"fecha\s*de\s*inicio",
    r"plazo\s*de\s*ejecuci[oó]n", r"penalizaci[oó]n",
    r"fuerza\s*mayor", r"caso\s*fortuito", r"pr[oó]rroga",
    r"lopsrm", r"art[ií]culo\s*\d+", r"contratista",
    r"escalatoria", r"ajuste\s*de\s*costos"
]
KEYWORD_PATTERN = re.compile("|".join(KEYWORDS), re.IGNORECASE)

results = {}
total_pages_scanned = 0
total_relevant_pages = 0

for fname in sorted(os.listdir(PDF_DIR)):
    if not fname.lower().endswith(".pdf"):
        continue
    fpath = os.path.join(PDF_DIR, fname)
    print(f"Procesando: {fname}...", end=" ")
    try:
        doc = fitz.open(fpath)
        relevant_pages = []
        for page_num in range(len(doc)):
            total_pages_scanned += 1
            text = doc[page_num].get_text()
            if KEYWORD_PATTERN.search(text):
                total_relevant_pages += 1
                # Guardar solo las primeras 2000 chars de cada página relevante
                relevant_pages.append({
                    "page": page_num + 1,
                    "text_preview": text[:2000],
                    "keywords_found": list(set(
                        m.group().lower() for m in KEYWORD_PATTERN.finditer(text)
                    ))
                })
        doc.close()
        print(f"{len(relevant_pages)} págs relevantes de {len(doc)}")
        if relevant_pages:
            results[fname] = {
                "total_pages": len(doc),
                "relevant_pages": len(relevant_pages),
                "data": relevant_pages[:20]  # Max 20 pages per doc
            }
    except Exception as e:
        print(f"ERROR: {e}")

# Guardar resultados
with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n=== RESUMEN ===")
print(f"PDFs procesados: {len(os.listdir(PDF_DIR)) - 1}")
print(f"Páginas escaneadas: {total_pages_scanned}")
print(f"Páginas relevantes: {total_relevant_pages}")
print(f"Documentos con contenido: {len(results)}")
print(f"Resultados guardados en: {OUTPUT}")

# Mini-análisis de keywords más frecuentes
all_kw = []
for doc_data in results.values():
    for page in doc_data["data"]:
        all_kw.extend(page["keywords_found"])

from collections import Counter
print(f"\n=== TOP 15 KEYWORDS ===")
for kw, count in Counter(all_kw).most_common(15):
    print(f"  {kw}: {count}")
