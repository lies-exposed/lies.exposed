{{/*
Usage: {{ tuple . "$name" | include "web.labels" | indent 2 }}
*/}}

{{- define "web.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{- tuple $scope $lies_exposed_name "frontend" | include "common.labels" -}}
{{- end -}}