AUTH
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

WORKSPACES
POST   /workspaces
GET    /workspaces
GET    /workspaces/:id
PATCH  /workspaces/:id
DELETE /workspaces/:id

PROJECTS
POST   /projects
GET    /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

TASKS
POST   /tasks
GET    /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id

ADVANCED TASK ENDPOINTS
GET /tasks?status=TODO
GET /tasks?priority=HIGH
GET /tasks?search=login
GET /tasks?page=1&limit=10