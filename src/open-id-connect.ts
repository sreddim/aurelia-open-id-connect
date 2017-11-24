import { autoinject } from "aurelia-framework";
import { RouterConfiguration } from "aurelia-router";
import { User, UserManager, UserManagerEvents } from "oidc-client";
import {
    OpenIdConnectLogger,
    OpenIdConnectRouting,
    UserManagerEventHandler,
    UserManagerEventsAction,
} from "./index-internal";

@autoinject
export default class OpenIdConnect {

    constructor(
        private openIdConnectRouting: OpenIdConnectRouting,
        public logger: OpenIdConnectLogger,
        public userManager: UserManager) { }

    public configure(routerConfiguration: RouterConfiguration) {

        if (typeof routerConfiguration === "undefined" || routerConfiguration === null) {
            throw new Error("routerConfiguration parameter must not be undefined or null");
        }

        this.openIdConnectRouting.configureRouter(routerConfiguration);
    }

    public async login(): Promise<void> {
        const args: any = {};
        await this.userManager.signinRedirect(args);
    }

    public async logout(): Promise<void> {
        const args: any = {};
        await this.userManager.signoutRedirect(args);
    }

    public loginSilent(): Promise<User> {
        const args: any = {};
        return this.userManager.signinSilent(args);
    }

    public getUser(): Promise<User> {
        return this.userManager.getUser();
    }

    public addOrRemoveHandler(
        key: keyof UserManagerEvents,
        handler: UserManagerEventHandler) {

        if (!key.startsWith("add") && !key.startsWith("remove")) {
            let message = "The 'addOrRemoveHandlers' method expects a 'key' argument ";
            message += "that starts with either 'add' or 'remove'. Instead we ";
            message += "recevied " + key;
            throw new TypeError(message);
        }

        const addOrRemove: UserManagerEventsAction =
            this.userManager.events[key]
                .bind(this.userManager.events);

        addOrRemove(handler);
    }
}
