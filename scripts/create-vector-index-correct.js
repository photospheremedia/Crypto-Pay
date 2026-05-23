#!/usr/bin/env node

/**
 * Create vector index in Supabase Vector Bucket
 * Official documentation: https://supabase.com/docs/guides/storage/vector/working-with-indexes
 * 
 * IMPORTANT: Use supabase.storage.vectors.from('bucket-name')
 * where 'bucket-name' is the actual vector bucket created in Supabase
 */

import { createClient } from "@supabase/supabase-js";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectUrl || !serviceKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  );
  process.exit(1);
}

const supabase = createClient(projectUrl, serviceKey);

async function createVectorIndex() {
  try {
    console.log("🚀 Creating vector index...");
    console.log(`Project URL: ${projectUrl}`);
    console.log(`Bucket: vectors`);

    // Access the vector bucket using the correct SDK method
    // The bucket name should be the actual vector bucket created in Supabase
    const bucket = supabase.storage.vectors.from("vectors");

    // Create index with OpenAI embedding dimensions
    const { data, error } = await bucket.createIndex({
      indexName: "chat-embeddings-openai",
      dataType: "float32",
      dimension: 1536, // OpenAI text-embedding-3-small
      distanceMetric: "cosine",
    });

    if (error) {
      console.error("❌ Error creating index:", error);
      process.exit(1);
    }

    console.log("✅ Vector index created successfully!");
    console.log("Index details:", data);

    // List all indexes to verify
    console.log("\n📋 Listing all indexes in 'vectors' bucket...");
    const { data: indexes, error: listError } = await bucket.listIndexes();

    if (listError) {
      console.error("❌ Error listing indexes:", listError);
    } else {
      console.log("Indexes found:", indexes);
      indexes?.forEach((index) => {
        console.log(`\n  Name: ${index.name}`);
        console.log(`  Dimension: ${index.dimension}`);
        console.log(`  Distance Metric: ${index.distanceMetric}`);
        console.log(`  Data Type: ${index.dataType}`);
        console.log(`  Created At: ${index.createdAt}`);
      });
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

createVectorIndex();
