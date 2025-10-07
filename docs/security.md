# Security Best Practices

This page outlines security best practices for using the OpenFeature Action safely in your workflows.

## Authentication & Authorization

### Token Management

**Always use GitHub Secrets for authentication tokens:**

```yaml
# ✅ Good - Using secrets
auth-token: ${{ secrets.FLAG_SOURCE_TOKEN }}

# ❌ Never do this - Hardcoded tokens
auth-token: "abc123xyz"
```

**Use environment-specific secrets:**

```yaml
# Different tokens for different environments
auth-token: ${{ secrets[format('TOKEN_{0}', upper(matrix.environment))] }}

# Examples:
# - TOKEN_DEV
# - TOKEN_STAGING  
# - TOKEN_PRODUCTION
```

**Prefer read-only tokens when possible:**

```yaml
# For validation only, use read-only tokens
- name: Validate flags
  uses: open-feature/openfeature-action@v1
  with:
    auth-token: ${{ secrets.FLAG_READ_ONLY_TOKEN }}
    manifest: flags.json
```

### Token Rotation

**Establish a token rotation schedule:**

- **Development**: Every 6 months
- **Staging**: Every 3 months
- **Production**: Every 30 days

**Automate token rotation:**

```yaml
name: Token Rotation Reminder
on:
  schedule:
    - cron: '0 9 1 * *'  # First day of each month

jobs:
  token-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Check token age
        run: |
          echo "::warning::Time to rotate production tokens"
          echo "::notice::Review and update all FLAG_*_TOKEN secrets"
```

## Workflow Security

### Minimal Permissions

**Set the minimum required permissions:**

```yaml
permissions:
  contents: read          # Read repository content
  pull-requests: write   # Post comments (only if needed)
  # No other permissions required
```

**For read-only workflows:**

```yaml
permissions:
  contents: read  # Only read access needed
```

### Pin Action Versions

**Use specific versions instead of tags:**

```yaml
# ✅ Good - Specific version
uses: open-feature/openfeature-action@v1.2.3

# ❌ Risky - Moving tags
uses: open-feature/openfeature-action@v1
uses: open-feature/openfeature-action@main
```

**Pin CLI versions for consistency:**

```yaml
- name: Compare with pinned CLI
  uses: open-feature/openfeature-action@v1.2.3
  with:
    cli-version: "v0.3.6"  # Specific version
    manifest: flags.json
```

### Secure Workflow Configuration

**Restrict workflow triggers:**

```yaml
# Only on specific branches
on:
  pull_request:
    branches: [main, develop]
    paths: ['flags.json']  # Only when flags change

# Avoid broad triggers
on: [push, pull_request]  # Too permissive
```

**Use environment protection:**

```yaml
jobs:
  production-validation:
    environment: production  # Requires approval
    runs-on: ubuntu-latest
    steps:
      - name: Validate production flags
        uses: open-feature/openfeature-action@v1
        with:
          against: ${{ secrets.PROD_FLAG_URL }}
          strict: true
```

## Data Protection

### Sensitive Data Detection

**Scan for sensitive information in flags:**

```yaml
- name: Security scan
  run: |
    # Check for potential secrets in flag names/values
    if grep -iE "(password|secret|key|token|api|private)" flags.json; then
      echo "::error::Potential sensitive data detected in flags"
      exit 1
    fi
    
    # Check for email addresses or phone numbers
    if grep -E "[\w\.-]+@[\w\.-]+\.\w+|[\d\-\(\)\+\s]{10,}" flags.json; then
      echo "::error::Potential PII detected in flags"
      exit 1
    fi
```

### Data Classification

**Label sensitive flags appropriately:**

```json
{
  "flags": {
    "internal-api-endpoint": {
      "state": "ENABLED",
      "variants": {
        "internal": "https://internal-api.company.com",
        "external": "https://api.company.com"
      },
      "defaultVariant": "external",
      "targeting": {},
      "_security": {
        "classification": "internal",
        "requires_review": true
      }
    }
  }
}
```

### Audit Logging

**Generate security audit logs:**

```yaml
- name: Security audit log
  if: always()
  run: |
    cat << EOF > security-audit.json
    {
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "event": "flag_validation",
      "repository": "${{ github.repository }}",
      "actor": "${{ github.actor }}",
      "commit": "${{ github.sha }}",
      "branch": "${{ github.ref }}",
      "pr_number": "${{ github.event.pull_request.number }}",
      "changes_detected": "${{ steps.validation.outputs.has-differences }}",
      "summary": "${{ steps.validation.outputs.summary }}",
      "environment": "production",
      "ip_address": "${{ toJson(github.event.client_ip) }}"
    }
    EOF
    
    # Send to security logging system
    curl -X POST "${{ secrets.SECURITY_LOG_ENDPOINT }}" \
      -H "Authorization: Bearer ${{ secrets.SECURITY_LOG_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d @security-audit.json
```

## Network Security

### HTTPS Enforcement

**Always use HTTPS for remote sources:**

```yaml
# ✅ Good - HTTPS
against: "https://api.example.com/flags"

# ❌ Insecure - HTTP
against: "http://api.example.com/flags"
```

### Certificate Validation

**Enable certificate validation:**

```yaml
- name: Validate certificates
  run: |
    # Test SSL certificate
    openssl s_client -connect api.example.com:443 -verify_return_error
```

### Proxy Configuration

**Configure corporate proxies securely:**

```yaml
- name: Configure proxy
  run: |
    # Set proxy from secrets (not environment variables)
    export HTTPS_PROXY="${{ secrets.HTTPS_PROXY }}"
    export HTTP_PROXY="${{ secrets.HTTP_PROXY }}"
    
    # Verify proxy certificate
    curl --proxy "$HTTPS_PROXY" --proxy-cacert /etc/ssl/certs/ca-certificates.crt \
         https://api.example.com/flags
```

## Supply Chain Security

### Dependency Verification

**Verify action integrity:**

```yaml
# Use signed releases when available
- name: Verify action signature
  uses: sigstore/cosign-installer@v2
  
- name: Validate action
  run: |
    # Verify the action's signature (when available)
    cosign verify --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
                  --certificate-identity-regexp='^https://github\.com/open-feature/openfeature-action/\.github/workflows/.+@refs/tags/v[0-9]+\.[0-9]+\.[0-9]+$' \
                  ghcr.io/open-feature/openfeature-action@v1.2.3
```

### CLI Verification

**Verify CLI integrity:**

```yaml
- name: Verify CLI installation
  run: |
    # Check CLI version matches expected
    EXPECTED_VERSION="v0.3.6"
    ACTUAL_VERSION=$(openfeature version --short)
    
    if [ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]; then
      echo "::error::CLI version mismatch. Expected: $EXPECTED_VERSION, Got: $ACTUAL_VERSION"
      exit 1
    fi
    
    # Verify CLI checksum (if available)
    # sha256sum openfeature && compare with known hash
```

## Incident Response

### Security Monitoring

**Monitor for security events:**

```yaml
- name: Security monitoring
  if: steps.validation.outputs.has-differences == 'true'
  run: |
    # Check for suspicious patterns
    CHANGES="${{ env.TOTAL_CHANGES }}"
    
    # Alert on bulk changes (potential compromise)
    if [ "${CHANGES:-0}" -gt 10 ]; then
      echo "::error::Unusual number of flag changes detected: $CHANGES"
      
      # Trigger security incident
      curl -X POST "${{ secrets.SECURITY_ALERT_URL }}" \
        -H "Content-Type: application/json" \
        -d '{
          "alert": "bulk_flag_changes",
          "severity": "high",
          "count": "'$CHANGES'",
          "repository": "${{ github.repository }}",
          "actor": "${{ github.actor }}"
        }'
    fi
```

### Automated Response

**Implement automated security responses:**

```yaml
- name: Security incident response
  if: |
    github.actor != 'dependabot[bot]' &&
    steps.validation.outputs.has-differences == 'true' &&
    contains(steps.validation.outputs.summary, 'ENABLED')
  run: |
    # Create security incident
    curl -X POST "${{ secrets.INCIDENT_WEBHOOK }}" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Unauthorized flag enablement detected",
        "severity": "medium",
        "description": "Flag changes detected: ${{ steps.validation.outputs.summary }}",
        "repository": "${{ github.repository }}",
        "commit": "${{ github.sha }}",
        "actor": "${{ github.actor }}"
      }'
```

## Compliance Requirements

### SOX Compliance

**For SOX-compliant environments:**

```yaml
- name: SOX compliance audit
  run: |
    # Ensure all changes are reviewed
    if [ "${{ github.event.pull_request.merged_by }}" = "null" ]; then
      echo "::error::SOX violation: Changes must be reviewed and approved"
      exit 1
    fi
    
    # Log for compliance audit
    echo "SOX_AUDIT: flag_change approved_by=${{ github.event.pull_request.merged_by.login }}" >> compliance.log
```

### GDPR Compliance

**For GDPR environments:**

```yaml
- name: GDPR compliance check
  run: |
    # Check for PII in targeting rules
    if jq -r '.flags[].targeting' flags.json | grep -iE "(email|ip|location|user_id)"; then
      echo "::warning::Targeting rules may contain PII - ensure GDPR compliance"
      echo "::notice::Review data processing agreements and user consent"
    fi
```

## Security Checklist

### Before Deployment

- [ ] All tokens stored in GitHub Secrets
- [ ] Action version pinned to specific release
- [ ] CLI version pinned to tested version
- [ ] Minimal workflow permissions set
- [ ] Sensitive data detection enabled
- [ ] Certificate validation configured
- [ ] Audit logging implemented

### Regular Security Reviews

- [ ] Rotate authentication tokens
- [ ] Review workflow permissions
- [ ] Update pinned versions
- [ ] Audit access logs
- [ ] Test security monitoring
- [ ] Verify compliance requirements

### Incident Response Preparation

- [ ] Security contact information current
- [ ] Incident response procedures documented
- [ ] Automated alerting configured
- [ ] Emergency rollback procedures tested
- [ ] Communication channels established

## Security Resources

### OWASP Guidelines

Follow OWASP CI/CD security guidelines:

- [OWASP CI/CD Security Top 10](https://owasp.org/www-project-top-10-ci-cd-security-risks/)
- [OWASP DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/)

### GitHub Security

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### OpenFeature Security

- [OpenFeature Security Policy](https://github.com/open-feature/spec/blob/main/SECURITY.md)
- [Community Security Guidelines](https://github.com/open-feature/community/blob/main/SECURITY.md)

## Reporting Security Issues

**For security vulnerabilities:**

1. **Do NOT** create a public GitHub issue
2. **Email**: <security@openfeature.dev>
3. **Include**: Detailed description, reproduction steps, impact assessment
4. **Expect**: Response within 48 hours

**For security questions:**

- [OpenFeature Slack #security](https://cloud-native.slack.com/archives/SECURITY)
- [GitHub Security Advisories](https://github.com/open-feature/openfeature-action/security/advisories)
