import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserRoutingModule} from './user-routing.module';
import {UsersAddComponent} from './users-add/users-add.component';
import {UsersEditComponent} from './users-edit/users-edit.component';
import {UsersFormComponent} from './users-form/users-form.component';
import {UsersListComponent} from './users-list/users-list.component';
import {SharedModule} from '../../shared/shared.module';
import {UserService} from './user.service';

@NgModule({
  declarations: [
    // components
    UsersAddComponent,
    UsersEditComponent,
    UsersFormComponent,
    UsersListComponent
  ],
  imports: [
    // modules
    CommonModule,
    UserRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [UserService]
})
export class UserModule {}
