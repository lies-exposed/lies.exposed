{{/*
Usage: {{ tuple . "$name" | include "localai.labels" | indent 2 }}
*/}}

{{- define "localai.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}

{{- tuple $scope $lies_exposed_name "ai" | include "common.labels" -}}

{{- end -}}