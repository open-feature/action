# Support & Community

Get help, ask questions, and connect with the OpenFeature community.

## Getting Help

### 1. Documentation First

Before asking for help, check these resources:

- **[Getting Started Guide](getting-started.md)** - Quick setup instructions
- **[Configuration Reference](configuration.md)** - Complete parameter list
- **[Examples](examples/)** - Common use cases and patterns
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

### 2. Search Existing Issues

Check if your question has already been answered:

- **[GitHub Issues](https://github.com/open-feature/openfeature-action/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/open-feature/openfeature-action/discussions)** - Questions and community discussions

### 3. Community Channels

#### OpenFeature Slack

Join the CNCF Slack and participate in these channels:

- **[#openfeature](https://cloud-native.slack.com/archives/C0344AANLA1)** - General OpenFeature discussion
- **[#openfeature-cli](https://cloud-native.slack.com/archives/C07DY4TUDK6)** - CLI-specific questions
- **[#openfeature-github-action](https://cloud-native.slack.com/archives/C0344AANLA1)** - Action-specific discussion

**[Join CNCF Slack →](https://slack.cncf.io/)**

#### Community Meetings

Join our monthly community calls:

- **When**: First Thursday of each month, 4:00 PM UTC
- **Where**: [Zoom Meeting](https://zoom-lfx.platform.linuxfoundation.org/meetings/openfeature)
- **Agenda**: [Community Repository](https://github.com/open-feature/community)

### 4. Professional Support

For enterprise support and consulting:

- **CNCF Service Providers**: [Find certified providers](https://landscape.cncf.io/guide#-cncf-members)
- **OpenFeature Maintainers**: Available for consulting through their organizations

## Reporting Issues

### Bug Reports

When reporting bugs, include:

**Required Information:**

- OpenFeature Action version (e.g., `v1.2.3`)
- OpenFeature CLI version (from logs or configuration)
- Runner environment (`ubuntu-latest`, `self-hosted`, etc.)
- Complete workflow configuration
- Error message and logs
- Expected vs actual behavior

**Bug Report Template:**

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

**Expected Behavior:**
Should successfully compare manifests

**Actual Behavior:**
Action fails with authentication error

**Additional Context:**

- This worked last week
- Token has not expired
- Manual curl works fine

```

### Feature Requests

For new features, include:
- **Use case**: Why do you need this feature?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've tried
- **Impact**: How would this help the community?

### Security Issues

**⚠️ Do NOT create public issues for security vulnerabilities**

Instead:
1. **Email**: [security@openfeature.dev](mailto:security@openfeature.dev)
2. **Include**: Detailed description, reproduction steps, impact assessment
3. **Expect**: Response within 48 hours

## Contributing

### Ways to Contribute

1. **Documentation**
   - Fix typos and improve clarity
   - Add examples and use cases
   - Translate documentation

2. **Code**
   - Fix bugs and improve error handling
   - Add new features
   - Improve performance

3. **Testing**
   - Add test cases
   - Improve test coverage
   - Test edge cases

4. **Community**
   - Answer questions in Slack
   - Help others troubleshoot issues
   - Share your use cases

### Contribution Process

1. **Check existing work**: Look for related issues or PRs
2. **Discuss first**: For significant changes, open an issue to discuss
3. **Fork and branch**: Create a feature branch from main
4. **Implement**: Make your changes with tests
5. **Document**: Update relevant documentation
6. **Test**: Ensure all tests pass
7. **Submit PR**: Create a pull request with clear description

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/openfeature-action.git
cd openfeature-action

# Create a feature branch
git checkout -b feature/my-improvement

# Make your changes
# Test your changes using GitHub Actions or act

# Commit and push
git commit -m "feat: add my improvement"
git push origin feature/my-improvement

# Create a pull request
```

### Code of Conduct

We follow the [OpenFeature Code of Conduct](https://github.com/open-feature/community/blob/main/CODE_OF_CONDUCT.md):

- **Be respectful** and inclusive
- **Be collaborative** and constructive  
- **Be patient** with newcomers
- **Be professional** in all interactions

## Resources

### Learning Materials

**OpenFeature:**

- **[OpenFeature Specification](https://openfeature.dev/specification/)** - Core concepts
- **[OpenFeature Documentation](https://openfeature.dev/docs/)** - Complete guides
- **[Feature Flag Best Practices](https://openfeature.dev/blog/)** - Industry insights

**GitHub Actions:**

- **[GitHub Actions Documentation](https://docs.github.com/en/actions)** - Official docs
- **[Composite Actions Guide](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)** - Action development
- **[Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)** - YAML reference

**Feature Flags:**

- **[Martin Fowler on Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)** - Foundational concepts
- **[Feature Flag Patterns](https://featureflags.io/feature-flag-patterns/)** - Implementation patterns

### Tools and Integrations

**Testing:**

- **[act](https://github.com/nektos/act)** - Run GitHub Actions locally
- **[GitHub CLI](https://cli.github.com/)** - Command-line GitHub integration

**Flag Providers:**

- **[LaunchDarkly](https://launchdarkly.com/)** - Feature flag platform
- **[Split](https://www.split.io/)** - Feature experimentation
- **[Flagsmith](https://flagsmith.com/)** - Open source flags
- **[ConfigCat](https://configcat.com/)** - Feature flag service

### Related Projects

**OpenFeature Ecosystem:**

- **[OpenFeature CLI](https://github.com/open-feature/cli)** - Command-line tool
- **[OpenFeature SDKs](https://openfeature.dev/docs/reference/technologies/)** - Language bindings
- **[OpenFeature Operators](https://github.com/open-feature/open-feature-operator)** - Kubernetes integration

## Stay Connected

### Social Media

- **Twitter**: [@openfeature](https://twitter.com/openfeature)
- **LinkedIn**: [OpenFeature](https://www.linkedin.com/company/openfeature/)
- **YouTube**: [OpenFeature Channel](https://www.youtube.com/c/openfeature)

### Newsletters and Blogs

- **[OpenFeature Blog](https://openfeature.dev/blog/)** - Latest updates and insights
- **[CNCF Newsletter](https://cncf.io/newsletter/)** - Cloud native ecosystem news

### Events and Conferences

- **[KubeCon + CloudNativeCon](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/)** - Annual CNCF conference
- **[OpenFeature Meetups](https://www.meetup.com/pro/openfeature/)** - Local community events
- **[Feature Flag Community Events](https://featureflags.io/events/)** - Industry meetups

## Acknowledgments

### Contributors

Thank you to all our contributors! See the full list on our [Contributors page](https://github.com/open-feature/openfeature-action/graphs/contributors).

Special thanks to:

- **OpenFeature community** for feedback and testing
- **CNCF** for hosting and supporting the project
- **GitHub** for providing the Actions platform
- **All organizations** using and improving this action

### Sponsors

OpenFeature is a Cloud Native Computing Foundation (CNCF) project.

**CNCF Project Status**: Incubating

**Founding Organizations**:

- Dynatrace
- LaunchDarkly
- Microsoft
- Split
- And many others...

### License

This project is licensed under the Apache License 2.0 - see the [LICENSE](../LICENSE) file for details.

## Quick Links

- 🏠 **[Home](../README.md)** - Project overview
- 🚀 **[Getting Started](getting-started.md)** - Quick setup
- 📖 **[Documentation](/)** - Complete guides
- 💬 **[Slack](https://cloud-native.slack.com/archives/C0344AANLA1)** - Community chat
- 🐛 **[Issues](https://github.com/open-feature/openfeature-action/issues)** - Bug reports
- 💡 **[Discussions](https://github.com/open-feature/openfeature-action/discussions)** - Questions
- 🎯 **[Roadmap](https://github.com/orgs/open-feature/projects)** - Future plans

---

**Need immediate help?** Join our [Slack channel](https://cloud-native.slack.com/archives/C0344AANLA1) for real-time support from the community and maintainers.
