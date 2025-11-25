// Debug script - Kiểm tra firmware records và file tồn tại
import fs from "fs";

const uploadsDir = "uploads/firmware";

console.log("\n📁 Checking uploads directory...");
console.log(`Path: ${uploadsDir}`);

if (!fs.existsSync(uploadsDir)) {
  console.log("❌ Directory does not exist!");
  console.log("\n🔧 Creating directory...");
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Directory created!");
} else {
  console.log("✅ Directory exists");

  const files = fs.readdirSync(uploadsDir);
  console.log(`\n📦 Files in directory: ${files.length}`);

  if (files.length === 0) {
    console.log("⚠️  No firmware files found!");
    console.log("\n💡 SOLUTION:");
    console.log("1. Go to http://localhost:5173/ota");
    console.log("2. Delete all existing firmware records");
    console.log("3. Upload NEW firmware files (.bin)");
    console.log("4. Trigger OTA update to ESP32");
  } else {
    files.forEach((file, index) => {
      const filePath = `${uploadsDir}/${file}`;
      const stats = fs.statSync(filePath);
      console.log(`\n${index + 1}. ${file}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
    });
  }
}

console.log("\n" + "=".repeat(60));
