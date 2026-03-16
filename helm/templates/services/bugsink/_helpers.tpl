{{/*
Usage: {{ tuple . "$name" | include "bugsink.labels" | indent 2 }}
*/}}

{{- define "bugsink.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{- tuple $scope $lies_exposed_name "monitoring" | include "common.labels" -}}
{{- end -}}