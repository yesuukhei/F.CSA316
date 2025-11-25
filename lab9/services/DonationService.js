const { DonationList } = require("../../lab6/donation");
const {
  ValidationError,
  NotFoundError,
  DatabaseError,
} = require("../exceptions");
const logger = require("../utils/logger");

// Хандивын үйлчилгээ
class DonationService {
  constructor() {
    this.donationList = new DonationList();
  }

  getDonationById(id) {
    if (!id || typeof id !== "string") {
      throw new ValidationError("Хандивын ID буруу байна");
    }

    const donation = this.donationList.getDonationById(id);
    if (!donation) {
      throw new NotFoundError("Хандивын аян", id);
    }

    logger.info("Хандивын аян олдлоо", { id });
    return donation;
  }

  createDonation(donationData) {
    if (!donationData.title || donationData.title.trim() === "") {
      throw new ValidationError("Хандивын аяны гарчиг хоосон байж болохгүй", {
        field: "title",
      });
    }

    if (!donationData.description || donationData.description.trim() === "") {
      throw new ValidationError("Хандивын аяны тайлбар хоосон байж болохгүй", {
        field: "description",
      });
    }

    if (!donationData.targetAmount || donationData.targetAmount <= 0) {
      throw new ValidationError("Зорилтот дүн 0-ээс их байх ёстой", {
        field: "targetAmount",
      });
    }

    if (!donationData.createdBy) {
      throw new ValidationError("Үүсгэгчийн ID шаардлагатай", {
        field: "createdBy",
      });
    }

    const donation = this.donationList.addDonation({
      title: donationData.title.trim(),
      description: donationData.description.trim(),
      targetAmount: donationData.targetAmount,
      createdBy: donationData.createdBy,
      category: donationData.category || "general",
    });

    logger.info("Хандивын аян үүслээ", { id: donation.id });
    return donation;
  }

  updateDonationStatus(id, newStatus) {
    if (!id || typeof id !== "string") {
      throw new ValidationError("Хандивын ID буруу байна");
    }

    const validStatuses = ["active", "completed", "cancelled", "paused"];
    if (!validStatuses.includes(newStatus)) {
      throw new ValidationError(`Төлөв буруу байна: ${newStatus}`, {
        field: "status",
      });
    }

    this.getDonationById(id); // Олдохгүй бол алдаа гарна
    this.donationList.updateDonationStatus(id, newStatus);
    logger.info("Төлөв шинэчлэгдлээ", { id, newStatus });
    return this.getDonationById(id);
  }

  getAllDonations() {
    const donations = this.donationList.getAllDonations();
    logger.info("Бүх хандивын аянууд авагдлаа", { count: donations.length });
    return donations;
  }

  getDonationsByStatus(status) {
    const validStatuses = ["active", "completed", "cancelled", "paused"];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Төлөв буруу байна: ${status}`, {
        field: "status",
      });
    }
    return this.donationList.getDonationsByStatus(status);
  }

  getStats() {
    return this.donationList.getStats();
  }
}

module.exports = DonationService;
