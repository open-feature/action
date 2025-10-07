# Guide for Security Teams

This guide covers security considerations, compliance requirements, and best practices for using the OpenFeature Action in security-conscious environments.

## Security Benefits

### Configuration Drift Detection

Detect when local configurations diverge from production, helping prevent:

- **Unauthorized flag changes** that bypass security controls
- **Configuration tampering** in production environments
- **Shadow deployments** where flags differ between environments

### Change Auditing

Every flag change is tracked and visible in pull requests:

- **Full audit trail** of who changed what and when
- **Peer review** requirements for flag modifications
- **Approval workflows** for sensitive flag changes

### Access Control

Treat flag changes like code changes:

- **Code review** requirements for all flag modifications
- **Branch protection** rules for critical environments
- **Role-based access** through GitHub permissions

## Security Configuration

### Token Management

**Use least-privilege tokens:**

```yaml
# Read-only token for validation
- name: Validate flags
  uses: open-feature/openfeature-action@v1
  with:
    auth-token: ${{ secrets.FLAG_READ_ONLY_TOKEN }}
    manifest: flags.json
```

**Environment-specific tokens:**

```yaml
# Different tokens per environment
strategy:
  matrix:
    environment: [dev, staging, prod]
steps:
  - name: Validate ${{ matrix.environment }}
    uses: open-feature/openfeature-action@v1
    with:
      auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}
```

**Token rotation schedule:**

- **Development**: Rotate every 6 months
- **Staging**: Rotate every 3 months  
- **Production**: Rotate every 30 days

### Secure Workflow Configuration

**Set minimal permissions:**

```yaml
permissions:
  contents: read          # Read repository content
  pull-requests: write   # Post PR comments (optional)
  # No other permissions needed
```

**Pin action versions:**

```yaml
# ✅ Good - specific version
uses: open-feature/openfeature-action@v1.2.3

# ❌ Avoid - moving tags
uses: open-feature/openfeature-action@v1
uses: open-feature/openfeature-action@main
```

**Pin CLI versions:**

```yaml
- name: Validate with pinned CLI
  uses: open-feature/openfeature-action@v1.2.3
  with:
    cli-version: "v0.3.6"  # Specific, audited version
```

## Compliance & Governance

### SOX Compliance

**Audit trail requirements:**

```yaml
- name: Generate compliance audit log
  if: always()
  run: |
    cat << EOF > audit-log.json
    {
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "event_type": "flag_validation",
      "repository": "${{ github.repository }}",
      "commit_sha": "${{ github.sha }}",
      "actor": "${{ github.actor }}",
      "pr_number": "${{ github.event.pull_request.number }}",
      "reviewer": "${{ github.event.pull_request.merged_by.login }}",
      "changes_detected": "${{ steps.validation.outputs.has-differences }}",
      "summary": "${{ steps.validation.outputs.summary }}",
      "environment": "production",
      "compliance_check": "passed"
    }
    EOF
    
    # Send to compliance logging system
    curl -X POST "$COMPLIANCE_ENDPOINT" \
      -H "Authorization: Bearer ${{ secrets.COMPLIANCE_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d @audit-log.json
```

### GDPR/Privacy Compliance

**Sensitive flag detection:**

```yaml
- name: Check for sensitive flags
  run: |
    # Scan for flags that might contain PII or sensitive data
    if grep -i "email\|phone\|ssn\|credit" flags.json; then
      echo "::error::Potentially sensitive data detected in flags"
      echo "Please review flag names and values for PII"
      exit 1
    fi
```

**Data classification:**

```yaml
- name: Classify flag data
  run: |
    # Check if flags contain sensitive targeting rules
    if jq '.flags[].targeting | select(. != {})' flags.json | grep -q .; then
      echo "::warning::Targeting rules detected - ensure compliance with data protection policies"
      echo "::notice::Review targeting criteria for PII usage"
    fi
```

### Change Control Process

**Approval workflow for production:**

```yaml
name: Production Flag Changes
on:
  pull_request:
    branches: [main]
    paths: ['flags.json']

jobs:
  security-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Validate changes
        id: validation
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          strict: true
          
      - name: Require security approval
        if: steps.validation.outputs.has-differences == 'true'
        uses: hmarr/auto-approve-action@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          required-approvals: 2
          required-approval-teams: "security-team,devops-team"
```

## Vulnerability Management

### Dependency Scanning

**Scan action dependencies:**

```yaml
- name: Security scan
  uses: securecodewarrior/github-action-add-sarif@v1
  with:
    sarif-file: security-scan.sarif
    
- name: Validate with security scan
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
```

### Secret Detection

**Prevent secrets in flag configurations:**

```yaml
- name: Secret detection
  uses: trufflesecurity/trufflehog@main
  with:
    path: flags.json
    
- name: Validate flags are clean
  run: |
    if grep -E "(password|secret|key|token)" flags.json; then
      echo "::error::Potential secrets detected in flag configuration"
      exit 1
    fi
```

### Supply Chain Security

**Verify action integrity:**

```yaml
- name: Verify action signature
  uses: sigstore/cosign-installer@v2
  
- name: Validate with verified action
  uses: open-feature/openfeature-action@v1.2.3
  # Action should be signed and verified
```

## Monitoring & Alerting

### Security Event Monitoring

**Real-time security alerts:**

```yaml
- name: Security monitoring
  if: steps.validation.outputs.has-differences == 'true'
  run: |
    # Alert security team of flag changes
    curl -X POST "$SECURITY_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d '{
        "alert_type": "flag_change_detected",
        "severity": "medium", 
        "repository": "${{ github.repository }}",
        "actor": "${{ github.actor }}",
        "changes": "${{ steps.validation.outputs.summary }}",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
      }'
```

**Anomaly detection:**

```yaml
- name: Detect unusual changes
  run: |
    # Alert on bulk flag changes (potential compromise)
    CHANGE_COUNT=$(echo "${{ env.TOTAL_CHANGES }}" | grep -o '[0-9]*' || echo 0)
    if [ "$CHANGE_COUNT" -gt 10 ]; then
      echo "::error::Unusual number of flag changes detected ($CHANGE_COUNT)"
      echo "::error::Potential security incident - review immediately"
      # Trigger security incident response
    fi
```

### Compliance Monitoring

**Continuous compliance checks:**

```yaml
name: Compliance Monitoring
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  compliance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Production compliance check
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.PROD_FLAG_URL }}
          auth-token: ${{ secrets.PROD_READ_TOKEN }}
          strict: true
          
      - name: Generate compliance report
        if: always()
        run: |
          echo "## Daily Compliance Report" >> compliance-report.md
          echo "**Date:** $(date)" >> compliance-report.md
          echo "**Status:** ${{ job.status }}" >> compliance-report.md
          echo "**Drift Detected:** ${{ steps.check.outputs.has-differences }}" >> compliance-report.md
          
      - name: Archive compliance report
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report-$(date +%Y%m%d)
          path: compliance-report.md
          retention-days: 2555  # 7 years for compliance
```

## Incident Response

### Security Incident Workflow

**Automated incident response:**

```yaml
- name: Security incident detection
  if: |
    steps.validation.outputs.has-differences == 'true' &&
    github.actor != 'dependabot[bot]' &&
    contains(steps.validation.outputs.summary, 'ENABLED')
  run: |
    # Create security incident
    curl -X POST "$INCIDENT_API" \
      -H "Authorization: Bearer ${{ secrets.INCIDENT_TOKEN }}" \
      -d '{
        "title": "Unauthorized flag change detected",
        "severity": "high",
        "description": "Flag changes detected: ${{ steps.validation.outputs.summary }}",
        "affected_system": "${{ github.repository }}",
        "detected_by": "openfeature-action"
      }'
```

### Emergency Response

**Emergency flag rollback:**

```yaml
name: Emergency Flag Rollback
on: workflow_dispatch

jobs:
  emergency-rollback:
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.rollback_commit }}
          
      - name: Validate rollback safety
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.PROD_FLAG_URL }}
          
      - name: Execute emergency rollback
        if: success()
        run: |
          # Emergency rollback procedure
          echo "Executing emergency rollback..."
```

## Best Practices Summary

### ✅ Do's

- **Use read-only tokens** for validation
- **Pin specific versions** of actions and CLI
- **Require code review** for all flag changes
- **Monitor for anomalies** in flag change patterns
- **Maintain audit trails** for compliance
- **Classify sensitive flags** appropriately
- **Rotate tokens regularly**
- **Test emergency procedures**

### ❌ Don'ts

- **Don't use admin tokens** for validation
- **Don't store secrets** in flag configurations
- **Don't bypass review** for "urgent" changes
- **Don't ignore drift alerts**
- **Don't use latest/moving tags** in production
- **Don't commit credentials** to repositories
- **Don't skip security scanning**

## Integration with Security Tools

### SIEM Integration

```yaml
- name: Send to SIEM
  run: |
    # Send structured logs to SIEM
    logger -p local0.info "FLAG_CHANGE: repo=${{ github.repository }} actor=${{ github.actor }} changes=${{ steps.validation.outputs.summary }}"
```

### Vulnerability Scanners

```yaml
- name: Security scan flags
  uses: securecodewarrior/github-action-add-sarif@v1
  with:
    sarif-file: flag-security-scan.sarif
```

## Next Steps

- **[Advanced Scenarios](../examples/advanced-scenarios.md)** - Complex security setups
- **[Configuration](../configuration.md)** - Secure configuration options
- **[Troubleshooting](../troubleshooting.md)** - Security-related issues
