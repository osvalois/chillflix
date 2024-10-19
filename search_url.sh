#!/bin/bash

# Directorio donde buscar (cambia esto al directorio de tu proyecto)
SEARCH_DIR="."

# URL a buscar
SEARCH_URL="http://www.welcometoscotland.com/blog/"

# Nombre de este script
SCRIPT_NAME=$(basename "$0")

echo "Buscando '$SEARCH_URL' en $SEARCH_DIR"

# Busca la URL en todos los archivos, excluyendo directorios comunes que no son relevantes y este script
RESULTS=$(grep -r --exclude-dir={node_modules,.git,build,dist} --exclude="$SCRIPT_NAME" "$SEARCH_URL" "$SEARCH_DIR")

# Comprueba si se encontraron resultados
if [ -n "$RESULTS" ]; then
    echo "La URL se encontró en los siguientes archivos:"
    echo "$RESULTS" | while IFS=':' read -r file content; do
        echo "Archivo: $file"
        echo "Contenido: $content"
        echo "------------------------"
    done
else
    echo "No se encontró la URL en ningún archivo del proyecto."
fi