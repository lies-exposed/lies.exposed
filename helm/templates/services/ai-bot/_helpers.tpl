{{/*
Usage: {{ tuple . "$name" | include "aiBot.labels" | indent 2 }}
*/}}

{{- define "aiBot.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}

{{- tuple $scope $lies_exposed_name "ai-bot" | include "common.labels" -}}

{{- end -}}