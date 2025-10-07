# CI/CD Integration Examples

Complete workflow examples for integrating the OpenFeature Action into your CI/CD pipelines.

## Complete PR Validation Workflow

A comprehensive pull request validation setup:

```yaml
name: Pull Request Validation
on:
  pull_request:
    branches: [main, develop]
    paths:
      - 'flags.json'
      - 'config/flags/**'

permissions:
  contents: read
  pull-requests: write

jobs:
  validate-flags:
    runs-on: ubuntu-latest
    name: Validate flag changes
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for git comparison
          
      - name: Validate flag syntax
        run: |
          # Basic JSON validation
          jq empty flags.json
          echo "✅ Flag manifest syntax is valid"
          
      - name: Compare against base branch
        uses: open-feature/openfeature-action@v1
        id: git-compare
        with:
          manifest: flags.json
          # Automatically uses PR base branch
          
      - name: Compare against production
        uses: open-feature/openfeature-action@v1
        id: prod-compare
        with:
          manifest: flags.json
          against: ${{ secrets.PRODUCTION_FLAG_URL }}
          auth-token: ${{ secrets.PRODUCTION_TOKEN }}
          post-pr-comment: false  # Don't duplicate comments
          
      - name: Generate comprehensive report
        run: |
          echo "## 📊 Flag Validation Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### Git Changes" >> $GITHUB_STEP_SUMMARY
          echo "- **Changes vs base branch:** ${{ steps.git-compare.outputs.has-differences }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Summary:** ${{ steps.git-compare.outputs.summary }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "### Production Drift" >> $GITHUB_STEP_SUMMARY
          echo "- **Drift detected:** ${{ steps.prod-compare.outputs.has-differences }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Summary:** ${{ steps.prod-compare.outputs.summary }}" >> $GITHUB_STEP_SUMMARY
          
      - name: Require approval for production changes
        if: steps.prod-compare.outputs.has-differences == 'true'
        run: |
          echo "::warning::Production drift detected - manual review required"
          echo "This PR introduces changes that differ from production flags"
```

## Deployment Pipeline Integration

### Pre-deployment Validation

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  pre-deploy-validation:
    runs-on: ubuntu-latest
    outputs:
      deploy-approved: ${{ steps.validation.outputs.approved }}
      
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate against staging
        id: staging-check
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.STAGING_FLAG_URL }}
          auth-token: ${{ secrets.STAGING_TOKEN }}
          strict: true
          
      - name: Validate against production
        id: prod-check
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.PRODUCTION_FLAG_URL }}
          auth-token: ${{ secrets.PRODUCTION_TOKEN }}
          
      - name: Determine deployment approval
        id: validation
        run: |
          if [ "${{ steps.staging-check.outputs.has-differences }}" = "false" ] && 
             [ "${{ steps.prod-check.outputs.has-differences }}" = "false" ]; then
            echo "approved=true" >> $GITHUB_OUTPUT
            echo "✅ Safe to deploy - no flag changes"
          else
            echo "approved=false" >> $GITHUB_OUTPUT
            echo "⚠️ Flag changes detected - review required"
          fi
          
  deploy:
    needs: pre-deploy-validation
    if: needs.pre-deploy-validation.outputs.deploy-approved == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy application
        run: echo "Deploying to production..."
        
  flag-change-review:
    needs: pre-deploy-validation
    if: needs.pre-deploy-validation.outputs.deploy-approved == 'false'
    runs-on: ubuntu-latest
    steps:
      - name: Create review issue
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Flag Changes Detected - Deployment Hold',
              body: `Flag configuration changes detected in commit ${context.sha}.
              
              Manual review required before deployment.
              
              @product-team @devops-team`,
              labels: ['deployment-hold', 'flag-changes']
            });
```

### Post-deployment Verification

```yaml
name: Post-Deployment Verification
on:
  workflow_run:
    workflows: ["Deploy to Production"]
    types: [completed]

jobs:
  verify-deployment:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Wait for deployment propagation
        run: sleep 60
        
      - name: Verify flags are in sync
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.PRODUCTION_FLAG_URL }}
          auth-token: ${{ secrets.PRODUCTION_TOKEN }}
          strict: true
          
      - name: Notify on sync failure
        if: failure()
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚨 Post-deployment flag sync verification failed!"}' \
            ${{ secrets.SLACK_WEBHOOK }}
```

## Multi-Environment Pipeline

```yaml
name: Multi-Environment Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Validate dev environment
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.DEV_FLAG_URL }}
          auth-token: ${{ secrets.DEV_TOKEN }}
          
  validate-staging:
    runs-on: ubuntu-latest
    needs: validate-dev
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate staging environment
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.STAGING_FLAG_URL }}
          auth-token: ${{ secrets.STAGING_TOKEN }}
          
      - name: Deploy to staging
        if: success()
        run: echo "Deploying to staging..."
        
  validate-production:
    runs-on: ubuntu-latest
    needs: validate-staging
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate production environment
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.PRODUCTION_FLAG_URL }}
          auth-token: ${{ secrets.PRODUCTION_TOKEN }}
          strict: true
          
      - name: Deploy to production
        if: success()
        run: echo "Deploying to production..."
```

## Scheduled Drift Detection

```yaml
name: Daily Flag Drift Check
on:
  schedule:
    - cron: '0 9 * * 1-5'  # Weekdays at 9 AM
  workflow_dispatch:

jobs:
  drift-detection:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, production]
        
    steps:
      - uses: actions/checkout@v4
      
      - name: Check ${{ matrix.environment }} drift
        id: drift-check
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets[format('FLAG_URL_{0}', upper(matrix.environment))] }}
          auth-token: ${{ secrets[format('FLAG_TOKEN_{0}', upper(matrix.environment))] }}
          
      - name: Create drift report
        if: steps.drift-check.outputs.has-differences == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            const title = `🚨 Configuration Drift Detected - ${{ matrix.environment }}`;
            const body = `
            Configuration drift detected in ${{ matrix.environment }} environment.
            
            **Summary:** ${{ steps.drift-check.outputs.summary }}
            
            **Action Required:** Review and sync configurations.
            
            **Environment:** ${{ matrix.environment }}
            **Detection Time:** ${new Date().toISOString()}
            
            @devops-team @product-team
            `;
            
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['drift-detection', '${{ matrix.environment }}', 'urgent']
            });
            
      - name: Send Slack notification
        if: steps.drift-check.outputs.has-differences == 'true'
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{
              "text": "🚨 Configuration drift detected in ${{ matrix.environment }}",
              "attachments": [{
                "color": "danger",
                "fields": [{
                  "title": "Environment",
                  "value": "${{ matrix.environment }}",
                  "short": true
                }, {
                  "title": "Summary",
                  "value": "${{ steps.drift-check.outputs.summary }}",
                  "short": false
                }]
              }]
            }' \
            ${{ secrets.SLACK_WEBHOOK }}
```

## Release Management Integration

```yaml
name: Release Flag Validation
on:
  release:
    types: [created]

jobs:
  validate-release-flags:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.release.tag_name }}
          
      - name: Validate flags for release
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.PRODUCTION_FLAG_URL }}
          auth-token: ${{ secrets.PRODUCTION_TOKEN }}
          
      - name: Create release validation report
        run: |
          echo "# Release Flag Validation Report" > release-report.md
          echo "" >> release-report.md
          echo "**Release:** ${{ github.event.release.tag_name }}" >> release-report.md
          echo "**Validation Time:** $(date)" >> release-report.md
          echo "" >> release-report.md
          echo "## Flag Configuration Status" >> release-report.md
          echo "${{ steps.validation.outputs.summary }}" >> release-report.md
          
      - name: Add report to release
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('release-report.md', 'utf8');
            
            github.rest.repos.updateRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              release_id: ${{ github.event.release.id }},
              body: `${{ github.event.release.body }}\n\n${report}`
            });
```

## Branch Protection Integration

```yaml
name: Branch Protection
on:
  pull_request:
    branches: [main, release/*]

jobs:
  flag-validation:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Validate flag changes
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          strict: ${{ github.base_ref == 'main' }}  # Strict for main branch
          
      - name: Check required approvals
        if: github.base_ref == 'main'
        uses: actions/github-script@v6
        with:
          script: |
            const reviews = await github.rest.pulls.listReviews({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            
            const approvals = reviews.data.filter(review => 
              review.state === 'APPROVED' && 
              ['product-team', 'devops-team'].includes(review.user.login)
            );
            
            if (approvals.length < 2) {
              core.setFailed('Flag changes to main branch require approval from product and devops teams');
            }
```

## Next Steps

- **[Security](../security.md)** - Security best practices for CI/CD
- **[Testing](../testing.md)** - Testing your action workflows
- **[Troubleshooting](../troubleshooting.md)** - Common CI/CD integration issues