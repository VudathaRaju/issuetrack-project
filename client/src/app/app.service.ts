import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  login(data) {
    return this.http.post(environment.baseUrl + "/api/login", data)
  }

  signup(data) {
    return this.http.post(environment.baseUrl + "/api/signup", data)
  }
  createIssue(data, fileToUpload: File) {
    var dataToSend = data;
    if (fileToUpload) {
      const formData: FormData = new FormData();
      formData.append('file', fileToUpload, fileToUpload.name);
      formData.append('title', data.title);
      formData.append('description', data.description);
      dataToSend = formData;
    }
    return this.http.post(environment.baseUrl + "/api/v1/issue", dataToSend)
  }
  getIssueById(id) {
    return this.http.get(environment.baseUrl + "/api/v1/issue/" + id)
  }
  getAllIssue(q) {
    var url = q ? "/api/v1/issues?q=" + q : '/api/v1/issues';
    return this.http.get(environment.baseUrl + url)
  }
  saveIssueComment(issueId, data) {
    return this.http.post(environment.baseUrl + '/api/v1/issue/comment/' + issueId, data);
  }
  addIssueAssignee(issueId, data) {
    return this.http.put(environment.baseUrl + '/api/v1/issue/assign/' + issueId, data);
  }
  deleteIssueAssignee(issueId, data) {
    return this.http.delete(environment.baseUrl + '/api/v1/issue/assign/' + issueId, data);
  }
  addIssueWatcher(issueId, data) {
    return this.http.put(environment.baseUrl + '/api/v1/issue/watcher/' + issueId, data);
  }
  deleteIssueWatcher(issueId, data) {
    return this.http.delete(environment.baseUrl + '/api/v1/issue/watcher/' + issueId, data);
  }
  getAllIssueAssignee(issueId) {
    return this.http.get(environment.baseUrl + '/api/v1/issue/assignees/' + issueId);
  }
  getAllIssueWatchers(issueId) {
    return this.http.get(environment.baseUrl + '/api/v1/issue/watchers/' + issueId);
  }
  getComments(issueId) {
    return this.http.get(environment.baseUrl + '/api/v1/issue/comments/' + issueId);
  }
  deleteComments(commentId) {
    return this.http.delete(environment.baseUrl + '/api/v1/issue/comment/' + commentId);
  }
  updateIssue(issueId, data) {
    return this.http.put(environment.baseUrl + '/api/v1/issue/' + issueId, data);
  }
  getAllUsers(issueId) {
    return this.http.get(environment.baseUrl + '/api/v1/users');
  }
  findInIssues(q) {
    return this.http.get(environment.baseUrl + "/api/v1/issues?q=" + q);
  }
  addPushSubscriber(sub: any) {
    return this.http.post(environment.baseUrl + '/api/v1/notifications', sub);
  }
  send(data) {
    return this.http.post(environment.baseUrl + '/api/v1/send-notification', data);
  }
  unSubscribe(id) {
    return this.http.post(environment.baseUrl + '/api/v1/unsubscribe', id);
  }
}
