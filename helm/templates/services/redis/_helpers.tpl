{{/*
Usage: {{ tuple . "$name" | include "redis.labels" | indent 2 }}
*/}}

{{- define "redis.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{- tuple $scope $lies_exposed_name "cache" | include "common.labels" -}}
{{- end -}}