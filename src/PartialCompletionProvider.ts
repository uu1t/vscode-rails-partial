import * as path from "path";
import {
  CompletionItemProvider,
  TextDocument,
  Position,
  workspace,
  CompletionItem,
  CompletionItemKind,
  Uri
} from "vscode";

import { COMPLETION_REGEXP } from "./utils";

const matchScore = (path1: string, path2: string): number => {
  const parts1 = path1.split(path.sep).slice(0, -1);
  const parts2 = path2.split(path.sep).slice(0, -1);

  let score = 0;
  parts1.some((part, index) => {
    if (part === parts2[index]) {
      score += 1;
      return false;
    }
    return true;
  });

  return score;
};

const viewPathForRelativePath = (partialPath: Uri): string => {
  const search = path.join("app", "views") + path.sep;
  return workspace.asRelativePath(partialPath).replace(search, "");
};

export default class PartialCompletionProvider
  implements CompletionItemProvider {
  public provideCompletionItems(document: TextDocument, position: Position) {
    const range = document.getWordRangeAtPosition(position, COMPLETION_REGEXP);
    if (!range) {
      return null;
    }
    return this.buildCompletionItems(document);
  }

  private async buildCompletionItems(
    document: TextDocument
  ): Promise<CompletionItem[] | null> {
    const partialPaths = await workspace.findFiles("app/views/**/_*");
    const viewPaths = partialPaths.map(viewPathForRelativePath);
    const currentViewPath = viewPathForRelativePath(document.uri);

    const itemsWithScore = viewPaths.map(viewPath => {
      return {
        item: this.buildCompletionItem(viewPath),
        score: matchScore(currentViewPath, viewPath)
      };
    });

    const scores = itemsWithScore.map(({ score }) => score);
    const maxScore = Math.max(...scores);
    const maxScoreItemWithScore = itemsWithScore.find(
      ({ score }) => score === maxScore
    );
    if (!maxScoreItemWithScore) {
      return null;
    }
    maxScoreItemWithScore.item.preselect = true;

    return itemsWithScore.map(({ item }) => item);
  }

  private buildCompletionItem(viewPath: string): CompletionItem {
    const parts = viewPath.split(path.sep);
    const fileName = parts[parts.length - 1];
    const [baseName] = fileName.split(".", 2);
    const partialPath = [...parts.slice(0, -1), baseName.slice(1)].join(
      path.sep
    );
    const item = new CompletionItem(partialPath, CompletionItemKind.File);
    item.detail = viewPath;
    return item;
  }
}
