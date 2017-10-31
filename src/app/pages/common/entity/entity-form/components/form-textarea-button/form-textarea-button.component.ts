import {Component, ViewContainerRef} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {FieldConfig} from '../../models/field-config.interface';
import {Field} from '../../models/field.interface';
import {TooltipComponent} from '../tooltip/tooltip.component';

@Component({
  selector : 'form-textarea-button',
  templateUrl : './form-textarea-button.component.html',
  styleUrls : [ '../dynamic-field/dynamic-field.css' ],
})
export class FormTextareaButtonComponent implements Field {
  config: FieldConfig;
  group: FormGroup;
  fieldShow: string;

  customEventMethod($event) {

    if( this.config.customEventMethod !== undefined && this.config.customEventMethod != null) {
      this.config.customEventMethod({ event:  $event, data: {}  });
    }

    $event.preventDefault();

  }
}
