const crypto = require("crypto");
const { ValidationError } = require("./exceptions");

/**
 * Хандивын аян үүсгэх функц
 * Custom алдааны класс ашиглана
 */
function createDonation({
  title,
  description,
  targetAmount,
  createdBy,
  category = "general",
}) {
  if (!title || title.trim() === "") {
    throw new ValidationError("Хандивын аяны гарчиг хоосон байж болохгүй", {
      field: "title",
    });
  }

  if (!description || description.trim() === "") {
    throw new ValidationError("Хандивын аяны тайлбар хоосон байж болохгүй", {
      field: "description",
    });
  }

  if (!targetAmount || targetAmount <= 0) {
    throw new ValidationError("Зорилтот дүн 0-ээс их байх ёстой", {
      field: "targetAmount",
      value: targetAmount,
    });
  }

  if (!createdBy) {
    throw new ValidationError("Үүсгэгчийн ID шаардлагатай", {
      field: "createdBy",
    });
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
      const { NotFoundError } = require("./exceptions");
      throw new NotFoundError("Хандивын аян", id);
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
    const completed = this.donations.filter(
      (d) => d.status === "completed"
    ).length;
    const totalTarget = this.donations.reduce(
      (sum, d) => sum + d.targetAmount,
      0
    );
    const totalRaised = this.donations.reduce(
      (sum, d) => sum + d.currentAmount,
      0
    );

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
  const logger = require("./utils/logger");

  console.log("ХАНДИВЫН СИСТЕМ ");
  console.log("=".repeat(50));

  const donationList = new DonationList();

  // Хандивын аян үүсгэх
  try {
    const d1 = donationList.addDonation({
      title: "Хөгжлийн бэрхшээлтэй хүүхдүүдэд туслах",
      description: "Зургийн сургуулийн хэрэгсэл худалдан авах",
      targetAmount: 1000000,
      createdBy: "user-123",
      category: "боловсрол",
    });
    console.log(`✓ Үүссэн: ${d1.title}`);
    logger.info("Хандивын аян үүслээ", { id: d1.id });

    // Алдааны жишээ
    console.log("\nАлдаа боловсруулалтын жишээ:");
    try {
      donationList.addDonation({
        title: "", // Хоосон - алдаа гарна
        description: "Test",
        targetAmount: 100000,
        createdBy: "user-789",
      });
    } catch (error) {
      console.log(`❌ Алдаа: ${error.message}`);
      console.log(`   Статус код: ${error.statusCode}`);
      logger.logError(error);
    }

    // Статистик
    const stats = donationList.getStats();
    console.log(`\nНийт аян: ${stats.total}`);
    console.log(`Нийт зорилтот дүн: ${stats.totalTarget.toLocaleString()}₮`);
  } catch (error) {
    logger.logError(error);
    console.error("Алдаа:", error.message);
  }
}

module.exports = { DonationList, createDonation };
