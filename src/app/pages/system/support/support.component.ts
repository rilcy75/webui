import {ApplicationRef, Component, Injector} from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';

import {

  Validators
} from '@angular/forms';
import {Router} from '@angular/router';
import * as _ from 'lodash';

import {RestService, WebSocketService} from '../../../services/';
import {
  FieldConfig
} from '../../common/entity/entity-form/models/field-config.interface';
import { EntityJobComponent } from '../../common/entity/entity-job/entity-job.component';
import { MatDialog } from '@angular/material';
import { T } from '../../../translate-marker';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector : 'app-support',
  template : `
  <entity-form [conf]="this"></entity-form>
  `
})


export class SupportComponent  {
  public username: any;
  public password: any;
  public categories: any;
  public attach_debug: any;
  public title: any;
  public body: any;
  public type: any;
  public category: any;
  public payload = {};
  public entityEdit: any;
  public route_success: string[] = ['system','support'];
  public route_cancel: string[] = ['system'];
  public saveSubmitText = "Submit";
  public registerUrl = " https://redmine.ixsystems.com/account/register"


  public fieldConfig: FieldConfig[] = [
    {
      type: 'paragraph',
      name: 'support_text',
      paraText: this.sanitizer.bypassSecurityTrustHtml(
        "Before filing a bug report or feature request, search https://redmine.ixsystems.com/projects/freenas to ensure the issue has not already been reported. If it has, add a comment to the existing issue instead of creating a new one. For enterprise-grade storage solutions and support, please visit http://www.ixsystems.com/storage/. <br><br> A Redmine account is required to file an issue. Make an account at https://redmine.ixsystems.com/account/register. Use a valid email address when registering to receive issue status updates.")
    },

    {
      type : 'input',
      name : 'username',
      placeholder : T('Username'),
      tooltip : T('Enter a valid username for the <a\
                   href="https://redmine.ixsystems.com/projects/freenas/issues"\
                   target="_blank">FreeNAS bug tracking system</a>'),
      required: true,
      validation : [ Validators.required ],
    },
    {
      type : 'input',
      name : 'password',
      inputType : 'password',
      placeholder : T('Password'),
      tooltip : T('Enter the bug tracker account password.',),
      required: true,
      validation : [ Validators.required ],
      blurStatus : true,
      blurEvent : this.blurEvent,
      parent : this,
      hideButton : false
    },
    {
      type : 'select',
      name : 'type',
      placeholder : T('Type'),
      tooltip : T('Select <i>Bug</i> when reporting an issue or\
                   <i>Feature</i> when requesting new functionality.'),
      options:[
        {label: 'bug', value: 'BUG'},
        {label: 'feature', value: 'FEATURE'}
      ]
    },
    {
      type : 'select',
      name : 'category',
      placeholder : T('Category'),
      tooltip : T('This field remains empty until a valid\
                   <b>Username</b> and <b>Password</b> is entered.\
                   Choose the category that best describes the bug or\
                   feature being reported.'),
      required: true,
      validation : [ Validators.required ],
      options:[]
    },
    {
      type : 'checkbox',
      name : 'attach_debug',
      placeholder : T('Attach Debug'),
      tooltip : T('Set to generate and attach to the new issue a report\
                   containing an overview of the system hardware, build\
                   string, and configuration. This can take several\
                   minutes.'),
    },
    {
      type : 'input',
      name : 'title',
      placeholder : T('Subject'),
      tooltip : T('Enter a descriptive title for the new issue.'),
      required: true,
      validation : [ Validators.required ]
    },
    {
      type : 'textarea',
      name : 'body',
      placeholder : T('Description'),
      tooltip : T('Enter a one to three paragraph summary of the issue.\
                   Describe the problem and provide any steps to\
                   replicate the issue.'),
      required: true,
      validation : [ Validators.required ]
    },
  ];
  constructor(protected router: Router, protected rest: RestService,
              protected ws: WebSocketService, protected _injector: Injector,
              protected _appRef: ApplicationRef, protected dialog: MatDialog,
              private sanitizer: DomSanitizer, protected dialogService: DialogService)
              {}

  afterInit(entityEdit: any) {
    this.entityEdit = entityEdit;
    this.category = _.find(this.fieldConfig, {name: "category"});



  }

  customSubmit(entityEdit): void{
    this.payload['username'] = entityEdit.username;
    this.payload['password'] = entityEdit.password;
    this.payload['category'] = entityEdit.category;
    this.payload['attach_debug'] = entityEdit.attach_debug;
    this.payload['title'] = entityEdit.title;
    this.payload['body'] = entityEdit.body;
    this.payload['type'] = entityEdit.type;

    this.openDialog();
  };

  openDialog() {
    const dialogRef = this.dialog.open(EntityJobComponent, {data: {"title":"Ticket"}});
    dialogRef.componentInstance.setCall('support.new_ticket', [this.payload]);
    dialogRef.componentInstance.submit();
    dialogRef.componentInstance.success.subscribe(res=>{
      dialogRef.componentInstance.setDescription(res.result.url);
    }),
    dialogRef.componentInstance.failure.subscribe((res) => {
      dialogRef.componentInstance.setDescription(res.error);
      this.router.navigate(new Array('/').concat(this.route_success));
    });
  }


  blurEvent(parent){
    this.category = _.find(parent.fieldConfig, {name: "category"});
      if(parent.entityEdit){
        this.username  = parent.entityEdit.formGroup.controls['username'].value;
        this.password  = parent.entityEdit.formGroup.controls['password'].value;
        if(
          !this.username && !this.password ||
          !this.username && this.password ||
          this.username && !this.password ||
          this.username === "" && this.password === "" ){
          return;
        }
          if(this.category.options.length > 0){
            this.category.options = [];
          }
          if(this.category.options.length === 0 ){
            parent.ws.call('support.fetch_categories',[this.username,this.password]).subscribe((res)=>{
              for (const property in res) {
                if (res.hasOwnProperty(property)) {
                  this.category.options.push({label : property, value : res[property]});
                }
              }},(error)=>{
                if(parent.dialogService){
                    parent.dialogService.errorReport(error.error, error.reason,error.trace.formatted);
                }
              });
          }
      }
  }

}
