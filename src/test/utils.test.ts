import * as assert from "assert";

import { PARTIAL_NAME_REGEXP } from "../utils";

suite("DEFINITION_REGEXP", () => {
  test("Match render method and extract partial name", () => {
    assert.strictEqual("".match(DEFINITION_REGEXP), null);

    let matches = 'render "item"'.match(DEFINITION_REGEXP) as RegExpMatchArray;
    assert.strictEqual(matches[0], 'render "item"');
    assert.strictEqual(matches[1], "item");

    matches = "render 'item'".match(DEFINITION_REGEXP) as RegExpMatchArray;
    assert.strictEqual(matches[0], "render 'item'");
    assert.strictEqual(matches[1], "item");

    matches = 'render "shared/item"'.match(DEFINITION_REGEXP) as RegExpMatchArray;
    assert.strictEqual(matches[0], 'render "shared/item"');
    assert.strictEqual(matches[1], "shared/item");

    matches = 'render partial: "item"'.match(DEFINITION_REGEXP) as RegExpMatchArray;
    assert.strictEqual(matches[0], 'render partial: "item"');
    assert.strictEqual(matches[1], "item");

    matches = 'render :partial => "item"'.match(DEFINITION_REGEXP) as RegExpMatchArray;
    assert.strictEqual(matches[0], 'render :partial => "item"');
    assert.strictEqual(matches[1], "item");

    matches = 'render partial: "item", collection: @items'.match(DEFINITION_REGEXP) as RegExpMatchArray;
    assert.strictEqual(matches[0], 'render partial: "item"');
    assert.strictEqual(matches[1], "item");
  });
});
