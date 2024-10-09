import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CnPipe } from '../../pipes/cn.pipe';
import { filter } from 'rxjs';

@Component({
  selector: 'expl-zs-nav',
  standalone: true,
  imports: [RouterLink, CnPipe],
  templateUrl: './nav.component.html',
  host: { class: 'contents' },
})
export class NavComponent {
  currentRoute = signal(this.router.url);
  currentPage = computed(() => '/' + this.currentRoute().split('/')[0]);

  constructor(private router: Router) {
    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.currentRoute.set(router.url));
  }
}
