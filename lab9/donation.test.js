const { DonationList, createDonation } = require("./donation");
const { ValidationError, NotFoundError } = require("./exceptions");

describe("Donation List Feature with Error Handling (Lab 9)", () => {
  let donationList;

  beforeEach(() => {
    donationList = new DonationList();
  });

  describe("Custom Error Classes", () => {
    test("should throw ValidationError for empty title", () => {
      expect(() => {
        createDonation({
          title: "",
          description: "Test",
          targetAmount: 100000,
          createdBy: "user-1",
        });
      }).toThrow(ValidationError);

      try {
        createDonation({
          title: "",
          description: "Test",
          targetAmount: 100000,
          createdBy: "user-1",
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.statusCode).toBe(400);
        expect(error.details).toHaveProperty("field", "title");
      }
    });

    test("should throw ValidationError for negative target amount", () => {
      expect(() => {
        createDonation({
          title: "Test",
          description: "Test",
          targetAmount: -1000,
          createdBy: "user-1",
        });
      }).toThrow(ValidationError);

      try {
        createDonation({
          title: "Test",
          description: "Test",
          targetAmount: -1000,
          createdBy: "user-1",
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.statusCode).toBe(400);
        expect(error.details).toHaveProperty("field", "targetAmount");
      }
    });

    test("should throw ValidationError for missing createdBy", () => {
      expect(() => {
        createDonation({
          title: "Test",
          description: "Test",
          targetAmount: 100000,
        });
      }).toThrow(ValidationError);
    });

    test("should throw NotFoundError when donation not found", () => {
      expect(() => {
        donationList.updateDonationStatus("nonexistent-id", "completed");
      }).toThrow(NotFoundError);

      try {
        donationList.updateDonationStatus("nonexistent-id", "completed");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.statusCode).toBe(404);
        expect(error.details).toHaveProperty("resourceName", "Хандивын аян");
      }
    });
  });

  describe("Error JSON Format", () => {
    test("ValidationError should have correct JSON format", () => {
      try {
        createDonation({
          title: "",
          description: "Test",
          targetAmount: 100000,
          createdBy: "user-1",
        });
      } catch (error) {
        const json = error.toJSON();
        expect(json).toHaveProperty("error");
        expect(json).toHaveProperty("statusCode", 400);
        expect(json).toHaveProperty("details");
      }
    });

    test("NotFoundError should have correct JSON format", () => {
      try {
        donationList.updateDonationStatus("nonexistent", "completed");
      } catch (error) {
        const json = error.toJSON();
        expect(json).toHaveProperty("error");
        expect(json).toHaveProperty("statusCode", 404);
        expect(json).toHaveProperty("details");
      }
    });
  });

  describe("Successful Operations", () => {
    test("should create donation with valid data", () => {
      const donation = createDonation({
        title: "Зургийн сургуулийн хандив",
        description: "Хөгжлийн бэрхшээлтэй хүүхдүүдэд туслах",
        targetAmount: 1000000,
        createdBy: "user-123",
      });

      expect(donation).toHaveProperty("id");
      expect(donation.title).toBe("Зургийн сургуулийн хандив");
      expect(donation.targetAmount).toBe(1000000);
      expect(donation.currentAmount).toBe(0);
      expect(donation.status).toBe("active");
    });

    test("should get donation by ID successfully", () => {
      const donation = donationList.addDonation({
        title: "Test Donation",
        description: "Test Description",
        targetAmount: 200000,
        createdBy: "user-1",
      });

      const found = donationList.getDonationById(donation.id);
      expect(found).toBeDefined();
      expect(found.title).toBe("Test Donation");
    });

    test("should update donation status successfully", () => {
      const donation = donationList.addDonation({
        title: "Test",
        description: "Test",
        targetAmount: 100000,
        createdBy: "user-1",
      });

      const updated = donationList.updateDonationStatus(
        donation.id,
        "completed"
      );
      expect(updated.status).toBe("completed");
    });
  });
});
