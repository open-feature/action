# Configuration

This page covers all configuration options for the OpenFeature Action.

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `against` | URL/remote source OR local path for git comparison (optional for PR workflows) | No | - |
| `manifest` | Path to your local flag manifest file relative to repository root OR URL to remote manifest | No | `flags.json` |
| `base-branch` | Base branch for git comparison (auto-detected in PRs) | No | - |
| `auth-token` | Authentication token for accessing protected against sources (use GitHub secrets) | No | - |
| `manifest-auth-token` | Authentication token for accessing protected manifest sources (use GitHub secrets) | No | - |
| `cli-version` | OpenFeature CLI version to use | No | `latest` |
| `against-manifest-path` | Path where the fetched manifest from the against source will be saved locally | No | `against-flags.json` |
| `strict` | Strict mode - fail the action if differences are found | No | `false` |
| `post-pr-comment` | Post a comment on the PR when differences are detected | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `has-differences` | Boolean string indicating if differences were found (`"true"`/`"false"`) |
| `comparison-result` | Raw comparison output from OpenFeature CLI in YAML format |
| `against-manifest-path` | File path where the against manifest was saved |
| `local-manifest-path` | File path of the local manifest (original path or downloaded from URL) |
| `summary` | Human-readable summary of the comparison result |

## Mode Detection

The action automatically detects the comparison mode based on your inputs:

### URL Mode

When `against` or `manifest` contains a protocol (e.g., `http://`, `https://`, `git://`, `ssh://`, `file://`) or Git SSH format.

**Example:**

```yaml
with:
  manifest: "https://staging.example.com/flags.json"
  against: "https://production.example.com/flags.json"
```

### Git Mode

When inputs are local paths or omitted entirely.

**Git Mode Behavior:**

- If in a pull request context: Uses `$GITHUB_BASE_REF` (the PR's target branch)  
- If `base-branch` is provided: Uses the specified branch
- Otherwise: Defaults to `main` branch

**Example:**

```yaml
with:
  manifest: "flags.json"          # Current branch
  against: "legacy/flags.json"    # Base branch path
  base-branch: "develop"
```

## Manifest Format

The action supports OpenFeature manifest files in JSON or YAML format.

### OpenFeature Manifest Structure

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

## Default Behaviors

| Behavior | Default Value | Notes |
|----------|--------------|--------|
| Local manifest path | `flags.json` | Relative to repository root |
| Against manifest save location | `against-flags.json` | Saved in workspace |
| Fail on differences | `false` | Won't fail the workflow by default |
| CLI version | `latest` | Fetches the most recent stable release |
| Authentication | None | Only required for protected sources |
| PR comments | `true` | Automatically posts/updates comments |

## Environment Variables

The action sets these environment variables for use in subsequent steps:

- `CLI_PATH` - Path to the OpenFeature CLI binary
- `LOCAL_MANIFEST_PATH` - Resolved path to the local manifest
- `ADD_COUNT` - Number of flags added (when differences found)
- `REMOVE_COUNT` - Number of flags removed (when differences found)
- `MODIFY_COUNT` - Number of flags modified (when differences found)
- `TOTAL_CHANGES` - Total number of changes (when differences found)

## Using Outputs

You can access the action's outputs in subsequent workflow steps:

```yaml
- name: Compare manifests
  id: compare
  uses: open-feature/openfeature-action@v1
  with:
    manifest: "flags.json"

- name: Handle differences
  if: steps.compare.outputs.has-differences == 'true'
  run: |
    echo "Found differences in: ${{ steps.compare.outputs.local-manifest-path }}"
    echo "Summary: ${{ steps.compare.outputs.summary }}"
```
