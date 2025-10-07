# Guide for Beginners

New to feature flags? This guide will help you understand what they are and how this action can help you manage them safely.

## What are Feature Flags?

Feature flags (also called feature toggles) allow you to control which features are enabled in your application **without deploying new code**. Think of them as switches you can flip to turn features on or off.

### Why Use Feature Flags?

- **Safe Deployments**: Release code without immediately exposing new features
- **A/B Testing**: Show different features to different users
- **Gradual Rollouts**: Enable features for a small percentage of users first
- **Emergency Switches**: Quickly disable problematic features
- **Environment Control**: Different settings for development, staging, and production

### Simple Example

Imagine you're building a new shopping cart design. Instead of:

```javascript
// Old way - risky!
function renderShoppingCart() {
  return <NewShoppingCart />; // Everyone gets the new design
}
```

You use a feature flag:

```javascript
// New way - safe!
function renderShoppingCart() {
  if (isFeatureEnabled('new-shopping-cart')) {
    return <NewShoppingCart />;
  }
  return <OldShoppingCart />; // Fallback to proven design
}
```

Now you can:

- Test the new cart with your team first
- Roll it out to 10% of users
- Instantly revert if something breaks

## What This Action Does

The OpenFeature Action helps you **track and review changes** to your feature flag configuration, just like you review code changes.

### The Problem It Solves

Without this action:

- Someone accidentally changes a flag from "off" to "on"
- The change goes unnoticed
- A half-finished feature suddenly appears to all users
- 😱 **Customer complaints roll in**

With this action:

- Flag changes appear in pull requests
- Team members can review and discuss changes
- You catch mistakes before they reach users
- ✅ **Confident deployments**

### What You'll See

When someone changes a flag, the action shows:

```diff
- "defaultValue": false,  // Feature was off
+ "defaultValue": true,   // Feature is now on
```

And posts a helpful comment:

> 🚨 **Flag Changes Detected**
>
> **Modified Flags:**
>
> - `new-shopping-cart` - default changed from `false` to `true`
>
> This will enable the new shopping cart for all users.

## Getting Started (Step by Step)

### Step 1: Create Your First Flag File

Create a file called `flags.json` in your repository:

```json
{
  "flags": {
    "welcome-message": {
      "state": "ENABLED",
      "variants": {
        "on": "Welcome to our new site!",
        "off": "Welcome!"
      },
      "defaultVariant": "off",
      "targeting": {}
    }
  }
}
```

### Step 2: Add the Action to Your Workflow

Create `.github/workflows/flag-validation.yml`:

```yaml
name: Validate Flag Changes
on: pull_request

jobs:
  check-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Check flag changes
        uses: open-feature/openfeature-action@v1
        with:
          manifest: "flags.json"
```

### Step 3: Make Your First Change

1. Create a new branch: `git checkout -b update-welcome-message`
2. Edit your `flags.json`:

   ```json
   {
     "flags": {
       "welcome-message": {
         "state": "ENABLED",
         "variants": {
           "on": "Welcome to our new site!",
           "off": "Welcome!"
         },
         "defaultVariant": "on",  // Changed from "off" to "on"
         "targeting": {}
       }
     }
   }
   ```

3. Commit and push:

   ```bash
   git add flags.json
   git commit -m "Enable welcome message"
   git push origin update-welcome-message
   ```

4. Create a pull request

### Step 4: Review the Results

You'll see:

- ✅ A green check if the action runs successfully
- 💬 A comment showing exactly what changed
- 📊 A summary of the flag modifications

## Common Scenarios

### Scenario 1: Adding a New Feature

You're adding a new feature called "dark mode":

```json
{
  "flags": {
    "dark-mode": {
      "state": "ENABLED",
      "variants": {
        "enabled": true,
        "disabled": false
      },
      "defaultVariant": "disabled",
      "targeting": {}
    }
  }
}
```

**What the action shows:**
> ✅ **New Flag Added**
>
> - `dark-mode` (boolean) - defaults to `disabled`

### Scenario 2: Enabling a Feature

You're ready to turn on dark mode:

```diff
- "defaultVariant": "disabled",
+ "defaultVariant": "enabled",
```

**What the action shows:**
> ⚠️ **Flag Modified**
>
> - `dark-mode` - default changed from `disabled` to `enabled`
>
> This will enable dark mode for all users.

### Scenario 3: Removing an Old Feature

You're cleaning up an old flag:

```diff
- "old-banner": {
-   "state": "ENABLED",
-   "variants": { ... },
-   "defaultVariant": "off",
-   "targeting": {}
- },
```

**What the action shows:**
> 🔴 **Flag Removed**
>
> - `old-banner` (boolean)

## Best Practices for Beginners

### 1. Start Simple

Begin with boolean flags (on/off). You can get fancy later.

```json
{
  "flags": {
    "new-feature": {
      "state": "ENABLED",
      "variants": {
        "on": true,
        "off": false
      },
      "defaultVariant": "off",
      "targeting": {}
    }
  }
}
```

### 2. Use Descriptive Names

❌ Bad: `flag1`, `test`, `new`
✅ Good: `shopping-cart-v2`, `dark-mode`, `welcome-banner`

### 3. Always Default to "Off"

For new features, start with `"defaultVariant": "off"` so nothing breaks accidentally.

### 4. Document Your Changes

In your pull request, explain:

- What the flag controls
- Why you're changing it
- Who it affects

### 5. Test Before Merging

Make sure your application handles both `true` and `false` values correctly.

## What to Do When Things Go Wrong

### "Action Failed"

Check the action logs. Common issues:

- Typo in your JSON file
- Missing fetch-depth in checkout

### "No Changes Detected"

Make sure you:

- Actually changed the `flags.json` file
- Committed your changes
- Are comparing against the right branch

### "Syntax Error"

Your JSON might be invalid. Use a JSON validator or:

```bash
cat flags.json | jq .
```

## Next Steps

Once you're comfortable with the basics:

1. **[Remote Comparison](../examples/remote-comparison.md)** - Compare against your production flags
2. **[Advanced Scenarios](../examples/advanced-scenarios.md)** - Multi-environment setups
3. **[Configuration](../configuration.md)** - All available options

## Questions?

- **Chat with us**: [OpenFeature Slack](https://cloud-native.slack.com/archives/C0344AANLA1)
- **Read more**: [OpenFeature Documentation](https://openfeature.dev/)
- **Report issues**: [GitHub Issues](https://github.com/open-feature/openfeature-action/issues)

Remember: Feature flags are powerful, but with power comes responsibility. This action helps you wield that power safely! 🚀
