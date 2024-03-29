"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDialogService = void 0;
const Toastr = require("./../../../vendor/toastr.js");
if (!Toastr)
    console.log("No Toastr!!!");
const Spinner = require("./../../../vendor/spin.js");
if (!Spinner)
    console.log("No Spinner!!!");
const Topbar = require("./../../../vendor/topbar.js");
if (!Topbar)
    console.log("No Topbar!!!");
const dialog_service_1 = require("./dialog-service");
// import * as $ from "jquery";
const n_defensive_1 = require("@nivinjoseph/n-defensive");
class DefaultDialogService {
    constructor(options) {
        var _a, _b, _c, _d, _e;
        this._loadingScreenCount = 0;
        this._loadingScreen = null;
        this._spinner = null;
        const accentColor = (_a = options === null || options === void 0 ? void 0 : options.accentColor) !== null && _a !== void 0 ? _a : "#000";
        const dialogLocation = (_b = options === null || options === void 0 ? void 0 : options.dialogLocation) !== null && _b !== void 0 ? _b : dialog_service_1.DialogLocation.bottomRight;
        const newestOnTop = (_c = options === null || options === void 0 ? void 0 : options.newestOnTop) !== null && _c !== void 0 ? _c : false;
        const enableCloseButton = (_d = options === null || options === void 0 ? void 0 : options.enableCloseButton) !== null && _d !== void 0 ? _d : false;
        const loadingScreen = (_e = options === null || options === void 0 ? void 0 : options.loadingScreen) !== null && _e !== void 0 ? _e : "spinner";
        (0, n_defensive_1.given)(accentColor, "accentColor").ensureHasValue().ensureIsString().ensure(t => t.trim().startsWith("#"), "must be hex value");
        (0, n_defensive_1.given)(dialogLocation, "dialogLocation").ensureHasValue().ensureIsEnum(dialog_service_1.DialogLocation);
        (0, n_defensive_1.given)(newestOnTop, "newestOnTop").ensureHasValue().ensureIsBoolean();
        (0, n_defensive_1.given)(enableCloseButton, "enableCloseButton").ensureHasValue().ensureIsBoolean();
        (0, n_defensive_1.given)(loadingScreen, "loadingScreen").ensureHasValue().ensureIsString()
            .ensure(t => t === "spinner" || t === "topbar");
        this._accentColor = accentColor.trim();
        this._loadingScreenType = loadingScreen;
        this._toastr = window.toastr;
        this._toastr.options.timeOut = 4000;
        this._toastr.options.positionClass = dialogLocation;
        this._toastr.options.newestOnTop = newestOnTop;
        this._toastr.options.closeButton = enableCloseButton;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        Topbar.config({
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
            this._toastr.info(message, title);
        }
        else {
            this._toastr.info(message);
        }
    }
    showSuccessMessage(message, title) {
        if (title) {
            this._toastr.success(message, title);
        }
        else {
            this._toastr.success(message);
        }
    }
    showWarningMessage(message, title) {
        if (title) {
            this._toastr.warning(message, title);
        }
        else {
            this._toastr.warning(message);
        }
    }
    showErrorMessage(message, title) {
        if (title) {
            this._toastr.error(message, title);
        }
        else {
            this._toastr.error(message);
        }
    }
    clearMessages() {
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
            Topbar.show();
        }
        this._loadingScreenCount++;
    }
    _hideTopBar() {
        this._loadingScreenCount--;
        if (this._loadingScreenCount < 0)
            this._loadingScreenCount = 0;
        if (this._loadingScreenCount === 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            Topbar.hide();
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
            lines: 12,
            length: 10,
            width: 4,
            radius: 10,
            corners: 1,
            rotate: 0,
            direction: 1,
            color: this._accentColor,
            speed: 1,
            trail: 60,
            shadow: false,
            hwaccel: false,
            className: "spinner",
            zIndex: 2e9,
            top: "auto",
            left: "auto" // Left position relative to parent in px
        };
        const target = document.getElementById("spinnerLocation");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this._spinner = new Spinner(opts).spin(target);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this._spinner.stop();
        this._loadingScreen.hide();
    }
}
exports.DefaultDialogService = DefaultDialogService;
//# sourceMappingURL=default-dialog-service.js.map