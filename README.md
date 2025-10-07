<!-- markdownlint-disable MD033 -->
<!-- x-hide-in-docs-start -->
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/open-feature/community/0e23508c163a6a1ac8c0ced3e4bd78faafe627c7/assets/logo/horizontal/white/openfeature-horizontal-white.svg" />
    <img align="center" alt="OpenFeature Logo" src="https://raw.githubusercontent.com/open-feature/community/0e23508c163a6a1ac8c0ced3e4bd78faafe627c7/assets/logo/horizontal/black/openfeature-horizontal-black.svg" />
  </picture>
</p>

<h2 align="center">OpenFeature Action</h2>
<!-- x-hide-in-docs-end -->

<!-- The 'github-badges' class is used in the docs -->
<p align="center" class="github-badges">
  <a href="https://github.com/orgs/open-feature/projects/17">
    <img alt="work-in-progress" src="https://img.shields.io/badge/status-WIP-yellow" />
  </a>
  <a href="https://cloud-native.slack.com/archives/C07DY4TUDK6">
    <img alt="Slack" src="https://img.shields.io/badge/slack-%40cncf%2Fopenfeature-brightgreen?style=flat&logo=slack" />
  </a>
  <a href="https://github.com/open-feature/openfeature-action/releases">
    <img alt="GitHub release" src="https://img.shields.io/github/v/release/open-feature/openfeature-action" />
  </a>
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/open-feature/openfeature-action" />
  </a>
</p>

<!-- x-hide-in-docs-start -->

> [!CAUTION]
> The OpenFeature Action and CLI are experimental!
> Feel free to give it a shot and provide feedback, but expect breaking changes.

[OpenFeature](https://openfeature.dev) is an open specification that provides a vendor-agnostic, community-driven API for feature flagging that works with your favorite feature flag management tool or in-house solution.

<!-- x-hide-in-docs-end -->

The OpenFeature GitHub Action compares OpenFeature flag manifests between your local configuration stored in your git repository, and/or remote sources using the [OpenFeature CLI](https://github.com/open-feature/cli). This action helps teams maintain consistency between their local feature flag configurations and centralized flag management systems. It enables **Feature-Flag Driven Development** by providing GitOps for your feature flags.

> **Note:** This project is being donated to the [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/) as part of the OpenFeature ecosystem.

## 🚀 Quick Start

### Simple Pull Request Validation

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
```

### Using Reusable Workflows (Recommended)

```yaml
name: Comprehensive Flag Validation
on: pull_request

jobs:
  validate-flags:
    uses: open-feature/openfeature-action/.github/workflows/reusable-pr-validation.yml@v1
    with:
      manifest-path: "flags.json"
      strict-mode: false
    secrets:
      auth-token: ${{ secrets.FLAG_PROVIDER_TOKEN }}
      slack-webhook: ${{ secrets.SLACK_WEBHOOK }}
```

### Remote Source Comparison

```yaml
- name: Compare against production flags
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    against: "https://your-flag-provider.com/api/flags"
    auth-token: ${{ secrets.FLAG_PROVIDER_TOKEN }}
```

## ✨ Key Features

- 🔍 **Smart Comparison** - Compare local files vs git branches OR remote sources
- 🌿 **Git Integration** - Automatic PR branch detection and comparison
- 🔗 **Remote Support** - Connect to any flag provider with URL support
- 🔐 **Secure** - Token-based authentication for protected sources
- 📊 **Rich Output** - Detailed change summaries and PR comments
- ⚙️ **Flexible** - Multiple comparison modes and configuration options

## 📚 Documentation

### Get Started

- **[Getting Started Guide](docs/getting-started.md)** - Quick setup and basic usage
- **[Configuration Reference](docs/configuration.md)** - Complete parameter documentation
- **[API Reference](docs/reference/api.md)** - Detailed inputs/outputs specification

### Examples & Use Cases

- **[Basic Usage](docs/examples/basic-usage.md)** - Simple comparison scenarios
- **[Remote Comparison](docs/examples/remote-comparison.md)** - Connect to flag providers
- **[Advanced Scenarios](docs/examples/advanced-scenarios.md)** - Complex workflows
- **[CI/CD Integration](docs/examples/ci-cd-integration.md)** - Pipeline automation

### User Guides

- **[For Beginners](docs/guides/for-beginners.md)** - New to feature flags?
- **[For DevOps](docs/guides/for-devops.md)** - CI/CD integration patterns
- **[For Security Teams](docs/guides/for-security.md)** - Security and compliance
- **[For Contributors](docs/guides/for-contributors.md)** - Development setup

### Workflows & Automation

- **[Reusable Workflows](docs/reusable-workflows.md)** - Production-ready workflow components
- **[Workflow Templates](docs/workflow-templates.md)** - Quick-start templates
- **[Advanced Examples](examples/workflows/)** - GitOps, security, and progressive delivery

### Resources

- **[Testing](docs/testing.md)** - Test strategies and automation
- **[Security](docs/security.md)** - Security best practices
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions
- **[Support](docs/support.md)** - Community and help resources

## 🎯 Use Cases

- **Pull Request Validation** - Catch flag changes before they reach production
- **Drift Detection** - Identify when local configs diverge from production
- **Environment Sync** - Ensure consistency across dev, staging, and production
- **Multi-Provider Comparison** - Compare configurations across different flag systems
- **Compliance & Auditing** - Track all flag changes with approval workflows

## 🛠 Integration Examples

### Multi-Environment Validation

```yaml
strategy:
  matrix:
    environment: [staging, production]
steps:
  - name: Validate ${{ matrix.environment }}
    uses: open-feature/openfeature-action@v1
    with:
      manifest: "flags.json"
      against: ${{ secrets[format('FLAG_URL_{0}', upper(matrix.environment))] }}
      auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}
```

### Conditional Deployment

```yaml
- name: Check flag sync
  id: flags
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    against: "https://api.flagprovider.com/flags"
    
- name: Deploy only if flags match
  if: steps.flags.outputs.has-differences == 'false'
  run: ./deploy.sh
```

### Remote-to-Remote Comparison

```yaml
- name: Compare staging vs production
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "https://staging-api.company.com/flags"
    against: "https://api.company.com/flags"
    manifest-auth-token: ${{ secrets.STAGING_TOKEN }}
    auth-token: ${{ secrets.PROD_TOKEN }}
```

## 🤝 Community & Support

### Get Help

- 📖 **[Documentation](docs/)** - Complete guides and references
- 💬 **[Slack](https://cloud-native.slack.com/archives/C0344AANLA1)** - Community chat (`#openfeature`)
- 🐛 **[Issues](https://github.com/open-feature/openfeature-action/issues)** - Bug reports and feature requests
- 💡 **[Discussions](https://github.com/open-feature/openfeature-action/discussions)** - Questions and ideas

### Contributing

We welcome contributions! See our [contributor guide](docs/guides/for-contributors.md) for details on:

- Setting up your development environment
- Running tests locally with [act](https://github.com/nektos/act)
- Submitting pull requests
- Code style and conventions

### Community

- **[OpenFeature Website](https://openfeature.dev)** - Learn about the OpenFeature ecosystem
- **[Community Meetings](https://zoom-lfx.platform.linuxfoundation.org/meetings/openfeature)** - Monthly calls
- **[CNCF Slack](https://slack.cncf.io)** - Join the cloud native community

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

**Contributors:**

<a href="https://github.com/open-feature/openfeature-action/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=open-feature/openfeature-action" alt="Pictures of the folks who have contributed to the project" />
</a>

*Part of the [OpenFeature](https://openfeature.dev/) ecosystem - A [CNCF](https://www.cncf.io/) project*
