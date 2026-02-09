// src/components/skills/SkillsEditor.jsx
import { useMemo, useState } from "react";
import { buildSkillUIIndex } from "../../utils/skillsIndex.utils";
import styles from "./SkillsEditor.module.scss";
import SkillTreeGrid from "./SkillTreeGrid";
import SkillDetailsPanel from "./SkillDetailsPanel";
import SkillDetailsModal from "./SkillDetailsModal";
import SkillGroupSprite from "./SkillGroupSprite";
import { calculateSkillPoints } from "../../utils/skillPoints.utils";
import { MAX_SKILL_POINTS } from "../../build.constants";
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
  
  const [activeTreeIndex, setActiveTreeIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);

  
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

  const tier = getSkillTier(skill);

  if (!isTierUnlocked(tier, groupEquipped)) return;


  // none → base
  if (!cur?.base && !cur?.aced) {
    const cost = skill.req_points?.base ?? 0;
    if (totalPoints + cost > MAX_SKILL_POINTS) return;

    next[skill.key] = { base: true, aced: false };
    patchSkills(next);
    return;
  }

  // base → aced
  if (cur?.base && !cur?.aced) {
    const cost = skill.req_points?.aced ?? 0;
    if (totalPoints + cost > MAX_SKILL_POINTS) return;

    next[skill.key] = { base: true, aced: true };
    patchSkills(next);
    return;
  }

  // aced → nada
}

  function calculateEquippedBelowTier(
  group,
  skillsState,
  maxTier
) {
  if (!group?.trees || !skillsState) return 0;

  let count = 0;

  group.trees.forEach(tree => {
    tree.skills.forEach(skill => {
      const tier = getSkillTier(skill);

      // ❗ solo tiers inferiores
      if (tier >= maxTier) return;

      const state = skillsState[skill.key];
      if (!state) return;

      if (state.aced) count += 2;
      else if (state.base) count += 1;
    });
  });

  return count;
}

function breaksTierIntegrity(group, skillsState) {
  if (!group?.trees) return false;

  return group.trees.some(tree =>
    tree.skills.some(skill => {
      const state = skillsState[skill.key];
      if (!state) return false;

      const tier = getSkillTier(skill);
      if (tier <= 1) return false;

      const equippedBelow =
        calculateEquippedBelowTier(
          group,
          skillsState,
          tier
        );

      const required =
        tier === 2 ? 2 :
        tier === 3 ? 5 :
        tier === 4 ? 8 :
        0;

      return equippedBelow < required;
    })
  );
}


  function cycleDown(skill) {
  const cur = build.skills?.[skill.key];
  if (!cur) return;

  const simulatedSkills = { ...(build.skills || {}) };

  if (cur.aced) {
    simulatedSkills[skill.key] = { base: true, aced: false };
  } else if (cur.base) {
    delete simulatedSkills[skill.key];
  }

  const invalid = breaksTierIntegrity(activeGroup, simulatedSkills);
  if (invalid) return;

  patchSkills(simulatedSkills);
}


function getCycleUpDisabledReason(skill, curState) {
  const tier = getSkillTier(skill);

  if (!isTierUnlocked(tier, groupEquipped)) {
  return `Tier ${tier} locked`;
}


  if (curState?.aced) return null;

  if (curState?.base) {
    const cost = skill.req_points?.aced ?? 0;
    if (totalPoints + cost > MAX_SKILL_POINTS) {
      return `Skill points: ${totalPoints}/${MAX_SKILL_POINTS}`;
    }
    return null;
  }

  const cost = skill.req_points?.base ?? 0;
  if (totalPoints + cost > MAX_SKILL_POINTS) {
    return `Skill points: ${totalPoints}/${MAX_SKILL_POINTS}`;
  }

  return null;
}

function getCycleDownDisabledReason(skill) {
  const cur = build.skills?.[skill.key];
  if (!cur) return null;

  const simulated = { ...(build.skills || {}) };

  if (cur.aced) simulated[skill.key] = { base: true, aced: false };
  else delete simulated[skill.key];

  const invalid = breaksTierIntegrity(activeGroup, simulated);
  if (invalid) return "Removing this skill would lock an active tier";

  return null;
}


  function openInfo(skill) {
    setSelectedSkillKey(skill.key);
    setModalOpen(true);
  }

  function selectForDetails(skill) {
    setSelectedSkillKey(skill.key);
  }


  function calculateGroupPoints(group, skillsState) {
  if (!group?.trees || !skillsState) return 0;

  return group.trees.reduce((sum, tree) => {
    return (
      sum +
      tree.skills.reduce((treeSum, skill) => {
        const state = skillsState[skill.key];
        if (!state) return treeSum;

        const base = skill.req_points?.base ?? 0;
        const aced = skill.req_points?.aced ?? 0;

        if (state.aced) return treeSum + base + aced;
        if (state.base) return treeSum + base;

        return treeSum;
      }, 0)
    );
  }, 0);
}
function calculateGroupEquippedSkills(group, skillsState) {
  if (!group?.trees || !skillsState) return 0;

  let count = 0;

  group.trees.forEach(tree => {
    tree.skills.forEach(skill => {
      const state = skillsState[skill.key];
      if (!state) return;

      if (state.aced) {
        count += 2;
      } else if (state.base) {
        count +=1;
      }
    });
  });

  return count;
}

const groupEquipped = useMemo(() => {
  return calculateGroupEquippedSkills(activeGroup, build.skills);
}, [activeGroup, build.skills]);


function isTierUnlocked(tier, equippedSkills) {
  switch (tier) {
    case 1:
      return true;
    case 2:
      return equippedSkills >= 2;
    case 3:
      return equippedSkills >= 5;
    case 4:
      return equippedSkills >= 8;
    default:
      return false;
  }
}

function calculateGroupEquippedForTiers(group, skillsState) {
  if (!group?.trees || !skillsState) return 0;

  let count = 0;

  group.trees.forEach(tree => {
    tree.skills.forEach(skill => {
      const state = skillsState[skill.key];
      if (!state) return;

      if (state.aced) count += 2;
      else if (state.base) count += 1;
    });
  });

  return count;
}

function hasActiveSkillsInLockedTiers(group, skillsState, equippedForTiers) {
  if (!group?.trees) return false;

  return group.trees.some(tree =>
    tree.skills.some(skill => {
      const state = skillsState[skill.key];
      if (!state) return false;

      const tier = getSkillTier(skill);
      return !isTierUnlocked(tier, equippedForTiers);
    })
  );
}

function getSkillTier(skill) {
  const pos = Number(skill.position);

  if (pos === 1) return 1;
  if (pos === 2 || pos === 3) return 2;
  if (pos === 4 || pos === 5) return 3;
  if (pos === 6) return 4;

  return 1;
}

const groupPointsById = useMemo(() => {
  const map = {};

  uiIndex.forEach(group => {
    map[group.groupId] = calculateGroupPoints(group, build.skills);
  });

  return map;
}, [uiIndex, build.skills]);


function clearActiveGroupSkills() {
  if (!activeGroup) return;

  setBuild(prev => {
    const nextSkills = { ...(prev.skills || {}) };

    activeGroup.trees.forEach(tree => {
      tree.skills.forEach(skill => {
        delete nextSkills[skill.key];
      });
    });

    return {
      ...prev,
      skills: nextSkills,
    };
  });
}

function clearAllSkills() {
  setBuild(prev => ({
    ...prev,
    skills: {},
  }));
}



  if (!activeGroup) return null;

  return (
  <div className={styles.wrapper}>
    {/* Header */}
    <div className={styles.header}>
      <div className={styles.headerInfo}>
        <div className={styles.pointsSpent}>
          <div className={styles.title}>// TOTAL SKILL POINTS: </div>
          <div className={styles.points}>{totalPoints}</div>
          <div>(Max. {MAX_SKILL_POINTS})</div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={clearActiveGroupSkills}
          >
            CLEAR GROUP
          </button>

          <button
            type="button"
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={clearAllSkills}
          >
            CLEAR ALL
          </button>
        </div>


      </div>

      {/* Group selector */}
      <div className={styles.groupSelector}>
        {uiIndex.map((g) => {
          const points = groupPointsById[g.groupId] ?? 0;

          return (
            <div key={g.groupId} className={styles.groupItem}>
              <button
                type="button"
                onClick={() => {
                  setActiveGroupId(g.groupId);
                  setSelectedSkillKey(null);
                  setActiveTreeIndex(0);
                  swiperInstance?.slideTo(0, 0);
                }}
                className={`${styles.groupButton} ${
                  g.groupId === activeGroupId ? styles.groupButtonActive : ""
                }`}
              >
                <SkillGroupSprite spritePos={g.sprite} height={18} />
                <span>{g.name?.toUpperCase()}</span>
              </button>

              <div className={styles.groupPoints}>{points}</div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Body */}
    <div
      className={`${styles.body} ${
        isMobile ? styles.bodyMobile : styles.bodyDesktop
      }`}
    >
      {/* Trees */}
      <div className={styles.treesWrapper}>
        {!isMobile ? (
          <div className={styles.treesGrid}>
            {activeGroup.trees.map((tree, idx) => {
              const treeBgUrl = `/bg/groupbg-${activeGroup.groupId}-${idx + 1}-v1.svg`;
              return (
              <div
                key={tree.treeId}
                className={styles.treeCard}
                  style={{
                    "--tree-bg": `url(${treeBgUrl})`,
                    "--tier-col-width": "32px",
                    "--bg-offset-y": "12px",
                  }}
              >
                <SkillTreeGrid
                  tree={tree}
                  skillsState={build.skills || {}}
                  isMobile={false}
                  groupEquipped={groupEquipped}
                  isTierUnlocked={isTierUnlocked}
                  getSkillTier={getSkillTier}
                  getCycleUpDisabledReason={getCycleUpDisabledReason}
                  getCycleDownDisabledReason={getCycleDownDisabledReason}
                  onCycleUpSkill={cycleUp}
                  onCycleDownSkill={cycleDown}
                  onSelectSkill={selectForDetails}
                  onOpenInfo={openInfo}
                />
              </div>
              )
              })}
          </div>
        ) : (
          <Swiper
            onSwiper={setSwiperInstance}
            spaceBetween={12}
            slidesPerView={1}
            threshold={10}
            touchStartPreventDefault
            preventClicks
            preventClicksPropagation
            onSlideChange={(swiper) => {
              setActiveTreeIndex(swiper.activeIndex);
            }}
          >
            {activeGroup.trees.map((tree, idx) => {
          const treeBgUrl = `/bg/groupbg-${activeGroup.groupId}-${idx + 1}-v1.svg`;

            return (
              <SwiperSlide key={tree.treeId}>
                <div
                  className={styles.treeCard}
                    style={{
                      "--tree-bg": `url(${treeBgUrl})`,
                      "--tier-col-width": "32px",
                      "--bg-offset-y": "12px",
                    }}
                >

                  <div className={styles.treeIndicator}>
                    {activeTreeIndex + 1} / {activeGroup.trees.length}
                  </div>

                  <SkillTreeGrid
                    tree={tree}
                    skillsState={build.skills || {}}
                    isMobile={true}
                    groupEquipped={groupEquipped}
                    isTierUnlocked={isTierUnlocked}
                    getSkillTier={getSkillTier}
                    getCycleUpDisabledReason={getCycleUpDisabledReason}
                    getCycleDownDisabledReason={getCycleDownDisabledReason}
                    onCycleUpSkill={cycleUp}
                    onCycleDownSkill={cycleDown}
                    onSelectSkill={selectForDetails}
                    onOpenInfo={openInfo}
                  />
                </div>
              </SwiperSlide>
              )
            })}
          </Swiper>
        )}
      </div>

      {/* Details desktop */}
      {!isMobile && (
        <aside className={styles.detailsAside}>
          <SkillDetailsPanel
            skill={selectedSkill}
            showAced={showAcedInDetails}
          />
        </aside>
      )}
    </div>

    {/* Modal mobile */}
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
