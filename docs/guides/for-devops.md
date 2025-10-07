# Guide for DevOps Engineers

This guide focuses on integrating the OpenFeature Action into your CI/CD pipelines and operational workflows.

## Integration Strategies

### 1. Pull Request Validation

**Recommended setup**: Use both git comparison and remote comparison to get complete visibility.

```yaml
name: Comprehensive Flag Validation
on:
  pull_request:
    branches: [main, develop]
    paths: ['flags.json', 'config/flags/**']

permissions:
  contents: read
  pull-requests: write

jobs:
  validate-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      # Show what changed in this PR
      - name: Git comparison
        uses: open-feature/openfeature-action@v1
        id: git-check
        with:
          manifest: flags.json
      
      # Check for drift from production
      - name: Production drift check
        uses: open-feature/openfeature-action@v1
        id: drift-check
        with:
          manifest: flags.json
          against: ${{ secrets.PROD_FLAG_URL }}
          auth-token: ${{ secrets.PROD_TOKEN }}
          post-pr-comment: false  # Avoid duplicate comments
      
      - name: Summary report
        run: |
          echo "## 📊 Flag Validation Summary" >> $GITHUB_STEP_SUMMARY
          echo "**PR Changes:** ${{ steps.git-check.outputs.has-differences }}" >> $GITHUB_STEP_SUMMARY
          echo "**Production Drift:** ${{ steps.drift-check.outputs.has-differences }}" >> $GITHUB_STEP_SUMMARY
```

### 2. Deployment Pipeline Integration

**Pre-deployment validation** to prevent problematic deployments:

```yaml
name: Production Deployment
on:
  push:
    branches: [main]

jobs:
  pre-deploy-checks:
    runs-on: ubuntu-latest
    outputs:
      safe-to-deploy: ${{ steps.validation.outputs.safe }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate against staging
        id: staging
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.STAGING_FLAG_URL }}
          auth-token: ${{ secrets.STAGING_TOKEN }}
          strict: true
          
      - name: Check deployment safety
        id: validation
        run: |
          if [ "${{ steps.staging.outputs.has-differences }}" = "false" ]; then
            echo "safe=true" >> $GITHUB_OUTPUT
            echo "✅ Safe to deploy - flags match staging"
          else
            echo "safe=false" >> $GITHUB_OUTPUT
            echo "⚠️ Flag differences detected - review required"
          fi
  
  deploy:
    needs: pre-deploy-checks
    if: needs.pre-deploy-checks.outputs.safe-to-deploy == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Your deployment logic here
          echo "Deploying to production..."
```

### 3. Drift Detection & Monitoring

**Scheduled drift detection** to catch configuration drift:

```yaml
name: Configuration Drift Detection
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  drift-detection:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
        
    steps:
      - uses: actions/checkout@v4
      
      - name: Check ${{ matrix.environment }} drift
        id: drift
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets[format('FLAG_URL_{0}', upper(matrix.environment))] }}
          auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}
          
      - name: Alert on drift
        if: steps.drift.outputs.has-differences == 'true'
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "🚨 Configuration drift detected in ${{ matrix.environment }}",
              attachments: [{
                color: "danger",
                fields: [{
                  title: "Environment",
                  value: "${{ matrix.environment }}",
                  short: true
                }, {
                  title: "Summary", 
                  value: "${{ steps.drift.outputs.summary }}",
                  short: false
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Operational Best Practices

### Environment Strategy

**Use different validation approaches per environment:**

```yaml
# Development: Relaxed validation
- name: Dev validation
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    strict: false

# Staging: Moderate validation  
- name: Staging validation
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    against: ${{ secrets.STAGING_URL }}
    strict: false

# Production: Strict validation
- name: Production validation
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    against: ${{ secrets.PROD_URL }}
    strict: true  # Fail on any differences
```

### Authentication Management

**Secure token management:**

```yaml
# Use environment-specific secrets
auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}

# Or use different tokens for read vs write
auth-token: ${{ secrets.FLAG_READ_TOKEN }}  # Read-only for validation
```

**Token rotation strategy:**

1. Use read-only tokens when possible
2. Rotate tokens quarterly
3. Use different tokens per environment
4. Monitor token usage in your flag provider

### Performance Optimization

**Cache CLI installation:**

```yaml
- name: Cache OpenFeature CLI
  uses: actions/cache@v3
  with:
    path: ~/go/bin/openfeature
    key: openfeature-cli-${{ runner.os }}-v0.3.6
    
- name: Compare manifests
  uses: open-feature/openfeature-action@v1
  with:
    cli-version: "v0.3.6"  # Pin for consistent caching
```

**Parallel validation:**

```yaml
jobs:
  validate:
    strategy:
      matrix:
        environment: [dev, staging, prod]
    runs-on: ubuntu-latest
    steps:
      - name: Validate ${{ matrix.environment }}
        uses: open-feature/openfeature-action@v1
        with:
          against: ${{ secrets[format('URL_{0}', upper(matrix.environment))] }}
```

## Monitoring & Alerting

### Metrics Collection

**Track validation metrics:**

```yaml
- name: Collect metrics
  if: always()
  run: |
    echo "flag_validation_total{environment=\"$ENV\",result=\"$RESULT\"} 1" >> metrics.txt
    echo "flag_differences_total{environment=\"$ENV\"} $DIFF_COUNT" >> metrics.txt
    # Send to your metrics system
  env:
    ENV: production
    RESULT: ${{ job.status }}
    DIFF_COUNT: ${{ env.TOTAL_CHANGES || 0 }}
```

### Alerting Rules

**Critical alerts:**

```yaml
- name: Critical alert
  if: |
    steps.validation.outputs.has-differences == 'true' && 
    contains(steps.validation.outputs.summary, 'ENABLED')
  run: |
    # Alert when flags are being enabled in production
    curl -X POST "$PAGERDUTY_URL" -d '{
      "incident_key": "flag-enabled-${{ github.sha }}",
      "event_type": "trigger",
      "description": "Flag enabled in production: ${{ steps.validation.outputs.summary }}"
    }'
```

### Compliance & Auditing

**Audit trail generation:**

```yaml
- name: Generate audit log
  run: |
    cat << EOF > audit-log.json
    {
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "event": "flag_validation",
      "repository": "${{ github.repository }}",
      "commit": "${{ github.sha }}",
      "actor": "${{ github.actor }}",
      "changes": ${{ steps.validation.outputs.comparison-result }},
      "approved_by": "${{ github.event.pull_request.merged_by.login }}"
    }
    EOF
    
    # Send to your audit system
    curl -X POST "$AUDIT_ENDPOINT" \
      -H "Content-Type: application/json" \
      -d @audit-log.json
```

## Advanced Integration Patterns

### GitOps Integration

**ArgoCD integration:**

```yaml
- name: Update GitOps repository
  if: steps.validation.outputs.has-differences == 'false'
  run: |
    git clone https://github.com/org/gitops-config.git
    cd gitops-config
    cp ../flags.json environments/production/
    git add .
    git commit -m "Update flags from ${{ github.repository }}@${{ github.sha }}"
    git push
```

### Progressive Delivery

**Flagger integration:**

```yaml
- name: Create canary deployment
  if: |
    steps.validation.outputs.has-differences == 'true' &&
    contains(steps.validation.outputs.summary, 'defaultValue')
  run: |
    # Create canary deployment for flag changes
    kubectl apply -f - <<EOF
    apiVersion: flagger.app/v1beta1
    kind: Canary
    metadata:
      name: app-flags-canary
    spec:
      analysis:
        threshold: 5
        stepWeight: 20
        metrics:
        - name: flag-validation-success
          threshold: 99
    EOF
```

### Multi-Cluster Validation

**Validate across multiple Kubernetes clusters:**

```yaml
jobs:
  validate-clusters:
    strategy:
      matrix:
        cluster: [us-east-1, us-west-2, eu-west-1]
    runs-on: ubuntu-latest
    steps:
      - name: Configure kubectl
        run: |
          aws eks update-kubeconfig --name cluster-${{ matrix.cluster }}
          
      - name: Validate cluster flags
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: "https://flags-${{ matrix.cluster }}.example.com/flags"
```

## Troubleshooting for DevOps

### Common CI/CD Issues

**Network timeouts:**

```yaml
- name: Compare with retry
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: |
      # Your comparison command
```

**Resource constraints:**

```yaml
runs-on: ubuntu-latest-4-cores  # Use larger runners if needed
```

**Rate limiting:**

```yaml
- name: Rate limit delay
  run: sleep ${{ github.run_number }}  # Stagger runs
```

### Debugging

**Enable debug mode:**

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

**Capture detailed logs:**

```yaml
- name: Debug validation
  if: failure()
  run: |
    echo "CLI version: $(openfeature version)"
    echo "Manifest content:"
    cat flags.json
    echo "Against manifest content:"
    cat against-flags.json
```

## Next Steps

- **[Advanced Scenarios](../examples/advanced-scenarios.md)** - Complex deployment patterns
- **[Security](../security.md)** - Security best practices
- **[Testing](../testing.md)** - Testing your integration
- **[Troubleshooting](../troubleshooting.md)** - Common issues and solutions
