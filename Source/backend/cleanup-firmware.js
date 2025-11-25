import mongoose from "mongoose";
import Firmware from "./src/models/firmware.js";
import fs from "fs";
import path from "path";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://hongbao:haingao280704@cluster0.rn0ke.mongodb.net/iot_sensor_db?retryWrites=true&w=majority&appName=Cluster0";

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Lấy tất cả firmware records
    const firmwares = await Firmware.find({});
    console.log(
      `\n📦 Found ${firmwares.length} firmware records in database\n`
    );

    let deleted = 0;
    for (const fw of firmwares) {
      console.log(`Checking: ${fw.version} - ${fw.filename}`);
      console.log(`  Path: ${fw.filePath}`);

      if (!fs.existsSync(fw.filePath)) {
        console.log(`  ❌ FILE NOT FOUND - Deleting record...`);
        await Firmware.deleteOne({ _id: fw._id });
        deleted++;
      } else {
        console.log(`  ✅ File exists`);
      }
    }

    console.log(`\n🗑️  Deleted ${deleted} orphaned firmware records`);
    console.log(`📊 Remaining firmwares: ${firmwares.length - deleted}`);

    await mongoose.disconnect();
    console.log("\n✅ Cleanup completed!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanup();
