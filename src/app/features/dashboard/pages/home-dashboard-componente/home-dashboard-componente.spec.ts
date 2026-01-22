import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDashboardComponente } from './home-dashboard-componente';

describe('HomeDashboardComponente', () => {
  let component: HomeDashboardComponente;
  let fixture: ComponentFixture<HomeDashboardComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeDashboardComponente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDashboardComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
