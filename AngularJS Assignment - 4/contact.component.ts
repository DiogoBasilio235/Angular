import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { flyInOut, hide, visibility, expand } from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';
import { Feedback, ContactType } from '../shared/feedback';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations:[ 
    flyInOut(), 
    visibility(),
    hide(),
    expand()
  ]
})

export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  usrFeedback: Feedback;
  errMess: string;
  usrFBCopy: Feedback;
  contactType = ContactType;
  receivedFeedback: Feedback;
  hideFeedback= true;
  hideForm = false;
  hideSpinner = true;


  @ViewChild('fform') feedbackFormDirective;

  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages = {
    'firstname': {
      'required': 'First name is required',
      'minlength': 'First name miust be at least 2 char long',
      'maxlength': 'First name cannot be more than 25 chars'
    },
    'lastname': {
      'required': 'Last name is required',
      'minlength': 'Last name miust be at least 2 char long',
      'maxlength': 'Last name cannot be more than 25 chars'
    }, 
    'telnum': {
      'required': 'Telephone number is required',
      'pattern': 'Telephone number must contain only numbers'
    },
    'email': {
      'required': 'Email is required',
      'email': 'Email not in valid format'
    }
  };
  
  constructor(private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL,
    private feedbackService : FeedbackService) { 
    this.createForm();
  }

  ngOnInit() {}

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });
    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {

    if(!this.feedbackForm) { 
      return; 
    }

    const form = this.feedbackForm;

    for (const field in this.formErrors) {
      if(this.formErrors.hasOwnProperty(field)) {

        // clear previous error message (any)
        this.formErrors[field] = '';

        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  } 


  onSubmit() {

    this.usrFeedback = this.feedbackForm.value;
    this.hideForm = true;
    this.hideSpinner = false;
    this.feedbackService.submitFeedback(this.usrFeedback)
    .subscribe(feedback=>{
      this.receivedFeedback = feedback;
      this.hideFeedback = false;
      this.hideSpinner = true;
    },
    errmess => {
      this.receivedFeedback = null;
      this.errMess = errmess;
    })
    setTimeout(() => {
      console.log("Removing Feedback");
      this.receivedFeedback = null;
      this.hideFeedback = true;
      this.hideForm = false;
      this.hideSpinner = true;
    }, 5000);

    this.feedbackForm.reset({
      firstname: '',
      lastname: '', 
      telnum: 0,
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });
    this.feedbackFormDirective.resetForm();
  }

}
