import { useTranslation } from "react-i18next";

const LanguageSelector = props => {
  const { i18n } = useTranslation();

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src="https://www.countryflagicons.com/FLAT/64/TR.png"
        title="Türkçe"
        onClick={() => i18n.changeLanguage("tr")}
        alt="Turkish Flag"
        style={{ cursor: "pointer" }}
      />
      <img
        src="https://www.countryflagicons.com/FLAT/64/GB.png"
        title="English"
        onClick={() => i18n.changeLanguage("en")}
        alt="Great Britain Flag"
        style={{ cursor: "pointer" }}
      />
    </div>
  );
};

export default LanguageSelector;
