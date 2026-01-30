# Infrastructure Audit Report

**Date**: January 29, 2026  
**Scope**: Full codebase analysis

---

## Table of Contents

1. [Critical Issues](#critical-issues)
2. [High Priority Issues](#high-priority-issues)
3. [Medium Priority Issues](#medium-priority-issues)
4. [Low Priority / Tech Debt](#low-priority--tech-debt)
5. [Recommended Action Plan](#recommended-action-plan)

---

## Critical Issues 🔴

### 1. Security: Hardcoded API Key

**Location**: `apps/gifster/src/app.tsx:24`

**Issue**: Giphy API key is hardcoded in source code:
```typescript
const gf = new GiphyFetch('GZKGwdu6xlIM0iV58yFKJOFLqj0NLXFw')
```

**Risk**: API key exposed in version control and public repositories

**Fix**:
1. Move to environment variable: `import.meta.env.VITE_GIPHY_API_KEY`
2. Add to `.env.example` (after creating it)
3. Rotate the API key if this has been committed to public repos

---

### 2. Monorepo Structure: Nested Git Repositories

**Issue**: Multiple apps and packages contain nested `.git` folders, breaking monorepo structure

**Affected directories**:
- `apps/ascii-video/.git`
- `apps/steering-text/.git`
- `apps/su-done-ku/.git`
- `apps/fallcrate/.git`
- `apps/gifster/.git`
- `apps/portfolio/.git`
- `apps/shareme/.git`
- `apps/minesweeper/.git`
- `apps/pathfinder-visualizer/.git`
- `packages/dread-ui/.git`

**Impact**:
- Complicates monorepo management
- Makes atomic commits across projects difficult
- Prevents unified version control

**Decision needed**: 
- **Option A**: Fully integrate into monorepo (remove `.git` folders and `.gitmodules`)
- **Option B**: Keep as submodules (but reconsider monorepo approach)

---

### 3. Missing Environment Variable Template

**Issue**: No `.env.example` file exists in the repository

**Impact**:
- New developers don't know what environment variables are required
- No documentation of configuration options
- Increases onboarding time

**Required variables** (identified from codebase):
- `VITE_GIPHY_API_KEY` (gifster)
- `VERCEL_TOKEN` (deployment)
- Firebase configuration variables (fallcrate, shareme, shared-backend)
- API endpoints (various apps)

**Fix**: Create `.env.example` with all required variables and documentation

---

### 4. Broken Vercel Configuration

**Location**: `vercel.json`

**Issue**: References non-existent apps:
- `app1/package.json`
- `app2/package.json`

**Fix**: Update to reference actual app directories from `apps/` folder

---

## High Priority Issues 🟠

### 5. TypeScript Configuration Inconsistencies

**Apps not extending base config**:

| App | Issues |
|-----|--------|
| `apps/ascii-video` | No extends, `moduleResolution: "Node"`, `strict: false` |
| `apps/enlight` | No extends, `moduleResolution: "Node"` |
| `apps/steering-text` | No extends |
| `apps/portfolio/backend` | No extends |
| `apps/su-done-ku/backend` | No extends |

**Impact**:
- Inconsistent type checking across projects
- May miss type errors in some apps
- Harder to maintain consistent standards

**Fix**: 
1. Have all apps extend `@repo/typescript-config/base.json`
2. Standardize on `moduleResolution: "bundler"` for frontend apps
3. Enable `strict: true` across all apps

---

### 6. Dependency Version Chaos

**TypeScript versions**:
- Most packages: `^5.2.2`
- Some packages: `^5.3.3`

**Vite versions**:
- fallcrate: `^3.2.3` ⚠️ **Major version behind**
- ascii-video: `^4.3.9` ⚠️ **Major version behind**
- gifster: `^5.0.0`
- Most others: `^5.1.0` - `^5.2.0`

**ESLint versions**:
- Range: `^8.6.0` (shareme/backend) to `^8.57.0`

**@typescript-eslint plugins**:
- **Major version conflict**: Mix of `6.x` and `7.x` versions

**@types/react**:
- Range: `^18.0.24` (fallcrate - very outdated) to `^18.2.66`

**@types/react-dom**:
- Range: `^18.0.8` (fallcrate - very outdated) to `^18.2.22`

**react-icons**:
- fallcrate: `^4.8.0` ⚠️ **Major version behind**
- gifster: `^4.12.0` ⚠️ **Major version behind**
- Most others: `^5.0.1` - `^5.2.1`

**@vitejs/plugin-react vs @vitejs/plugin-react-swc**:
- fallcrate: `@vitejs/plugin-react: ^2.2.0` (outdated)
- minesweeper/pathfinder: `@vitejs/plugin-react: ^4.2.1`
- Most others: `@vitejs/plugin-react-swc: ^3.5.0`

**uuid**:
- Root: `^9.0.1`
- fallcrate: `^9.0.0`
- pathfinder/minesweeper: `^8.3.2` ⚠️ **Major version behind**

**Impact**:
- Potential breaking changes between versions
- Harder to debug issues
- May miss security patches
- Inconsistent behavior across apps

**Fix**: Standardize all dependency versions across the monorepo

---

### 7. Wrong Dependency Sections

**Production dependencies in devDependencies**:
- `apps/gifster/package.json:23` - `@giphy/js-fetch-api: ^5.2.0`
  - Used in production code (`gif-grid.tsx:3`)
  - Should be in `dependencies`

**Dev dependencies in dependencies**:
- `apps/shareme/backend/package.json:20` - `eslint: ^8.6.0`
  - Should be in `devDependencies`

**Missing dependencies**:
- `apps/shared-backend` - Uses `require('dotenv')` but `dotenv` not listed in dependencies

---

### 8. Incorrect Workspace Reference

**Location**: `apps/su-done-ku/frontend/package.json:14`

**Issue**: Uses `"dread-ui": "*"` instead of `"dread-ui": "workspace:*"`

**Impact**: May not properly link to workspace package

**Fix**:
```json
"dread-ui": "workspace:*"
```

---

### 9. Docker/Nginx Configuration Issues

**Missing nginx service**:
- `docker-compose.yml` doesn't include nginx service
- Only `docker-compose.override.yml` has nginx (local dev only)
- `infra/nginx/nginx.conf:9` references `http://portfolio:3000` but service mapping unclear

**Hardcoded paths**:
- `Dockerfile:29` - `WORKDIR /usr/src/app/apps/portfolio/backend`
- `infra/nginx/nginx.conf:5-6` - SSL certificate paths:
  ```
  ssl_certificate /etc/ssl/cert.pem;
  ssl_certificate_key /etc/ssl/cert-key.pem;
  ```

**docker-compose.yml issues**:
- Only defines `portfolio` service
- No services for other apps
- Missing environment variable validation

**Fix**:
1. Add nginx to main `docker-compose.yml`
2. Make paths configurable
3. Add service health checks
4. Add environment variable validation

---

### 10. Deprecated GitHub Actions

**Location**: `.github/workflows/build-and-deploy.yml`

**Issues**:
- Line 32: Uses deprecated `docker-practice/actions-setup-docker@master`
  - Replace with official `docker/setup-buildx-action`
- Line 67: Hardcoded ECR registry URL: `851725492026.dkr.ecr.us-east-1.amazonaws.com`
  - Should be environment variable
- Line 70: `docker stop $(docker ps -q)` stops **ALL** containers, not just portfolio
  - Should target specific containers

**Missing**:
- No error handling if build fails
- No rollback mechanism if deployment fails

---

## Medium Priority Issues 🟡

### 11. Inconsistent Build Configuration

**Vite plugin inconsistencies**:
- fallcrate: Uses `@vitejs/plugin-react` (not SWC)
- minesweeper: Uses `@vitejs/plugin-react` (not SWC)
- Most others: Use `@vitejs/plugin-react-swc`

**Missing plugins**:
- `apps/ascii-video/vite.config.js` - Only has `@vitejs/plugin-basic-ssl`, no React plugin
- `apps/enlight/vite.config.js` - No plugins at all

**Type casting workarounds**:
- `apps/fallcrate/vite.config.ts:9` - `tsconfigPaths() as any, svgr() as any`
- `apps/su-done-ku/frontend/vite.config.ts:9-11` - Uses `as PluginOption` casting

**Missing base paths**:
- Some apps missing `base` property for deployment paths

---

### 12. Inconsistent Linting/Formatting

**Prettier configs**:
- Only root and `apps/quipster` have `.prettierrc` files
- Other apps rely on root config (may not be applied consistently)

**Missing ESLint configs**:
- `apps/ascii-video`
- `apps/enlight`
- `apps/steering-text`

**Rule disabling instead of fixing**:
- Many files disable rules instead of fixing issues
- Example: `apps/quipster/src/providers/app-provider.tsx` - entire file has `/* eslint-disable @typescript-eslint/no-explicit-any */`

---

### 13. Excessive TypeScript 'any' Usage

**Statistics**: 63+ instances of `any` type found across codebase

**Examples**:
- `apps/quipster/src/providers/app-provider.tsx:10-18` - `any[]` and `any` for words, lists, selectedWord
- `apps/shareme/frontend/src/components/pin-details/pin-details.tsx:12-14` - `any` for pins and pinDetail
- `apps/pathfinder-visualizer/src/utilities/animator.ts:8` - `(...args: any[]) => void`
- `apps/quipster/src/components/list-card.tsx:6` - `list: any`
- `apps/shareme/frontend/src/components/search-bar.tsx:14` - `({ searchTerm, setSearchTerm }: any)`

**Impact**:
- Loses TypeScript's type safety benefits
- Makes refactoring harder
- May hide bugs

---

### 14. Cross-App Imports

**Issue**: `apps/home-page` imports directly from `apps/sketches` using relative paths

**Examples**:
- `apps/home-page/src/providers/intro-provider.tsx`:
  ```typescript
  import { SketchKey } from '../../../sketches/src/sketches'
  ```
- `apps/home-page/src/components/page/page-bg.tsx`:
  ```typescript
  import { sketches } from '../../../../sketches/src/sketches'
  ```

**Impact**:
- Breaks encapsulation
- Creates tight coupling between apps
- Makes apps not independently deployable

**Fix**: 
- Move shared code to packages
- Or properly configure workspace dependencies

---

### 15. Performance Anti-Patterns

**Missing useEffect dependencies**:
- `apps/fallcrate/src/hooks/fileserver/use-files.tsx:17-23` - Missing `db` in dependency array
- Multiple files disable `react-hooks/exhaustive-deps` warnings

**Specific examples**:
- `apps/quipster/src/providers/app-provider.tsx:59-67` - `subscribeToVocabLists` in dependency array may cause re-subscriptions
- `apps/shareme/frontend/src/components/pin-details/pin-details.tsx:36` - Disabled exhaustive-deps
- `apps/pathfinder-visualizer/src/app.tsx:152-153` - Multiple disabled exhaustive-deps warnings
- `apps/minesweeper/src/components/minesweeper/minesweeper.tsx` - Multiple disabled exhaustive-deps (lines 66, 110, 282)
- `apps/quipster/src/providers/app-provider.tsx:79-84` - Effect depends on `selectedWord` which it also sets, potential infinite loop risk

**Missing optimizations**:
- Missing `useCallback`/`useMemo` in performance-critical components
- Potential memory leaks from uncleaned subscriptions

---

### 16. Individual Lockfile in Monorepo

**Location**: `apps/quipster/pnpm-lock.yaml`

**Issue**: Individual apps should not have their own lockfiles in a monorepo

**Fix**: Delete `apps/quipster/pnpm-lock.yaml` and use only root lockfile

---

### 17. Inconsistent Package Naming

**Location**: `apps/shared-backend/package.json`

**Issue**: Named `"fallcrate-backend"` instead of following monorepo naming convention

**Expected**: `"@repo/shared-backend"` or similar

**Impact**: Confusing package references

---

### 18. Inconsistent Environment Variable Loading

**Inconsistent approaches**:
- Most apps: `dotenv -e ../../.env`
- Portfolio backend: `dotenvx run --env-file=../../../.env`
- Some apps: No dotenv in dev scripts

**Apps without dotenv in dev script**:
- `apps/steering-text`
- `apps/ascii-video`
- `apps/enlight`

---

## Low Priority / Tech Debt 🔵

### 19. Commented-Out Code

**Examples**:
- `apps/fallcrate/src/hooks/fileserver/use-files.tsx:25-30` - Commented-out code should be removed
- Multiple files contain dead code that should be cleaned up

---

### 20. Inconsistent File Naming Conventions

**Mixed conventions**:
- Some use kebab-case: `main-content/`, `browser-item/`
- Components use PascalCase: `PinDetails.tsx`, `GridSquare.tsx`
- Utilities use mix of both

**Recommendation**: Standardize on:
- kebab-case for files and folders
- PascalCase for React component files

---

### 21. Missing README Files

**Apps without README.md**:
- `apps/ascii-video/`
- `apps/enlight/`
- `apps/fallcrate/`

**Apps with README** (good examples):
- `apps/pathfinder-visualizer/`
- `apps/resume/`
- `apps/sketches/`
- `apps/quipster/`
- `apps/steering-text/`
- `apps/gifster/`

---

### 22. Version Inconsistencies

**Mixed versions across packages**:
- Most apps: `"version": "0.0.0"`
- Some apps: `"version": "1.0.0"`
  - `apps/portfolio/backend`
  - `apps/shared-backend`
  - `apps/su-done-ku/backend`
  - `apps/shareme/backend`
  - `apps/gifster`
  - `packages/assets`

**Recommendation**: Standardize on one versioning approach

---

### 23. Inconsistent Error Handling

**Different patterns used**:
- Try-catch blocks
- `.catch()` promises
- Silent failures (console.error only)
- Alerts (poor UX)

**Examples**:
- `apps/fallcrate/src/db/use-firestore-db.tsx:111` - Only logs errors
- `apps/ascii-video/src/video-camera.ts:47` - Uses `alert(err)` (poor UX)
- `apps/gifster/src/components/gif-grid.tsx:33` - Uses `.catch()` but no user feedback

**Recommendation**: Create shared error handling utility in `@repo/utils`

---

### 24. Poor Separation of Concerns

**Large components**:
- `apps/pathfinder-visualizer/src/app.tsx` - 558 lines

**Mixed responsibilities**:
- `apps/quipster/src/providers/app-provider.tsx` - Provider handles multiple concerns (words, lists, terms, favorites)

**Uncertainty about architecture**:
- `apps/fallcrate/src/hooks/fileserver/use-files.tsx:7-9` - Comments indicate uncertainty: "does this need to be a context? I don't fully understand each use of contexts yet"

---

### 25. Inconsistent Component Organization

**Different organizational patterns**:
- `apps/fallcrate/src/components/` - Well-organized with feature folders
- `apps/shareme/frontend/src/components/` - Mix of feature folders and flat components
- `apps/pathfinder-visualizer/src/components/` - Flat structure with only 2 components
- `apps/quipster/src/components/` - Mix of feature folders and flat structure

**Index file inconsistency**:
- Some folders have `index.tsx`, others don't

---

### 26. Import Pattern Inconsistencies

**Mixed patterns**:
- Relative imports: `'../../types'`
- Absolute imports with path aliases: `@fallcrate/components/navbar`
- Cross-app imports: `'../../../../sketches/src/sketches'`

**Recommendation**: Standardize on absolute imports via path aliases

---

### 27. Turbo.json Configuration

**Location**: `turbo.json:7`

**Issue**: Outputs only `["dist/**"]` but some apps may output to different directories

**Fix**: Verify all apps output to `dist/` or update configuration

---

### 28. TypeScript Config Base Paths

**Issue**: Base config uses relative paths (`../dread-ui/src/*`) which may break depending on where config is consumed

**Impact**: Path resolution may fail in nested directories

---

### 29. Missing package.json in portfolio

**Issue**: `apps/portfolio` has no root `package.json`

**Current structure**:
- `apps/portfolio/frontend/package.json` ✓
- `apps/portfolio/backend/package.json` ✓
- `apps/portfolio/package.json` ✗

**Impact**: Workspace config expects `apps/*` to have package.json files

---

## Recommended Action Plan

### Immediate (Today)

1. ✅ **Fix hardcoded API key** (security risk)
   - Move to environment variable
   - Rotate key if exposed in public repos
   
2. ✅ **Create .env.example**
   - Document all required environment variables
   
3. ✅ **Fix vercel.json**
   - Update to reference actual apps

### This Week

4. ✅ **Decide on git submodules**
   - Option A: Remove nested `.git` folders and fully integrate
   - Option B: Keep as submodules (but reconsider monorepo approach)
   
5. ✅ **Fix workspace references**
   - Update `apps/su-done-ku/frontend/package.json`
   - Verify all workspace dependencies
   
6. ✅ **Move dependencies to correct sections**
   - gifster: Move `@giphy/js-fetch-api` to dependencies
   - shareme/backend: Move `eslint` to devDependencies
   - shared-backend: Add `dotenv` if needed
   
7. ✅ **Remove individual lockfile**
   - Delete `apps/quipster/pnpm-lock.yaml`

### Next Sprint

8. ✅ **Standardize dependency versions**
   - Create script to audit and update versions
   - Focus on major version mismatches first
   
9. ✅ **Fix TypeScript configurations**
   - Have all apps extend base config
   - Standardize moduleResolution
   - Enable strict mode everywhere
   
10. ✅ **Update Docker/nginx configuration**
    - Add nginx to main docker-compose.yml
    - Make paths configurable
    - Add health checks
    
11. ✅ **Update GitHub Actions**
    - Replace deprecated Docker action
    - Use environment variables for ECR URL
    - Fix container stop command
    - Add error handling

### Ongoing Improvements

12. ✅ **Reduce 'any' usage**
    - Add proper TypeScript types
    - Create types in shared package
    
13. ✅ **Fix useEffect dependencies**
    - Address all disabled exhaustive-deps warnings
    - Add proper cleanup functions
    
14. ✅ **Improve error handling**
    - Create shared error handling utility
    - Standardize error patterns
    
15. ✅ **Standardize linting/formatting**
    - Ensure all apps have ESLint configs
    - Add Prettier to all apps
    
16. ✅ **Fix cross-app imports**
    - Move shared code to packages
    - Remove direct app-to-app imports
    
17. ✅ **Clean up tech debt**
    - Remove commented code
    - Standardize file naming
    - Add missing README files
    - Improve component organization

---

## Monitoring and Maintenance

### Scripts to Create

1. **Dependency audit script**
   - Check for version inconsistencies
   - Check for security vulnerabilities
   - Report outdated dependencies

2. **Workspace validation script**
   - Verify all workspace references
   - Check for nested git repositories
   - Validate package.json files

3. **TypeScript strict mode migration**
   - Gradually enable strict mode in remaining apps
   - Fix type errors systematically

### Regular Tasks

- Monthly dependency updates
- Quarterly architecture review
- Regular linting/type checking
- Performance audits

---

## Notes

- This audit was performed on January 29, 2026
- Some issues may have dependencies on others (fix in order listed)
- Prioritize security and stability fixes first
- Consider setting up pre-commit hooks to prevent regressions

---

## Agent IDs (for reference)

- Dependency audit: `37400c01-ad5b-4ca4-bae8-cad6726bb819`
- Build config audit: `185c29b0-1c5d-43d9-b7e7-b33e3395f025`
- Architecture audit: `cef270bb-960f-4c11-8592-b56cc82542fe`
- Monorepo structure audit: `86b302c0-58f3-44d6-94de-3b34e1b87181`
