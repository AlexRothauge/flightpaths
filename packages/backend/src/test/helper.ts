import { assert, expect } from "chai";

interface AssertAsyncErrorOption {
  type?: ErrorConstructor;
  message?: string;
}

/* istanbul ignore next */
export async function assertAsyncError(
  fn: () => Promise<unknown>,
  { type = Error, message = "" }: AssertAsyncErrorOption = {}
): Promise<void> {
  try {
    await fn();
    assert.fail("no error thrown");
  } catch (e: unknown) {
    if (!(e instanceof type)) {
      assert.fail(`error not of type ${type.name}`);
    }
    if (!(e instanceof Error)) {
      assert.fail("does not extend Error");
    }
    expect(e.message).to.be.equal(message);
  }
}
