import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { DEFAULT_BUILD } from "./build.constants";

export function encodeBuildToUrl(build) {
  try {
    const json = JSON.stringify(build);
    return compressToEncodedURIComponent(json);
  } catch (err) {
    console.warn("Failed to encode build", err);
    return null;
  }
}

export function decodeBuildFromUrl(encoded) {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    const parsed = JSON.parse(json);

    // validación mínima
    if (!parsed || parsed.version !== DEFAULT_BUILD.version) {
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn("Failed to decode build", err);
    return null;
  }
}
