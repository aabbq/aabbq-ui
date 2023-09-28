import { Routes } from "@angular/router";

import { HomeComponent } from './home';
import { LoginComponent } from './account';
import { authGuard } from './_helpers';

const usersRoutes = () => import('./users/users.routes').then(x => x.USERS_ROUTES);
const itemsRoutes = () => import('./item/items.routes').then(x => x.ITEMS_ROUTES);
const banksRoutes = () => import('./bank/banks.routes').then(x => x.BANKS_ROUTES);
const productsRoutes = () => import('./product/products.routes').then(x => x.PRODUCTS_ROUTES);
const productInventoriesRoutes = () => import('./productinventory/product-inventories.routes').then(x => x.PRODUCT_INVENTORIES_ROUTES);
const productInsRoutes = () => import('./productin/product-ins.routes').then(x => x.PRODUCT_INS_ROUTES);
const ordersRoutes = () => import('./order/orders.routes').then(x => x.ORDERS_ROUTES);
const productCategoriesRoutes = () => import('./productcategory/product-categorys.routes').then(x => x.PRODUCT_CATEGORIES_ROUTES);

export const APP_ROUTES: Routes = [
    { path: '', component: HomeComponent, canActivate: [authGuard] },
    { path: 'users', loadChildren: usersRoutes, canActivate: [authGuard] },
    { path: 'account/login', component: LoginComponent },

    { path: 'items', loadChildren: itemsRoutes, canActivate: [authGuard] },

    { path: 'banks', loadChildren: banksRoutes, canActivate: [authGuard] },

    { path: 'products', loadChildren: productsRoutes, canActivate: [authGuard] },

    { path: 'product-inventories', loadChildren: productInventoriesRoutes, canActivate: [authGuard] },

    { path: 'product-ins', loadChildren: productInsRoutes, canActivate: [authGuard] },

    { path: 'orders', loadChildren: ordersRoutes, canActivate: [authGuard] },

    { path: 'product-categories', loadChildren: productCategoriesRoutes, canActivate: [authGuard] },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];