import { Component, ViewContainerRef, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfig } from '../../models/field-config.interface';
import { Field } from '../../models/field.interface';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'form-slider',
  templateUrl: './form-slider.component.html',
  styleUrls: ['./form-slider.component.css'],
})
export class FormSliderComponent implements Field, OnInit {
  config: FieldConfig;
  group: FormGroup;
  fieldShow: string;
  public value: any;

  ngOnInit() {
    this.value = this.config.min;
  }

  updateValue($event) {
    this.value = $event.value;
  }
}