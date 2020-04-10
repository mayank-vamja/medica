import { TestBed } from '@angular/core/testing';

import { ApiMedicService } from './api-medic.service';

describe('ApiMedicService', () => {
  let service: ApiMedicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiMedicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
