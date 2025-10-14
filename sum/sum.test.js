const sum = require("./sum");

test("1 + 2 = 3 гарах ёстой", () => {
  expect(sum(1, 2)).toBe(3);
});
test( "Тоо биш өгөгдөл өгвөл алдаа заана", () => {
 expect(() => sum(1, "x")).toThrow("Тоо оруулах шаардлагатай!");
});