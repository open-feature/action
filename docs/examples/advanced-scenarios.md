# Advanced Scenarios

This page covers complex use cases and advanced configurations.

## Strict Mode

### Fail on Any Differences

Use strict mode to fail the workflow if any differences are detected:

```yaml
- name: Enforce flag sync
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.flagprovider.com/flags.json"
    manifest: "flags.json"
    strict: true  # Fails the workflow if differences found
```

### Conditional Strict Mode

Apply strict mode only in certain environments:

```yaml
- name: Compare manifests
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags"
    manifest: "flags.json"
    strict: ${{ github.ref == 'refs/heads/main' }}  # Strict only on main branch
```

## Multi-Environment Validation

### Environment Matrix

Validate against multiple environments simultaneously:

```yaml
name: Multi-Environment Flag Validation
on: [push, pull_request]

jobs:
  validate-environments:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, production]
        include:
          - environment: dev
            strict: false
          - environment: staging
            strict: false
          - environment: production
            strict: true
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate ${{ matrix.environment }}
        uses: open-feature/openfeature-action@v1
        with:
          against: ${{ secrets[format('FLAG_URL_{0}', upper(matrix.environment))] }}
          manifest: "flags.json"
          auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}
          against-manifest-path: "${{ matrix.environment }}-flags.json"
          strict: ${{ matrix.strict }}
          
      - name: Upload comparison results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: comparison-${{ matrix.environment }}
          path: ${{ matrix.environment }}-flags.json
```

### Sequential Environment Validation

Validate environments in order (stop on first failure):

```yaml
jobs:
  validate-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate dev environment
        uses: open-feature/openfeature-action@v1
        with:
          against: ${{ secrets.DEV_FLAG_URL }}
          manifest: "flags.json"
          auth-token: ${{ secrets.DEV_TOKEN }}

  validate-staging:
    needs: validate-dev
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate staging environment
        uses: open-feature/openfeature-action@v1
        with:
          against: ${{ secrets.STAGING_FLAG_URL }}
          manifest: "flags.json"
          auth-token: ${{ secrets.STAGING_TOKEN }}

  validate-production:
    needs: validate-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate production environment
        uses: open-feature/openfeature-action@v1
        with:
          against: ${{ secrets.PROD_FLAG_URL }}
          manifest: "flags.json"
          auth-token: ${{ secrets.PROD_TOKEN }}
          strict: true
```

## CLI Version Management

### Pin Specific CLI Version

Use a specific CLI version for reproducible builds:

```yaml
- name: Compare with specific CLI version
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "flags.json"
    cli-version: "v0.3.6"  # Pin to specific version
```

### Test Multiple CLI Versions

Test compatibility across CLI versions:

```yaml
name: CLI Version Compatibility
on: [push, pull_request]

jobs:
  test-cli-versions:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        cli-version: ['v0.3.6', 'v0.3.7', 'latest']
        
    steps:
      - uses: actions/checkout@v4
      
      - name: Test with CLI ${{ matrix.cli-version }}
        uses: open-feature/openfeature-action@v1
        with:
          against: "https://api.example.com/flags"
          manifest: "flags.json"
          cli-version: ${{ matrix.cli-version }}
```

## Custom PR Comments

### Disable PR Comments

```yaml
- name: Compare without PR comments
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    post-pr-comment: false  # Disable automatic PR comments
```

### Custom Reactions to Changes

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    post-pr-comment: false  # Handle comments manually

- name: Custom PR comment
  if: github.event_name == 'pull_request' && steps.compare.outputs.has-differences == 'true'
  uses: actions/github-script@v6
  with:
    script: |
      const comment = `
      ## 🚨 Custom Flag Change Alert
      
      **Changes detected:** ${{ steps.compare.outputs.summary }}
      
      **Action required:** Please review these changes with the product team.
      
      **Approval needed from:** @product-team @security-team
      `;
      
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

## Complex Workflow Logic

### Conditional Execution

```yaml
- name: Check if flags changed
  id: changes
  uses: dorny/paths-filter@v2
  with:
    filters: |
      flags:
        - 'flags.json'
        - 'config/flags/**'

- name: Compare manifests
  if: steps.changes.outputs.flags == 'true'
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"

- name: Skip comparison
  if: steps.changes.outputs.flags == 'false'
  run: echo "No flag changes detected, skipping comparison"
```

### Approval Gates

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    against: "https://api.example.com/flags"

- name: Require approval for changes
  if: steps.compare.outputs.has-differences == 'true'
  uses: trstringer/manual-approval@v1
  with:
    secret: ${{ github.TOKEN }}
    approvers: product-team,security-team
    minimum-approvals: 2
    issue-title: "Flag changes detected - approval required"
    issue-body: |
      Flag changes detected in PR #${{ github.event.number }}
      
      Summary: ${{ steps.compare.outputs.summary }}
      
      Please review and approve if these changes are intentional.
```

## Error Recovery and Resilience

### Retry on Failure

```yaml
- name: Compare with retry
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    retry_on: error
    command: |
      gh workflow run compare-flags.yml --ref ${{ github.ref }}
```

### Graceful Degradation

```yaml
- name: Try primary comparison
  id: primary
  uses: open-feature/openfeature-action@v1
  continue-on-error: true
  with:
    against: "https://primary-api.example.com/flags"
    manifest: "flags.json"

- name: Fallback comparison
  if: failure() && steps.primary.conclusion == 'failure'
  uses: open-feature/openfeature-action@v1
  continue-on-error: true
  with:
    against: "https://backup-api.example.com/flags"
    manifest: "flags.json"

- name: Local-only validation
  if: failure()
  run: |
    echo "Remote sources unavailable, performing local validation only"
    # Add local validation logic here
```

## Integration with Other Tools

### SonarQube Integration

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"

- name: Report to SonarQube
  if: steps.compare.outputs.has-differences == 'true'
  run: |
    sonar-scanner \
      -Dsonar.projectKey=flag-changes \
      -Dsonar.sources=flags.json \
      -Dsonar.host.url=${{ secrets.SONAR_HOST_URL }} \
      -Dsonar.login=${{ secrets.SONAR_TOKEN }}
```

### Jira Integration

```yaml
- name: Create Jira ticket for changes
  if: steps.compare.outputs.has-differences == 'true'
  uses: atlassian/gajira-create@v3
  with:
    project: DEVOPS
    issuetype: Task
    summary: "Flag configuration changes detected"
    description: |
      Automated detection of flag configuration changes.
      
      Summary: ${{ steps.compare.outputs.summary }}
      
      PR: ${{ github.event.pull_request.html_url }}
```

## Performance Optimization

### Cache CLI Installation

```yaml
- name: Cache OpenFeature CLI
  uses: actions/cache@v3
  with:
    path: ~/go/bin/openfeature
    key: openfeature-cli-${{ runner.os }}-${{ hashFiles('**/go.sum') }}

- name: Compare manifests
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    cli-version: "v0.3.6"  # Pin version for consistent caching
```

### Parallel Comparisons

```yaml
jobs:
  compare-environments:
    strategy:
      matrix:
        environment: [staging, production]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Compare ${{ matrix.environment }}
        uses: open-feature/openfeature-action@v1
        with:
          against: ${{ secrets[format('URL_{0}', upper(matrix.environment))] }}
          manifest: "flags.json"
```

## Next Steps

- **[CI/CD Integration](ci-cd-integration.md)** - Complete workflow examples
- **[Security](../security.md)** - Security best practices
- **[Troubleshooting](../troubleshooting.md)** - Common issues and solutions
