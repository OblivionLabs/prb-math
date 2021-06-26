import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { E, MAX_SD59x18, MAX_WHOLE_SD59x18, PI } from "../../../helpers/constants";
import { sqrt } from "../../../helpers/math";
import { bn } from "../../../helpers/numbers";
import { PRBMathErrors } from "../../shared/errors";

export default function shouldBehaveLikeSqrt(): void {
  context("when x is zero", function () {
    it("returns zero", async function () {
      const x: BigNumber = bn("0");
      const expected: BigNumber = bn("0");
      expect(expected).to.equal(await this.contracts.prbMathSd59x18.doSqrt(x));
      expect(expected).to.equal(await this.contracts.prbMathSd59x18Typed.doSqrt(x));
    });
  });

  context("when x is negative", function () {
    it("reverts", async function () {
      const x: BigNumber = fp("-1");
      await expect(this.contracts.prbMathSd59x18.doSqrt(x)).to.be.revertedWith(PRBMathErrors.SqrtSd59x18NegativeInput);
      await expect(this.contracts.prbMathSd59x18Typed.doSqrt(x)).to.be.revertedWith(
        PRBMathErrors.SqrtSd59x18NegativeInput,
      );
    });
  });

  context("when x is positive", function () {
    context(
      "when x is greater than or equal to 57896044618658097711785492504343953926634.992332820282019729",
      function () {
        const testSets = [
          fp("57896044618658097711785492504343953926634.992332820282019729"),
          fp(MAX_WHOLE_SD59x18),
          fp(MAX_SD59x18),
        ];

        forEach(testSets).it("takes %e and reverts", async function (x: BigNumber) {
          await expect(this.contracts.prbMathSd59x18.doSqrt(x)).to.be.revertedWith(PRBMathErrors.SqrtSd59x18Overflow);
          await expect(this.contracts.prbMathSd59x18Typed.doSqrt(x)).to.be.revertedWith(
            PRBMathErrors.SqrtSd59x18Overflow,
          );
        });
      },
    );

    context("when x is less than 57896044618658097711785492504343953926634.992332820282019729", function () {
      const testSets = [
        ["1e-18"],
        ["1e-15"],
        ["1"],
        ["2"],
        [E],
        ["3"],
        [PI],
        ["4"],
        ["16"],
        ["1e17"],
        ["1e18"],
        ["12489131238983290393813.123784889921092801"],
        ["1889920002192904839344128288891377.732371920009212883"],
        ["1e40"],
        ["5e40"],
        ["57896044618658097711785492504343953926634.992332820282019728"],
      ];

      forEach(testSets).it("takes %e and returns the correct value", async function (x: string) {
        const expected: BigNumber = fp(sqrt(x));
        expect(expected).to.equal(await this.contracts.prbMathSd59x18.doSqrt(fp(x)));
        expect(expected).to.equal(await this.contracts.prbMathSd59x18Typed.doSqrt(fp(x)));
      });
    });
  });
}
