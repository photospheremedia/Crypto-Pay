import { createClient } from "@supabase/supabase-js";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(projectUrl, serviceKey);
const bucket = supabase.storage.vectors.from("vectors");

const { data: response, error } = await bucket.listIndexes();
if (error) {
  console.error("❌ Error:", error);
  process.exit(1);
} else {
  console.log("✅ Vectors bucket indexes:\n");
  
  const indexes = Array.isArray(response) ? response : response?.indexes || [];
  
  if (indexes.length === 0) {
    console.log("No indexes found.");
  } else {
    indexes.forEach((index) => {
      console.log(`📍 Index Name: ${index.indexName || index.name}`);
      console.log(`   Vector Bucket: ${index.vectorBucketName || index.bucket}`);
      if (index.dimension) console.log(`   Dimension: ${index.dimension}`);
      if (index.distanceMetric) console.log(`   Distance Metric: ${index.distanceMetric}`);
      if (index.dataType) console.log(`   Data Type: ${index.dataType}`);
      if (index.creationTime) console.log(`   Created (timestamp): ${index.creationTime}`);
      console.log();
    });
  }
}
