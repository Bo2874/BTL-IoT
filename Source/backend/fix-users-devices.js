import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

async function fixUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users\n`);

    // Fix each user individually
    for (const user of users) {
      console.log(`Checking ${user.name}...`);
      if (!Array.isArray(user.devices)) {
        console.log(`  ⚠️ Invalid devices field, fixing...`);
        user.devices = [];
        await user.save();
        console.log(`  ✅ Fixed!`);
      } else {
        console.log(`  ✅ OK (${user.devices.length} devices)`);
      }
    }

    console.log("\n=== VERIFICATION ===");
    const usersAfter = await User.find();
    usersAfter.forEach((user) => {
      console.log(
        `${user.name} - Devices: ${
          Array.isArray(user.devices) ? user.devices.length : "STILL INVALID"
        }`
      );
    });

    await mongoose.connection.close();
    console.log("\n✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixUsers();
