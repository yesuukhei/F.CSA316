const { DonationList, createDonation } = require("./donation");

describe("Donation List Feature (PB-102)", () => {
  let donationList;

  beforeEach(() => {
    donationList = new DonationList();
  });

  test("should create a new donation campaign with required fields", () => {
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

  test("should return list of all active donations", () => {
    donationList.addDonation({
      title: "Хандив 1",
      description: "Тайлбар 1",
      targetAmount: 500000,
      createdBy: "user-1",
    });

    donationList.addDonation({
      title: "Хандив 2",
      description: "Тайлбар 2",
      targetAmount: 800000,
      createdBy: "user-2",
    });

    const donations = donationList.getAllDonations();
    expect(donations).toHaveLength(2);
    expect(donations[0].title).toBe("Хандив 1");
  });

  test("should filter donations by status", () => {
    const donation1 = donationList.addDonation({
      title: "Active Donation",
      description: "Test",
      targetAmount: 100000,
      createdBy: "user-1",
    });

    const donation2 = donationList.addDonation({
      title: "Completed Donation",
      description: "Test",
      targetAmount: 50000,
      createdBy: "user-2",
    });

    donationList.updateDonationStatus(donation2.id, "completed");

    const activeDonations = donationList.getDonationsByStatus("active");
    expect(activeDonations).toHaveLength(1);
    expect(activeDonations[0].title).toBe("Active Donation");
  });

  test("should get specific donation by ID", () => {
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

  test("should reject donation with missing required fields", () => {
    expect(() => {
      createDonation({
        title: "",
        description: "Test",
        targetAmount: 100000,
      });
    }).toThrow();
  });

  test("should reject donation with negative target amount", () => {
    expect(() => {
      createDonation({
        title: "Test",
        description: "Test",
        targetAmount: -1000,
        createdBy: "user-1",
      });
    }).toThrow("Target amount must be positive");
  });

  test("should sort donations by creation date (newest first)", async () => {
    donationList.addDonation({
      title: "First",
      description: "Test",
      targetAmount: 100000,
      createdBy: "user-1",
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    donationList.addDonation({
      title: "Second",
      description: "Test",
      targetAmount: 100000,
      createdBy: "user-1",
    });

    const sorted = donationList.getSortedDonations("date", "desc");
    expect(sorted[0].title).toBe("Second");
  });
});
