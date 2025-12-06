# Harbor Feature Reference: Vercel + Supabase

## Vercel Features (Frontend Tab)

### 1. Dashboard Overview
- **Project List**: Grid/list view, filter by repo, sort by activity
- **Quick Info**: Deployed URL, last commit, Real Experience Score
- **Direct Actions**: Favorites, view logs, manage domains, transfer, settings

### 2. Deployments Tab
| Feature | Description | Priority |
|---------|-------------|----------|
| Deployment List | All current/past deployments | HIGH |
| Status Badges | Success, building, error, canceled | HIGH |
| Preview URLs | Each deployment gets unique URL | HIGH |
| Active Branches | PRs get preview deployments | MEDIUM |
| Build Logs | Real-time terminal output | HIGH |
| Redeploy Button | Trigger new deployment | HIGH |
| Rollback | Revert to previous version | MEDIUM |

### 3. Project Settings
| Feature | Description | Priority |
|---------|-------------|----------|
| General | Name, root directory | HIGH |
| Build Settings | Build command, output dir | HIGH |
| Environment Variables | Per-environment (prod/preview/dev) | HIGH |
| Domains | Custom domain management | MEDIUM |
| Git Integration | Connected repo, branch settings | HIGH |
| Functions | Serverless function config | LOW |
| Webhooks | Deploy hooks, notifications | LOW |

### 4. Environment Variables
- **Scopes**: Production, Preview, Development
- **Encrypted**: Stored securely
- **Redeployment**: Changes require redeploy
- **UI**: Add/edit/delete with visibility toggle

---

## Supabase Features (Backend Tab)

### 1. Table Editor
| Feature | Description | Priority |
|---------|-------------|----------|
| Table List | All tables in database | HIGH |
| Spreadsheet View | Editable cells like Excel | HIGH |
| Add Row | Insert new records | HIGH |
| Add Column | Create new fields | HIGH |
| Foreign Keys | Define relationships | MEDIUM |
| Export Data | CSV export | MEDIUM |
| Filter/Sort | Query data visually | HIGH |

### 2. SQL Editor
| Feature | Description | Priority |
|---------|-------------|----------|
| Query Editor | Write raw SQL | HIGH |
| Syntax Highlighting | Color-coded SQL | HIGH |
| Auto-complete | Table/column suggestions | MEDIUM |
| Execution History | Previous queries | MEDIUM |
| Error Detection | Inline error messages | HIGH |
| AI Assistant | Natural language → SQL | LOW |
| Save Queries | Reusable snippets | LOW |

### 3. Database Overview
| Feature | Description | Priority |
|---------|-------------|----------|
| Schema Visualizer | ERD-style diagram | MEDIUM |
| Table Stats | Row count, size | HIGH |
| Connection String | Copy DB URL | HIGH |
| Backups | Download/restore | LOW |

### 4. Auto-Generated API
| Feature | Description | Priority |
|---------|-------------|----------|
| REST Endpoints | CRUD for each table | HIGH |
| API Docs | Swagger-style docs | MEDIUM |
| API Keys | anon/service keys | HIGH |
| Row Level Security | Policy-based access | MEDIUM |

### 5. Authentication
| Feature | Description | Priority |
|---------|-------------|----------|
| Email/Password | Basic auth | MEDIUM |
| OAuth | Google, GitHub, etc. | MEDIUM |
| Magic Links | Passwordless | LOW |
| User Management | List/manage users | MEDIUM |

### 6. Storage
| Feature | Description | Priority |
|---------|-------------|----------|
| Buckets | File containers | LOW |
| File Upload | Drag-drop uploads | LOW |
| Public URLs | CDN links | LOW |

---

## Harbor Implementation Priority

### Phase 1: Core (Must Have)
**Frontend Tab:**
- [ ] Deployment list with status
- [ ] Build logs viewer
- [ ] Environment variables editor
- [ ] Domain/URL display

**Backend Tab:**
- [ ] "No backend" state for static sites
- [ ] Table list (read from Prisma schema)
- [ ] Basic SQL editor
- [ ] Database stats

### Phase 2: Enhanced
- [ ] Redeploy/rollback
- [ ] Spreadsheet-style table editor
- [ ] Query history
- [ ] API documentation

### Phase 3: Advanced
- [ ] Preview deployments per branch
- [ ] Row Level Security
- [ ] Auth management
- [ ] File storage
