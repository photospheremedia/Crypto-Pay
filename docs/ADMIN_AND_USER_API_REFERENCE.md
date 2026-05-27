## Admin & User API reference (portal)

This is the living index of backend endpoints used by the portal UI and admin tooling.

### User-scoped endpoints

#### Get current user

- **Method**: `GET`
- **Path**: `/api/user`
- **Auth**: returns `null` when logged out
- **Response**: user JSON or `null`

Used by the portal to determine signed-in state.

#### Chat (streaming)

- **Method**: `POST`
- **Path**: `/api/chat`
- **Runtime**: `edge`
- **Auth**: optional (guest supported), but rate-limited
- **Notes**:
  - Uses rate limiting before invoking provider keys
  - Requires `GROQ_API_KEY` or `OPENAI_API_KEY` for real responses

### Admin endpoints

Admin endpoints live under `/api/admin/*` and must use `checkAdminAccess()` to enforce:

- **401** if no session
- **403** if not platform staff / missing permission

#### Admin: merchants directory

- **Method**: `GET`
- **Path**: `/api/admin/users`
- **Auth**:
  - `canViewMerchants` required
- **Response**:
  - `{ success: true, users: [...], summary: {...}, pagination: {...} }`

#### Admin: staff management

- **Methods**: `GET|POST|PATCH|DELETE`
- **Path**: `/api/admin/staff`
- **Auth**:
  - `canManageStaff` required
- **Notes**:
  - Enforces role hierarchy checks (`canManageRole`)

#### Admin: customers

- **Methods**: `GET|POST`
- **Path**: `/api/admin/customers`
- **Auth**:
  - admin required
- **Notes**:
  - Combines `user_profiles` + chat leads + orders-derived data

#### Admin: audit logs

- **Methods**: `GET|POST`
- **Path**: `/api/admin/audit`
- **Auth**:
  - super-admin required for `GET`

### Internal automation endpoints

These routes are not meant for browser clients and must require `x-internal-key`.

#### BTC watcher (list / upsert / delete)

- **Methods**: `GET|POST|DELETE`
- **Path**: `/api/internal/btc/watcher`
- **Auth**:
  - `INTERNAL_API_KEY` must be set
  - Request header: `x-internal-key: <INTERNAL_API_KEY>`
- **Provider configuration**:
  - `BTC_PROVIDER_API_KEY`
  - `BTC_PROVIDER_BASE_URL`
  - `BCH_PROVIDER_BASE_URL` (only when using `network=bch`)

**GET** list monitored addresses:

- `/api/internal/btc/watcher?network=btc`

**POST** upsert:

- Body: `{ "network": "btc", "addr": "<address>", "tag": "optional" }`

**DELETE** delete:

- Body: `{ "network": "btc", "addr": "<address>" }`

