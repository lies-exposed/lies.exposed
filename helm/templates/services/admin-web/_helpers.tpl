{{/*
Usage: {{ tuple . "$name" | include "adminWeb.labels" | indent 2 }}
*/}}

{{- define "adminWeb.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{- tuple $scope $lies_exposed_name "admin-frontend" | include "common.labels" -}}
{{- end -}}