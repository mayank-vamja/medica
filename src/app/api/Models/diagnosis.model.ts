import { Specialisation } from './specialisation.model';

interface IssueObject {
  ID: number,
  Name: string;
  ProfName: string;
  Ics: string;
  IcsName: string;
  Acuuracy: string;
}

export interface Diagnosis {
  Issue: IssueObject;
  Specialisation: Specialisation[];
}
