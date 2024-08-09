import "../../../vendor/toastr.js";
import "../../../vendor/topbar.js";
import "../../../vendor/spin.js";
// This works for Prod
// import Toastr from "../../../vendor/toastr.js";
// import Topbar from "../../../vendor/topbar.cjs";
// import Spinner from "../../../vendor/spin.cjs";
import { DialogLocation } from "./dialog-service.js";
// import * as $ from "jquery";
import { given } from "@nivinjoseph/n-defensive";
// 
export class DefaultDialogService {
    _accentColor;
    _toastr;
    _loadingScreenType;
    _loadingScreenCount = 0;
    _loadingScreen = null;
    _spinner = null;
    constructor(options) {
        const accentColor = options?.accentColor ?? "#000";
        const dialogLocation = options?.dialogLocation ?? DialogLocation.bottomRight;
        const newestOnTop = options?.newestOnTop ?? false;
        const enableCloseButton = options?.enableCloseButton ?? false;
        const loadingScreen = options?.loadingScreen ?? "spinner";
        given(accentColor, "accentColor").ensureHasValue().ensureIsString().ensure(t => t.trim().startsWith("#"), "must be hex value");
        given(dialogLocation, "dialogLocation").ensureHasValue().ensureIsEnum(DialogLocation);
        given(newestOnTop, "newestOnTop").ensureHasValue().ensureIsBoolean();
        given(enableCloseButton, "enableCloseButton").ensureHasValue().ensureIsBoolean();
        given(loadingScreen, "loadingScreen").ensureHasValue().ensureIsString()
            .ensure(t => t === "spinner" || t === "topbar");
        this._accentColor = accentColor.trim();
        this._loadingScreenType = loadingScreen;
        this._toastr = window.toastr;
        this._toastr.options.timeOut = 4000;
        this._toastr.options.positionClass = dialogLocation;
        this._toastr.options.newestOnTop = newestOnTop;
        this._toastr.options.closeButton = enableCloseButton;
        window.topbar.config({
            barThickness: 4,
            barColors: {
                "0": this._accentColor
            }
        });
    }
    showLoadingScreen() {
        if (this._loadingScreenType === "topbar")
            this._showTopBar();
        else
            this._showSpinner();
    }
    hideLoadingScreen() {
        if (this._loadingScreenType === "topbar")
            this._hideTopBar();
        else
            this._hideSpinner();
    }
    showMessage(message, title) {
        if (title) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._toastr.info(message, title);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._toastr.info(message);
        }
    }
    showSuccessMessage(message, title) {
        if (title) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._toastr.success(message, title);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._toastr.success(message);
        }
    }
    showWarningMessage(message, title) {
        if (title) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._toastr.warning(message, title);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._toastr.warning(message);
        }
    }
    showErrorMessage(message, title) {
        if (title) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._toastr.error(message, title);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._toastr.error(message);
        }
    }
    clearMessages() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this._toastr.clear();
    }
    _showSpinner() {
        if (this._loadingScreenCount === 0) {
            if (!this._loadingScreen) {
                this._createLoadingScreen();
            }
            this._loadingScreen.show();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this._spinner.spin(document.getElementById("spinnerLocation"));
        }
        this._loadingScreenCount++;
    }
    _hideSpinner() {
        this._loadingScreenCount--;
        if (this._loadingScreenCount < 0)
            this._loadingScreenCount = 0;
        if (this._loadingScreenCount === 0) {
            if (this._loadingScreen && this._spinner) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this._spinner.stop();
                this._loadingScreen.hide();
            }
        }
    }
    _showTopBar() {
        if (this._loadingScreenCount === 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            window.topbar.show();
        }
        this._loadingScreenCount++;
    }
    _hideTopBar() {
        this._loadingScreenCount--;
        if (this._loadingScreenCount < 0)
            this._loadingScreenCount = 0;
        if (this._loadingScreenCount === 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            window.topbar.hide();
        }
    }
    _createLoadingScreen() {
        this._loadingScreen = $("<div style='position:fixed;top:0;left:0;right:0;bottom:0;z-index:100000000;background-color:rgba(255, 255, 255, 0.1);'><div id='spinnerLocation' style='position:absolute;top:50%;left:50%;'></div></div>")
            .appendTo($("body"));
        // var opts = {
        //    lines: 13, // The number of lines to draw
        //    length: 20, // The length of each line
        //    width: 10, // The line thickness
        //    radius: 30, // The radius of the inner circle
        //    corners: 1, // Corner roundness (0..1)
        //    rotate: 0, // The rotation offset
        //    direction: 1, // 1: clockwise, -1: counterclockwise
        //    color: '#FF7C00', //'#000', // #rgb or #rrggbb or array of colors
        //    speed: 1, // Rounds per second
        //    trail: 60, // Afterglow percentage
        //    shadow: false, // Whether to render a shadow
        //    hwaccel: false, // Whether to use hardware acceleration
        //    className: 'spinner', // The CSS class to assign to the spinner
        //    zIndex: 2e9, // The z-index (defaults to 2000000000)
        //    top: 'auto', // Top position relative to parent in px
        //    left: 'auto' // Left position relative to parent in px
        // };
        const opts = {
            lines: 12, // The number of lines to draw
            length: 10, // The length of each line
            width: 4, // The line thickness
            radius: 10, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: this._accentColor, // '#000', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: "spinner", // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: "auto", // Top position relative to parent in px
            left: "auto" // Left position relative to parent in px
        };
        const target = document.getElementById("spinnerLocation");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this._spinner = new window.Spinner(opts).spin(target);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this._spinner.stop();
        this._loadingScreen.hide();
    }
}
//# sourceMappingURL=default-dialog-service.js.map