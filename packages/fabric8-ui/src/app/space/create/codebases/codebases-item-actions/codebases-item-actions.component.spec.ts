import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Broadcaster, Notifications } from 'ngx-base';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Observable, of as observableOf, throwError as observableThrowError } from 'rxjs';
import { CheService } from '../services/che.service';
import { CodebasesService } from '../services/codebases.service';
import { GitHubService } from '../services/github.service';
import { WorkspacesService } from '../services/workspaces.service';
import { CodebasesItemActionsComponent } from './codebases-item-actions.component';

describe('Codebases Item Actions Component', () => {
  let dialogMock: any;
  let gitHubServiceMock: any;
  let notificationMock: any;
  let fixture;
  let broadcasterMock: any;
  let cheServiceMock: any;
  let workspacesServiceMock: any;
  let codebasesServiceMock: any;

  beforeEach(() => {
    gitHubServiceMock = jasmine.createSpy('GitHubService');
    dialogMock = jasmine.createSpyObj('bs-modal', ['show', 'hide']);
    notificationMock = jasmine.createSpyObj('Notifications', ['message']);
    broadcasterMock = jasmine.createSpyObj('Broadcaster', ['broadcast', 'on']);
    cheServiceMock = jasmine.createSpyObj('CheService', ['getState']);
    workspacesServiceMock = jasmine.createSpyObj('WorkspacesService', ['createWorkspace']);
    codebasesServiceMock = jasmine.createSpyObj('CodebasesService', ['deleteCodebase']);

    TestBed.configureTestingModule({
      imports: [FormsModule, ModalModule.forRoot()],
      declarations: [CodebasesItemActionsComponent],
      providers: [
        {
          provide: Broadcaster,
          useValue: broadcasterMock,
        },
        {
          provide: CheService,
          useValue: cheServiceMock,
        },
        {
          provide: WorkspacesService,
          useValue: workspacesServiceMock,
        },
        {
          provide: CodebasesService,
          useValue: codebasesServiceMock,
        },
        {
          provide: GitHubService,
          useValue: gitHubServiceMock,
        },
        {
          provide: Notifications,
          useValue: notificationMock,
        },
      ],
      // Tells the compiler not to error on unknown elements and attributes
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(CodebasesItemActionsComponent);
    cheServiceMock.getState.and.returnValue(
      observableOf({ clusterFull: false, multiTenant: true, running: true }),
    );
  });

  it('Create Workspace successfully', async(() => {
    // given
    let comp = fixture.componentInstance;
    comp.codebase = { id: '6f5b6738-170e-490e-b3bb-d10f56b587c8' };
    const workspaceLinks = {
      links: {
        open: 'http://somehwere.com',
      },
    };
    workspacesServiceMock.createWorkspace.and.returnValue(observableOf(workspaceLinks));
    const notificationAction = { name: 'created' };
    notificationMock.message.and.returnValue(observableOf(notificationAction));
    broadcasterMock.broadcast.and.returnValue();
    broadcasterMock.on.and.returnValue(observableOf({ running: true }));
    fixture.detectChanges();
    // when
    comp.createWorkspace();
    fixture.detectChanges();
    // then
    expect(notificationMock.message).toHaveBeenCalled();
    expect(broadcasterMock.broadcast).toHaveBeenCalled();
  }));

  it('Create Workspace in error', async(() => {
    // given
    let comp = fixture.componentInstance;
    comp.codebase = { id: '6f5b6738-170e-490e-b3bb-d10f56b587c8' };
    workspacesServiceMock.createWorkspace.and.returnValue(observableThrowError('ERROR'));
    const notificationAction = { name: 'ERROR' };
    notificationMock.message.and.returnValue(observableOf(notificationAction));
    broadcasterMock.on.and.returnValue(observableOf({ running: true }));
    fixture.detectChanges();
    // when
    comp.createWorkspace();
    fixture.detectChanges();
    // then
    expect(notificationMock.message).toHaveBeenCalled();
  }));

  it('Create Workspace with capacity full', async(() => {
    // given
    let comp = fixture.componentInstance;
    cheServiceMock.getState.and.returnValue(
      observableOf({ clusterFull: true, multiTenant: true, running: true }),
    );
    const notificationAction = { name: 'ERROR' };
    notificationMock.message.and.returnValue(observableOf(notificationAction));
    fixture.detectChanges();
    // when
    comp.createWorkspace();
    fixture.detectChanges();
    // then
    expect(notificationMock.message).toHaveBeenCalled();
  }));

  it('Delete codebase successfully', async(() => {
    // given
    let comp = fixture.componentInstance;
    comp.codebase = { id: '6f5b6738-170e-490e-b3bb-d10f56b587c8' };
    comp.deleteCodebaseDialog = dialogMock;
    codebasesServiceMock.deleteCodebase.and.returnValue(observableOf(comp.codebase));
    broadcasterMock.on.and.returnValue(observableOf({ running: true }));
    //  broadcasterMock.on.and.returnValue(Observable.of(code));
    fixture.detectChanges();
    // when
    comp.deleteCodebase();
    fixture.detectChanges();
    expect(broadcasterMock.broadcast).toHaveBeenCalled();
  }));

  it('Delete codebase error', async(() => {
    // given
    let comp = fixture.componentInstance;
    comp.codebase = { id: '6f5b6738-170e-490e-b3bb-d10f56b587c8' };
    comp.deleteCodebaseDialog = dialogMock;
    codebasesServiceMock.deleteCodebase.and.returnValue(observableThrowError('ERROR'));
    const notificationAction = { name: 'ERROR' };
    notificationMock.message.and.returnValue(observableOf(notificationAction));
    broadcasterMock.on.and.returnValue(observableOf({ running: true }));
    fixture.detectChanges();
    // when
    comp.deleteCodebase();
    fixture.detectChanges();
    // then
    expect(notificationMock.message).toHaveBeenCalled();
  }));
});
