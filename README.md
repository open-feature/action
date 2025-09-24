# OpenFeature Manifest Compare Action

A GitHub Action that compares OpenFeature flag manifests between your local configuration and a remote source using the [OpenFeature CLI](https://github.com/open-feature/cli). This action helps teams maintain consistency between their local feature flag configurations and centralized flag management systems.

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

## Prerequisites

- GitHub Actions workflow
- OpenFeature manifest file in your repository
- For git branch comparison: `fetch-depth: 0` in your checkout action (to access branch history)
- For remote source comparison: Access to a remote manifest source (URL or provider)
- (Optional) Authentication token for protected sources

## Quick Start

Add this action to your workflow to compare flag manifests:

**For Pull Request workflows (compares against base branch):**
```yaml
name: Compare Flag Manifests  
on: pull_request

jobs:
  compare-manifests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Needed for git branch comparison
      
      - name: Compare flag manifests
        uses: openfeature/openfeature-action@v1
        with:
          manifest: "flags.json"
          # Automatically compares against PR base branch
```

**For remote source comparison:**
```yaml
name: Compare Flag Manifests
on: [push, pull_request]

jobs:
  compare-manifests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Compare flag manifests
        uses: openfeature/openfeature-action@v1
        with:
          against: "https://your-remote-source.com/flags.yml"
          manifest: "openfeature.yml"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `against` | URL/remote source OR local path for git comparison (optional for PR workflows) | No | - |
| `manifest` | Path to your local flag manifest file relative to repository root | No | `flags.json` |
| `base-branch` | Base branch for git comparison (auto-detected in PRs) | No | - |
| `auth-token` | Authentication token for accessing protected flag sources (use GitHub secrets) | No | - |
| `cli-version` | OpenFeature CLI version to use | No | `latest` |
| `against-manifest-path` | Path where the fetched manifest from the against source will be saved locally | No | `against-flags.json` |
| `fail-on-diff` | Fail the action if differences are found | No | `false` |

### Mode Detection

The action automatically detects the comparison mode based on the `against` input:

- **URL Mode**: When `against` contains a protocol (e.g., `http://`, `https://`, `git://`, `ssh://`, `file://`) or Git SSH format
- **Git Mode**: When `against` is a local path or omitted entirely

**Git Mode Behavior**:
- If in a pull request context: Uses `$GITHUB_BASE_REF` (the PR's target branch)  
- If `base-branch` is provided: Uses the specified branch
- Otherwise: Defaults to `main` branch

## Outputs

| Output | Description |
|--------|-------------|
| `has-differences` | Boolean string indicating if differences were found (`"true"`/`"false"`) |
| `comparison-result` | Raw comparison output from OpenFeature CLI in the specified format |
| `against-manifest-path` | File path where the against manifest was saved |
| `summary` | Human-readable summary of the comparison result |

### Understanding Comparison Results

The action compares manifests and identifies:
- **Added flags**: Flags present in local but not in against
- **Removed flags**: Flags present in against but not in local  
- **Modified flags**: Flags with different configurations between local and against
- **Unchanged flags**: Flags that are identical in both manifests

#### Example Outputs

**When flags are added locally:**
```
🔍 Flag manifest differences detected between local and against sources

Added Flags:
├── newLocalFlag (string)
└── anotherNewFlag (number)
```

**When flags are removed locally:**
```
🔍 Flag manifest differences detected between local and against sources

Removed Flags:
├── exampleStr (string)
└── exampleNum (number)
```

**When flags are modified:**
```
🔍 Flag manifest differences detected between local and against sources

Modified Flags:
└── exampleBool
    ├── defaultValue: false → true
    └── description: "Original description" → "Modified description"
```

**When manifests are identical:**
```
✅ No differences found between local and against flag manifests
```

**Complex scenario with multiple changes (JSON format):**
```json
{
  "added": ["brandNewFeature", "anotherNewFlag"],
  "removed": ["exampleStr", "exampleNum"],
  "modified": {
    "exampleBool": {
      "defaultValue": {"old": false, "new": true}
    }
  }
}
```

## Usage Examples

### Git Branch Comparison (Recommended for PRs)

**Minimal configuration for pull request workflows:**
```yaml
- name: Compare manifests
  uses: openfeature/openfeature-action@v1
  with:
    manifest: "flags.json"
    # Automatically uses PR base branch
```

**Compare against a specific branch:**
```yaml  
- name: Compare manifests
  uses: openfeature/openfeature-action@v1
  with:
    manifest: "flags.json"
    base-branch: "develop"
```

**Compare different manifest paths between branches:**
```yaml
- name: Compare manifests  
  uses: openfeature/openfeature-action@v1
  with:
    manifest: "new-location/flags.json"    # Current branch
    against: "old-location/flags.json"     # Base branch
    base-branch: "main"
```

### Remote Source Comparison

**Compare with remote URL:**
```yaml
- name: Compare manifests
  uses: openfeature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "./config/flags.yml"
```

**Git repository via SSH:**
```yaml
- name: Compare manifests
  uses: openfeature/openfeature-action@v1
  with:
    against: "git@github.com:org/config-repo.git#main:flags.json"
    manifest: "flags.json"
```

### Fail on Differences

Fail the workflow if differences are detected:

```yaml
- name: Ensure manifest sync
  uses: openfeature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "openfeature.yml"
    fail-on-diff: "true"
```

### Use Comparison Results

Access the comparison results in subsequent steps:

```yaml
- name: Compare manifests
  id: compare
  uses: openfeature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "openfeature.yml"

- name: Post to Slack if differences found
  if: steps.compare.outputs.has-differences == 'true'
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"🚨 Flag manifest differences detected: ${{ steps.compare.outputs.summary }}"}' \
      ${{ secrets.SLACK_WEBHOOK }}
```

### Different Output Formats

Get comparison results in different formats:

```yaml
- name: JSON comparison
  uses: openfeature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "openfeature.yml"
    output-format: "json"

- name: Text comparison
  uses: openfeature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "openfeature.yml"
    output-format: "text"
```

### Specify CLI Version

Use a specific version of the OpenFeature CLI:

```yaml
- name: Compare with specific CLI version
  uses: openfeature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "openfeature.yml"
    cli-version: "v0.3.6"  # Pin to specific version
```

Available versions: See [OpenFeature CLI releases](https://github.com/open-feature/cli/releases)

### Authenticated Pull

Use authentication token for protected flag sources:

```yaml
- name: Compare with authenticated source
  uses: openfeature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "openfeature.yml"
    auth-token: ${{ secrets.FLAG_SOURCE_TOKEN }}
```

## Integration Examples

### Pull Request Validation

**Simple PR validation (compares against base branch):**
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
          fetch-depth: 0  # Required for git branch comparison
      
      - name: Validate flag manifest changes
        uses: openfeature/openfeature-action@v1
        id: validate
        with:
          manifest: "flags.json"
          # Automatically compares against PR base branch
          
      - name: Comment on PR if differences found
        uses: actions/github-script@v7
        if: steps.validate.outputs.has-differences == 'true'  
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🔍 Flag manifest changes detected between your branch and the target branch. Please review the differences in the action summary.'
            })
```

**PR validation against remote source:**
```yaml
name: Validate Flag Changes
on:
  pull_request:
    paths:
      - 'openfeature.yml'

jobs:
  validate-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate against remote source
        uses: openfeature/openfeature-action@v1
        with:
          against: ${{ secrets.FLAG_MANAGEMENT_URL }}
          manifest: "openfeature.yml"
          auth-token: ${{ secrets.FLAG_MANAGEMENT_TOKEN }}
          fail-on-diff: "false"
```

### Multi-Environment Comparison

Compare against different environments:

```yaml
name: Multi-Environment Flag Comparison
on: [push, workflow_dispatch]

jobs:
  compare-environments:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Compare with ${{ matrix.environment }}
        uses: openfeature/openfeature-action@v1
        with:
          against: ${{ secrets[format('FLAG_URL_{0}', upper(matrix.environment))] }}
          manifest: "openfeature.yml"
          against-manifest-path: "${{ matrix.environment }}-flags.yml"
          output-format: "markdown"
```

## Error Handling

The action includes comprehensive error handling for common scenarios:

- **Missing Local Manifest**: Action fails with clear error message
- **Network Issues**: Graceful handling of remote source connectivity problems
- **Invalid Manifests**: Clear error reporting for malformed YAML/JSON
- **CLI Installation Failures**: Automatic retry and fallback mechanisms

## Troubleshooting

### Action fails with "CLI installation failed"

1. Check if the specified CLI version exists in the [OpenFeature CLI releases](https://github.com/open-feature/cli/releases)
2. Verify network connectivity to GitHub from your runner
3. Try using `cli-version: "latest"` to get the most recent version

### Action fails with "Failed to pull manifest from against source"

1. Verify the `against` URL is accessible
2. Check if authentication is required for your against source
   - If so, provide the `auth-token` input parameter
   - Ensure the token has proper permissions to access the resource
3. Ensure the against source returns valid manifest content
4. Test the URL manually: `curl -L -H "Authorization: Bearer YOUR_TOKEN" "your-against-url"`

### Comparison results are empty

1. Verify both manifest files are valid OpenFeature format
2. Check that the local manifest file exists at the specified path
3. Ensure the CLI `compare` command supports your manifest format
4. Try different `output-format` values to see if one works

### Permission Issues

If you encounter permission errors, ensure you're using the `auth-token` input:

```yaml
- name: Compare manifests
  uses: openfeature/openfeature-action@v1
  with:
    against: "https://api.example.com/flags.yml"
    manifest: "openfeature.yml"
    auth-token: ${{ secrets.FLAG_AUTH_TOKEN }}
```

## Security Best Practices

### Handling Authentication Tokens

1. **Always use GitHub Secrets** for authentication tokens:
   ```yaml
   auth-token: ${{ secrets.FLAG_SOURCE_TOKEN }}  # ✅ Good
   auth-token: "abc123xyz"                       # ❌ Never hardcode tokens
   ```

2. **Use environment-specific secrets** for different stages:
   ```yaml
   auth-token: ${{ secrets[format('TOKEN_{0}', matrix.environment)] }}
   ```

3. **Limit token permissions** to read-only access when possible

4. **Rotate tokens regularly** and update GitHub secrets accordingly

### Secure Workflow Configuration

- Set appropriate permissions for your workflow:
  ```yaml
  permissions:
    contents: read
    pull-requests: write  # Only if commenting on PRs
  ```

- Use specific action versions instead of tags:
  ```yaml
  uses: openfeature/openfeature-action@v1.2.3  # Specific version
  ```

- Pin CLI version for reproducible builds:
  ```yaml
  cli-version: "v0.3.6"  # Specific CLI version
  ```

## Compatibility

### GitHub Actions Runners
- **Supported**: `ubuntu-latest`, `ubuntu-22.04`, `ubuntu-20.04`
- **Requirements**: Go is pre-installed on GitHub-hosted runners

### OpenFeature CLI Versions
- **Default**: Latest stable release
- **Stable Versions**: v0.3.6, v0.3.5, v0.3.4, etc. (see [CLI releases](https://github.com/open-feature/cli/releases))
- **Version Selection**: Use `cli-version` input to pin a specific version (e.g., `v0.3.6`)
- **Format**: Version tags must include the `v` prefix (e.g., `v0.3.6`, not `0.3.6`)

### Manifest Formats
- JSON (`.json`)
- YAML (`.yml`, `.yaml`)
- Must conform to [OpenFeature manifest schema](https://openfeature.dev/specification/sections/flag-configuration)

## Default Behaviors

| Behavior | Default Value | Notes |
|----------|--------------|--------|
| Local manifest path | `flags.json` | Relative to repository root |
| Against manifest save location | `against-flags.json` | Saved in workspace |
| Output format | `tree` | Human-readable tree format |
| Fail on differences | `false` | Won't fail the workflow by default |
| CLI version | `latest` | Fetches the most recent stable release |
| Authentication | None | Only required for protected sources |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [OpenFeature Documentation](https://openfeature.dev/)
- [OpenFeature CLI Repository](https://github.com/open-feature/cli)
- [GitHub Issues](https://github.com/openfeature/openfeature-action/issues)
- [OpenFeature Slack](https://cloud-native.slack.com/archives/C0344AANLA1)

---

*Part of the [OpenFeature](https://openfeature.dev/) ecosystem*
