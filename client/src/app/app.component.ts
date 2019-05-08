import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { SwPush, SwUpdate } from "@angular/service-worker";
import { AuthService } from './core/auth.service';
import { ReloadIssuesGrid } from './http-client.service';
import { AppService } from './app.service';
declare var iziToast: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'issue-tracker-tool';
  user: any;
  q: any;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute,
    private reloadService: ReloadIssuesGrid,
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private appService: AppService) {
    this.user = this.authService.currentUser;
    this.route.queryParams.subscribe(params => {
      this.q = params['q'];
    });
  }

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("New version available. Load New Version?")) {
          window.location.reload();
        }
      });
    }
  }

  search() {
    this.router.navigate(['/dashboard'], { queryParams: { q: this.q } });
    setTimeout(() => {
      this.reloadService.filter('Register click');
    }, 100);
  }
}
