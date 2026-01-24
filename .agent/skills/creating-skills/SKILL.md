---
name: creating-skills
description: Generates high-quality, predictable, and efficient `.agent/skills/` directories based on user requirements. Use when the user wants to create a new skill or capability.
---

# Antigravity Skill Creator

## When to use this skill

- When the user says "create a skill for X"
- When the user provides instructions and says "turn this into a skill"
- When you need to define a reusable capability for the agent

## Workflow

- [ ] **Analyze Request**: Identify the skill name (gerund), description, and core logic.
- [ ] **Create Structure**:
  - [ ] Create directory: `.agent/skills/[skill-name]/`
  - [ ] Create `SKILL.md`
- [ ] **Draft Content**:
  - [ ] YAML Frontmatter (strict adherence to standards)
  - [ ] Core Logic (concise, progressive disclosure)
  - [ ] Checklists and Validation instructions
- [ ] **Review**: Ensure folder hierarchy and best practices are met.

## Instructions

### 1. Core Structural Requirements

Every skill you generate must follow this folder hierarchy:

- `<skill-name>/`
  - `SKILL.md` (Required: Main logic and instructions)
  - `scripts/` (Optional: Helper scripts)
  - `examples/` (Optional: Reference implementations)
  - `resources/` (Optional: Templates or assets)

### 2. YAML Frontmatter Standards

The `SKILL.md` must start with YAML frontmatter following these strict rules:

- **name**: Gerund form (e.g., `testing-code`, `managing-databases`). Max 64 chars. Lowercase, numbers, and hyphens only. No "claude" or "anthropic".
- **description**: Written in **third person**. Must include specific triggers/keywords. Max 1024 chars. (e.g., "Extracts text from PDFs. Use when the user mentions document processing or PDF files.")

### 3. Writing Principles

When writing the body of `SKILL.md`, adhere to these best practices:

- **Conciseness**: Focus only on the unique logic of the skill.
- **Progressive Disclosure**: Keep `SKILL.md` under 500 lines. Link to secondary files for details.
- **Forward Slashes**: Always use `/` for paths, never `\`.
- **Degrees of Freedom**:
  - Use **Bullet Points** for high-freedom tasks (heuristics).
  - Use **Code Blocks** for medium-freedom (templates).
  - Use **Specific Bash Commands** for low-freedom (fragile operations).

### 4. Workflow & Feedback Loops

For complex tasks, include:

1.  **Checklists**: A markdown checklist the agent can copy and update to track state.
2.  **Validation Loops**: A "Plan-Validate-Execute" pattern.
3.  **Error Handling**: Instructions for scripts should be "black boxes".

### 5. Output Template

When asked to create a skill, output the result in this format:

### [Folder Name]

**Path:** `.agent/skills/[skill-name]/`

### [SKILL.md]

```markdown
---
name: [gerund-name]
description: [3rd-person description]
---

# [Skill Title]

...
```
