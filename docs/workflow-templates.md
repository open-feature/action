# Workflow Templates

Get started quickly with OpenFeature Action using our ready-to-use workflow templates. These templates provide common patterns and can be easily customized for your specific needs.

## Available Templates

GitHub will automatically suggest these templates when you create a new workflow in repositories that use feature flags.

### 🚀 Quick Start Template

**File:** `openfeature-quick-start.yml`
**Best for:** First-time users, simple validation needs

The simplest way to get started with feature flag validation. Just validates flag changes in pull requests and posts helpful comments.

```yaml
name: OpenFeature Quick Start
on:
  pull_request:
    branches: [main]
    paths: ['flags.json']

permissions:
  contents: read
  pull-requests: write

jobs:
  validate-flags:
    runs-on: ubuntu-latest
    name: Quick Flag Validation
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Validate flag changes
        uses: open-feature/openfeature-action@v1
        with:
          manifest: 'flags.json'
          post-pr-comment: true
```

**Features:**
- ✅ Automatic git comparison against PR base branch
- ✅ PR comments showing differences
- ✅ Simple setup with minimal configuration
- ✅ Perfect for getting started

**Customization:**
```yaml
# Update the manifest path to match your file
manifest: 'config/feature-flags.yaml'  # Instead of 'flags.json'

# Add file path patterns to trigger on different files
paths: ['flags.json', '**/*flags*.json', '**/*flags*.yml']
```

### 🔍 PR Validation Template

**File:** `openfeature-pr-validation.yml`
**Best for:** Teams wanting comprehensive PR validation

Advanced pull request validation with git comparison and optional remote source validation.

```yaml
name: OpenFeature PR Validation
on:
  pull_request:
    branches: [main, develop]
    paths: 
      - 'flags.json'
      - 'feature-flags.json'

permissions:
  contents: read
  pull-requests: write

jobs:
  validate-flags:
    name: Validate Feature Flags
    uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1
    with:
      manifest-path: 'flags.json'
      include-git-comparison: true
      post-comments: true
      strict-mode: false
    secrets:
      # Optional: Add remote source comparison
      # auth-token: ${{ secrets.FLAG_SOURCE_TOKEN }}
      # slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
```

**Features:**
- ✅ Uses the reusable PR validation workflow
- ✅ Git comparison showing changes in the PR
- ✅ Optional remote source comparison
- ✅ Configurable strictness levels
- ✅ Slack notifications support

**Customization:**
```yaml
# Add remote source validation
with:
  remote-source: 'https://api.launchdarkly.com/api/v2/flags/export'
secrets:
  auth-token: ${{ secrets.LAUNCHDARKLY_TOKEN }}

# Enable strict mode to block PRs with differences
with:
  strict-mode: true

# Customize the workflow name
with:
  workflow-name: 'Custom Flag Validation'
```

### 📊 Drift Detection Template

**File:** `openfeature-drift-detection.yml`
**Best for:** Production monitoring, compliance requirements

Scheduled monitoring to detect when local configurations drift from production environments.

```yaml
name: OpenFeature Drift Detection
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  detect-drift:
    name: Detect Configuration Drift
    uses: open-feature/openfeature-action/.github/workflows/reusable-drift-detection.yml@v1
    with:
      manifest-path: 'flags.json'
      environments: '["staging", "production"]'
      create-issue-on-drift: true
      issue-labels: 'drift-detected,feature-flags,needs-review'
    secrets:
      STAGING_FLAG_URL: ${{ secrets.STAGING_FLAG_URL }}
      STAGING_FLAG_TOKEN: ${{ secrets.STAGING_FLAG_TOKEN }}
      PRODUCTION_FLAG_URL: ${{ secrets.PRODUCTION_FLAG_URL }}
      PRODUCTION_FLAG_TOKEN: ${{ secrets.PRODUCTION_FLAG_TOKEN }}
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Features:**
- ✅ Scheduled drift detection (customizable frequency)
- ✅ Multi-environment monitoring
- ✅ Automatic GitHub issue creation
- ✅ Slack/Teams notifications
- ✅ Manual trigger support

**Customization:**
```yaml
# Change monitoring frequency
on:
  schedule:
    - cron: '0 1 * * *'  # Daily at 1 AM
    - cron: '0 */2 * * *'  # Every 2 hours
    - cron: '0 9,17 * * 1-5'  # 9 AM and 5 PM, weekdays only

# Monitor different environments
with:
  environments: '["dev", "qa", "staging", "production"]'

# Customize notifications
with:
  notification-channels: '{"slack": true, "teams": true, "email": false}'

# Different issue labels
with:
  issue-labels: 'critical,drift-detected,production,needs-immediate-attention'
```

### 🛡️ Deployment Gate Template

**File:** `openfeature-deployment-gate.yml`
**Best for:** Controlled deployments, compliance requirements

Pre-deployment validation that can block deployments if flag configurations don't meet requirements.

```yaml
name: OpenFeature Deployment Gate
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]
        default: 'staging'
      gate-strategy:
        type: choice
        options: [strict, warn, advisory]
        default: 'strict'

permissions:
  contents: read
  deployments: write
  issues: write

jobs:
  deployment-gate:
    name: Deployment Gate
    uses: open-feature/openfeature-action/.github/workflows/reusable-deployment-gate.yml@v1
    with:
      manifest-path: 'flags.json'
      target-environment: ${{ inputs.environment }}
      gate-strategy: ${{ inputs.gate-strategy }}
      require-approval: true
      approval-timeout: 30
    secrets:
      STAGING_FLAG_URL: ${{ secrets.STAGING_FLAG_URL }}
      STAGING_FLAG_TOKEN: ${{ secrets.STAGING_FLAG_TOKEN }}
      PRODUCTION_FLAG_URL: ${{ secrets.PRODUCTION_FLAG_URL }}
      PRODUCTION_FLAG_TOKEN: ${{ secrets.PRODUCTION_FLAG_TOKEN }}
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # Example deployment job
  deploy:
    name: Deploy to ${{ inputs.environment }}
    needs: deployment-gate
    if: needs.deployment-gate.outputs.deployment-allowed == 'true'
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    
    steps:
      - name: Deploy application
        run: |
          echo "🚀 Deploying to ${{ inputs.environment }}..."
          echo "Gate status: ${{ needs.deployment-gate.outputs.gate-status }}"
```

**Features:**
- ✅ Manual deployment trigger with environment selection
- ✅ Multiple gate strategies (strict, warn, advisory)
- ✅ Manual approval workflows for sensitive changes
- ✅ GitHub deployment tracking
- ✅ Rollback capabilities

**Customization:**
```yaml
# Automatic deployment on push
on:
  push:
    branches: [main]

# Different approval requirements
with:
  require-approval: false  # No manual approval
  # OR
  approval-timeout: 60  # Longer approval window

# Custom deployment metadata
with:
  deployment-metadata: '{
    "version": "${{ github.ref_name }}",
    "deployer": "${{ github.actor }}",
    "ticket": "DEPLOY-${{ github.run_number }}"
  }'
```

## Template Setup Guide

### 1. Using Templates in GitHub UI

1. **Navigate to your repository**
2. **Click "Actions" tab**
3. **Click "New workflow"**
4. **Look for "OpenFeature" templates** in the suggestions
5. **Choose a template** and customize as needed

### 2. Manual Template Setup

1. **Create workflow directory:**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Copy template content** into a new file:
   ```bash
   # Example: Copy PR validation template
   curl -o .github/workflows/flag-validation.yml \
     https://raw.githubusercontent.com/open-feature/openfeature-action/main/.github/workflow-templates/openfeature-pr-validation.yml
   ```

3. **Customize the template** for your needs
4. **Commit and push** to activate

### 3. Template Customization

Each template includes comments showing common customizations:

```yaml
# Update manifest path
with:
  manifest-path: 'config/flags.yaml'  # Change from default 'flags.json'

# Add environment-specific settings
secrets:
  # Development environment
  DEV_FLAG_URL: ${{ secrets.DEV_FEATURE_FLAGS_URL }}
  DEV_FLAG_TOKEN: ${{ secrets.DEV_API_TOKEN }}
  
  # Production environment  
  PROD_FLAG_URL: ${{ secrets.PROD_FEATURE_FLAGS_URL }}
  PROD_FLAG_TOKEN: ${{ secrets.PROD_API_TOKEN }}
```

## Common Customizations

### Manifest File Paths

Most templates default to `flags.json`. Update for your file structure:

```yaml
# Single manifest file
with:
  manifest-path: 'config/feature-flags.yaml'

# Multiple triggers for different files
on:
  pull_request:
    paths: 
      - 'flags.json'
      - 'config/flags/**'
      - 'environments/*/flags.yml'
```

### Environment Configuration

Configure secrets for your flag providers:

```yaml
secrets:
  # LaunchDarkly
  PRODUCTION_FLAG_URL: ${{ secrets.LAUNCHDARKLY_API_URL }}
  PRODUCTION_FLAG_TOKEN: ${{ secrets.LAUNCHDARKLY_API_TOKEN }}
  
  # Split.io
  STAGING_FLAG_URL: ${{ secrets.SPLIT_API_URL }}
  STAGING_FLAG_TOKEN: ${{ secrets.SPLIT_API_KEY }}
  
  # Flagsmith
  DEV_FLAG_URL: ${{ secrets.FLAGSMITH_API_URL }}
  DEV_FLAG_TOKEN: ${{ secrets.FLAGSMITH_ENV_KEY }}
```

### Notification Setup

Add Slack, Teams, or other notification webhooks:

```yaml
secrets:
  # Slack notifications
  SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK_URL }}
  
  # Microsoft Teams
  TEAMS_WEBHOOK: ${{ secrets.TEAMS_WEBHOOK_URL }}
  
  # Discord
  DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

### Branch and Path Patterns

Customize when workflows trigger:

```yaml
# Specific branches
on:
  pull_request:
    branches: [main, develop, release/*]
  push:
    branches: [main]

# File patterns
on:
  pull_request:
    paths:
      - 'flags.json'
      - 'config/flags/**/*.json'
      - 'environments/*/feature-flags.yml'
      - '!**/*.md'  # Exclude documentation
```

## Combining Templates

You can combine multiple templates in a single workflow:

```yaml
name: Complete Flag Management
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'

jobs:
  # PR validation for pull requests
  pr-validation:
    if: github.event_name == 'pull_request'
    uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1
    with:
      manifest-path: 'flags.json'
      strict-mode: true

  # Drift detection on schedule
  drift-detection:
    if: github.event_name == 'schedule'
    uses: open-feature/openfeature-action/.github/workflows/reusable-drift-detection.yml@v1
    with:
      environments: '["production"]'

  # Deployment gate on push to main
  deployment-gate:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    uses: open-feature/openfeature-action/.github/workflows/reusable-deployment-gate.yml@v1
    with:
      target-environment: 'production'
      gate-strategy: 'strict'
```

## Template Maintenance

### Keeping Templates Updated

Pin templates to specific versions for stability:

```yaml
# Pinned version (recommended for production)
uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1.2.3

# Latest version (good for development)
uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1

# Development version (not recommended)
uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@main
```

### Version Migration

When updating template versions:

1. **Review changelog** for breaking changes
2. **Test in development environment** first
3. **Update incrementally** (dev → staging → production)
4. **Monitor workflow runs** for issues

## Troubleshooting Templates

### Common Issues

#### Template Not Found
```
Error: Repository not found or template not accessible
```
**Solution:** Ensure you're using the correct repository and version:
```yaml
uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1
```

#### Missing Permissions
```
Error: Resource not accessible by integration
```
**Solution:** Add required permissions:
```yaml
permissions:
  contents: read
  pull-requests: write  # For PR comments
  issues: write        # For drift detection
  deployments: write   # For deployment gates
```

#### Secret Not Found
```
Error: Secret PRODUCTION_FLAG_URL not found
```
**Solution:** Configure required secrets in repository settings or adjust template to use available secrets.

### Debug Mode

Enable debug logging for troubleshooting:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

## Next Steps

- **[Reusable Workflows](reusable-workflows.md)** - Detailed documentation for advanced customization
- **[Examples](examples/)** - Real-world usage examples
- **[Configuration](configuration.md)** - Complete parameter reference
- **[Getting Started](getting-started.md)** - Setup and basic usage guide