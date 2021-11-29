import { Component, OnInit, ViewChild} from '@angular/core';
import { Dish} from '../shared/dish';
import { Comment } from '../shared/comment';
import { DISHES } from '../shared/dishes';
import { DishService } from '../services/dish.service';
import { switchMap} from 'rxjs/operators'
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {

  @ViewChild('fform') commentFormDirective!: NgForm;

  formErrors = {
    'author': '',
    'rating': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Name is required',
      'minlength': 'Name must be at least 2 char long'
    }, 
    'comment': {
      'required': 'Comment is required',
      'minlength': 'Comment must be at least 2 char long'
    }
  };

  commentForm: FormGroup;
  usrComment : Comment;


  dish: Dish; 
  dishIds: string[];
  prev: string;
  next: string;


  constructor(private dishService: DishService,
     private route: ActivatedRoute, 
     private location: Location,
     private fb: FormBuilder) {
       this.createForm();
      }

  ngOnInit() {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);

    this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => {this.dish = dish; this.setPrevNext(dish.id) });
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  

  createForm() {
    this.commentForm = this.fb.group({
      author: ['',[Validators.required, Validators.minLength(2)]],
      comment: ['',[Validators.required, Validators.minLength(2)]],
      rating: ['5'],
      date: ''
    });
    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onSubmit() {
    
    this.usrComment = this.commentForm.value;
    console.log(this.usrComment);

    this.usrComment.date = new Date().toISOString();

    var idCurrent = this.dish.id;

    DISHES.forEach(
      (dish) => {
        if (dish.id = idCurrent) {
          dish.comments.push(this.usrComment);
        }
      }
    )
    console.log(DISHES);
    this.commentForm.reset({
      author: '',
      rating: '5',
      comment: ''
    });
    this.commentFormDirective.resetForm();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }

    const form = this.commentForm;

    for (const field in this.formErrors) {
      if(this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';

        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for ( const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

}
 