# Testing

This page covers testing strategies, test structure, and validation approaches for the OpenFeature Action.

## Test Structure

The OpenFeature Action includes comprehensive testing through GitHub Actions workflows:

```
.github/workflows/
├── test.yml              # Main feature tests
├── test-git-mode.yml     # Git comparison tests  
├── pr-validation.yml     # Real-world integration test
└── reusable-test.yml     # Shared test utilities
```

### Main Test Scenarios

**test.yml** covers core functionality:

- Local vs local manifest comparison
- Local vs remote manifest comparison
- Remote vs remote manifest comparison
- Different CLI versions
- Error handling scenarios

**test-git-mode.yml** covers git operations:

- Branch comparisons (main vs feature)
- Git fetch and checkout operations
- Missing branch handling
- Repository access patterns

**pr-validation.yml** provides real-world testing:

- Actual pull request integration
- PR comment generation
- Live flag provider interaction
- End-to-end workflow validation

## Testing Your Integration

### Unit Testing Approach

Since this is a composite action, test through workflow execution:

```yaml
name: Test My Integration
on: [push, pull_request]

jobs:
  test-basic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Test basic comparison
        uses: open-feature/openfeature-action@v1
        with:
          manifest: test-flags.json
```

### Testing Different Scenarios

#### 1. Local File Comparison

```yaml
- name: Test local comparison
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    against: test-flags.json
```

#### 2. Remote Source Testing

```yaml
- name: Test remote comparison
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    against: "https://api.example.com/flags"
    auth-token: ${{ secrets.TEST_TOKEN }}
```

#### 3. Git Branch Comparison

```yaml
- name: Test git comparison
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    
- name: Compare against main
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    base-branch: main
```

#### 4. Error Condition Testing

```yaml
- name: Test missing file (should fail)
  uses: open-feature/openfeature-action@v1
  continue-on-error: true
  id: test-error
  with:
    manifest: nonexistent.json
    
- name: Verify error handling
  run: |
    if [ "${{ steps.test-error.outcome }}" != "failure" ]; then
      echo "Expected failure but action succeeded"
      exit 1
    fi
```

### Test Data Management

#### Sample Test Manifests

**Basic test manifest** (`test-flags.json`):

```json
{
  "flags": {
    "test-flag": {
      "state": "ENABLED",
      "variants": {
        "on": true,
        "off": false
      },
      "defaultVariant": "off"
    }
  }
}
```

**Modified test manifest** (`test-flags-modified.json`):

```json
{
  "flags": {
    "test-flag": {
      "state": "ENABLED",
      "variants": {
        "on": true,
        "off": false
      },
      "defaultVariant": "on"
    }
  }
}
```

#### Test Environment Setup

```yaml
- name: Setup test environment
  run: |
    # Create test manifests
    cat << 'EOF' > original-flags.json
    {
      "flags": {
        "feature-a": {
          "state": "ENABLED",
          "variants": {"on": true, "off": false},
          "defaultVariant": "off"
        }
      }
    }
    EOF
    
    cat << 'EOF' > modified-flags.json
    {
      "flags": {
        "feature-a": {
          "state": "ENABLED", 
          "variants": {"on": true, "off": false},
          "defaultVariant": "on"
        },
        "feature-b": {
          "state": "ENABLED",
          "variants": {"v1": "old", "v2": "new"},
          "defaultVariant": "v1"
        }
      }
    }
    EOF
```

## Test Automation Patterns

### Continuous Integration Testing

```yaml
name: CI Tests
on: [push, pull_request]

jobs:
  test-matrix:
    strategy:
      matrix:
        cli-version: ["latest", "v0.3.6", "v0.3.5"]
        runner: [ubuntu-latest, macos-latest]
        
    runs-on: ${{ matrix.runner }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Test CLI version ${{ matrix.cli-version }}
        uses: open-feature/openfeature-action@v1
        with:
          cli-version: ${{ matrix.cli-version }}
          manifest: flags.json
```

### Integration Testing

```yaml
name: Integration Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  integration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Test production integration
        uses: open-feature/openfeature-action@v1
        with:
          manifest: flags.json
          against: ${{ secrets.PROD_FLAG_URL }}
          auth-token: ${{ secrets.PROD_READ_TOKEN }}
          
      - name: Verify results
        run: |
          echo "Integration test completed"
          echo "Status: ${{ job.status }}"
```

### Performance Testing

```yaml
- name: Performance test
  run: |
    start_time=$(date +%s)
    
    # Run the action
    time open-feature/openfeature-action@v1 \
      --manifest large-flags.json \
      --against production-flags.json
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    echo "Test completed in ${duration} seconds"
    
    # Fail if too slow
    if [ $duration -gt 60 ]; then
      echo "Test took too long: ${duration}s"
      exit 1
    fi
```

## Testing Best Practices

### 1. Test Isolation

```yaml
# Each test should be independent
- name: Test A
  uses: open-feature/openfeature-action@v1
  with:
    manifest: test-a.json
    
- name: Test B
  uses: open-feature/openfeature-action@v1
  with:
    manifest: test-b.json
```

### 2. Clear Test Naming

```yaml
- name: "Should detect flag state change from OFF to ON"
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flag-state-on.json
    against: flag-state-off.json
```

### 3. Comprehensive Coverage

```yaml
# Test all input combinations
strategy:
  matrix:
    manifest: [local-file, remote-url]
    against: [local-file, remote-url, git-branch]
    strict: [true, false]
```

### 4. Error Testing

```yaml
# Test error conditions
- name: "Should fail with invalid manifest"
  uses: open-feature/openfeature-action@v1
  continue-on-error: true
  id: invalid-test
  with:
    manifest: invalid.json
    
- name: "Verify failure"
  run: |
    if [ "${{ steps.invalid-test.outcome }}" != "failure" ]; then
      exit 1
    fi
```

## Mock Testing

### Mock Flag Provider

```yaml
- name: Setup mock server
  run: |
    # Start mock flag provider
    python3 -m http.server 8080 --directory test-data &
    echo "Mock server PID: $!" > mock.pid
    sleep 2
    
- name: Test against mock
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    against: "http://localhost:8080/mock-flags.json"
    
- name: Cleanup mock server
  if: always()
  run: |
    if [ -f mock.pid ]; then
      kill $(cat mock.pid) || true
    fi
```

### Stubbed Responses

```yaml
- name: Test with stubbed responses
  env:
    FLAG_SOURCE_RESPONSE: |
      {
        "flags": {
          "stubbed-flag": {
            "state": "ENABLED",
            "variants": {"on": true, "off": false},
            "defaultVariant": "on"
          }
        }
      }
  run: |
    echo "$FLAG_SOURCE_RESPONSE" > stubbed-flags.json
    
- name: Compare against stub
  uses: open-feature/openfeature-action@v1
  with:
    manifest: flags.json
    against: stubbed-flags.json
```

## Debugging Tests

### Enable Debug Output

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  
steps:
  - name: Debug test
    uses: open-feature/openfeature-action@v1
    with:
      manifest: flags.json
```

### Capture Test Artifacts

```yaml
- name: Run test
  uses: open-feature/openfeature-action@v1
  id: test
  with:
    manifest: flags.json
    
- name: Upload test artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-artifacts
    path: |
      flags.json
      against-flags.json
      comparison-output.json
      ${{ steps.test.outputs.summary }}
```

### Test Logs Analysis

```yaml
- name: Analyze test logs
  if: failure()
  run: |
    echo "=== Test Failure Analysis ==="
    echo "Action outcome: ${{ steps.test.outcome }}"
    echo "Outputs:"
    echo "  has-differences: ${{ steps.test.outputs.has-differences }}"
    echo "  summary: ${{ steps.test.outputs.summary }}"
    
    echo "=== File Contents ==="
    echo "Manifest:"
    cat flags.json
    echo "Against:"
    cat against-flags.json
```

## Validation Testing

### Schema Validation

```yaml
- name: Validate manifest schema
  run: |
    # Install schema validator
    npm install -g ajv-cli
    
    # Validate against OpenFeature schema
    ajv validate -s openfeature-schema.json -d flags.json
```

### Content Validation

```yaml
- name: Validate flag content
  run: |
    # Check for required fields
    jq -e '.flags | keys | length > 0' flags.json
    
    # Validate flag structure
    jq -e '.flags[] | has("state") and has("variants") and has("defaultVariant")' flags.json
```

## Regression Testing

### Baseline Comparison

```yaml
- name: Regression test
  run: |
    # Compare current output with baseline
    diff baseline-output.json current-output.json || {
      echo "Regression detected!"
      echo "Differences:"
      diff baseline-output.json current-output.json
      exit 1
    }
```

### Version Compatibility

```yaml
strategy:
  matrix:
    action-version: [v1.0.0, v1.1.0, v1.2.0]
    
steps:
  - name: Test version ${{ matrix.action-version }}
    uses: open-feature/openfeature-action@${{ matrix.action-version }}
    with:
      manifest: flags.json
```

## Continuous Testing

### Automated Test Runs

```yaml
name: Continuous Testing
on:
  schedule:
    - cron: '0 */2 * * *'  # Every 2 hours
    
jobs:
  continuous-test:
    runs-on: ubuntu-latest
    steps:
      - name: Run comprehensive tests
        uses: ./.github/workflows/test.yml
```

### Test Result Tracking

```yaml
- name: Track test results
  if: always()
  run: |
    # Send test metrics to monitoring system
    curl -X POST "$METRICS_ENDPOINT" \
      -d "test_result{job=\"${{ github.job }}\",status=\"${{ job.status }}\"} 1"
```

## Next Steps

- **[Examples](examples/)** - See practical testing examples
- **[Troubleshooting](troubleshooting.md)** - Debug test failures  
- **[Configuration](configuration.md)** - Testing configuration options
- **[Security](security.md)** - Security testing practices
