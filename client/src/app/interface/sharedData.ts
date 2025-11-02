import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedData {
  private dataSubject = new BehaviorSubject<any>(null); // Initialize with `null`
  data$ = this.dataSubject.asObservable();

  updateData(data: any) {
    this.dataSubject.next(data); // Update the data
  }
}
