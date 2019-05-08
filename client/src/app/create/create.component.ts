import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router'
declare var iziToast: any;
declare var $: any;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  constructor(private service: AppService, private rout: Router) { }
  description: any;
  status: any;
  title: any;
  fileToUpload: File = null;
  ngOnInit() {
    $(document).ready(function () {
      $("#txtEditor").Editor();
    });
  }
  createIssue() {
    this.service.createIssue(
      {
        status: this.status,
        title: this.title,
        description: $("#txtEditor").Editor("getText")
      }, this.fileToUpload
    ).subscribe(
      data => {
        iziToast.success({
          title: 'Success',
          messege: 'Issue Created'
        })
        this.rout.navigate(['/dashboard']);
      },
      err => {
        iziToast.error({
          title: 'Error',
          message: err.error ? err.error.message : err.message
        })
      }
    )
  }
  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }
}
