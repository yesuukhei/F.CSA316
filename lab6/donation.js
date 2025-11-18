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
  const donationList = new DonationList();

  donationList.addDonation({
    title: "Хөгжлийн бэрхшээлтэй хүүхдүүдэд туслах",
    description: "Зургийн сургуулийн хэрэгсэл худалдан авах",
    targetAmount: 1000000,
    createdBy: "user-123",
    category: "education",
  });

  donationList.addDonation({
    title: "Эмнэлгийн тусламж",
    description: "Цочмог тусламж шаардлагатай өвчтөнд туслах",
    targetAmount: 5000000,
    createdBy: "user-456",
    category: "health",
  });

  console.log("\n📋 Бүх хандивууд:");
  const all = donationList.getAllDonations();
  all.forEach((d) => {
    console.log(`  - ${d.title} (${d.targetAmount}₮)`);
  });

  console.log("\n📊 Статистик:");
  const stats = donationList.getStats();
  console.log(`  Нийт аян: ${stats.total}`);
  console.log(`  Идэвхтэй: ${stats.active}`);
  console.log(`  Зорилтот дүн: ${stats.totalTarget}₮`);
}

module.exports = { DonationList, createDonation };
