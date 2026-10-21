import { useMemo, useState } from "react";
import loadoutData from "../../../data/payday3_loadout_items.json";
import perksData from "../../../data/perksData.js";
import { formatWeaponTypeLabel } from "../../../utils/searchPresentation.utils";
import {
  findWeaponPerkCombinations,
  getWeaponPerkSources,
} from "./utils/weaponPerkCombinations";
import WeaponPerkSearchPicker from "./WeaponPerkSearchPicker";
import styles from "./PerkDetailsSection.module.scss";
import PerkDescriptionText from "../../../components/PerkDescriptionText.jsx";

function getOverkillName(weaponKey) {
  if (!weaponKey) return null;
  const item = Object.values(loadoutData?.overkill ?? {}).find(
    (entry) => entry?.key === weaponKey
  );
  return item?.name ?? weaponKey;
}

function getSourceName(source) {
  if (source.kind === "iconic" || source.count === 1) return source.name;
  return `Any ${formatWeaponTypeLabel(source.weaponType)}`;
}

function PerkSource({ source, showPerk = false }) {
  return (
    <span className={styles.sourceName}>
      {getSourceName(source)}
      {source.kind === "iconic" && (
        <span className={styles.iconicTag}>Iconic</span>
      )}
      {showPerk && <span className={styles.sourcePerk}>[{perksData[source.perkKey]?.name ?? source.perkKey}]</span>}
    </span>
  );
}

function PerkAvailability({ sources }) {
  if (!sources.length) return <span className={styles.metaValue}>—</span>;

  return (
    <div className={styles.availability}>
      {['primary', 'secondary'].map((slot) => {
        const options = sources.filter((source) => source.slot === slot);
        if (!options.length) return null;
        return (
          <div key={slot} className={styles.availabilitySlot}>
            <span className={styles.slotName}>{slot}</span>
            <div className={styles.availabilityOptions}>
              {options.map((source) => (
                <span className={styles.availabilityOption} key={source.key}>
                  <PerkSource source={source} />
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const weaponPerks = Object.values(perksData)
  .filter((option) => option.scope === 'weapon' && option.optionType === 'perk')
  .sort((a, b) => a.name.localeCompare(b.name));

function PerkCombinationsFinder({ firstPerk }) {
  const [secondKey, setSecondKey] = useState('');
  const secondPerk = perksData[secondKey];
  const combinations = useMemo(
    () => secondPerk
      ? findWeaponPerkCombinations(firstPerk, secondPerk, loadoutData)
      : [],
    [firstPerk, secondPerk]
  );

  return (
    <section className={styles.finder} aria-label="Find Perk Combinations">
      <h3 className={styles.finderTitle}>Find Perk Combinations</h3>
      <p className={styles.finderDescription}>
        Choose a second Weapon Perk to see every compatible Primary + Secondary combination.
      </p>
      <div className={styles.pickerRow}>
        <div className={styles.selectedPerk}>
          <span className={styles.pickerLabel}>First perk</span>
          <strong>{firstPerk.name}</strong>
        </div>
        <div className={styles.pickerField}>
          <WeaponPerkSearchPicker
            id="catalog-second-weapon-perk"
            label="Second perk"
            perks={weaponPerks.filter((option) => option.key !== firstPerk.key)}
            value={secondKey}
            onChange={setSecondKey}
          />
        </div>
      </div>

      {secondPerk && (
        <div className={styles.finderResults} aria-live="polite">
          <h4 className={styles.resultsTitle}>
            {combinations.length} {combinations.length === 1 ? 'combination' : 'combinations'} available
          </h4>
          {combinations.length ? (
            <div className={styles.combinationList}>
              {combinations.map(({ primary, secondary }) => (
                <div
                  className={styles.combination}
                  key={`${primary.perkKey}/${primary.key}|${secondary.perkKey}/${secondary.key}`}
                >
                  <div className={styles.combinationSide}>
                    <span className={styles.slotName}>Primary</span>
                    <PerkSource source={primary} showPerk />
                  </div>
                  <span className={styles.combinationPlus} aria-hidden="true">+</span>
                  <div className={styles.combinationSide}>
                    <span className={styles.slotName}>Secondary</span>
                    <PerkSource source={secondary} showPerk />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyResult}>
              These perks cannot be equipped together with the available Primary and Secondary weapons.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default function PerkDetailsSection({ perk }) {
  const sources = useMemo(() => getWeaponPerkSources(perk, loadoutData), [perk]);
  if (!perk) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.metaGrid}>
        {perk.scope === "weapon" && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Available for</span>
            <PerkAvailability sources={sources} />
          </div>
        )}

        {perk.scope === "overkill" && (
          <>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Overkill Weapon</span>
              <span className={styles.metaValue}>
                {getOverkillName(perk.weaponKey)}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Configuration slot</span>
              <span className={styles.metaValue}>{perk.slotLabel}</span>
            </div>
          </>
        )}
      </div>

      <div className={`${styles.description} ${perk.equipped ? styles.equipped : perk.persistent ? styles.persistent : ""}`}>
        <PerkDescriptionText description={perk.description} />
      </div>

      {perk.scope === 'weapon' && perk.optionType === 'perk' && (
        <PerkCombinationsFinder key={perk.key} firstPerk={perk} />
      )}
    </div>
  );
}
