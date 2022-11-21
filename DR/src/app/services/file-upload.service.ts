import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileUpload } from '../models/file-upload.model';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
private basePath = '/uploads';
  constructor(
    private db: AngularFireDatabase, 
    private storage: AngularFireStorage,
    public firestore: AngularFirestore
    ) { }

  getFiles(numberItems: number): AngularFireList<FileUpload> {
    return this.db.list(this.basePath, ref =>
      ref.limitToLast(numberItems));
  }
  
  deleteFile(fileUpload: FileUpload): void {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string): Promise<void> {
    return this.db.list(this.basePath).remove(key);
  }

  private deleteFileStorage(name: string): void {
    const storageRef = this.storage.ref(this.basePath);
    storageRef.child(name).delete();
  }

  gePredictions(): Observable<any> {
    return this.firestore
      .collection('hosting')
      .valueChanges({ idField: 'id' });
  }
}