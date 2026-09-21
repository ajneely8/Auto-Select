import test from "node:test";
import assert from "node:assert/strict";
import { looksLikeGibberishName as g } from "../src/lib/leads/gibberish.ts";

test("flags the bot names seen in the CRM", () => {
  for (const [firstName, lastName] of [["Kkfn", "Rhccj"], ["Kqoqjbd", "Hqhqz"], ["Fzdaog", "Gbsvnwqr"], ["Haiv", "Jcrwjs"]]) {
    assert.equal(g({ firstName, lastName }), true, `${firstName} ${lastName}`);
  }
});

test("does not flag real names", () => {
  const real = [["Maria", "Garcia"], ["John", "Schmidt"], ["Aiden", "Neely"], ["Nguyen", "Tran"], ["Wojciech", "Krzyzewski"], ["Lynn", "Hsu"], ["Christopher", "Strength"], ["Li", "Ng"], ["Zoe", "Smythe"], ["Priya", "Iqbal"], ["Ana", "Rodriguez-Lopez"], ["Mike", "McGrath"]];
  for (const [firstName, lastName] of real) assert.equal(g({ firstName, lastName }), false, `${firstName} ${lastName}`);
});

test("ignores empty, placeholder and single-name submissions safely", () => {
  assert.equal(g({}), false);
  assert.equal(g({ firstName: "Sam", lastName: "-" }), false);
  assert.equal(g({ name: "Chris" }), false);
});
