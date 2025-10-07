# Getting Started

Welcome to the OpenFeature Action! This guide will help you set up flag manifest comparison in your GitHub workflows.

## Prerequisites

- **GitHub Actions workflow**
- **Git repository** with OpenFeature manifest file
- **For git branch comparison**: `fetch-depth: 0` in your checkout action (to access branch history)
- **For remote source comparison**: Access to a remote manifest source (URL or provider)
- **(Optional)** Authentication token for protected sources

> **Note:** The action uses the OpenFeature CLI, which is automatically installed during the workflow run.

## Your First Workflow

The simplest way to get started is with pull request validation. This compares your changes against the target branch:

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

## What Happens Next?

When you create a pull request:

1. **Action runs automatically** when flag files change
2. **Compares manifests** between your branch and the target branch
3. **Posts a comment** on the PR if differences are found
4. **Generates a summary** showing what flags were added, removed, or modified

## Quick Start with Templates

For even faster setup, use our ready-made workflow templates:

### 🚀 Quick Start Template
Perfect for beginners - just add to `.github/workflows/flag-validation.yml`:

```yaml
name: OpenFeature Quick Start
on:
  pull_request:
    paths: ['flags.json']

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
      - uses: open-feature/openfeature-action@v1
        with:
          manifest: 'flags.json'
```

### 🔍 Advanced PR Validation Template
Uses reusable workflows for more features:

```yaml
name: Flag PR Validation
on:
  pull_request:
    branches: [main]
    paths: ['flags.json']

jobs:
  validate:
    uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1
    with:
      manifest-path: 'flags.json'
      strict-mode: false
    secrets:
      slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
```

## Next Steps

### Choose Your Path

- **[Workflow Templates](workflow-templates.md)** - Ready-to-use starter templates
- **[Reusable Workflows](reusable-workflows.md)** - Production-ready workflow components
- **[Configuration](configuration.md)** - Learn about all available options
- **[Basic Examples](examples/basic-usage.md)** - See more workflow examples
- **[Remote Comparison](examples/remote-comparison.md)** - Compare against remote flag providers
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

## Need Help?

- Check our [troubleshooting guide](troubleshooting.md)
- Join the [OpenFeature Slack](https://cloud-native.slack.com/archives/C0344AANLA1)
- [Open an issue](https://github.com/open-feature/openfeature-action/issues) if you find a bug
