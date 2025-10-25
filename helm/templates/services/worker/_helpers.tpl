{{/*
Usage: {{ tuple . "$name" | include "worker.labels" | indent 2 }}
*/}}

{{- define "worker.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{- tuple $scope $lies_exposed_name "worker" | include "common.labels" -}}
{{- end -}}

{{/*
Common job spec configuration for worker jobs
Usage: {{ include "worker.job.spec" (dict "timeout" 3600 "backoffLimit" 2) | indent 2 }}
*/}}
{{- define "worker.job.spec" -}}
backoffLimit: {{ .backoffLimit | default 2 }}
activeDeadlineSeconds: {{ .timeout | default 3600 }}
{{- end -}}

{{/*
Common pod spec configuration for worker jobs
Usage: {{ include "worker.job.podSpec" . | indent 6 }}
*/}}
{{- define "worker.job.podSpec" -}}
imagePullSecrets:
  - name: ghcr-io-registry-auth
volumes:
  - name: db-ca-certificate-crt
    secret:
      secretName: db-ca-certificate
      items:
        - key: db-ca-certificate.crt
          path: db-ca-certificate.crt
  - name: worker-temp-volume
    persistentVolumeClaim:
      claimName: temp-pv-claim
restartPolicy: Never
{{- end -}}

{{/*
Common container configuration for worker jobs
Usage: {{ include "worker.job.container" (dict "name" "container-name" "command" (list "node" "./build/bin/cli.js" "command-name") "jobConfig" .Values.worker.jobName) | indent 8 }}
*/}}
{{- define "worker.job.container" -}}
{{- $jobType := index .command 2 -}}
{{- $defaultResources := dict "limits" (dict "memory" "1Gi" "cpu" "500m") "requests" (dict "memory" "512Mi" "cpu" "200m") -}}
{{- if eq $jobType "upsert-nlp-entities" -}}
  {{- $defaultResources = dict "limits" (dict "memory" "512Mi" "cpu" "300m") "requests" (dict "memory" "256Mi" "cpu" "100m") -}}
{{- end -}}
{{- $resources := .jobConfig.resources | default $defaultResources -}}
name: {{ .name }}
image: ghcr.io/lies-exposed/liexp-worker:latest
imagePullPolicy: Always
envFrom:
  - configMapRef:
      name: worker-env
command:
{{- range .command }}
  - {{ . | quote }}
{{- end }}
{{- if .jobConfig.limit }}
  - {{ .jobConfig.limit | quote }}
{{- end }}
resources:
  limits:
    memory: {{ $resources.limits.memory | quote }}
    cpu: {{ $resources.limits.cpu | quote }}
  requests:
    memory: {{ $resources.requests.memory | quote }}
    cpu: {{ $resources.requests.cpu | quote }}
volumeMounts:
  - name: db-ca-certificate-crt
    mountPath: /prod/worker/certs/db-ca-certificate.crt
    subPath: db-ca-certificate.crt
  - name: worker-temp-volume
    mountPath: /prod/worker/temp
{{- end -}}

