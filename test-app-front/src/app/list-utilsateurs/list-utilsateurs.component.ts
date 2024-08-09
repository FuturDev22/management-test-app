import { Component, OnInit } from '@angular/core';
import { Utilisateur } from '../models/utilisateur.model';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-list-utilsateurs',
  templateUrl: './list-utilsateurs.component.html',
  styleUrls: ['./list-utilsateurs.component.css']
})
export class ListUtilsateursComponent implements OnInit {
  users: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  searchText: string = '';
  page: number = 1;
  pageSize: number = 5;
  totalPages!: number;
  sortDirection: boolean = true;
  showModal: boolean = false;
  editMode: boolean = false;
  currentUser: Utilisateur = { id: 0, name: '', email: '', password: '', role: 'Testeur' };
  showPassword: boolean = false;
  userToDelete: Utilisateur | null = null;

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.utilisateurService.getAllUsers().subscribe(data => {
      this.users = data;
      this.filteredUsers = this.users;
      this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const name = user.name ? user.name.toLowerCase() : '';
      const email = user.email ? user.email.toLowerCase() : '';
      const role = user.role ? user.role.toLowerCase() : '';

      return name.includes(this.searchText.toLowerCase()) ||
             email.includes(this.searchText.toLowerCase()) ||
             role.includes(this.searchText.toLowerCase());
    });

    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.page = 1;
  }

  sortTable(column: string) {
    this.sortDirection = !this.sortDirection;
    this.filteredUsers.sort((a, b) => {
      const aValue = (a as any)[column].toLowerCase();
      const bValue = (b as any)[column].toLowerCase();
      return this.sortDirection ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
  }

  paginatedUsers() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredUsers.slice(start, end);
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  openModal() {
    this.showModal = true;
    this.editMode = false;
    this.currentUser = { id: 0, name: '', email: '', password: '', role: 'Testeur' };
    this.showPassword = false;
  }

  openEditModal(user: Utilisateur) {
    this.showModal = true;
    this.editMode = true;
    this.currentUser = { ...user };
    this.showPassword = false;
  }

  closeModal() {
    this.showModal = false;
  }

  addUser() {
    this.utilisateurService.createUser(this.currentUser).subscribe(user => {
      this.users.push(user);
      this.filterUsers();
      this.closeModal();
    });
  }

  updateUser() {
    if (this.currentUser.id) {
      this.utilisateurService.updateUser(this.currentUser.id, this.currentUser).subscribe(updatedUser => {
        const index = this.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers();
          this.closeModal();
        }
      });
    }
  }

  confirmDelete(user: Utilisateur) {
    this.userToDelete = user;
    const toastElement = document.getElementById('deleteToast');
    if (toastElement) {
      const toast = new (window as any).bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  deleteUser() {
    if (this.userToDelete) {
      this.utilisateurService.deleteUser(this.userToDelete.id!).subscribe(() => {
        this.users = this.users.filter(u => u.id !== this.userToDelete?.id);
        this.filterUsers();
        this.closeToast();
      });
    }
  }

  closeToast() {
    const toastElement = document.getElementById('deleteToast');
    if (toastElement) {
      const toast = new (window as any).bootstrap.Toast(toastElement);
      toast.hide();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  generateRandomPassword(): string {
    const base = 'sopra';
    const randomPart = Math.random().toString(36).substring(2, 8);
    return base + randomPart;
  }
  generateAndSetPassword() {
    this.currentUser.password = this.generateRandomPassword();
  }
}
