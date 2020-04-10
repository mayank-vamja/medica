export const GET_AUTH_TOKEN_URL = "https://sandbox-authservice.priaid.ch/login";
export const API_MEDIC_BASE_URL = "https://sandbox-healthservice.priaid.ch/";

export default {
  API_ENDPOINTS: {
    /* language=en-gb for English */
    getAllSymptoms: "symptoms?token={token}&language={language}",
    symptoms: "symptoms?token={token}&language={language}&sysmtoms={symtoms}",
    issues: "issues?token={token}&language={language}",
    diagnosis:
      "diagnosis?token={token}&language={language}&symptoms={symptoms}&gender={gender}&year_of_birth={yearOfBirth}",
    bodyLocations: "body/locations?token={token}&language={language}",
    bodySubLocations:
      "body/locations/{locationId}?token={token}&language={language}",
    symptomsInLocation:
      "symptoms/{locationId}/{selectorStatus}?token={token}&language={language}",
    // selectorStatus : man / woman / boy / girl
    issueInfo: "issues/{issueId}/info?token={token}&language={language}",
    proposedSymptoms:
      "symptoms/proposed?token={token}&language={language}&symptoms={symptoms}&gender={gender}&year_of_birth={yearOfBirth}",
    redFlagText:
      "redflag?symptomId={symptomId}&token={token}&language={language}",
    specialisations:
      "diagnosis/specialisations?token={token}&language={language}&symptoms={symptoms}&gender={gender}&year_of_birth={yearOfBirth}",
    allSpecisalisations: "specialisations?token={token}&language={language}",
  },
};

export const GET_ALL_SYMPTOMS = "getAllSymptoms"
export const SYMPTOMS = "symptoms"
export const ISSUES = "issues"
export const DIAGNOSIS = "diagnosis"
export const BODY_LOCATIONS = "bodyLocations"
export const BODY_SUB_LOCATIONS = "bodySubLocations";
export const SYMPTOMS_IN_LOCATION = "symptomsInLocation";
export const ISSUE_INFO = "issueInfo";
export const PROPOSED_SYMPTOMS = "proposedSymptoms";
export const RED_FLAG_TEXT = "redFlagText";
export const SPECIALISATIONS = "specialisations";
export const ALL_SPECIALISATIONS = "allSpecisalisations";