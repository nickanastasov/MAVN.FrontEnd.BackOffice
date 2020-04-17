import {Component, OnInit} from '@angular/core';
import {TiersService} from '../tiers.service';
import {Tier} from '../models/tier.interface';
import {Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TOKEN_SYMBOL} from 'src/app/core/constants/const';

@Component({
  selector: 'app-tiers-list',
  templateUrl: './tiers-list.component.html',
  styleUrls: ['./tiers-list.component.scss']
})
export class TiersListComponent implements OnInit {
  loading = true;
  tokenSymbol = TOKEN_SYMBOL;
  tiers: Tier[];
  private getAllSubscription: Subscription;

  constructor(private tiersService: TiersService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.load();
  }

  load() {
    if (this.getAllSubscription) {
      this.getAllSubscription.unsubscribe();
    }

    this.getAllSubscription = this.tiersService.getAll().subscribe(
      response => {
        this.tiers = response;
      },
      () => {
        this.snackBar.open('Something went wrong. Please try again', 'Close');
      },
      () => {
        this.loading = false;
      }
    );
  }
}
