# Guide for Contributors

Welcome to the OpenFeature Action project! This guide will help you understand the codebase and contribute effectively.

## Project Architecture

### Core Components

The action is built using the **GitHub Actions composite pattern** with bash scripts:

```
openfeature-action/
├── action.yml              # Main action definition
├── docs/                   # Documentation
├── .github/workflows/      # Test workflows
└── flags.json             # Example flag file
```

### How It Works

1. **CLI Installation**: Downloads and installs the OpenFeature CLI
2. **Manifest Resolution**: Resolves both local and remote manifests
3. **Comparison**: Uses the CLI to compare manifests
4. **Output Generation**: Creates summaries and PR comments

### Key Functions (in action.yml)

```bash
is_url()                    # Detect if input is a URL
get_target_branch()         # Resolve git branch logic
pull_manifest()             # Download remote manifests
fetch_git_manifest()        # Get manifests from git
generate_config_table()     # Create configuration summaries
```

## Development Setup

### Prerequisites

- **GitHub account** with Actions enabled
- **Basic bash knowledge** (the action is primarily bash)
- **Understanding of GitHub Actions** composite actions
- **Familiarity with OpenFeature** manifests helpful

### Local Testing

#### Method 1: Using act

Install [act](https://github.com/nektos/act) to run GitHub Actions locally:

```bash
# Install act
brew install act  # macOS
# or follow instructions for your platform

# Test the basic action
act -j test-action

# Test specific scenarios
act -j test-remote-to-remote
act -j test-git-mode
```

#### Method 2: Fork and Test

1. **Fork the repository**
2. **Make your changes**
3. **Push to a branch**
4. **Create a PR** to trigger the test workflows

### Testing Your Changes

The repository includes comprehensive tests:

```bash
# Test workflows are in .github/workflows/
test.yml                    # Main feature tests
test-git-mode.yml          # Git comparison tests
pr-validation.yml          # Real-world integration test
```

**Key test scenarios:**

- Local vs local comparison
- Local vs remote comparison
- Remote vs remote comparison
- Git branch comparisons
- Error handling
- Different CLI versions

## Code Style Guidelines

### Bash Script Conventions

```bash
# ✅ Good: Use descriptive function names
is_url() {
  [[ "$1" =~ :// ]] || [[ "$1" =~ ^[^/]+:[^/] ]]
}

# ✅ Good: Use proper error handling
if ! pull_manifest "$url" "$path" "$token" "description"; then
  echo "::error::Failed to pull manifest"
  exit 1
fi

# ✅ Good: Use GitHub Actions logging
echo "::notice::Processing manifest at $path"
echo "::warning::Differences detected"
echo "::error::Validation failed"
```

### Documentation Standards

- **Always update docs** when changing functionality
- **Include examples** for new features
- **Test documentation** examples before committing
- **Keep language clear** and beginner-friendly

### Commit Message Format

```
type(scope): description

Examples:
feat(comparison): add remote-to-remote comparison support
fix(git): handle missing target branch gracefully
docs(examples): add multi-environment validation example
test(remote): add authentication failure test case
```

## Making Contributions

### Types of Contributions

1. **Bug Fixes**
   - Fix issues in existing functionality
   - Improve error handling
   - Resolve edge cases

2. **New Features**
   - Add new comparison modes
   - Enhance output formats
   - Improve integration capabilities

3. **Documentation**
   - Add examples and guides
   - Improve existing docs
   - Translate documentation

4. **Testing**
   - Add test cases
   - Improve test coverage
   - Add integration tests

### Feature Development Workflow

1. **Check existing issues** or create a new one
2. **Discuss the approach** in the issue
3. **Fork and create a branch**: `git checkout -b feature/your-feature`
4. **Implement your changes**
5. **Add tests** for your changes
6. **Update documentation**
7. **Test thoroughly** using act or PR workflows
8. **Submit a pull request**

### Pull Request Guidelines

**Before submitting:**

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Examples work as expected
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages follow the format

**PR Description should include:**

- **What**: What does this change do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How was it tested?

### Example PR Template

```markdown
## What
Adds support for comparing two remote manifests directly.

## Why
Users requested the ability to compare staging vs production without 
involving local files.

## How
- Extended manifest resolution logic to handle URLs in both parameters
- Added new authentication parameter for manifest source
- Updated output to show resolved paths

## Testing
- Added test cases in `test.yml`
- Tested with real remote URLs
- Verified authentication works with tokens

## Breaking Changes
None - this is fully backward compatible.
```

## Common Development Tasks

### Adding a New Input Parameter

1. **Update action.yml**:

```yaml
inputs:
  new-parameter:
    description: 'Description of the new parameter'
    required: false
    default: 'default-value'
```

2. **Use in the action**:

```bash
NEW_PARAM="${{ inputs.new-parameter }}"
```

3. **Update documentation**:

```markdown
| `new-parameter` | Description | No | `default-value` |
```

4. **Add tests**:

```yaml
- name: Test new parameter
  uses: ./
  with:
    new-parameter: "test-value"
```

### Adding a New Function

1. **Define in the setup step**:

```bash
new_function() {
  local param1="$1"
  local param2="$2"
  
  # Function logic here
  echo "::notice::Processing $param1"
}
```

2. **Export for later use**:

```bash
declare -f new_function >> /tmp/action_functions.sh
```

3. **Use in later steps**:

```bash
source /tmp/action_functions.sh
new_function "value1" "value2"
```

### Adding Error Handling

```bash
# Set up error handling
set -euo pipefail

# Capture errors with context
if ! some_command; then
  echo "::error::Command failed: some_command"
  echo "::error::Context: $CONTEXT_VAR"
  exit 1
fi

# Graceful degradation
if ! optional_command; then
  echo "::warning::Optional command failed, continuing..."
fi
```

## Testing Guidelines

### Unit Testing

Since this is a composite action, we test through workflow runs:

```yaml
# Test specific functionality
- name: Test URL detection
  run: |
    # Test the is_url function logic
    if [[ "https://example.com" =~ :// ]]; then
      echo "✅ URL detection works"
    else
      echo "❌ URL detection failed"
      exit 1
    fi
```

### Integration Testing

```yaml
# Test end-to-end scenarios
- name: Test remote comparison
  uses: ./
  with:
    manifest: "https://remote1.example.com/flags.json"
    against: "https://remote2.example.com/flags.json"
```

### Error Testing

```yaml
# Test error conditions
- name: Test missing file
  uses: ./
  continue-on-error: true
  id: test-error
  with:
    manifest: "nonexistent.json"
    
- name: Verify error handling
  run: |
    if [ "${{ steps.test-error.outcome }}" != "failure" ]; then
      echo "Expected failure but action succeeded"
      exit 1
    fi
```

## Release Process

### Versioning

We follow semantic versioning:

- **Major** (v2.0.0): Breaking changes
- **Minor** (v1.1.0): New features, backward compatible
- **Patch** (v1.0.1): Bug fixes, backward compatible

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is complete
- [ ] Examples are tested
- [ ] Breaking changes are documented
- [ ] Release notes are prepared

### Creating a Release

1. **Update version** in relevant files
2. **Create a tag**: `git tag v1.1.0`
3. **Push tag**: `git push origin v1.1.0`
4. **Create GitHub release** with changelog
5. **Update major version tag**: `git tag -f v1 && git push -f origin v1`

## Community Guidelines

### Code of Conduct

We follow the [OpenFeature Code of Conduct](https://github.com/open-feature/community/blob/main/CODE_OF_CONDUCT.md):

- **Be respectful** and inclusive
- **Be collaborative** and helpful
- **Be constructive** in feedback
- **Be patient** with newcomers

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **OpenFeature Slack**: For real-time chat
- **Community Calls**: Monthly OpenFeature meetings

### Communication Channels

- **Slack**: [#openfeature](https://cloud-native.slack.com/archives/C0344AANLA1)
- **Twitter**: [@openfeature](https://twitter.com/openfeature)
- **GitHub**: [OpenFeature Organization](https://github.com/open-feature)

## Resources

### Useful Links

- **[OpenFeature Specification](https://openfeature.dev/specification/)**
- **[OpenFeature CLI](https://github.com/open-feature/cli)**
- **[GitHub Actions Documentation](https://docs.github.com/en/actions)**
- **[Composite Actions Guide](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)**

### Learning Resources

- **[GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)**
- **[Bash Best Practices](https://google.github.io/styleguide/shellguide.html)**
- **[OpenFeature Documentation](https://openfeature.dev/docs/)**

## Thank You

Thank you for contributing to OpenFeature Action! Your contributions help make feature flag management safer and more reliable for everyone.

Questions? Reach out in [Slack](https://cloud-native.slack.com/archives/C0344AANLA1) or [open an issue](https://github.com/open-feature/openfeature-action/issues)!
