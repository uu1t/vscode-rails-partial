"use strict";

import * as path from "path";
import { pathExistsSync } from "fs-extra";
import {
  DefinitionProvider,
  TextDocument,
  Location,
  Position,
  Uri,
  workspace
} from "vscode";

import { DEFINITION_REGEXP } from "./utils";

export default class PartialDefinitionProvider implements DefinitionProvider {
  constructor(private rootPath: string) {}

  public async provideDefinition(document: TextDocument, position: Position) {
    const range = document.getWordRangeAtPosition(position, DEFINITION_REGEXP);
    if (!range) {
      return null;
    }
    const partialName = document.getText(range).replace(DEFINITION_REGEXP, "$1");
    return this.partialLocation(document.fileName, partialName);
  }

  private partialLocation(currentFileName: string, partialName: string) {
    const viewFileExtensions: string[] = workspace.getConfiguration(
      "railsPartial"
    ).viewFileExtensions;

    const fileBase = partialName.includes("/")
      ? path.join(
          this.rootPath,
          "app",
          "views",
          path.dirname(partialName),
          `_${path.basename(partialName)}`
        )
      : path.join(path.dirname(currentFileName), `_${partialName}`);

    const targetExt = viewFileExtensions.find(ext => {
      return pathExistsSync(`${fileBase}.${ext}`);
    });

    // TODO: Definition link API
    // https://github.com/Microsoft/vscode/pull/52230
    return targetExt
      ? new Location(Uri.file(`${fileBase}.${targetExt}`), new Position(0, 0))
      : null;
  }
}
