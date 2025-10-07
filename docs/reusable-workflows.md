# Reusable Workflows

This guide covers the reusable workflows provided with the OpenFeature Action, enabling you to quickly implement common flag management patterns with minimal configuration.

## Overview

The OpenFeature Action includes four powerful reusable workflows:

- **[PR Validation](#pr-validation)** - Automated pull request validation
- **[Drift Detection](#drift-detection)** - Scheduled configuration drift monitoring
- **[Multi-Environment Validation](#multi-environment-validation)** - Parallel environment validation
- **[Deployment Gate](#deployment-gate)** - Pre-deployment validation with approval workflows

## PR Validation

**File:** `.github/workflows/reusable-pr-validation.yml`

Automatically validates feature flag changes in pull requests, comparing against git branches and optionally remote sources.

### Features

- ✅ Automatic git comparison against PR base branch
- ✅ Optional remote source comparison
- ✅ Configurable PR comments with detailed differences
- ✅ Slack notifications for detected differences
- ✅ Strict mode to block PRs with differences
- ✅ Comprehensive validation summary

### Usage

```yaml
name: Validate Flag Changes
on:
  pull_request:
    branches: [main]

jobs:
  validate:
    uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1
    with:
      manifest-path: 'flags.json'
      remote-source: 'https://api.flagprovider.com/flags'
      strict-mode: false
      post-comments: true
    secrets:
      auth-token: ${{ secrets.FLAG_TOKEN }}
      slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
```

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `manifest-path` | Path to the manifest file | No | `flags.json` |
| `base-branch` | Base branch for comparison | No | Auto-detected |
| `remote-source` | Remote URL to compare against | No | - |
| `strict-mode` | Fail workflow if differences found | No | `false` |
| `post-comments` | Post PR comments with results | No | `true` |
| `include-git-comparison` | Include git comparison | No | `true` |
| `cli-version` | OpenFeature CLI version | No | `latest` |
| `workflow-name` | Custom workflow name | No | `Flag Validation` |

### Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| `auth-token` | Authentication for remote source | No |
| `slack-webhook` | Slack webhook for notifications | No |

### Outputs

| Output | Description |
|--------|-------------|
| `has-differences` | Whether any differences were detected |
| `git-differences` | Git comparison results |
| `remote-differences` | Remote comparison results |
| `summary` | Comprehensive validation summary |

### Example Scenarios

#### Basic PR Validation

```yaml
jobs:
  validate:
    uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1
    with:
      manifest-path: 'config/flags.yaml'
```

#### Strict Validation with Remote Comparison

```yaml
jobs:
  validate:
    uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1
    with:
      manifest-path: 'flags.json'
      remote-source: 'https://api.launchdarkly.com/api/v2/flags/export'
      strict-mode: true
    secrets:
      auth-token: ${{ secrets.LAUNCHDARKLY_TOKEN }}
```

## Drift Detection

**File:** `.github/workflows/reusable-drift-detection.yml`

Automatically detects configuration drift between local manifests and remote environments on a schedule.

### Features

- ✅ Multi-environment drift detection
- ✅ Automatic GitHub issue creation
- ✅ Slack/Teams/Discord notifications
- ✅ Configurable schedules and environments
- ✅ Detailed drift analysis reports
- ✅ Integration with incident response systems

### Usage

```yaml
name: Drift Detection
on:
  schedule:
    - cron: '0 */6 * * *'

jobs:
  detect-drift:
    uses: open-feature/openfeature-action/.github/workflows/reusable-drift-detection.yml@v1
    with:
      environments: '["staging", "production"]'
      create-issue-on-drift: true
    secrets:
      STAGING_FLAG_URL: ${{ secrets.STAGING_FLAG_URL }}
      STAGING_FLAG_TOKEN: ${{ secrets.STAGING_FLAG_TOKEN }}
      PRODUCTION_FLAG_URL: ${{ secrets.PRODUCTION_FLAG_URL }}
      PRODUCTION_FLAG_TOKEN: ${{ secrets.PRODUCTION_FLAG_TOKEN }}
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `manifest-path` | Path to manifest file | No | `flags.json` |
| `environments` | JSON array of environments | No | `["production"]` |
| `schedule-description` | Description for notifications | No | `Scheduled drift detection` |
| `fail-on-drift` | Fail workflow if drift detected | No | `false` |
| `create-issue-on-drift` | Create GitHub issue on drift | No | `true` |
| `issue-labels` | Labels for created issues | No | `drift-detected,feature-flags,needs-review` |
| `notification-channels` | Notification settings JSON | No | `{"slack": true, "email": false}` |

### Environment Secrets

Configure these secrets for each environment you want to monitor:

| Secret Pattern | Description |
|----------------|-------------|
| `{ENV}_FLAG_URL` | Flag provider URL (e.g., `STAGING_FLAG_URL`) |
| `{ENV}_FLAG_TOKEN` | Authentication token (e.g., `STAGING_FLAG_TOKEN`) |

### Notification Secrets

| Secret | Description |
|--------|-------------|
| `SLACK_WEBHOOK` | Slack webhook URL |
| `TEAMS_WEBHOOK` | Microsoft Teams webhook URL |
| `DISCORD_WEBHOOK` | Discord webhook URL |

### Example Configurations

#### Hourly Production Monitoring

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Every hour

jobs:
  monitor-production:
    uses: open-feature/openfeature-action/.github/workflows/reusable-drift-detection.yml@v1
    with:
      environments: '["production"]'
      fail-on-drift: true
      issue-labels: 'critical,drift-detected,production'
    secrets:
      PRODUCTION_FLAG_URL: ${{ secrets.PROD_API_URL }}
      PRODUCTION_FLAG_TOKEN: ${{ secrets.PROD_READ_TOKEN }}
      SLACK_WEBHOOK: ${{ secrets.ALERT_SLACK_WEBHOOK }}
```

#### Multi-Environment with Teams Notifications

```yaml
jobs:
  comprehensive-drift-check:
    uses: open-feature/openfeature-action/.github/workflows/reusable-drift-detection.yml@v1
    with:
      environments: '["dev", "staging", "production"]'
      notification-channels: '{"slack": true, "teams": true}'
    secrets:
      DEV_FLAG_URL: ${{ secrets.DEV_FLAG_URL }}
      DEV_FLAG_TOKEN: ${{ secrets.DEV_FLAG_TOKEN }}
      STAGING_FLAG_URL: ${{ secrets.STAGING_FLAG_URL }}
      STAGING_FLAG_TOKEN: ${{ secrets.STAGING_FLAG_TOKEN }}
      PRODUCTION_FLAG_URL: ${{ secrets.PRODUCTION_FLAG_URL }}
      PRODUCTION_FLAG_TOKEN: ${{ secrets.PRODUCTION_FLAG_TOKEN }}
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
      TEAMS_WEBHOOK: ${{ secrets.TEAMS_WEBHOOK }}
```

## Multi-Environment Validation

**File:** `.github/workflows/reusable-multi-env.yml`

Validates flag configurations across multiple environments in parallel, providing comprehensive environment consistency reports.

### Features

- ✅ Parallel environment validation
- ✅ Sequential validation support
- ✅ Environment dependency handling
- ✅ Comprehensive reporting matrix
- ✅ Configurable timeout and error handling
- ✅ Slack notifications for failures

### Usage

```yaml
name: Multi-Environment Validation
on: [push, workflow_dispatch]

jobs:
  validate-all-environments:
    uses: open-feature/openfeature-action/.github/workflows/reusable-multi-env.yml@v1
    with:
      environments: '["dev", "staging", "production"]'
      validation-strategy: 'parallel'
      strict-mode: true
    secrets:
      DEV_FLAG_URL: ${{ secrets.DEV_FLAG_URL }}
      DEV_FLAG_TOKEN: ${{ secrets.DEV_FLAG_TOKEN }}
      STAGING_FLAG_URL: ${{ secrets.STAGING_FLAG_URL }}
      STAGING_FLAG_TOKEN: ${{ secrets.STAGING_FLAG_TOKEN }}
      PRODUCTION_FLAG_URL: ${{ secrets.PRODUCTION_FLAG_URL }}
      PRODUCTION_FLAG_TOKEN: ${{ secrets.PRODUCTION_FLAG_TOKEN }}
```

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `manifest-path` | Path to manifest file | No | `flags.json` |
| `environments` | JSON array of environments | No | `["staging", "production"]` |
| `fail-fast` | Stop on first failure | No | `false` |
| `strict-mode` | Fail if any differences found | No | `false` |
| `validation-strategy` | `parallel` or `sequential` | No | `parallel` |
| `timeout-minutes` | Timeout per environment | No | `10` |
| `include-summary` | Generate summary report | No | `true` |

### Outputs

| Output | Description |
|--------|-------------|
| `validation-passed` | Whether all validations passed |
| `failed-environments` | List of failed environments |
| `environments-with-differences` | Environments with differences |
| `validation-summary` | Complete validation summary |

### Example Configurations

#### Sequential Validation with Dependencies

```yaml
jobs:
  staged-validation:
    uses: open-feature/openfeature-action/.github/workflows/reusable-multi-env.yml@v1
    with:
      environments: '["dev", "staging", "production"]'
      validation-strategy: 'sequential'
      fail-fast: true
      environment-dependencies: '{
        "staging": ["dev"],
        "production": ["staging"]
      }'
```

#### High-Availability Multi-Region Validation

```yaml
jobs:
  multi-region-validation:
    uses: open-feature/openfeature-action/.github/workflows/reusable-multi-env.yml@v1
    with:
      environments: '["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]'
      timeout-minutes: 15
      strict-mode: false
```

## Deployment Gate

**File:** `.github/workflows/reusable-deployment-gate.yml`

Pre-deployment validation that can block deployments if flag configurations don't match requirements.

### Features

- ✅ Multiple gate strategies (strict, warn, advisory)
- ✅ Manual approval workflows
- ✅ Automatic deployment records
- ✅ Rollback capabilities
- ✅ Integration with GitHub Environments
- ✅ Comprehensive deployment metadata

### Usage

```yaml
name: Deployment Gate
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]

jobs:
  deployment-gate:
    uses: open-feature/openfeature-action/.github/workflows/reusable-deployment-gate.yml@v1
    with:
      target-environment: ${{ inputs.environment }}
      gate-strategy: 'strict'
      require-approval: true
    secrets:
      STAGING_FLAG_URL: ${{ secrets.STAGING_FLAG_URL }}
      STAGING_FLAG_TOKEN: ${{ secrets.STAGING_FLAG_TOKEN }}
      PRODUCTION_FLAG_URL: ${{ secrets.PRODUCTION_FLAG_URL }}
      PRODUCTION_FLAG_TOKEN: ${{ secrets.PRODUCTION_FLAG_TOKEN }}
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `target-environment` | Target deployment environment | Yes | - |
| `gate-strategy` | `strict`, `warn`, or `advisory` | No | `strict` |
| `comparison-sources` | Sources to compare against | No | `["staging"]` |
| `require-approval` | Require manual approval | No | `false` |
| `approval-timeout` | Approval timeout in minutes | No | `30` |
| `rollback-on-failure` | Enable rollback capabilities | No | `false` |
| `deployment-metadata` | JSON deployment metadata | No | `{}` |

### Gate Strategies

#### Strict Mode
- **Behavior**: Blocks deployment if any differences detected
- **Use case**: Production deployments requiring exact flag matching
- **Result**: Deployment fails if validation fails

#### Warn Mode
- **Behavior**: Allows deployment with warnings
- **Use case**: Staging environments or non-critical deployments
- **Result**: Deployment proceeds with notifications

#### Advisory Mode
- **Behavior**: Informational only, never blocks
- **Use case**: Development environments or monitoring
- **Result**: Always allows deployment

### Example Configurations

#### Production Deployment with Approval

```yaml
jobs:
  production-gate:
    uses: open-feature/openfeature-action/.github/workflows/reusable-deployment-gate.yml@v1
    with:
      target-environment: 'production'
      gate-strategy: 'strict'
      comparison-sources: '["staging"]'
      require-approval: true
      approval-timeout: 60
      deployment-metadata: '{
        "version": "${{ github.ref_name }}",
        "deployer": "${{ github.actor }}",
        "change_ticket": "CHG-12345"
      }'

  deploy:
    needs: production-gate
    if: needs.production-gate.outputs.deployment-allowed == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying with gate approval: ${{ needs.production-gate.outputs.gate-status }}"
```

## Integration Patterns

### Combining Multiple Workflows

You can combine multiple reusable workflows for comprehensive flag management:

```yaml
name: Comprehensive Flag Management
on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'

jobs:
  # PR validation
  pr-validation:
    if: github.event_name == 'pull_request'
    uses: ./.github/workflows/reusable-pr-validation.yml
    with:
      strict-mode: true

  # Multi-environment validation on push
  multi-env-validation:
    if: github.event_name == 'push'
    uses: ./.github/workflows/reusable-multi-env.yml
    with:
      environments: '["dev", "staging", "production"]'

  # Scheduled drift detection
  drift-detection:
    if: github.event_name == 'schedule'
    uses: ./.github/workflows/reusable-drift-detection.yml
    with:
      environments: '["production"]'

  # Deployment gate for production
  deployment-gate:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: multi-env-validation
    uses: ./.github/workflows/reusable-deployment-gate.yml
    with:
      target-environment: 'production'
      gate-strategy: 'strict'
```

### Conditional Workflows

Use conditional logic to run different workflows based on context:

```yaml
jobs:
  determine-strategy:
    runs-on: ubuntu-latest
    outputs:
      is-hotfix: ${{ steps.check.outputs.is-hotfix }}
      environment: ${{ steps.check.outputs.environment }}
    steps:
      - id: check
        run: |
          if [[ "${{ github.ref }}" =~ hotfix ]]; then
            echo "is-hotfix=true" >> $GITHUB_OUTPUT
            echo "environment=production" >> $GITHUB_OUTPUT
          else
            echo "is-hotfix=false" >> $GITHUB_OUTPUT
            echo "environment=staging" >> $GITHUB_OUTPUT
          fi

  normal-validation:
    if: needs.determine-strategy.outputs.is-hotfix == 'false'
    uses: ./.github/workflows/reusable-pr-validation.yml
    with:
      strict-mode: false

  hotfix-validation:
    if: needs.determine-strategy.outputs.is-hotfix == 'true'
    uses: ./.github/workflows/reusable-deployment-gate.yml
    with:
      target-environment: 'production'
      gate-strategy: 'strict'
      require-approval: true
```

## Best Practices

### 1. Environment Configuration

- Use consistent environment naming across workflows
- Store environment-specific secrets with clear naming patterns
- Document environment dependencies and requirements

### 2. Notification Strategy

- Configure different notification channels for different severities
- Use separate webhooks for development vs production alerts
- Include relevant context in notification messages

### 3. Error Handling

- Use appropriate timeout values for your environment
- Configure retry logic for transient failures
- Implement proper fallback strategies

### 4. Security

- Use read-only tokens when possible
- Rotate authentication tokens regularly
- Follow the principle of least privilege for environment access

### 5. Monitoring

- Set up metrics collection for workflow execution
- Monitor workflow success rates and duration
- Alert on workflow failures or anomalies

## Troubleshooting

### Common Issues

#### Authentication Failures
```yaml
# Ensure tokens have correct permissions
auth-token: ${{ secrets.FLAG_READ_TOKEN }}  # Read-only
# vs
auth-token: ${{ secrets.FLAG_ADMIN_TOKEN }}  # Admin access
```

#### Environment Secret Naming
```yaml
# Correct pattern
STAGING_FLAG_URL: ${{ secrets.STAGING_FLAG_URL }}
PRODUCTION_FLAG_URL: ${{ secrets.PRODUCTION_FLAG_URL }}

# Incorrect - inconsistent naming
STAGE_FLAG_URL: ${{ secrets.STAGING_FLAG_URL }}  # Mismatch
```

#### Timeout Issues
```yaml
# Increase timeout for slow environments
with:
  timeout-minutes: 20  # Instead of default 10
```

### Debugging

Enable debug mode for detailed logs:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

## Next Steps

- **[Workflow Templates](workflow-templates.md)** - Ready-to-use starter templates
- **[Examples](examples/workflows/)** - Advanced workflow examples
- **[Configuration](configuration.md)** - Detailed parameter reference
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions