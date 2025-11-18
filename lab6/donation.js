const crypto = require("crypto");

function createDonation({ title, description, targetAmount, createdBy, category = "general" }) {
  if (!title || title.trim() === "") {
    throw new Error("Title is required");
  }

  if (!description || description.trim() === "") {
    throw new Error("Description is required");
  }

  if (!targetAmount || targetAmount <= 0) {
    throw new Error("Target amount must be positive");
  }

  if (!createdBy) {
    throw new Error("Creator ID is required");
  }

  return {
    id: crypto.randomBytes(8).toString("hex"),
    title: title.trim(),
    description: description.trim(),
    targetAmount,
    currentAmount: 0,
    category,
    createdBy,
    status: "active",
    createdAt: new Date().toISOString(),
    donors: [],
  };
}

class DonationList {
  constructor() {
    this.donations = [];
  }

  addDonation(donationData) {
    const donation = createDonation(donationData);
    this.donations.push(donation);
    return donation;
  }

  getAllDonations() {
    return this.donations;
  }

  getDonationsByStatus(status) {
    return this.donations.filter((d) => d.status === status);
  }

  getDonationById(id) {
    return this.donations.find((d) => d.id === id);
  }

  updateDonationStatus(id, newStatus) {
    const donation = this.getDonationById(id);
    if (!donation) {
      throw new Error("Donation not found");
    }
    donation.status = newStatus;
    return donation;
  }

  getSortedDonations(sortBy = "date", order = "desc") {
    const sorted = [...this.donations];

    if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return order === "desc" ? dateB - dateA : dateA - dateB;
      });
    } else if (sortBy === "amount") {
      sorted.sort((a, b) => {
        return order === "desc"
          ? b.targetAmount - a.targetAmount
          : a.targetAmount - b.targetAmount;
      });
    }

    return sorted;
  }

  getStats() {
    const total = this.donations.length;
    const active = this.donations.filter((d) => d.status === "active").length;
    const completed = this.donations.filter((d) => d.status === "completed").length;
    const totalTarget = this.donations.reduce((sum, d) => sum + d.targetAmount, 0);
    const totalRaised = this.donations.reduce((sum, d) => sum + d.currentAmount, 0);

    return {
      total,
      active,
      completed,
      totalTarget,
      totalRaised,
    };
  }
}

if (require.main === module) {
  console.log("=".repeat(60));
  console.log("🎯 ХАНДИВЫН СИСТЕМ - PB-102");
  console.log("=".repeat(60));

  const donationList = new DonationList();

  console.log("\n✨ Хандивын аян үүсгэж байна...\n");

  const d1 = donationList.addDonation({
    title: "Хөгжлийн бэрхшээлтэй хүүхдүүдэд туслах",
    description: "Зургийн сургуулийн хэрэгсэл худалдан авах",
    targetAmount: 1000000,
    createdBy: "user-123",
    category: "боловсрол",
  });
  console.log(`   ✅ Үүссэн: ${d1.title}`);

  const d2 = donationList.addDonation({
    title: "Эмнэлгийн тусламж",
    description: "Цочмог тусламж шаардлагатай өвчтөнд туслах",
    targetAmount: 5000000,
    createdBy: "user-456",
    category: "эрүүл мэнд",
  });
  console.log(`   ✅ Үүссэн: ${d2.title}`);

  console.log("\n" + "=".repeat(60));
  console.log("📋 БҮХ ХАНДИВЫН АЯНУУД");
  console.log("=".repeat(60));
  
  const all = donationList.getAllDonations();
  all.forEach((d, index) => {
    console.log(`\n${index + 1}. ${d.title}`);
    console.log(`   Тайлбар: ${d.description}`);
    console.log(`   Зорилтот дүн: ${d.targetAmount.toLocaleString()}₮`);
    console.log(`   Одоогийн дүн: ${d.currentAmount.toLocaleString()}₮`);
    console.log(`   Ангилал: ${d.category}`);
    console.log(`   Төлөв: ${d.status}`);
    console.log(`   ID: ${d.id}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("📊 СТАТИСТИК");
  console.log("=".repeat(60));
  
  const stats = donationList.getStats();
  console.log(`\n   Нийт аян: ${stats.total}`);
  console.log(`   Идэвхтэй аян: ${stats.active}`);
  console.log(`   Дууссан аян: ${stats.completed}`);
  console.log(`   Нийт зорилтот дүн: ${stats.totalTarget.toLocaleString()}₮`);
  console.log(`   Нийт цугларсан дүн: ${stats.totalRaised.toLocaleString()}₮`);
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ Демо амжилттай дууслаа!");
  console.log("=".repeat(60) + "\n");
}

module.exports = { DonationList, createDonation };
