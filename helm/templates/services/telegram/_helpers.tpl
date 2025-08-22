{{/*
Usage: {{ tuple . "$name" | include "tg.labels" | indent 2 }}
*/}}

{{- define "tg.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{ tuple $scope $lies_exposed_name "telegram" | include "common.labels" }}
{{- end -}}