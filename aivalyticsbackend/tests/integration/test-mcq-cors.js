const fetch = require("node-fetch");

async function testMCQCORS() {
  console.log("🧪 Testing MCQ Generate Endpoint CORS");
  console.log("=====================================");

  const baseURL = "https://api.dashboardai.aivalytics.com";
  const origin = "https://dashboardai.aivalytics.com";

  // Test 1: OPTIONS preflight request
  console.log("\n1. Testing OPTIONS preflight request...");
  try {
    const optionsResponse = await fetch(`${baseURL}/api/mcq/generate`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
      },
    });

    console.log("✅ OPTIONS request successful");
    console.log("Status:", optionsResponse.status);

    // Check CORS headers
    const corsHeaders = [
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Credentials",
    ];

    console.log("\nCORS Headers:");
    corsHeaders.forEach((header) => {
      const value = optionsResponse.headers.get(header);
      if (value) {
        console.log(`  ${header}: ${value}`);
      } else {
        console.log(`  ${header}: Not found`);
      }
    });
  } catch (error) {
    console.log("❌ OPTIONS request failed:", error.message);
  }

  // Test 2: Check if server is responding
  console.log("\n2. Testing server connectivity...");
  try {
    const healthResponse = await fetch(`${baseURL}/health`);
    console.log("✅ Server is responding");
    console.log("Status:", healthResponse.status);
  } catch (error) {
    console.log("❌ Server connectivity failed:", error.message);
  }

  // Test 3: Test CORS test endpoint
  console.log("\n3. Testing CORS test endpoint...");
  try {
    const corsTestResponse = await fetch(`${baseURL}/api/cors-test`, {
      headers: {
        Origin: origin,
      },
    });

    if (corsTestResponse.ok) {
      const data = await corsTestResponse.json();
      console.log("✅ CORS test successful");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      console.log("❌ CORS test failed");
      console.log("Status:", corsTestResponse.status);
    }
  } catch (error) {
    console.log("❌ CORS test failed:", error.message);
  }

  console.log("\n📋 Summary:");
  console.log("If all tests pass, the CORS configuration should be working.");
  console.log("If any test fails, you may need to:");
  console.log("1. Restart your production server");
  console.log("2. Check your environment variables");
  console.log("3. Verify your hosting provider's CORS settings");
}

testMCQCORS().catch(console.error);
