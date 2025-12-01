# Push Feature Documentation

The OpenFeature Action now supports **pushing flag manifests to remote providers**, enabling automated synchronization of your feature flags with external systems.

## Table of Contents
- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Advanced Configuration](#advanced-configuration)
- [Automatic Push on Merge](#automatic-push-on-merge)
- [Security Considerations](#security-considerations)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

The push feature allows you to:
- **Sync local flag changes** to remote flag providers
- **Automate flag deployment** after PR reviews
- **Maintain consistency** between your codebase and flag provider
- **Support CI/CD workflows** with feature flag management

## Basic Usage

### Enable Push in Your Action

```yaml
- name: Compare and Push Flags
  uses: open-feature/action@main
  with:
    manifest: flags.json
    against: https://your-provider.com/api
    auth-token: ${{ secrets.FLAG_TOKEN }}
    push-enabled: 'true'  # Enable push
```

## Advanced Configuration

### Push Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `push-enabled` | Enable/disable push functionality | `false` | No |
| `push-to` | URL to push to (defaults to `against` URL) | Value of `against` | No |
| `push-auth-token` | Auth token for push (defaults to `auth-token`) | Value of `auth-token` | No |
| `push-only-on-sync` | Only push if manifests are already in sync | `false` | No |

### Push Outputs

| Output | Description |
|--------|-------------|
| `push-performed` | Whether push was actually performed (`true`/`false`) |
| `push-result` | Result message from push operation |

## Automatic Push on Merge

### Quick Start

Add this workflow to automatically push flag changes when PRs are merged:

**.github/workflows/auto-push-flags.yml:**
```yaml
name: Auto-Push Flags

on:
  push:
    branches:
      - main
    paths:
      - 'flags.json'

jobs:
  push-to-provider:
    uses: open-feature/action/.github/workflows/push-on-merge.yml@main
    with:
      manifest-path: 'flags.json'
      remote-url: 'https://flagd-studio.onrender.com/api'
    secrets:
      auth-token: ${{ secrets.FLAGD_STUDIO_TOKEN }}
```

### How It Works

1. **Triggered on merge** - Runs when changes are pushed to main branch
2. **Checks for changes** - Only proceeds if flag manifest was modified
3. **Pushes to provider** - Syncs the updated manifest with your remote provider
4. **Creates deployment** - Records the push as a GitHub deployment for tracking

### Reusable Workflow Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `manifest-path` | Path to flag manifest | `flags.json` |
| `remote-url` | Provider API endpoint | Required |
| `branch` | Branch to monitor | Default branch |
| `cli-version` | OpenFeature CLI version | `latest` |
| `dry-run` | Test without pushing | `false` |

### Error Handling and Notifications

**⚠️ Important:** When using automatic push on merge, it's critical to monitor for failures and notify your team when the push fails. Since the push happens after the PR is already merged, a failure could leave your local manifest out of sync with your remote provider.

#### Recommended: Add Failure Notifications

Add a notification step to alert your team if the automated push fails:

```yaml
name: Auto-Push Flags

on:
  push:
    branches:
      - main
    paths:
      - 'flags.json'

jobs:
  push-to-provider:
    uses: open-feature/action/.github/workflows/push-on-merge.yml@main
    with:
      manifest-path: 'flags.json'
      remote-url: 'https://flagd-studio.onrender.com/api'
    secrets:
      auth-token: ${{ secrets.FLAGD_STUDIO_TOKEN }}

  notify-on-failure:
    needs: push-to-provider
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Notify team via Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🚨 Flag Push Failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Automated flag push failed after merge*\n\n• *Repository:* ${{ github.repository }}\n• *Branch:* ${{ github.ref_name }}\n• *Commit:* <${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}|${{ github.sha }}>\n• *Author:* @${{ github.actor }}\n\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View workflow run>"
                  }
                }
              ]
            }
```

#### Alternative Notification Methods

**Microsoft Teams:**
```yaml
- name: Notify via Teams
  if: failure()
  uses: jdcargile/ms-teams-notification@v1.3
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    ms-teams-webhook-uri: ${{ secrets.TEAMS_WEBHOOK }}
    notification-summary: Flag push failed after merge
    notification-color: dc3545
```

**Email:**
```yaml
- name: Send email notification
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.MAIL_USERNAME }}
    password: ${{ secrets.MAIL_PASSWORD }}
    subject: 🚨 Flag Push Failed - ${{ github.repository }}
    to: team@example.com
    from: GitHub Actions
    body: |
      Automated flag push failed after PR merge.

      Repository: ${{ github.repository }}
      Commit: ${{ github.sha }}
      Author: ${{ github.actor }}

      View run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

**GitHub Issues (auto-create issue on failure):**
```yaml
- name: Create issue on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      await github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: '🚨 Automated flag push failed',
        body: `## Push Failure Alert

        The automated flag push to the remote provider failed after merging.

        **Details:**
        - **Commit:** ${context.sha}
        - **Author:** @${context.actor}
        - **Workflow Run:** ${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}

        **Action Required:**
        1. Check the workflow logs for error details
        2. Verify authentication token is valid
        3. Manually push flags if needed: \`openfeature push --flag-source-url <url> --auth-token <token>\`

        **Impact:** Local manifest may be out of sync with remote provider until resolved.`,
        labels: ['flag-sync', 'urgent', 'automated']
      });
```

#### Monitoring Best Practices

1. **Set up alerts** - Always configure failure notifications for automated push workflows
2. **Monitor regularly** - Check GitHub Actions tab for workflow status
3. **Use deployment tracking** - Review GitHub Deployments to see push history
4. **Have a rollback plan** - Document how to manually push or revert changes
5. **Test notifications** - Verify your notification setup works before relying on it

## Security Considerations

### Authentication Tokens

1. **Store tokens as secrets** - Never commit tokens to your repository
2. **Use least privilege** - Create tokens with minimal required permissions
3. **Rotate regularly** - Update tokens periodically

```yaml
# Good - using secret
auth-token: ${{ secrets.FLAG_TOKEN }}

# Bad - hardcoded token
auth-token: 'abc123...'  # NEVER DO THIS
```

### Token Reuse

The action intelligently reuses tokens:
- If `push-auth-token` is not provided, it uses `auth-token`
- Useful when your token has both read and write permissions
- Reduces configuration complexity

### Safety Features

#### Push Only on Sync

Prevent accidental overwrites with `push-only-on-sync`:

```yaml
- uses: open-feature/action@main
  with:
    push-enabled: 'true'
    push-only-on-sync: 'true'  # Only push if already in sync
```

This is useful for:
- Initial provider setup
- Ensuring no unexpected changes
- Validation workflows

## Examples

### Example 1: Push After PR Approval

```yaml
name: Push on PR Merge

on:
  pull_request:
    types: [closed]

jobs:
  push-if-merged:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: open-feature/action@main
        with:
          manifest: flags.json
          against: https://provider.com/api
          auth-token: ${{ secrets.TOKEN }}
          push-enabled: 'true'
```

### Example 2: Multi-Environment Push

```yaml
name: Deploy Flags to All Environments

on:
  workflow_dispatch:

jobs:
  push-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: open-feature/action@main
        with:
          manifest: flags/staging.json
          against: https://staging.provider.com/api
          auth-token: ${{ secrets.STAGING_TOKEN }}
          push-enabled: 'true'

  push-production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: open-feature/action@main
        with:
          manifest: flags/production.json
          against: https://prod.provider.com/api
          auth-token: ${{ secrets.PROD_TOKEN }}
          push-enabled: 'true'
```

### Example 3: Conditional Push Based on Differences

```yaml
- name: Compare flags
  id: compare
  uses: open-feature/action@main
  with:
    manifest: flags.json
    against: https://provider.com/api
    auth-token: ${{ secrets.TOKEN }}
    push-enabled: 'false'  # Don't push yet

- name: Push if changes detected
  if: steps.compare.outputs.has-differences == 'true'
  uses: open-feature/action@main
  with:
    manifest: flags.json
    against: https://provider.com/api
    auth-token: ${{ secrets.TOKEN }}
    push-enabled: 'true'
```

### Example 4: Dry Run Testing

```yaml
- name: Test push (dry run)
  uses: open-feature/action/.github/workflows/push-on-merge.yml@main
  with:
    manifest-path: 'flags.json'
    remote-url: 'https://provider.com/api'
    dry-run: true  # Test without actually pushing
  secrets:
    auth-token: ${{ secrets.TOKEN }}
```

## Troubleshooting

### Common Issues

#### Push fails with authentication error
- **Check token permissions** - Ensure token has write access
- **Verify token is set** - Check GitHub Secrets configuration
- **Test with CLI directly** - `openfeature push --flag-source-url <url> --auth-token <token>`

#### Push not triggering on merge
- **Check workflow path filters** - Ensure manifest file matches path filter
- **Verify branch name** - Confirm pushing to correct branch
- **Review workflow conditions** - Check `if` conditions in workflow

#### Manifest validation errors
- **Validate JSON syntax** - Use a JSON linter
- **Check schema compliance** - Ensure manifest follows OpenFeature schema
- **Test locally first** - Run `openfeature validate` locally

### Debug Mode

Enable debug logging for troubleshooting:

```yaml
- uses: open-feature/action@main
  env:
    ACTIONS_STEP_DEBUG: true
  with:
    # ... your config
```

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/open-feature/action/issues)
- **Discussions**: [OpenFeature Community](https://github.com/orgs/open-feature/discussions)
- **Documentation**: [OpenFeature Docs](https://openfeature.dev)

## Best Practices

1. **Use PR workflows for validation** - Compare but don't push in PR checks
2. **Push only from main branch** - Avoid pushing from feature branches
3. **⚠️ Always set up failure notifications** - Configure Slack, email, or issue alerts for failed pushes (see [Error Handling](#error-handling-and-notifications)). This is critical for automated push workflows.
4. **Version your manifests** - Keep history of flag changes in git
5. **Test with dry-run first** - Validate workflow before enabling push
6. **Use deployment tracking** - Monitor when flags were pushed via GitHub Deployments
7. **Implement rollback strategy** - Have a plan to revert changes and manually sync if needed

## Migration Guide

If you're currently manually pushing flags, here's how to migrate:

1. **Add auth token to secrets**:
   ```
   GitHub Settings → Secrets → New repository secret
   Name: FLAGD_STUDIO_TOKEN
   Value: <your-token>
   ```

2. **Add the auto-push workflow**:
   Copy `examples/auto-push-workflow.yml` to `.github/workflows/`

3. **Test with dry-run**:
   Set `dry-run: true` initially to test

4. **Enable push**:
   Remove `dry-run` or set to `false`

5. **Monitor initial pushes**:
   Check Actions tab for push results

## Next Steps

- [Read about comparison features](../README.md#comparison-features)
- [Learn about strict mode](../README.md#strict-mode)
- [Explore PR comment integration](../README.md#pr-comments)
- [View example workflows](../examples/)