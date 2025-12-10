# Kubernetes Configuration for Arnova

This directory contains Kubernetes manifests for deploying the Arnova e-commerce platform.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured to access your cluster
- Docker registry credentials (if using private images)
- Helm (optional, for advanced deployments)

## Quick Start

### 1. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -k k8s/

# Or apply individual manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/django-secret.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/nginx-configmap.yaml
kubectl apply -f k8s/django-deployment.yaml
kubectl apply -f k8s/nginx-deployment.yaml
```

### 2. Check Deployment Status

```bash
# Check pods
kubectl get pods -n arnova

# Check services
kubectl get svc -n arnova

# Check deployments
kubectl get deployments -n arnova

# Check logs
kubectl logs -n arnova deployment/django-app
kubectl logs -n arnova deployment/nginx
```

### 3. Run Database Migrations

```bash
# Get a pod name
POD_NAME=$(kubectl get pods -n arnova -l app=django-app -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -it -n arnova $POD_NAME -- python manage.py migrate

# Create superuser
kubectl exec -it -n arnova $POD_NAME -- python manage.py createsuperuser
```

## Configuration Files

### Namespace & Secrets

- `namespace.yaml` - Creates the `arnova` namespace
- `postgres-secret.yaml` - PostgreSQL credentials
- `django-secret.yaml` - Django configuration

### Database

- `postgres-deployment.yaml` - PostgreSQL StatefulSet and PersistentVolume

### Application

- `django-deployment.yaml` - Django application deployment
- `nginx-configmap.yaml` - Nginx configuration
- `nginx-deployment.yaml` - Nginx reverse proxy deployment

### Networking

- `ingress.yaml` - Ingress configuration for external access
- `network-policy.yaml` - Network policies for security

### Scaling

- `hpa.yaml` - Horizontal Pod Autoscaler for auto-scaling

## Customization

### Update Secrets

Edit the secret files before deployment:

```bash
# PostgreSQL credentials
kubectl edit secret postgres-secret -n arnova

# Django secret key
kubectl edit secret django-secret -n arnova
```

### Update Django Image

Update the image tag in `django-deployment.yaml`:

```yaml
image: your-registry/arnova:v1.0.0
imagePullPolicy: Always
```

### Configure Ingress

Update the domain names in `ingress.yaml`:

```yaml
- host: your-domain.com
  http:
    paths:
      - path: /
```

### Adjust Resource Limits

Modify resource requests/limits in deployment files:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment django-app -n arnova --replicas=5
kubectl scale deployment nginx -n arnova --replicas=3
```

### Automatic Scaling (HPA)

The HPA configuration will automatically scale based on:

- CPU utilization: 70% for Django, 75% for Nginx
- Memory utilization: 80% for Django

```bash
kubectl get hpa -n arnova
kubectl describe hpa django-hpa -n arnova
```

## Monitoring

### Check Pod Status

```bash
kubectl get pods -n arnova -o wide
kubectl describe pod <pod-name> -n arnova
```

### View Logs

```bash
kubectl logs <pod-name> -n arnova
kubectl logs -f <pod-name> -n arnova  # Follow logs
kubectl logs -n arnova -l app=django-app --all-containers=true
```

### Check Events

```bash
kubectl get events -n arnova
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status and events
kubectl describe pod <pod-name> -n arnova

# Check logs
kubectl logs <pod-name> -n arnova
```

### Database connection issues

```bash
# Test PostgreSQL connectivity
kubectl exec -it <django-pod> -n arnova -- \
  psql -h postgres -U arnova_user -d arnova_db
```

### Nginx errors

```bash
# Check Nginx logs
kubectl logs <nginx-pod> -n arnova

# Test configuration
kubectl exec <nginx-pod> -n arnova -- nginx -t
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k k8s/

# Or delete namespace (everything inside will be deleted)
kubectl delete namespace arnova
```

## Production Checklist

- [ ] Change Django SECRET_KEY in `django-secret.yaml`
- [ ] Update PostgreSQL password in `postgres-secret.yaml`
- [ ] Configure proper domain in `ingress.yaml`
- [ ] Set up TLS certificates (cert-manager recommended)
- [ ] Configure ingress controller (nginx-ingress)
- [ ] Review and adjust resource limits
- [ ] Set up persistent storage for PostgreSQL
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Configure RBAC policies
- [ ] Review network policies
- [ ] Set up CI/CD pipeline

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kustomize Documentation](https://kustomize.io/)
