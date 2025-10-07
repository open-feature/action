# Troubleshooting

This page covers common issues and their solutions.

## Common Issues

### CLI Installation Failed

**Error:**

```
Error: Failed to install OpenFeature CLI
```

**Solutions:**

1. **Check CLI version exists:**

   ```yaml
   with:
     cli-version: "latest"  # Try latest first
   ```

2. **Verify network connectivity:**
   - Check if GitHub is accessible from your runner
   - Try using GitHub-hosted runners instead of self-hosted

3. **Use specific version:**

   ```yaml
   with:
     cli-version: "v0.3.6"  # Use known working version
   ```

4. **Check Go installation:**
   - GitHub-hosted runners have Go pre-installed
   - For self-hosted runners, ensure Go is available

### Failed to Pull Manifest from Remote Source

**Error:**

```
Error: Failed to pull manifest from https://api.example.com/flags
```

**Solutions:**

1. **Verify URL accessibility:**

   ```bash
   curl -I "https://api.example.com/flags"
   ```

2. **Check authentication:**

   ```yaml
   with:
     auth-token: ${{ secrets.FLAG_TOKEN }}
   ```

3. **Verify token permissions:**
   - Ensure token has read access to the flag source
   - Check if token is expired

4. **Test manually:**

   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" "https://api.example.com/flags"
   ```

5. **Check response format:**
   - Ensure the endpoint returns valid JSON/YAML
   - Verify it matches OpenFeature manifest schema

### Manifest File Not Found

**Error:**

```
Error: Local manifest file 'flags.json' not found
```

**Solutions:**

1. **Check file exists:**

   ```bash
   ls -la flags.json
   ```

2. **Verify file path:**

   ```yaml
   with:
     manifest: "./config/flags.json"  # Relative to repo root
   ```

3. **Check checkout action:**

   ```yaml
   - uses: actions/checkout@v4  # Ensure files are checked out
   ```

### Git Comparison Issues

**Error:**

```
Error: Target branch 'main' not found in local or remote repository
```

**Solutions:**

1. **Set fetch-depth:**

   ```yaml
   - uses: actions/checkout@v4
     with:
       fetch-depth: 0  # Fetch all history
   ```

2. **Check branch exists:**

   ```bash
   git branch -r  # List remote branches
   ```

3. **Specify correct branch:**

   ```yaml
   with:
     base-branch: "develop"  # Use correct branch name
   ```

4. **Verify branch accessibility:**

   ```bash
   git ls-remote origin main  # Check if branch exists on remote
   ```

### Permission Errors

**Error:**

```
Error: Permission denied when accessing flag source
```

**Solutions:**

1. **Use GitHub Secrets:**

   ```yaml
   with:
     auth-token: ${{ secrets.FLAG_TOKEN }}  # Never hardcode tokens
   ```

2. **Check token scope:**
   - Ensure token has necessary permissions
   - Use read-only tokens when possible

3. **Verify token format:**

   ```yaml
   auth-token: "Bearer ${{ secrets.TOKEN }}"     # Some APIs need Bearer prefix
   auth-token: "${{ secrets.TOKEN }}"            # Others use token directly
   ```

### Comparison Results Empty

**Error:**

```
No output from comparison, but files are different
```

**Solutions:**

1. **Check manifest format:**

   ```bash
   jq . flags.json  # Validate JSON
   ```

2. **Verify CLI compatibility:**

   ```yaml
   with:
     cli-version: "v0.3.6"  # Use known compatible version
   ```

3. **Check file encoding:**

   ```bash
   file flags.json  # Ensure UTF-8 encoding
   ```

4. **Validate against schema:**
   - Ensure manifests follow OpenFeature specification
   - Check for required fields

### Action Hangs or Times Out

**Error:**

```
The operation was canceled.
```

**Solutions:**

1. **Check network connectivity:**
   - Verify remote sources are accessible
   - Check for rate limiting

2. **Increase timeout:**

   ```yaml
   - name: Compare manifests
     timeout-minutes: 10
     uses: open-feature/openfeature-action@v1
   ```

3. **Use retry logic:**

   ```yaml
   - name: Compare with retry
     uses: nick-fields/retry@v2
     with:
       timeout_minutes: 5
       max_attempts: 3
       command: |
         # Your comparison logic
   ```

## Debug Mode

Enable debug logging to get more detailed information:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

This will show:

- Detailed CLI output
- Network requests
- File operations
- Function calls

## Advanced Troubleshooting

### Inspect Action Artifacts

```yaml
- name: Debug comparison
  if: failure()
  run: |
    echo "=== Manifest Content ==="
    cat flags.json
    echo "=== Against Manifest ==="
    cat against-flags.json
    echo "=== Comparison Output ==="
    cat comparison-output/raw-output.txt
    
- name: Upload debug artifacts
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: debug-artifacts
    path: |
      flags.json
      against-flags.json
      comparison-output/
```

### Manual CLI Testing

Test the OpenFeature CLI directly:

```yaml
- name: Manual CLI test
  run: |
    # Install CLI manually
    go install github.com/open-feature/cli/cmd/openfeature@latest
    
    # Test pull command
    openfeature pull --flag-source-url "https://api.example.com/flags" --manifest "test.json"
    
    # Test compare command
    openfeature compare --manifest flags.json --against test.json
```

### Network Diagnostics

```yaml
- name: Network diagnostics
  run: |
    echo "=== DNS Resolution ==="
    nslookup api.example.com
    
    echo "=== Connectivity Test ==="
    curl -v https://api.example.com/flags
    
    echo "=== Certificate Check ==="
    openssl s_client -connect api.example.com:443 -servername api.example.com
```

### File System Debugging

```yaml
- name: File system debug
  run: |
    echo "=== Working Directory ==="
    pwd
    ls -la
    
    echo "=== Manifest File Details ==="
    ls -la flags.json
    file flags.json
    head -20 flags.json
    
    echo "=== Permissions ==="
    id
    umask
```

## Environment-Specific Issues

### Self-Hosted Runners

**Common issues:**

- Missing Go installation
- Network restrictions
- File permissions
- Proxy configuration

**Solutions:**

```yaml
- name: Setup environment
  run: |
    # Install Go if missing
    sudo apt-get update
    sudo apt-get install golang-go
    
    # Set proxy if needed
    export HTTPS_PROXY=${{ secrets.HTTPS_PROXY }}
    export HTTP_PROXY=${{ secrets.HTTP_PROXY }}
```

### Corporate Environments

**Common issues:**

- Proxy servers
- Certificate issues
- Network restrictions
- Security policies

**Solutions:**

```yaml
- name: Corporate environment setup
  run: |
    # Configure proxy
    git config --global http.proxy ${{ secrets.HTTP_PROXY }}
    git config --global https.proxy ${{ secrets.HTTPS_PROXY }}
    
    # Trust corporate certificates
    export CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
```

### Windows Runners

**Common issues:**

- Path separators
- Shell compatibility
- Line endings

**Solutions:**

```yaml
- name: Windows-specific setup
  if: runner.os == 'Windows'
  run: |
    # Use proper path separators
    $manifestPath = "flags.json"
    
    # Handle line endings
    git config --global core.autocrlf false
```

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Search existing issues:** [GitHub Issues](https://github.com/open-feature/openfeature-action/issues)
3. **Enable debug mode** and collect logs
4. **Test with minimal configuration**

### Where to Get Help

1. **GitHub Issues:**
   - [Create a new issue](https://github.com/open-feature/openfeature-action/issues/new)
   - Include debug logs and configuration

2. **OpenFeature Slack:**
   - [#openfeature](https://cloud-native.slack.com/archives/C0344AANLA1) - General discussion
   - [#openfeature-cli](https://cloud-native.slack.com/archives/C07DY4TUDK6) - CLI-specific issues

3. **Community Calls:**
   - Monthly [OpenFeature community meetings](https://zoom-lfx.platform.linuxfoundation.org/meetings/openfeature)

### When Reporting Issues

Include the following information:

1. **Action version:** `open-feature/openfeature-action@v1.2.3`
2. **CLI version:** From your configuration or logs
3. **Runner environment:** `ubuntu-latest`, `self-hosted`, etc.
4. **Workflow configuration:** Your `action.yml` usage
5. **Error message:** Full error output
6. **Debug logs:** With `ACTIONS_STEP_DEBUG=true`
7. **Expected behavior:** What you expected to happen
8. **Actual behavior:** What actually happened

### Issue Template

```markdown
## Bug Report

**Action Version:** v1.2.3
**CLI Version:** v0.3.6
**Runner:** ubuntu-latest

**Configuration:**
```yaml
- uses: open-feature/openfeature-action@v1.2.3
  with:
    manifest: flags.json
    against: https://api.example.com/flags
```

**Error Message:**

```
Error: Failed to pull manifest from https://api.example.com/flags
```

**Debug Logs:**
[Attach debug logs with ACTIONS_STEP_DEBUG=true]

**Expected:** Should successfully compare manifests
**Actual:** Action fails with authentication error

```

This helps maintainers understand and reproduce your issue quickly.
