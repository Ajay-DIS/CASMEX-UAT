import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { PaymentModeServiceService } from '../payment-mode-service.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  files1: TreeNode[];
  selectedFile: TreeNode; 
 
  constructor(private nodetree: PaymentModeServiceService) { }

  ngOnInit(): void {
    this.nodetree.getFiles().then((files) => (this.files1 = files));
  }

}
