const { signUp } = require("./sign_up");

describe("signUp", () => {
  test("creates user on valid input and stores hashed password", () => {
    const users = [];
    const result = signUp(users, { name: "John", email: "john@example.com", password: "secretPass1" });
    expect(result).toHaveProperty("id");
    expect(result).toMatchObject({ name: "John", email: "john@example.com" });
    expect(users).toHaveLength(1);
    expect(users[0]).toHaveProperty("passwordHash");
    expect(users[0]).toHaveProperty("salt");
    expect(users[0].passwordHash).not.toEqual("secretPass1");
  });

  test("rejects invalid email", () => {
    const users = [];
    const res = signUp(users, { name: "A", email: "invalid", password: "secretPass1" });
    expect(res).toBeUndefined();
    expect(users).toHaveLength(0);
  });

  test("rejects short password", () => {
    const users = [];
    const res = signUp(users, { name: "A", email: "a@a.com", password: "short" });
    expect(res).toBeUndefined();
    expect(users).toHaveLength(0);
  });

  test("rejects empty name", () => {
    const users = [];
    const res = signUp(users, { name: " ", email: "a@a.com", password: "secretPass1" });
    expect(res).toBeUndefined();
    expect(users).toHaveLength(0);
  });

  test("rejects duplicate email (case-insensitive)", () => {
    const users = [];
    signUp(users, { name: "John", email: "john@example.com", password: "secretPass1" });
    const res = signUp(users, { name: "Jane", email: "JOHN@example.com", password: "secretPass1" });
    expect(res).toBeUndefined();
    expect(users).toHaveLength(1);
  });
});


