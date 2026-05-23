# GitHub Copilot Guide - Restaurant Hub Solution

Quick reference for using Copilot effectively in this project.

## Quick Start

### Enable Copilot (First Time)
1. In VS Code, enable the setting:
   ```json
   { "github.copilot.chat.codeGeneration.useInstructionFiles": true }
   ```
   ✅ Already configured in `.vscode/settings.json`

2. Open Copilot Chat: `⌃⌘I` (macOS) or `Ctrl+Alt+I` (Windows/Linux)

## Three Ways to Use Copilot

### 1. **Inline Chat** (Fastest for quick fixes)
**Keyboard:** `⌘I` (macOS) or `Ctrl+I` (Windows/Linux)

Perfect for:
- Fixing selected code
- Explaining a function
- Refactoring a block

**Example:**
```typescript
// Select this function, press ⌘I
function calculateOrderTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price * items[i].quantity;
  }
  return total;
}

// Type in inline chat: /fix
// Copilot improves the code
```

### 2. **Chat View** (For complex tasks)
**Keyboard:** `⌃⌘I` (macOS) or `Ctrl+Alt+I` (Windows/Linux)

Use for:
- Multi-step implementation
- Architecture decisions
- Debugging issues

**Example prompt:**
```
I need to add multi-tenant validation to the orders API route.
Review #file:apps/portal/app/api/orders/route.ts
and suggest RLS policy changes needed.
```

### 3. **Context Mentions** (Power user mode)
Start with `#` in chat to add smart context.

| Mention | Use For |
|---------|---------|
| `#codebase` | Search entire project for patterns |
| `#selection` | Include highlighted code |
| `#changes` | Uncommitted git changes |
| `#problems` | Lint/type errors |
| `#usages` | Find all references |
| `#file:path/to/file.ts` | Reference specific file |

**Example:**
```
How is tenant isolation enforced in #codebase?
Show me examples of RLS policies.
```

## Useful Chat Commands

| Command | Use Case |
|---------|----------|
| `/fix` | Fix errors or improve code |
| `/explain` | Understand how code works |
| `/tests` | Generate tests |
| `/docs` | Add documentation comments |
| `/setupTests` | Configure testing framework |

## Project-Specific Patterns

### Finding Multi-Tenant Patterns
```
Show me how RLS policies are used in #codebase
```

### Understanding Database Queries
```
#file:apps/portal/app/api/orders/route.ts
How is tenant_id enforced in this file?
```

### Checking Implementation Examples
```
Where is #usages:buildSystemPrompt used?
Show the pattern.
```

### Reviewing Before Implementation
```
Before I implement this feature, search #codebase
for similar patterns and show me 2-3 examples.
```

## Best Practices

✅ **DO:**
- Use `#codebase` before implementing to find existing patterns
- Use `/explain` to understand unfamiliar code
- Use `#selection` with `/fix` for quick improvements
- Reference this file: `/docs/SETUP.md`, `/docs/DATABASE.md`
- Ask Copilot to "find similar patterns" before implementing

❌ **DON'T:**
- Ask Copilot to create documentation files (implement code only)
- Ignore the `.github/copilot-instructions.md` guidelines
- Use Copilot for research without fact-checking official docs
- Generate multiple design documents before coding

## Agent Mode (Advanced)

Enable automatic multi-step task execution:

```json
{
  "chat.agent.enabled": true,
  "chat.agent.maxRequests": 15
}
```

✅ Already configured in `.vscode/settings.json`

**Use cases:**
- Generate API route + tests + database migration
- Refactor across multiple files
- Add feature with all dependencies

**Example:**
```
Using agent mode, add a new "featured_items" feature to the menu system.
Include: database schema, API route, TypeScript types, and unit tests.
Reference patterns in #codebase.
```

## Troubleshooting

### Copilot isn't using my instructions
- Verify `github.copilot.chat.codeGeneration.useInstructionFiles` is `true`
- Restart VS Code
- Check `.github/copilot-instructions.md` exists

### Chat context seems limited
- Use `#codebase` explicitly for broader search
- Start with `#file:` to focus on specific files
- Use `#usages` to find implementation examples

### Generated code doesn't follow project patterns
- Show Copilot examples first: "Review these examples: #file:path1 #file:path2"
- Be explicit: "Following the pattern in #codebase, implement..."
- Reference guidelines: "Use Radix UI + Tailwind as shown in #codebase"

## Quick Command Reference

```bash
# Keyboard Shortcuts
⌘I / Ctrl+I           - Inline chat (select code first)
⌃⌘I / Ctrl+Alt+I     - Open Chat view
⌘. / Ctrl+.           - Toggle chat modes

# Chat Commands
/fix                  - Fix selected code
/explain              - Explain code
/tests                - Generate tests
/docs                 - Add comments
/setupTests           - Configure testing

# Context Mentions
#codebase             - Search project
#selection            - Highlighted code
#changes              - Git changes
#problems             - Errors/warnings
#usages               - Find references
#file:path/to/file.ts - Specific file
```

## Learn More

- **Project Instructions:** See `.github/copilot-instructions.md`
- **Setup Guide:** See `docs/SETUP.md`
- **Database Schema:** See `docs/DATABASE.md`
- **Official Copilot Docs:** https://github.com/features/copilot
