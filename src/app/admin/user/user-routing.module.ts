import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {UsersListComponent} from './users-list/users-list.component';
import {UsersAddComponent} from './users-add/users-add.component';
import {UsersEditComponent} from './users-edit/users-edit.component';

const routes: Routes = [
  {
    path: '',
    component: UsersListComponent
  },
  {
    path: 'add-admin-user',
    component: UsersAddComponent
  },
  {
    path: 'edit-admin-user/:id',
    component: UsersEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
