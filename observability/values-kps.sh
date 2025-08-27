helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create ns observability || true


# Minimal values to enable Grafana admin and scrape by annotations
cat <<'EOF' > values-kps.yaml
grafana:
  adminUser: admin
  adminPassword: admin123
  service:
    type: LoadBalancer
prometheus:
  prometheusSpec:
    serviceMonitorSelectorNilUsesHelmValues: false
EOF


helm install kps prometheus-community/kube-prometheus-stack \
-n observability -f values-kps.yaml