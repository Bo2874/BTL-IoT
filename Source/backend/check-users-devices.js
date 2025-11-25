import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
});

const DeviceSchema = new mongoose.Schema({
  deviceId: String,
  name: String,
  location: String,
  assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", UserSchema);
const Device = mongoose.model("Device", DeviceSchema);

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Lấy danh sách users với devices
    const users = await User.find().populate("devices");
    console.log("=== USERS VÀ DEVICES CỦA HỌ ===");
    users.forEach((user) => {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`Role: ${user.role}`);
      console.log(`Devices array: ${JSON.stringify(user.devices)}`);
      console.log(`Devices count: ${user.devices ? user.devices.length : 0}`);
      if (user.devices && user.devices.length > 0) {
        user.devices.forEach((d, idx) => {
          if (d && d._id) {
            console.log(`  - ${d.deviceId || "N/A"}: ${d.name || "N/A"}`);
          } else {
            console.log(`  - [${idx}] Invalid device reference: ${d}`);
          }
        });
      }
    });

    // Lấy danh sách devices hiện tại
    const devices = await Device.find().populate(
      "assignedWorkers",
      "name email"
    );
    console.log(
      `\n\n=== TỔNG SỐ DEVICES TRONG DATABASE: ${devices.length} ===`
    );
    devices.forEach((d) => {
      console.log(`\nDevice: ${d.deviceId} - ${d.name}`);
      console.log(`Location: ${d.location || "N/A"}`);
      console.log(`Assigned Workers: ${d.assignedWorkers?.length || 0}`);
      if (d.assignedWorkers && d.assignedWorkers.length > 0) {
        d.assignedWorkers.forEach((w) => {
          console.log(`  - ${w.name} (${w.email})`);
        });
      }
    });

    await mongoose.connection.close();
    console.log("\n✅ Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkData();
