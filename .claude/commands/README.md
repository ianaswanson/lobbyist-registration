# Claude Code Custom Commands

This directory contains custom slash commands you can invoke in Claude Code sessions.

## Available Commands

### `/reset-demo`
**Purpose**: Reset database to comprehensive demo data with 3+ examples of each record type

**When to use**:
- Before testing admin approval workflows
- Before stakeholder demos
- After making test data changes you want to undo
- Anytime you need pristine, polished demo data

**What it does**:
1. Adds `db:reset` npm script if needed
2. Enhances seed data to ensure 3+ examples of all major record types
3. Runs database reset and reseed
4. Verifies comprehensive coverage

**Example**:
```
User: /reset-demo
Claude: [Executes the reset workflow]
```

---

## How to Add New Commands

Create a new `.md` file in this directory:

```markdown
# Command Name

Brief description

## Your Task

Instructions for Claude on what to do when this command is invoked.

## Success Criteria

What defines successful completion.
```

Then you can invoke it with `/command-name` in any Claude Code session.
