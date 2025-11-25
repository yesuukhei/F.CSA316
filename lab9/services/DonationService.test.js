const DonationService = require("./DonationService");
const { ValidationError, NotFoundError } = require("../exceptions");

describe("DonationService (Lab 9)", () => {
  let service;

  beforeEach(() => {
    service = new DonationService();
  });

  describe("createDonation", () => {
    test("should create donation with valid data", () => {
      const donation = service.createDonation({
        title: "Test Donation",
        description: "Test Description",
        targetAmount: 100000,
        createdBy: "user-1",
      });

      expect(donation).toHaveProperty("id");
      expect(donation.title).toBe("Test Donation");
    });

    test("should throw ValidationError for empty title", () => {
      expect(() => {
        service.createDonation({
          title: "",
          description: "Test",
          targetAmount: 100000,
          createdBy: "user-1",
        });
      }).toThrow(ValidationError);
    });

    test("should throw ValidationError for negative amount", () => {
      expect(() => {
        service.createDonation({
          title: "Test",
          description: "Test",
          targetAmount: -1000,
          createdBy: "user-1",
        });
      }).toThrow(ValidationError);
    });
  });

  describe("getDonationById", () => {
    test("should return donation when found", () => {
      const created = service.createDonation({
        title: "Test",
        description: "Test",
        targetAmount: 100000,
        createdBy: "user-1",
      });

      const found = service.getDonationById(created.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
    });

    test("should throw NotFoundError when not found", () => {
      expect(() => {
        service.getDonationById("nonexistent-id");
      }).toThrow(NotFoundError);
    });

    test("should throw ValidationError for invalid ID", () => {
      expect(() => {
        service.getDonationById(null);
      }).toThrow(ValidationError);
    });
  });

  describe("updateDonationStatus", () => {
    test("should update status successfully", () => {
      const donation = service.createDonation({
        title: "Test",
        description: "Test",
        targetAmount: 100000,
        createdBy: "user-1",
      });

      const updated = service.updateDonationStatus(donation.id, "completed");
      expect(updated.status).toBe("completed");
    });

    test("should throw ValidationError for invalid status", () => {
      const donation = service.createDonation({
        title: "Test",
        description: "Test",
        targetAmount: 100000,
        createdBy: "user-1",
      });

      expect(() => {
        service.updateDonationStatus(donation.id, "invalid-status");
      }).toThrow(ValidationError);
    });

    test("should throw NotFoundError for nonexistent donation", () => {
      expect(() => {
        service.updateDonationStatus("nonexistent-id", "completed");
      }).toThrow(NotFoundError);
    });
  });

  describe("getDonationsByStatus", () => {
    test("should return donations by status", () => {
      service.createDonation({
        title: "Active 1",
        description: "Test",
        targetAmount: 100000,
        createdBy: "user-1",
      });

      service.createDonation({
        title: "Active 2",
        description: "Test",
        targetAmount: 200000,
        createdBy: "user-2",
      });

      const active = service.getDonationsByStatus("active");
      expect(active.length).toBe(2);
    });

    test("should throw ValidationError for invalid status", () => {
      expect(() => {
        service.getDonationsByStatus("invalid-status");
      }).toThrow(ValidationError);
    });
  });

  describe("getStats", () => {
    test("should return statistics", () => {
      service.createDonation({
        title: "Test 1",
        description: "Test",
        targetAmount: 100000,
        createdBy: "user-1",
      });

      const stats = service.getStats();
      expect(stats).toHaveProperty("total");
      expect(stats).toHaveProperty("active");
      expect(stats).toHaveProperty("totalTarget");
    });
  });
});

