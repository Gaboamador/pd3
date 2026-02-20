import { useNavigate } from "react-router-dom";
import { encodeBuildToUrl } from "../build/build.buildUrl.utils";

function normalizeOwnedBuild(build) {
  const clean = { ...build };
  delete clean.__shared;
  return clean;
}

export function useLoadBuild() {
  const navigate = useNavigate();

  function loadBuild(build, opts = {}) {
    const { replace = false, fromExplorer = null } = opts;

    if (!build) return;

    const clean = normalizeOwnedBuild(build);
    const encoded = encodeBuildToUrl(clean);
    if (!encoded) return;

    navigate(`/build-editor/b/${encoded}`, {
      replace,
      state: fromExplorer ? { fromExplorer } : undefined,
    });
  }

  return { loadBuild };
}