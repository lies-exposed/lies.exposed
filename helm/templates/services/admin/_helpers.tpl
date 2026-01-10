{{/*
Usage: {{ tuple . "$name" | include "admin.labels" | indent 2 }}
*/}}

{{- define "admin.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{- tuple $scope $lies_exposed_name "admin-frontend" | include "common.labels" -}}
{{- end -}}