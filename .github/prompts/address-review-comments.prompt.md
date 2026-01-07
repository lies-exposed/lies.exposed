---
agent: agent
---

# Address PR Review Comments

1. **Fetch PR Information**
   - Use MCP GitHub tools to get PR for current branch
   - Retrieve all review comments with MCP GitHub tools (resolved and unresolved)
   - Filter for unresolved comments only

2. **Analyze Current State**
   - For each unresolved comment, check if already addressed in code
   - Categorize: needs implementation vs already fixed

3. **Plan Implementation**
   - Create action plan for comments requiring work
   - Document expected changes for each comment

4. **Implement Changes**
   - Address each unresolved comment
   - Follow project code quality standards (see .github/instructions/code-quality.instructions.md)
   - Add/update tests as needed

5. **Verification**
   - Run type checking: `pnpm typecheck`
   - Run linting: `pnpm lint`
   - Run tests: `pnpm vitest`
   - Run build: `pnpm build`
   - Fix any errors before proceeding

6. **Documentation**
   - Provide suggested commit message following conventional commits format
   - Format: `<type>(<scope>): <description>` (see .github/instructions/code-quality.instructions.md)

7. **Final Report**
   - List all comments addressed (already fixed vs newly implemented)
   - Show verification results (tests, build, lint)
   - Provide commit message