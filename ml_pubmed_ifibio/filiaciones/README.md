# Filiaciones: guía de interpretación

**fuente**: FullNetwork.ipynb: df[PMID, Authors]; todos los autores del dataframe actual

**identidad_autor**: AuthorClean si existe; si falta, apellido + nombre/iniciales o nombre colectivo. No hay desambiguación de personas. AuthorClean usa apellido y primera inicial y puede unir homónimos.

**unidad_filiacion**: Texto completo de cada entrada Affiliations/Affiliation. Solo normaliza Unicode y espacios. No divide por comas ni agrupa variantes institucionales.

**acumuladas**: Textos distintos observados en todos los artículos del autor; no implica simultaneidad ni instituciones distintas.

**max_filiaciones_en_un_paper**: Máximo de textos distintos declarados por ese autor en un mismo PMID.

**sin_filiacion**: Cero significa sin filiación registrada, no ausencia real de filiación.

**red**: No dirigida. Une dos filiaciones solo cuando el mismo autor declara ambas en el mismo PMID. Conserva nodos aislados.

**weight**: Número de autores distintos que sustentan la arista; cada autor cuenta una vez aunque tenga varios artículos.

**n_papers_arista**: Número de PMID distintos que sustentan la arista.

**n_autor_paper**: Número de pares autor-PMID que sustentan la arista.

**duplicados**: Se unen entradas repetidas con el mismo PMID y clave de autor; cada filiación cuenta una vez por autor-PMID.

**lectura_llm**: Leer esta metodología y el catálogo antes de interpretar autores y aristas; usar evidencia autor-PMID y textos_originales para verificar. No inferir afiliación actual ni movilidad a partir del acumulado.

**archivos**: filiaciones_llm.json contiene metodología, autores, catálogo, observaciones y aristas completas. CSV contienen tablas; listas codificadas en JSON. GraphML contiene la red con atributos escalares.