import { useNavigate } from "react-router-dom";
import SkillSection from "../../../components/SkillSection";
import { highlightText } from "../../../utils/highlightText.jsx";
import styles from "./SkillDescriptionResults.module.scss";

export default function SkillDescriptionResults({ skills, query }) {

  const navigate = useNavigate();

  if (!skills?.length) return null;

   return (
    <div className={styles.results}>

      {skills.map((skill) => {

        const highlightedName =
          highlightText(skill.name, query, styles.match);

        return (

          <div key={skill.key} className={styles.skillCard}>

            <div
              className={styles.skillName}
              onClick={() => navigate(`/catalog/${skill.key}`)}
            >
              {highlightedName}
            </div>

            <SkillSection
              skill={skill}
              showMeta={true}
              enableTotals={false}
              textTransform={(node) =>
                highlightText(node, query, styles.match)
              }
            />

          </div>

        );
      })}

    </div>
  );
}