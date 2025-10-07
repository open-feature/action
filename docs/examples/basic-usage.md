# Basic Usage Examples

This page covers the most common ways to use the OpenFeature Action.

## Pull Request Validation

### Minimal Configuration

The simplest setup for pull request workflows:

```yaml
name: Validate Flag Changes
on: pull_request

jobs:
  validate-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for git comparison
      
      - name: Compare flag manifests
        uses: open-feature/openfeature-action@v1
        with:
          manifest: "flags.json"
          # Automatically compares against PR base branch
```

### Compare Against Specific Branch

```yaml
- name: Compare against develop
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    base-branch: "develop"
```

### Different Manifest Paths

Compare different manifest paths between branches:

```yaml
- name: Compare different paths
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "new-location/flags.json"    # Current branch
    against: "old-location/flags.json"     # Base branch
    base-branch: "main"
```

## Basic Remote Comparison

### Compare Against Remote Source

```yaml
- name: Check against production
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.flagprovider.com/flags.json"
    manifest: "flags.json"
    auth-token: ${{ secrets.FLAG_TOKEN }}
```

### Authenticated Remote Sources

When your remote source requires authentication:

```yaml
- name: Compare with authenticated source
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "flags.json"
    auth-token: ${{ secrets.FLAG_SOURCE_TOKEN }}
```

## Working with Outputs

### Using Comparison Results

Access the comparison results in subsequent steps:

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "flags.json"

- name: Notify Slack on differences
  if: steps.compare.outputs.has-differences == 'true'
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"🚨 Flag drift detected: ${{ steps.compare.outputs.summary }}"}' \
      ${{ secrets.SLACK_WEBHOOK }}
```

### Conditional Steps

Run different steps based on comparison results:

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"

- name: Deploy if no changes
  if: steps.compare.outputs.has-differences == 'false'
  run: echo "No flag changes, safe to deploy"

- name: Review required if changes
  if: steps.compare.outputs.has-differences == 'true'
  run: echo "Flag changes detected, manual review required"
```

## Workflow Triggers

### On Flag File Changes Only

Trigger only when flag files change:

```yaml
name: Validate Flag Changes
on:
  pull_request:
    paths:
      - 'flags.json'
      - 'config/flags/**'

jobs:
  validate-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Validate flag manifest changes
        uses: open-feature/openfeature-action@v1
        with:
          manifest: "flags.json"
```

### Multiple Events

Run on various events:

```yaml
name: Flag Validation
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:  # Manual trigger

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Compare manifests
        uses: open-feature/openfeature-action@v1
        with:
          manifest: "flags.json"
```

## Error Handling

### Continue on Error

Allow the workflow to continue even if comparison fails:

```yaml
- name: Compare manifests
  uses: open-feature/openfeature-action@v1
  continue-on-error: true
  with:
    manifest: "flags.json"
    against: "https://api.example.com/flags.json"
```

### Custom Error Handling

Handle specific error scenarios:

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  continue-on-error: true
  with:
    manifest: "flags.json"

- name: Handle comparison failure
  if: failure() && steps.compare.conclusion == 'failure'
  run: |
    echo "Comparison failed - this might be a network issue"
    echo "Continuing with deployment..."
```

## Next Steps

- **[Remote Comparison](remote-comparison.md)** - Advanced remote source scenarios
- **[Advanced Scenarios](advanced-scenarios.md)** - Multi-environment, strict mode, etc.
- **[CI/CD Integration](ci-cd-integration.md)** - Complete workflow examples
