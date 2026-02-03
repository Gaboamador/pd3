// src/components/skills/SkillsEditor.jsx
import { useMemo, useState } from "react";
import { buildSkillUIIndex } from "../../utils/skillsIndex.utils";
import SkillTreeGrid from "./SkillTreeGrid";
import SkillDetailsPanel from "./SkillDetailsPanel";
import SkillDetailsModal from "./SkillDetailsModal";
import { calculateSkillPoints } from "../../utils/skillPoints.utils";
import { MAX_SKILL_POINTS } from "../../build.constants";

// Swiper (asegurate de tenerlo instalado)
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

function useIsMobile(breakpointPx = 920) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpointPx;
  });

  // listener minimalista (sin hooks raros)
  if (typeof window !== "undefined") {
    window.onresize = () => setIsMobile(window.innerWidth < breakpointPx);
  }

  return isMobile;
}

export default function SkillsEditor({ build, setBuild, skillsData, skillGroupsData }) {
  const isMobile = useIsMobile(920);

  const uiIndex = useMemo(() => {
    return buildSkillUIIndex(skillsData, skillGroupsData);
  }, [skillsData, skillGroupsData]);

  // grupo seleccionado: por default el primero (position 0)
  const [activeGroupId, setActiveGroupId] = useState(() => uiIndex?.[0]?.groupId ?? 1);

  const activeGroup = useMemo(() => {
    return uiIndex.find(g => g.groupId === activeGroupId) ?? uiIndex?.[0] ?? null;
  }, [uiIndex, activeGroupId]);

  // Skill seleccionada para details (desktop) o modal (mobile)
  const [selectedSkillKey, setSelectedSkillKey] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedSkill = useMemo(() => {
    if (!selectedSkillKey) return null;
    return skillsData?.[selectedSkillKey] ?? null;
  }, [skillsData, selectedSkillKey]);

  const selectedState = build?.skills?.[selectedSkillKey];
  const showAcedInDetails = !!selectedState?.aced;

  const totalPoints = useMemo(() => {
    return calculateSkillPoints(build.skills || {}, skillsData || {});
  }, [build.skills, skillsData]);

  function patchSkills(nextSkills) {
    setBuild(prev => ({ ...prev, skills: nextSkills }));
  }

  function cycleUp(skill) {
    const cur = build.skills?.[skill.key];
    const next = { ...(build.skills || {}) };

    // none -> base
    if (!cur?.base && !cur?.aced) {
      const newPoints = totalPoints + (skill?.req_points?.base ?? 0);
      if (newPoints > MAX_SKILL_POINTS) return;

      next[skill.key] = { base: true, aced: false };
      patchSkills(next);
      return;
    }

    // base -> aced
    if (cur?.base && !cur?.aced) {
      const delta = (skill?.req_points?.aced ?? 0) - (skill?.req_points?.base ?? 0);
      const newPoints = totalPoints + delta;
      if (newPoints > MAX_SKILL_POINTS) return;

      next[skill.key] = { base: true, aced: true };
      patchSkills(next);
      return;
    }

    // aced -> (no hace nada)
  }

  function cycleDown(skill) {
    const cur = build.skills?.[skill.key];
    if (!cur) return;

    const next = { ...(build.skills || {}) };

    // aced -> base
    if (cur?.aced) {
      next[skill.key] = { base: true, aced: false };
      patchSkills(next);
      return;
    }

    // base -> none
    if (cur?.base) {
      delete next[skill.key];
      patchSkills(next);
    }
  }

  /**
   * Devuelve el motivo por el cual el "cycleUp" debería estar bloqueado.
   * (lo usamos para UX en cards)
   */
  function getCycleUpDisabledReason(skill, curState) {
    // Si ya está aced, no hay upgrade posible, pero NO queremos bloquear la UI.
    // Entonces: no devolvemos reason.
    if (curState?.aced) return null;

    // base -> aced: chequear delta de puntos
    if (curState?.base && !curState?.aced) {
      const delta = (skill?.req_points?.aced ?? 0) - (skill?.req_points?.base ?? 0);
      if (totalPoints + delta > MAX_SKILL_POINTS) {
        return `Skill points: ${totalPoints}/${MAX_SKILL_POINTS}`;
      }
      return null;
    }

    // none -> base
    const costBase = skill?.req_points?.base ?? 0;
    if (totalPoints + costBase > MAX_SKILL_POINTS) {
      return `Skill points: ${totalPoints}/${MAX_SKILL_POINTS}`;
    }

    return null;
  }

  function openInfo(skill) {
    setSelectedSkillKey(skill.key);
    setModalOpen(true);
  }

  function selectForDetails(skill) {
    setSelectedSkillKey(skill.key);
  }

  if (!activeGroup) return null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 1000, fontSize: 16 }}>Skills</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Points: <b>{totalPoints}</b> / {MAX_SKILL_POINTS}
          </div>
        </div>

        {/* Group selector */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {uiIndex.map(g => (
            <button
              key={g.groupId}
              type="button"
              onClick={() => {
                setActiveGroupId(g.groupId);
                setSelectedSkillKey(null);
              }}
              style={{
                borderRadius: 999,
                padding: "8px 12px",
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.18)",
                background: g.groupId === activeGroupId ? "rgba(255,255,255,0.12)" : "transparent",
                color: "inherit",
                fontWeight: 800,
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Body: trees + details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* Trees */}
        <div style={{ minWidth: 0 }}>
          {!isMobile ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {activeGroup.trees.map(tree => (
                <div
                  key={tree.treeId}
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <SkillTreeGrid
                    tree={tree}
                    skillsState={build.skills || {}}
                    isMobile={false}
                    getCycleUpDisabledReason={getCycleUpDisabledReason}
                    onCycleUpSkill={cycleUp}
                    onCycleDownSkill={cycleDown}
                    onSelectSkill={selectForDetails}
                    onOpenInfo={openInfo}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Swiper spaceBetween={12} slidesPerView={1}>
              {activeGroup.trees.map(tree => (
                <SwiperSlide key={tree.treeId}>
                  <div
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <SkillTreeGrid
                      tree={tree}
                      skillsState={build.skills || {}}
                      isMobile={true}
                      getCycleUpDisabledReason={getCycleUpDisabledReason}
                      onCycleUpSkill={cycleUp}
                      onCycleDownSkill={cycleDown}
                      onSelectSkill={selectForDetails}
                      onOpenInfo={openInfo}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Details (desktop aside) */}
        {!isMobile && (
          <aside style={{ position: "sticky", top: 12 }}>
            <SkillDetailsPanel skill={selectedSkill} showAced={showAcedInDetails} />
          </aside>
        )}
      </div>

      {/* Modal (mobile) */}
      {isMobile && selectedSkill && (
        <SkillDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          skill={selectedSkill}
          showAced={showAcedInDetails}
        />
      )}
    </div>
  );
}
