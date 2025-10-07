# Remote Comparison Examples

This page covers advanced scenarios for comparing manifests with remote sources.

## Remote-to-Remote Comparison

Compare two remote flag providers directly:

```yaml
- name: Compare staging vs production
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "https://staging.flagprovider.com/flags.json"
    against: "https://production.flagprovider.com/flags.json"
    manifest-auth-token: ${{ secrets.STAGING_TOKEN }}
    auth-token: ${{ secrets.PRODUCTION_TOKEN }}
```

## Multi-Provider Comparison

Compare different flag management systems:

```yaml
name: Compare Flag Providers
on: [push, workflow_dispatch]

jobs:
  compare-providers:
    runs-on: ubuntu-latest
    steps:
      - name: Compare LaunchDarkly vs Flagsmith
        uses: open-feature/openfeature-action@v1
        with:
          manifest: "https://app.launchdarkly.com/api/v2/flags/export"
          against: "https://api.flagsmith.com/api/v1/environments/flags/"
          manifest-auth-token: ${{ secrets.LAUNCHDARKLY_TOKEN }}
          auth-token: ${{ secrets.FLAGSMITH_TOKEN }}
```

## Environment Drift Detection

### Single Environment Check

```yaml
- name: Check production drift
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"  # Local configuration
    against: "https://api.yourcompany.com/flags"
    auth-token: ${{ secrets.PRODUCTION_API_TOKEN }}
    strict: true  # Fail if drift detected
```

### Multi-Environment Matrix

Check drift across multiple environments:

```yaml
name: Multi-Environment Drift Detection
on: 
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM
  workflow_dispatch:

jobs:
  check-drift:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
        fail-fast: false
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Check ${{ matrix.environment }} drift
        uses: open-feature/openfeature-action@v1
        with:
          manifest: "flags.json"
          against: ${{ secrets[format('FLAG_URL_{0}', upper(matrix.environment))] }}
          auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}
          against-manifest-path: "${{ matrix.environment }}-flags.json"
          
      - name: Upload drift report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: drift-report-${{ matrix.environment }}
          path: ${{ matrix.environment }}-flags.json
```

## Different Authentication Methods

### Bearer Token Authentication

```yaml
- name: Compare with bearer token
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags"
    manifest: "flags.json"
    auth-token: ${{ secrets.BEARER_TOKEN }}
```

### API Key Authentication

```yaml
- name: Compare with API key
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags?api_key=${{ secrets.API_KEY }}"
    manifest: "flags.json"
```

### Different Auth for Each Source

```yaml
- name: Different auth tokens
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "https://staging-api.example.com/flags"
    against: "https://prod-api.example.com/flags"
    manifest-auth-token: ${{ secrets.STAGING_AUTH }}
    auth-token: ${{ secrets.PROD_AUTH }}
```

## Git Repository Sources

### Git Repository via HTTPS

```yaml
- name: Compare with Git repo
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://github.com/org/config-repo/raw/main/flags.json"
    manifest: "flags.json"
    auth-token: ${{ secrets.GITHUB_TOKEN }}
```

### Git Repository via SSH

```yaml
- name: Compare with Git repo via SSH
  uses: open-feature/openfeature-action@v1
  with:
    against: "git@github.com:org/config-repo.git#main:flags.json"
    manifest: "flags.json"
```

## Advanced Remote Scenarios

### Fallback Sources

Try multiple sources with fallback:

```yaml
- name: Compare with primary source
  id: primary
  uses: open-feature/openfeature-action@v1
  continue-on-error: true
  with:
    against: "https://primary-api.example.com/flags"
    manifest: "flags.json"
    auth-token: ${{ secrets.PRIMARY_TOKEN }}

- name: Compare with backup source
  if: failure() && steps.primary.conclusion == 'failure'
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://backup-api.example.com/flags"
    manifest: "flags.json"
    auth-token: ${{ secrets.BACKUP_TOKEN }}
```

### Custom Headers

When you need custom headers (using URL parameters):

```yaml
- name: Compare with custom headers
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags"
    manifest: "flags.json"
    auth-token: "Bearer ${{ secrets.ACCESS_TOKEN }}"
```

### Rate Limited APIs

Handle rate-limited APIs with delays:

```yaml
- name: Wait before API call
  run: sleep 5

- name: Compare with rate-limited API
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags"
    manifest: "flags.json"
    auth-token: ${{ secrets.API_TOKEN }}
```

## Monitoring and Alerting

### Slack Notifications

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    against: "https://api.example.com/flags"
    auth-token: ${{ secrets.FLAG_TOKEN }}

- name: Notify on drift
  if: steps.compare.outputs.has-differences == 'true'
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{
        "text": "🚨 Configuration drift detected!",
        "attachments": [{
          "color": "warning",
          "fields": [{
            "title": "Changes Found",
            "value": "${{ steps.compare.outputs.summary }}",
            "short": false
          }]
        }]
      }' \
      ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

```yaml
- name: Send email on differences
  if: steps.compare.outputs.has-differences == 'true'
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "Flag Configuration Drift Detected"
    body: |
      Configuration drift detected in flag manifests.
      
      Summary: ${{ steps.compare.outputs.summary }}
      
      Please review the changes and sync your configurations.
    to: devops-team@company.com
```

## Next Steps

- **[Advanced Scenarios](advanced-scenarios.md)** - Multi-environment, strict mode, etc.
- **[CI/CD Integration](ci-cd-integration.md)** - Complete workflow examples
- **[Troubleshooting](../troubleshooting.md)** - Common issues with remote sources
