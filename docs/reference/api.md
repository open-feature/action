# API Reference

Complete reference for all inputs, outputs, and environment variables.

## Inputs

### Required Inputs

#### `manifest`

- **Type**: `string`
- **Required**: `true`
- **Description**: Path to the local manifest file or URL to a remote manifest
- **Examples**:

  ```yaml
  manifest: "flags.json"                    # Local file
  manifest: "./config/feature-flags.yaml"  # Relative path
  manifest: "https://api.example.com/flags" # Remote URL
  ```

### Optional Inputs

#### `against`

- **Type**: `string`
- **Required**: `false`
- **Description**: Comparison target - local file, remote URL, or git reference
- **Default**: Compares against the same manifest in the target branch
- **Examples**:

  ```yaml
  against: "production-flags.json"          # Local file
  against: "https://prod.example.com/flags" # Remote URL
  against: "origin/main:flags.json"        # Git reference
  ```

#### `auth-token`

- **Type**: `string`
- **Required**: `false`
- **Description**: Authentication token for remote manifest sources
- **Usage**: Store in GitHub Secrets, never hardcode
- **Examples**:

  ```yaml
  auth-token: ${{ secrets.FLAG_SOURCE_TOKEN }}
  auth-token: ${{ secrets.PROD_READ_TOKEN }}
  ```

#### `manifest-auth-token`

- **Type**: `string`
- **Required**: `false`
- **Description**: Authentication token specifically for the manifest parameter when it's a URL
- **Usage**: Allows different authentication for manifest vs against when both are remote
- **Examples**:

  ```yaml
  manifest-auth-token: ${{ secrets.DEV_TOKEN }}
  auth-token: ${{ secrets.PROD_TOKEN }}
  ```

#### `base-branch`

- **Type**: `string`
- **Required**: `false`
- **Description**: Git branch to compare against for git-mode comparisons
- **Default**: Auto-detected from `github.base_ref` or defaults to `main`
- **Examples**:

  ```yaml
  base-branch: "main"
  base-branch: "develop"
  base-branch: "release/v1.0"
  ```

#### `against-manifest-path`

- **Type**: `string`
- **Required**: `false`
- **Description**: Local path where the "against" manifest should be saved
- **Default**: `"against-flags.json"`
- **Examples**:

  ```yaml
  against-manifest-path: "comparison-target.json"
  against-manifest-path: "./temp/target-flags.yaml"
  ```

#### `cli-version`

- **Type**: `string`
- **Required**: `false`
- **Description**: Specific version of the OpenFeature CLI to use
- **Default**: `"latest"`
- **Examples**:

  ```yaml
  cli-version: "latest"
  cli-version: "v0.3.6"
  cli-version: "v0.3.5"
  ```

#### `strict`

- **Type**: `boolean`
- **Required**: `false`
- **Description**: Whether to fail the action if differences are detected
- **Default**: `false`
- **Examples**:

  ```yaml
  strict: true   # Fail on any differences
  strict: false  # Report differences but don't fail
  ```

#### `post-pr-comment`

- **Type**: `boolean`
- **Required**: `false`
- **Description**: Whether to post comparison results as a PR comment
- **Default**: `true`
- **Requirements**: Requires `pull-requests: write` permission
- **Examples**:

  ```yaml
  post-pr-comment: true   # Post PR comments
  post-pr-comment: false  # No PR comments
  ```

## Outputs

### `has-differences`

- **Type**: `boolean`
- **Description**: Whether differences were detected between manifests
- **Values**: `"true"` or `"false"` (as strings)
- **Example Usage**:

  ```yaml
  - name: Check for differences
    id: comparison
    uses: open-feature/openfeature-action@v1
    
  - name: Handle differences
    if: steps.comparison.outputs.has-differences == 'true'
    run: echo "Differences detected!"
  ```

### `summary`

- **Type**: `string`
- **Description**: Human-readable summary of the comparison results
- **Format**: Text description of changes found
- **Example Usage**:

  ```yaml
  - name: Show summary
    run: echo "${{ steps.comparison.outputs.summary }}"
  ```

### `comparison-result`

- **Type**: `string`
- **Description**: Complete JSON output from the OpenFeature CLI comparison
- **Format**: JSON string containing detailed comparison data
- **Example Usage**:

  ```yaml
  - name: Parse results
    run: |
      echo '${{ steps.comparison.outputs.comparison-result }}' | jq .
  ```

### `local-manifest-path`

- **Type**: `string`
- **Description**: Path to the local manifest file used in comparison
- **Example Usage**:

  ```yaml
  - name: Archive manifest
    uses: actions/upload-artifact@v3
    with:
      path: ${{ steps.comparison.outputs.local-manifest-path }}
  ```

### `against-manifest-path`

- **Type**: `string`
- **Description**: Path to the resolved "against" manifest file
- **Example Usage**:

  ```yaml
  - name: Archive comparison target
    uses: actions/upload-artifact@v3
    with:
      path: ${{ steps.comparison.outputs.against-manifest-path }}
  ```

## Environment Variables

### Action-Specific Variables

#### `ACTIONS_STEP_DEBUG`

- **Type**: `boolean`
- **Description**: Enable debug logging for troubleshooting
- **Usage**: Set to `true` to see detailed logs
- **Example**:

  ```yaml
  env:
    ACTIONS_STEP_DEBUG: true
  ```

### CLI Environment Variables

The action respects these OpenFeature CLI environment variables:

#### `OPENFEATURE_CLI_LOG_LEVEL`

- **Type**: `string`
- **Values**: `debug`, `info`, `warn`, `error`
- **Description**: Set CLI logging level
- **Example**:

  ```yaml
  env:
    OPENFEATURE_CLI_LOG_LEVEL: debug
  ```

#### `OPENFEATURE_CLI_OUTPUT_FORMAT`

- **Type**: `string`
- **Values**: `json`, `yaml`, `table`
- **Description**: Set CLI output format
- **Example**:

  ```yaml
  env:
    OPENFEATURE_CLI_OUTPUT_FORMAT: json
  ```

### Network Configuration

#### `HTTP_PROXY` / `HTTPS_PROXY`

- **Type**: `string`
- **Description**: Proxy server configuration for remote manifest access
- **Example**:

  ```yaml
  env:
    HTTPS_PROXY: https://proxy.company.com:8080
    HTTP_PROXY: http://proxy.company.com:8080
  ```

#### `NO_PROXY`

- **Type**: `string`
- **Description**: Comma-separated list of hosts to bypass proxy
- **Example**:

  ```yaml
  env:
    NO_PROXY: localhost,127.0.0.1,.company.com
  ```

## GitHub Context Variables

The action uses these GitHub context variables automatically:

### `github.base_ref`

- **Description**: Base branch for pull request (used for auto-detecting target branch)
- **Available**: Pull request events only

### `github.ref`

- **Description**: Current branch reference
- **Used**: For git comparisons and logging

### `github.sha`

- **Description**: Commit SHA
- **Used**: For audit trails and logging

### `github.actor`

- **Description**: User who triggered the workflow
- **Used**: For audit trails and security logging

### `github.repository`

- **Description**: Repository name in `owner/repo` format
- **Used**: For logging and audit trails

### `github.event.pull_request.number`

- **Description**: Pull request number
- **Used**: For PR comment posting

## Permissions Required

### Minimal Permissions

```yaml
permissions:
  contents: read  # Read repository content
```

### With PR Comments

```yaml
permissions:
  contents: read          # Read repository content
  pull-requests: write   # Post PR comments
```

### For Git Comparisons

```yaml
permissions:
  contents: read  # Read repository content and git history
```

## Usage Patterns

### Basic Comparison

```yaml
- uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
```

### Remote Comparison

```yaml
- uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    against: ${{ secrets.PROD_FLAG_URL }}
    auth-token: ${{ secrets.PROD_TOKEN }}
```

### Strict Validation

```yaml
- uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    against: production-flags.json
    strict: true
```

### Multiple Environments

```yaml
strategy:
  matrix:
    environment: [dev, staging, prod]
steps:
  - uses: open-feature/openfeature-action@v1
    with:
      manifest: flags.json
      against: ${{ secrets[format('FLAG_URL_{0}', upper(matrix.environment))] }}
      auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}
```

### Custom CLI Version

```yaml
- uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    cli-version: "v0.3.6"
```

### Conditional Actions

```yaml
- name: Compare flags
  id: comparison
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    
- name: Deploy if no differences
  if: steps.comparison.outputs.has-differences == 'false'
  run: ./deploy.sh
```

## Error Handling

### Common Error Scenarios

1. **Missing manifest file**: Returns error, action fails
2. **Invalid manifest format**: CLI validation error, action fails
3. **Network timeout**: Retry-able error, action fails
4. **Authentication failure**: Returns error, action fails
5. **Git branch not found**: Returns error, action fails

### Error Output Format

Errors are reported through:

- **Action failure**: Non-zero exit code
- **GitHub annotations**: `::error::` messages in logs
- **Step summary**: Error details in workflow summary

### Handling Errors in Workflows

```yaml
- name: Compare flags
  id: comparison
  uses: open-feature/openfeature-action@v1
  continue-on-error: true
  with:
    manifest: flags.json
    
- name: Handle errors
  if: failure()
  run: |
    echo "Comparison failed, but continuing..."
    echo "Error in step: comparison"
```

## Version Compatibility

### Action Versions

- **v1.x.x**: Current stable version
- **v1**: Latest v1.x release (moving tag)
- **main**: Development version (not recommended for production)

### CLI Compatibility

- **v0.3.6**: Recommended stable version
- **v0.3.5**: Previous stable version
- **latest**: Latest CLI release (may include breaking changes)

### GitHub Actions Runner Compatibility

- **ubuntu-latest**: ✅ Fully supported
- **macos-latest**: ✅ Fully supported  
- **windows-latest**: ✅ Supported
- **self-hosted**: ✅ Supported (requires Go installation)

## Next Steps

- **[Configuration Guide](../configuration.md)** - Detailed configuration examples
- **[Examples](../examples/)** - Practical usage examples  
- **[Troubleshooting](../troubleshooting.md)** - Common issues and solutions
