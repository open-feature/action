# Test Fixtures

This directory contains test fixtures, for instance those used for validating the generated client validation feature.

## Files

### `generated/`

Contains sample generated client files that correspond to the root `flags.json` manifest.

- **`openfeature.tsx`**: Sample React hooks generated from `flags.json`
- **`openfeature.go`**: Sample Go client generated from `flags.json`

These files are used in tests to simulate a scenario where:

1. A developer has already generated and committed client code
2. The manifest (`flags.json`) is modified
3. The validation should detect that generated files are out of sync

### `test-manifest-modified.json`

A modified version of the root `flags.json` with an additional flag (`newlyAddedFlag`).

**Purpose**: Used to test out-of-sync detection by:

1. Using pre-generated files from `generated/` directory
2. Switching to this modified manifest
3. Running validation to verify it detects the missing generated code for `newlyAddedFlag`

## Usage in Tests

### Example: Out-of-Sync Detection Test

```yaml
# Copy pre-generated files
- name: Setup old generated files
  run: |
    mkdir -p generated
    cp test-fixtures/generated/openfeature.tsx generated/

# Use modified manifest
- name: Use modified manifest
  run: cp test-fixtures/test-manifest-modified.json flags.json

# Run validation - should detect changes
- name: Validate
  uses: ./
  with:
    manifest: "flags.json"
    validate-generators: '["react"]'
    validate-generators-output-dir: "generated"
```

The validation will detect that the generated `openfeature.tsx` doesn't include the `newlyAddedFlag`, indicating the developer forgot to regenerate after modifying the manifest.
