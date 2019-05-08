import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { AppService } from '../app.service'
import { ReloadIssuesGrid } from '../http-client.service';
declare var iziToast: any;
declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private rout: Router, private service: AppService, private route: ActivatedRoute,
    private reloadService: ReloadIssuesGrid) {
    this.reloadService.listen().subscribe((m: any) => {
      this.reloadGrid(m);
    })
  }
  status: any;
  title: any;
  reporter: any;
  date: any;
  allIssues: any;
  comment: any;
  issuId: any;
  q: any;
  reloadGrid(event) {
    this.allIssues = [];
    this.getIssues();
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.q = params['q'];
    });
    this.getIssues();
  }
  getIssues() {
    this.service.getAllIssue(this.q).subscribe(
      (data: any) => {
        this.allIssues = data.data;
        setTimeout(() => {
          $('#myTable').DataTable();
        }, 50);
      },
      err => {
        iziToast.error({
          title: "Error",
          message: err.error ? err.error.message : err.message
        })
      }
    )
  }
  create() {
    this.rout.navigate(['/create']);
  }
  issueDetail(issue) {
    this.rout.navigate(['/issue-detail', issue._id]);
  }

}
