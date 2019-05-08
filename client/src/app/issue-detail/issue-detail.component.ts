import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { SwPush, SwUpdate } from "@angular/service-worker";
import { AppService } from '../app.service'
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';
declare var iziToast: any;
declare var $: any;
@Component({
  selector: 'app-issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnInit {

  constructor(private rout: Router,
    private authService: AuthService,
    private service: AppService,
    private route: ActivatedRoute,
    private swPush: SwPush,
    private swUpdate: SwUpdate) { }
  status: any;
  title: any;
  reporter: any;
  date: any;
  allIssues: any;
  comment: any;
  issuId: any;
  issueData: any;
  allComments: any;
  editor: any;
  allAssignee: any;
  allWatcher: any;
  assignee: any;
  watcher: any;
  allUsers: any;
  editText: any;
  accessType: string;
  watching: any;
  fileDownloadUrl: any;
  statusUpdate: any;
  currentUser: any;
  show: any;
  ngOnInit() {
    this.currentUser = this.authService.currentUser.user_id;
    this.issuId = this.route.snapshot.paramMap.get('id')
    if (!this.issuId) {
      return iziToast.error({
        title: "Error",
        message: 'Issue ID was not found in URL'
      }
      )
    }
    this.status = "select"
    this.assignee = '';
    this.watcher = '';
    this.getIssue()
    this.getComments();

    this.getAllUsers();
    this.subscribeToNotifications();
  }
  addComment() {
    this.service.saveIssueComment(this.issuId, { comment: this.comment }).subscribe(
      data => {
        iziToast.success({
          title: "Success",
          message: "Comment Added"
        })
        this.getComments();
        this.sendNewsletter({
          title: 'New Comment Added',
          body: this.comment,
          url: window.location.href,
          issue_id: this.issuId
        });
        this.comment = '';
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        }
        )
      }
    )
  }
  getComments() {
    this.service.getComments(this.issuId).subscribe(
      (data: any) => {
        this.allComments = data.data;
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        }
        )
      }
    )
  }
  deleteComment(commentId) {
    if (!confirm("Are you sure You Want to delete?"))
      return;
    this.service.deleteComments(commentId).subscribe(
      data => {
        iziToast.success({
          title: "Success",
          message: "Comment Deleted"
        })
        this.getComments();
        this.sendNewsletter({
          title: 'Comment Deleted ',
          body: '',
          url: window.location.href,
          issue_id: this.issuId
        });
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        }
        )
      }
    )

  }

  cancelUpdate() {
    this.editor = false;
    $(".Editor-container").remove();
  }
  statusChange() {
    this.statusUpdate = this.status == 'select' ? this.issueData.status : this.status;
    this.service.updateIssue(this.issuId, { status: this.statusUpdate }).subscribe(
      data => {

        iziToast.success({
          title: "Success",
          message: "Issue Updated"
        })
        this.getIssue()
        this.status = 'select';
        this.sendNewsletter({
          title: 'Issue Updated',
          body: this.statusUpdate,
          url: window.location.href,
          issue_id: this.issuId
        });
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        }
        )
      }
    )
  }
  editIssue() {
    var that = this
    this.editor = true;
    this.editText = this.issueData.title;
    this.statusUpdate = this.issueData.status;
    setTimeout(function () {
      $("#txtEditor").Editor();
      setTimeout(function () {
        $("#txtEditor").Editor("setText", that.issueData ? that.issueData.description : '')
      }, 50)
    }, 50)
  }
  updateIssue() {
    this.editor = false;
    this.service.updateIssue(this.issuId, { description: $("#txtEditor").Editor("getText"), title: this.editText, status: this.status }).subscribe(
      data => {
        $(".Editor-container").remove();
        iziToast.success({
          title: "Success",
          message: "Issue Updated"
        })
        this.getIssue()
        this.sendNewsletter({
          title: 'Issue  Detail Updated',
          body: $("#txtEditor").Editor("getText"),
          url: window.location.href,
          issue_id: this.issuId
        });
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        }
        )
      }
    )
  }
  getIssue() {
    this.service.getIssueById(this.issuId).subscribe(
      (data: any) => {

        this.issueData = data.data[0];
        this.accessType = data.accessType;
        this.fileDownloadUrl = environment.baseUrl.concat('/').concat(this.issueData ? this.issueData.attachment : ''
        )
        this.getAssignee();
        this.getWatchers();
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        })
      });
  }

  addAssignee() {
    this.service.addIssueAssignee(this.issuId, { assignee: this.assignee }).subscribe(
      data => {
        iziToast.success({
          title: "Success",
          message: "Assignee Added"
        })
        this.getAssignee();
        this.sendNewsletter({
          title: 'Assignee List Updated',
          body: this.assignee,
          url: window.location.href,
          issue_id: this.issuId
        });
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        }
        )
      }
    )
  }

  addWatcher() {
    this.service.addIssueWatcher(this.issuId, { watcher: this.watcher }).subscribe(
      data => {
        iziToast.success({
          title: "Success",
          message: "Watcher Added"
        })
        this.getWatchers();
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        }
        )
      }
    )
  }

  getAssignee() {
    this.service.getAllIssueAssignee(this.issuId).subscribe(
      (data: any) => {
        this.allAssignee = data.data
        var isExist = this.allAssignee.filter(element => {
          return element._id === this.currentUser
        })
        if ((this.issueData.reporter != this.currentUser) && (isExist.length == 0)) {
          this.show = true
        }
        else {
          this.show = false
        }
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        })
      });
  }

  getWatchers() {
    this.service.getAllIssueWatchers(this.issuId).subscribe(
      (data: any) => {
        this.allWatcher = data.data
        if (this.allWatcher.length == 0) {
          this.watching = false;
          return;
        }
        var array = this.allWatcher.filter(element => {
          return element._id === this.authService.currentUser.user_id
        })

        if (array.length != 0) {
          this.watching = true;
        }
        else {
          this.watching = false;
        }

      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        })
      });
  }

  getAllUsers() {
    this.service.getAllUsers(this.issuId).subscribe(
      (data: any) => {
        this.allUsers = data.data
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        })
      });
  }
  watch() {
    this.watcher = this.authService.currentUser.user_id
    this.addWatcher();
    this.watching = true;
  }
  unwatch() {
    this.watching = false;
    var index = this.allWatcher.indexOf(this.authService.currentUser.user_id)
    this.allWatcher.splice(index, 1);
    {
      this.service.updateIssue(this.issuId, { watcher: this.allWatcher }).subscribe(
        data => {
          iziToast.success({
            title: "Success",
            message: "Removed from watcher"
          })
          this.getIssue()

          this.swPush.unsubscribe()
            .then(function (subscription) {
              console.log(subscription);
            });
          this.service.unSubscribe({ user_id: this.authService.currentUser.user_id }).subscribe()
        },
        err => {
          iziToast.error({
            title: "Error",
            message: err.error ? err.error.message : err.message
          }
          )
        }
      )
    }
  }

  sendNewsletter(data) {
    console.log("Sending Issue notification to all Subscribers ...");
    this.service.send(data).subscribe();
  }

  subscribeToNotifications() {
    this.swPush.requestSubscription({
      serverPublicKey: environment.VAPID_PUBLIC_KEY
    })
      .then(sub => this.service.addPushSubscriber({ sub_data: sub, issue_id: this.issuId, user_id: this.authService.currentUser.user_id }).subscribe())
      .catch(err => console.error("Could not subscribe to notifications", err));
  }
}
