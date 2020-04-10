export interface LocationSymptom {
  ID: string;
  Name: string;
  HasRedFlag: string;
  HealthSymptomLocationIDs: Array<number>;
  Synonyms: Array<any>;
}
