{{/*
Usage: {{ tuple . "$name" | include "api.labels" | indent 2 }}
*/}}

{{- define "api.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}

{{- tuple $scope $lies_exposed_name "backend" | include "common.labels" -}}

{{- end -}}