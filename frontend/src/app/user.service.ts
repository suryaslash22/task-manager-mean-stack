import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private webReqService: WebRequestService) { }

  getUsers() {
    return this.webReqService.get('users');
  }

  changeUserEmail(userId: string, newEmail: string){
    return this.webReqService.put(`admin/users/${userId}/change-email`, { newEmail });
  }

  changeUserPw(userId: string, newPassword: string){
    return this.webReqService.put(`admin/users/${userId}/change-password`, { newPassword });
  }

  makeUserAdmin(userId: string){
    return this.webReqService.post(`admin/users/${userId}/make-admin`, { userId });
  }

  deleteUser(userId: string){
    return this.webReqService.delete(`admin/users/${userId}/delete-user`);
  }
}
