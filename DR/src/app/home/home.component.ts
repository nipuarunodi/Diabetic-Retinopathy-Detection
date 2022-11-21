import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../services/file-upload.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileUpload } from '../models/file-upload.model';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  latestFileUpload: FileUpload = null;
  percentage: number;
  host_url: string; 

  private basePath = '/uploads';

  constructor(
    private uploadService: FileUploadService,
    private db: AngularFireDatabase, 
    private storage: AngularFireStorage,
    private httpClient: HttpClient
    ) {}

  ngOnInit(): void {
  }

  selectFile(event): void {
    this.selectedFiles = event.target.files;
  }
  
  upload(): void {
    this.latestFileUpload = null;
    const file = this.selectedFiles.item(0);
    this.selectedFiles = undefined;
    this.currentFileUpload = new FileUpload(file);
    this.pushFileToStorage(this.currentFileUpload).subscribe(
      (percentage) => {
        this.percentage = Math.round(percentage);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  pushFileToStorage(fileUpload: FileUpload): Observable<number> {
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload);
        });
      })
    ).subscribe();
    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
    
    const timestamp = Date.now()

    fileUpload.timestamp = timestamp;
    fileUpload.prediction = null;
    
    this.db.list(this.basePath).push(fileUpload);
    this.getHostingURL();

    // this.currentFileUpload = fileUpload;
  }

  getHostingURL(){
    this.uploadService.gePredictions().subscribe((res) => {
      this.host_url = res[0].url + '/predict';
      this.httpClient.get(this.host_url).subscribe((response: any) => {
        this.latestFileUpload = response.message;
        console.log(response);
      });
    });
  }

}