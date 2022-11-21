import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../services/file-upload.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  fileUploads: any[];
  selectedFile: any = null;

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
    this.uploadService.getFiles(100).snapshotChanges().pipe(
      map(changes =>
        // store the key
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(fileUploads => {
      this.fileUploads = fileUploads;
    });
  }

  deleteFileUpload(fileUpload): void {
    this.uploadService.deleteFile(fileUpload);
  }

  openModal(fileUpload): void {
    this.selectedFile = fileUpload;
  }
}
