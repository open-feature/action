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

The OpenFeature GitHub Action compares OpenFeature flag manifests between your local configuration stored in your git repository, and/or a remote source using the [OpenFeature CLI](https://github.com/open-feature/cli). This action helps teams maintain consistency between their local feature flag configurations and centralized flag management systems. It also enables **Feature-Flag Driven Development** by providing gitops for your feature flags.

> **Note:** This project is being donated to the [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/) as part of the OpenFeature ecosystem.

## Table of Contents

- [For Different Users](#for-different-users)
  - [New to Feature Flags?](#new-to-feature-flags)
  - [DevOps Engineers](#devops-engineers)
  - [Security Teams](#security-teams)
  - [Contributors](#contributors)
- [Use Cases](#use-cases)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Inputs & Outputs](#inputs--outputs)
- [Usage Examples](#usage-examples)
- [Manifest Format](#manifest-format)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Support & Community](#support--community)

## For Different Users

### New to Feature Flags?

Feature flags (also called feature toggles) allow you to control which features are enabled in your application without deploying new code. This action helps you:

- **Track changes** to your feature flag configuration
- **Prevent drift** between your local configs and production
- **Review flag changes** in pull requests before they go live

**Quick example:** If you have a feature flag for a new UI design, this action will notify you when someone changes the flag's default value from "off" to "on", helping you catch unintended changes before deployment.

### DevOps Engineers

This action integrates seamlessly into CI/CD pipelines to:

- **Automate flag validation** in pull request workflows
- **Detect configuration drift** between environments
- **Enforce governance** by requiring review of flag changes
- **Generate audit trails** of all flag modifications

**Recommended setup:** Use both git comparison (to see what changed in your PR) and remote comparison (to check drift from your flag management system).

### Security Teams

Use this action for security and compliance:

- **Configuration drift detection** - Know when local configs diverge from production
- **Change auditing** - Every flag change is tracked and visible in pull requests
- **Access control** - Require code review for flag changes just like any other code
- **Environment consistency** - Ensure development matches production flag states

### Contributors

Want to contribute? This action is built with:

- **GitHub Actions** composite action pattern
- **OpenFeature CLI** for the heavy lifting
- **Bash scripts** for orchestration
- **YAML parsing** for structured output

See the [Contributing](#contributing) section for development setup.

## Use Cases

- **Pull Request Validation**: Compare flag changes between feature branches and base branches automatically
- **Branch Comparison**: Validate flag manifest changes during development workflow
- **Remote Source Validation**: Check if local flag changes align with external flag management systems  
- **Drift Detection**: Identify when local configurations have diverged from remote configurations
- **Environment Synchronization**: Ensure consistency across development, staging, and production environments
- **Compliance Checking**: Verify that flag configurations meet organizational standards

## Features

- 🔍 **Manifest Comparison** - Compare local flag manifests against remote sources OR git branches
- 🌿 **Git Branch Comparison** - Automatically compare against PR base branches with minimal configuration
- 🔗 **Smart Mode Detection** - Automatically detects URL vs git mode based on input format
- 🔐 **Authentication Support** - Secure access to protected flag sources using tokens
- 📊 **Rich GitHub Integration** - Detailed summaries with change breakdowns in GitHub Action results
- ⚙️ **Flexible Configuration** - Support for various protocols and git branch comparisons
- 🛡️ **Error Handling** - Graceful handling of network issues, missing files, and CLI failures
- 🔧 **CI/CD Ready** - Designed for seamless integration into existing workflows
- 💬 **Smart PR Comments** - Automatically posts/updates comments on pull requests with differences

## Prerequisites

- **GitHub Actions workflow**
- **Git repository** with OpenFeature manifest file
- **For git branch comparison**: `fetch-depth: 0` in your checkout action (to access branch history)
- **For remote source comparison**: Access to a remote manifest source (URL or provider)
- **(Optional)** Authentication token for protected sources

> **Note:** The action uses the OpenFeature CLI, which is automatically installed during the workflow run.

## Quick Start

### For Pull Request Workflows (Recommended)

This is the simplest setup - just compare your changes against the target branch:

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

### For Remote Source Comparison

Compare your local manifest against a remote flag management system:

```yaml
name: Check Flag Drift
on: [push, pull_request]

jobs:
  check-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Compare against production flags
        uses: open-feature/openfeature-action@v1
        with:
          against: "https://your-flag-provider.com/api/flags"
          manifest: "flags.json"
          auth-token: ${{ secrets.FLAG_PROVIDER_TOKEN }}
```

## Inputs & Outputs

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `against` | URL/remote source OR local path for git comparison (optional for PR workflows) | No | - |
| `manifest` | Path to your local flag manifest file relative to repository root | No | `flags.json` |
| `base-branch` | Base branch for git comparison (auto-detected in PRs) | No | - |
| `auth-token` | Authentication token for accessing protected flag sources (use GitHub secrets) | No | - |
| `cli-version` | OpenFeature CLI version to use | No | `latest` |
| `against-manifest-path` | Path where the fetched manifest from the against source will be saved locally | No | `against-flags.json` |
| `strict` | Strict mode - fail the action if differences are found | No | `false` |
| `post-pr-comment` | Post a comment on the PR when differences are detected | No | `true` |

### Mode Detection

The action automatically detects the comparison mode based on the `against` input:

- **URL Mode**: When `against` contains a protocol (e.g., `http://`, `https://`, `git://`, `ssh://`, `file://`) or Git SSH format
- **Git Mode**: When `against` is a local path or omitted entirely

**Git Mode Behavior**:

- If in a pull request context: Uses `$GITHUB_BASE_REF` (the PR's target branch)  
- If `base-branch` is provided: Uses the specified branch
- Otherwise: Defaults to `main` branch

### Outputs

| Output | Description |
|--------|-------------|
| `has-differences` | Boolean string indicating if differences were found (`"true"`/`"false"`) |
| `comparison-result` | Raw comparison output from OpenFeature CLI in YAML format |
| `against-manifest-path` | File path where the against manifest was saved |
| `summary` | Human-readable summary of the comparison result |

## Usage Examples

### Basic Examples

#### Minimal PR Validation

```yaml
- name: Validate flag changes
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
```

#### Compare Against Specific Branch

```yaml
- name: Compare against develop
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"
    base-branch: "develop"
```

#### Compare Against Remote Source

```yaml
- name: Check against production
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.flagprovider.com/flags.json"
    manifest: "flags.json"
    auth-token: ${{ secrets.FLAG_TOKEN }}
```

### Advanced Examples

#### Strict Mode (Fail on Differences)

```yaml
- name: Enforce flag sync
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.flagprovider.com/flags.json"
    manifest: "flags.json"
    strict: true
```

#### Use Comparison Results

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  with:
    against: "https://api.flagprovider.com/flags.json"
    manifest: "flags.json"

- name: Notify Slack on differences
  if: steps.compare.outputs.has-differences == 'true'
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"🚨 Flag drift detected: ${{ steps.compare.outputs.summary }}"}' \
      ${{ secrets.SLACK_WEBHOOK }}
```

#### Multi-Environment Validation

```yaml
name: Multi-Environment Flag Validation
on: [push, pull_request]

jobs:
  validate-environments:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate ${{ matrix.environment }}
        uses: open-feature/openfeature-action@v1
        with:
          against: ${{ secrets[format('FLAG_URL_{0}', upper(matrix.environment))] }}
          manifest: "flags.json"
          auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}
          against-manifest-path: "${{ matrix.environment }}-flags.json"
```

#### Different Manifest Paths

```yaml
- name: Compare different paths
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "new-location/flags.json"    # Current branch
    against: "old-location/flags.json"     # Base branch
    base-branch: "main"
```

## Manifest Format

This action supports OpenFeature manifest files in JSON or YAML format. The manifest format differs from basic feature flag configurations:

### OpenFeature Manifest Format

```json
{
  "flags": {
    "enableNewUI": {
      "state": "ENABLED",
      "variants": {
        "on": true,
        "off": false
      },
      "defaultVariant": "off",
      "targeting": {}
    },
    "featureToggle": {
      "state": "ENABLED", 
      "variants": {
        "control": "control-experience",
        "treatment": "new-experience"
      },
      "defaultVariant": "treatment",
      "targeting": {
        "if": [
          {
            "in": [
              {"var": "userId"},
              ["user-1", "user-2"]
            ]
          },
          "treatment",
          "control"
        ]
      }
    }
  }
}
```

### Key Properties

- **`state`**: `"ENABLED"` or `"DISABLED"` - whether the flag is active
- **`variants`**: Object defining possible values for the flag
- **`defaultVariant`**: Which variant to use when targeting doesn't match
- **`targeting`**: JSON Logic rules for determining which variant to serve

For more details, see the [OpenFeature Flag Configuration Specification](https://openfeature.dev/specification/sections/flag-configuration).

## Testing

This repository includes comprehensive tests to ensure reliability:

### Test Types

1. **Integration Tests** (`pr-validation.yml`)
   - **Purpose**: Real-world testing that simulates actual usage
   - **What it tests**: Both git comparison and remote source comparison
   - **When it runs**: On PRs that modify `flags.json`

2. **Feature Tests** (`test.yml`)
   - **Purpose**: Test individual features and error handling
   - **What it tests**: Different manifest scenarios, CLI versions, error conditions
   - **When it runs**: On pushes and PRs

3. **Git Mode Tests** (`test-git-mode.yml`)
   - **Purpose**: Specifically test git branch comparison functionality
   - **What it tests**: Branch detection, path mapping, minimal configuration
   - **When it runs**: On flag changes and workflow modifications

### Running Tests Locally

You can test this action locally using [act](https://github.com/nektos/act):

```bash
# Test the basic functionality
act -j test-action

# Test git mode functionality  
act -j test-git-mode

# Test with a specific event
act pull_request -e .github/workflows/pr-validation.yml
```

### Test Scenarios Covered

- ✅ **Added flags**: Local manifest has flags not in remote
- ✅ **Removed flags**: Remote has flags not in local manifest  
- ✅ **Modified flags**: Same flags with different configurations
- ✅ **Identical manifests**: No differences detected
- ✅ **Mixed changes**: Complex scenarios with multiple types of changes
- ✅ **Error handling**: Missing files, network issues, invalid manifests
- ✅ **CLI versions**: Compatibility with different OpenFeature CLI versions
- ✅ **Authentication**: Token-based access to protected sources

## Troubleshooting

### Common Issues

#### "CLI installation failed"

1. Check if the specified CLI version exists in [OpenFeature CLI releases](https://github.com/open-feature/cli/releases)
2. Verify network connectivity to GitHub from your runner
3. Try using `cli-version: "latest"` to get the most recent version

#### "Failed to pull manifest from against source"

1. Verify the `against` URL is accessible and returns valid JSON/YAML
2. Check if authentication is required:

   ```yaml
   auth-token: ${{ secrets.FLAG_SOURCE_TOKEN }}
   ```

3. Test the URL manually:

   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" "your-against-url"
   ```


#### "Manifest file not found"

1. Verify the manifest file exists at the specified path
2. Check the file path is relative to the repository root
3. For git comparisons, ensure the file exists in the target branch

#### Git Comparison Issues

1. Ensure `fetch-depth: 0` is set in your checkout action
2. Verify the target branch exists and is accessible
3. Check that the manifest path exists in both branches

### Debug Mode

Enable debug logging by setting `ACTIONS_STEP_DEBUG` secret to `true` in your repository.

## Security

### Best Practices

#### Authentication Tokens

1. **Always use GitHub Secrets** for authentication tokens:

   ```yaml
   auth-token: ${{ secrets.FLAG_SOURCE_TOKEN }}  # ✅ Good
   auth-token: "abc123xyz"                       # ❌ Never hardcode
   ```


2. **Use environment-specific secrets**:

   ```yaml
   auth-token: ${{ secrets[format('TOKEN_{0}', matrix.environment)] }}
   ```


3. **Limit token permissions** to read-only access when possible
4. **Rotate tokens regularly** and update GitHub secrets accordingly

#### Workflow Security

- Set appropriate permissions:

  ```yaml
  permissions:
    contents: read
    pull-requests: write  # Only if using PR comments
  ```


- Use specific action versions:

  ```yaml
  uses: open-feature/openfeature-action@v1.2.3  # ✅ Specific version
  uses: open-feature/openfeature-action@v1      # ❌ Moving tag
  ```


- Pin CLI versions for reproducible builds:

  ```yaml
  cli-version: "v0.3.6"  # ✅ Pinned version
  cli-version: "latest"  # ❌ May change unexpectedly
  ```


### Handling Sensitive Data

- Never commit flag configurations with production secrets
- Use separate manifests for different environments
- Audit flag changes just like code changes
- Consider using encrypted manifests for sensitive configurations

## Support & Community

### Getting Help

- 📖 **Documentation**: [OpenFeature Documentation](https://openfeature.dev/)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/open-feature/openfeature-action/issues)
- 💬 **Community Chat**: [CNCF Slack #openfeature](https://cloud-native.slack.com/archives/C0344AANLA1)
- 🛠️ **CLI Issues**: [OpenFeature CLI Repository](https://github.com/open-feature/cli)

### Community

- **CNCF Slack Channels**:
  - [#openfeature](https://cloud-native.slack.com/archives/C0344AANLA1) - General discussion
  - [#openfeature-cli](https://cloud-native.slack.com/archives/C07DY4TUDK6) - CLI-specific topics

- **Regular Meetings**: [Community Calls](https://zoom-lfx.platform.linuxfoundation.org/meetings/openfeature)

- **Social Media**:
  - Twitter: [@openfeature](https://twitter.com/openfeature)
  - LinkedIn: [OpenFeature](https://www.linkedin.com/company/openfeature/)

### Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** and create a feature branch
2. **Make your changes** and add tests if needed
3. **Test locally** using the test workflows
4. **Submit a pull request** with a clear description

#### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/openfeature-action.git
cd openfeature-action

# Test your changes
act -j test-action
```

#### Code Style

- Use clear, descriptive commit messages
- Follow existing shell script conventions
- Add tests for new features
- Update documentation for any changes

### Support the Project

- ⭐ **Star this repository** to show your support
- 🐛 **Report bugs** and suggest improvements
- 📝 **Contribute** code, documentation, or examples
- 🗣️ **Share** your experience with the community

### Project Contributors

Thanks to all our contributors:

<a href="https://github.com/open-feature/openfeature-action/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=open-feature/openfeature-action" alt="Pictures of the folks who have contributed to the project" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Compatibility

### GitHub Actions Runners

- **Supported**: `ubuntu-latest`, `ubuntu-22.04`, `ubuntu-20.04`
- **Requirements**: Go is pre-installed on GitHub-hosted runners

### OpenFeature CLI Versions

- **Default**: Latest stable release
- **Stable Versions**: v0.3.6, v0.3.5, v0.3.4, etc. ([CLI releases](https://github.com/open-feature/cli/releases))
- **Version Selection**: Use `cli-version` input to pin a specific version
- **Format**: Version tags must include the `v` prefix (e.g., `v0.3.6`, not `0.3.6`)

### Manifest Formats

- **JSON** (`.json`) - Recommended for most use cases
- **YAML** (`.yml`, `.yaml`) - Good for complex configurations
- **Schema**: Must conform to [OpenFeature manifest schema](https://openfeature.dev/specification/sections/flag-configuration)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Part of the [OpenFeature](https://openfeature.dev/) ecosystem - A [CNCF](https://www.cncf.io/) project*

<!-- x-hide-in-docs-end -->