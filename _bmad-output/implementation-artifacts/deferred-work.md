# Deferred Work

## Deferred from: code review of 1-1-initialize-local-workspace-ui-foundation.md (2026-06-16)
- **Clean up redundant and unused dependencies in package.json**: `package.json` contains redundant and unused packages (e.g. `@base-ui/react`, `@fontsource-variable/geist`, `tw-animate-css`, `shadcn` as runtime instead of devDependency).
- **Use serializable state records instead of raw File objects**: The Zustand store currently stores browser `File` objects directly in state. If persistence middleware is added in the future, it will fail to serialize properly.
