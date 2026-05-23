# S3 & Analytics Bucket Configuration

**⚠️ IMPORTANT**: These are actual credentials. Keep them secret and never commit to Git.  
Store in `.env.local` (which is already gitignored).

## S3 Connection Details

```
Endpoint: https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/s3
Region: us-east-1
```

## Analytics Bucket

**Bucket Name**: `analytics`  
**Type**: Apache Iceberg  
**Access Key ID**: `6fed82842ac56074b2fd924c7fb43849`  
**Warehouse**: `analytics`

**Iceberg Catalog URI**:
```
https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/iceberg
```

## Vector Bucket

**Bucket Name**: `vectors`  
**Type**: pgvector  
**Access Key ID**: `af95e172e18489d1b7e203bbf9c909d9b`

## Service Authentication

**Service Token** (Supabase Auth):
```
SUPABASE_SERVICE_TOKEN_REDACTED
```

## How to Use in Code

### Python - Analytics with PyIceberg

```python
from pyiceberg.catalog.rest import RestCatalog

catalog = RestCatalog(
    name="iceberg",
    properties={
        "uri": "https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/iceberg",
        "s3.access-key-id": "6fed82842ac56074b2fd924c7fb43849",
        "s3.secret-access-key": "cfbd7cdab96025839eba6f334899c560c2ca6fac86034b23e18bee3212452693",
        "s3.endpoint": "https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/s3",
    }
)

table = catalog.load_table("analytics.events")
df = table.scan().to_pandas()
```

### TypeScript - Vectors via SDK

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xfairwgarmpvbogiuduk.supabase.co',
  'your-anon-key'  // or service role key
)

const bucket = supabase.storage.vectors.from('vectors')

// Store embeddings
await bucket.upsert([{
  id: 'message_1',
  vector: [0.1, 0.2, 0.3, ...],  // 1536 dimensions
  metadata: {
    text: 'User message',
    conversation_id: 'conv_123'
  }
}])

// Search
const results = await bucket.search([0.1, 0.2, 0.3, ...], {
  limit: 5
})
```

### Node.js - S3 via AWS SDK

```typescript
import * as AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: '6fed82842ac56074b2fd924c7fb43849',
  secretAccessKey: 'cfbd7cdab96025839eba6f334899c560c2ca6fac86034b23e18bee3212452693',
  endpoint: 'https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/s3',
  s3ForcePathStyle: true,
  region: 'us-east-1'
})

// List buckets
const buckets = await s3.listBuckets().promise()
console.log(buckets)

// Upload to analytics
await s3.putObject({
  Bucket: 'analytics',
  Key: 'events/2026-02-02.json',
  Body: JSON.stringify(events)
}).promise()
```

### SQL - Query Analytics via Postgres FDW

```sql
-- Query analytics data via Postgres (after setup)
SELECT 
  event_type,
  count(*) as total_events,
  avg((data->>'amount')::numeric) as avg_amount
FROM analytics.events
GROUP BY event_type;
```

## Environment Variables (.env.local)

```bash
# Analytics
ANALYTICS_BUCKET_NAME=analytics
ANALYTICS_ACCESS_KEY_ID=6fed82842ac56074b2fd924c7fb43849
ICEBERG_CATALOG_URI=https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/iceberg

# Vectors
VECTORS_BUCKET_NAME=vectors
VECTORS_ACCESS_KEY_ID=af95e172e18489d1b7e203bbf9c909d9b

# S3
S3_ENDPOINT=https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/s3
S3_REGION=us-east-1

# Supabase
SUPABASE_SERVICE_TOKEN=sb_secret_your_token_here
SUPABASE_URL=https://xfairwgarmpvbogiuduk.supabase.co
```

## Security Notes

⚠️ **Never commit these credentials to Git**
- `.env.local` is gitignored ✓
- Use environment variables in production
- Rotate keys periodically
- Use minimal-permission policies where possible
- Monitor access logs for unusual activity

## Next Steps

1. ✅ Buckets created
2. ⏳ Add credentials to `.env.local`
3. ⏳ Test connection in your application
4. ⏳ Implement analytics event logging
5. ⏳ Implement vector embeddings for chat

## References

- [VECTOR_BUCKETS_SETUP.md](VECTOR_BUCKETS_SETUP.md)
- [ANALYTICS_BUCKETS_SETUP.md](ANALYTICS_BUCKETS_SETUP.md)
- [BUCKETS_IMPLEMENTATION_CHECKLIST.md](BUCKETS_IMPLEMENTATION_CHECKLIST.md)
