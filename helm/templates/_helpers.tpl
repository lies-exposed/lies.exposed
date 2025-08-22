{{/*
Function to parse .env file and output in yaml
KEY_ENV1=VAL_ENV1      KEY_ENV1: base64(VAL_ENV1)
KEY_ENV2=VAL_ENV2  =>  KEY_ENV2: base64(VAL_ENV2)
KEY_ENV3=VAL_ENV3      KEY_ENV3: base64(VAL_ENV3)

Usage: {{ tuple . "config/env/api.env" | include "env.parseFile" | indent 2}}

*/}}

{{- define "env.parseFile" -}}
{{- $scope := index . 0 -}}
{{- $filePath := index . 1 -}}

{{- range $scope.Files.Lines $filePath -}}
{{- $a := splitn "=" 2 . -}}
{{- if $a._0 -}}
{{ $a._0 }}: {{ $a._1 | quote }}
{{ end -}}
{{- end -}}

{{- end -}}

{{- define "common.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{- $component := index . 2 -}}
labels:
  lies.exposed/name: {{ $lies_exposed_name | quote }}
  app.kubernetes.io/instance: {{ $scope.Release.Name | quote }}
  app.kubernetes.io/namespace: {{ $scope.Release.Namespace | quote }}
  app.kubernetes.io/component: {{ $component | quote }}
  app.kubernetes.io/part-of: lies-exposed
  app.kubernetes.io/managed-by: Helm
{{- end -}}