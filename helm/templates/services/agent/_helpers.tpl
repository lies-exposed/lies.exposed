{{/*
Usage: {{ tuple . "$name" | include "agent.labels" | indent 2 }}
*/}}

{{- define "agent.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}

{{- tuple $scope $lies_exposed_name "agent" | include "common.labels" -}}

{{- end -}}