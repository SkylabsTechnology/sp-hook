//#region Init Items
/**
 * @type {HTMLDivElement} 
 */
var cls_InsertedIcon;
/**
 * @type {HTMLDivElement}
 */
var cls_SaveToDbButton;
/**
 * @type {Element}
 */
var cls_EditorNavSection;



const CLS_SetItems = function(key, value) {
    localStorage.setItem(key, value);
    CLS_HandleSaveButtonAddRemove(localStorage);
}

/**
 * Adds styles to the global and iframe DOMs
 */
const CLS_AppendStyles = function() {
    let parentHead = window.parent.document.head.querySelector('style[cls-parent-styles="true"]');
    if(!parentHead) {
        let styleTag = window.parent.document.createElement('style');
        styleTag.setAttribute('cls-parent-styles', 'true');
        styleTag.innerHTML = `
        /* GLOBALS SQUARESPACE EMULATION */
        .cls-sp-toggle-outer-wrapper {
            margin-left: 22px;
            margin-right: 22px;
            box-sizing: border-box;
        }
        .cls-sp-toggle-outer-container {
            display: block;
            min-height: 44px;
            padding-top: 11px;
            padding-bottom: 11px;
            box-sizing: border-box;
            cursor: inherit;
            hyphens: auto;
        }
        .cls-sp-toggle-inner-container {
            box-sizing: border-box;
            display: flex;
            -webkit-box-align: center;
            align-items: center;
            flex-direction: row;
            -webkit-box-pack: justify;
            justify-content: space-between;
        }
        .cls-sp-toggle-inner-label-container {
            margin-right: 11px;
            width: 342px;
            box-sizing: border-box;
            display: flex;
            -webkit-box-align: center;
            align-items: center;
        }
        .cls-sp-toggle-inner-label {
            margin: 0px;
            box-sizing: border-box;
            text-rendering: optimizelegibility;
            -webkit-font-smoothing: antialiased;
            color: rgb(14, 14, 14);
            font-weight: 400;
            font-family: Clarkson, "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 22px;
        }
        .cls-sp-toggle-container {
            margin-left: 11px;
            box-sizing: border-box;
            display: flex;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: end;
            justify-content: flex-end;
        }
        .cls-sp-toggle-input {
            background-color: rgb(255, 255, 255);
            border-radius: 50%;
            box-sizing: border-box;
            height: 12px;
            margin: 2px;
            width: 12px;
            appearance: none;
            cursor: pointer;
            outline: none;
            position: absolute;
            transition: all 300ms cubic-bezier(0.32, 0.94, 0.6, 1) 0s;
        }
        .cls-sp-toggle-under-line {
            background-color: rgb(231, 231, 231);
            height: 1px;
            width: 100%;
            box-sizing: border-box;
        }
        .cls-sp-toggle-under-line-inner {
            background-color: rgb(14, 14, 14);
            height: 1px;
            width: 0%;
            box-sizing: border-box;
            transition: all 0.3s cubic-bezier(0.32, 0.94, 0.6, 1) 0s;
        }
        
        .cls-sp-toggle {
            background-color: rgb(110, 110, 110);
            border-radius: 8px;
            box-sizing: border-box;
            height: 16px;
            position: relative;
            width: 28px;
            display: flex;
            cursor: pointer;
            transition: all 300ms cubic-bezier(0.32, 0.94, 0.6, 1) 0s;
            -webkit-box-align: center;
            align-items: center;
        }
        .cls-sp-toggle.cls-sp-toggle-checked {
            background-color: rgb(142, 70, 163);
        }
        .cls-sp-toggle.cls-sp-toggle-checked .cls-sp-toggle-input{
            right: 0;
        }
        .cls-sp-toggle-label {
            color: rgb(110, 110, 110);
            display: block;
            margin-top: 33px;
            overflow: hidden;
            padding-left: 22px;
            padding-right: 22px;
            margin-left: 0px;
            box-sizing: border-box;
            text-rendering: optimizelegibility;
            -webkit-font-smoothing: antialiased;
            font-weight: 500;
            font-family: Clarkson, "Helvetica Neue", Helvetica, Arial, sans-serif;
            text-transform: uppercase;
            font-size: 9.75px;
            letter-spacing: 0.75px;
            line-height: 16px;
            text-overflow: ellipsis;
        }
        /* CLS GLOBALS*/
        .cls-icon-container {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-content: center;
            justify-content: center;
            align-items: center;
            width: 35px;
            height: 35px;
            margin: 0 10px 0 0;
        }
        .cls-icon-container svg {
            width: 35px;
            height: 35px;
        }
        .cls-save-button-container {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-content: center;
            justify-content: center;
            align-items: center;
            margin: 0;
            position: relative;
        }
        button.cls-save-button {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-content: center;
            justify-content: center;
            align-items: center;
            margin: 0 10px!important;
            background: rgba(184, 163, 239, 1);
            padding: 10px 24px!important;
            width: 100%;
            color: #fff;
            border-radius: 4px;
            box-shadow: 0px 7px 0px 0px rgb(0 0 0);
            animation: fade-out-save-background 1s 4 ease-in-out;
            transition: all 280ms cubic-bezier(.4, 0, .2, 1);
            position: relative;
            z-index: 10;
        }
        button.cls-save-button:active {
            background: #b19bed;
            margin: 7px 10px 0 10px!important;
            box-shadow: 0 0 0 0 rgb(0 0 0);
        }
        button.cls-save-button:hover {
            background: #a891eb;
        }
        .cls-save-button-background {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-content: center;
            justify-content: center;
            align-items: center;
            background: #000;
            width: calc(100% - 20px);
            height: 100%;
            margin: 0 10px;
            top: 0;
            left: 0;
            position: absolute;
            border-radius: 4px 4px 0 0;
            animation: fade-out 6s ease-in-out forwards;
        }
        .cls-fade-out {
            animation: fade-out .5s ease-in-out;
        }
        @keyframes shake-button {
            10% { transform: translate3d(-1px, 0, 0); offset: 0.1; }
            20% { transform: translate3d(2px, 0, 0); offset: 0.2; }
            30% { transform: translate3d(-3px, 0, 0); offset: 0.3; }
            40% { transform: translate3d(3px, 0, 0); offset: 0.4; }
            50% { transform: translate3d(-3px, 0, 0); offset: 0.5; }
            60% { transform: translate3d(3px, 0, 0); offset: 0.6; }
            70% { transform: translate3d(-3px, 0, 0); offset: 0.7; }
            80% { transform: translate3d(2px, 0, 0); offset: 0.8; }
            90% { transform: translate3d(-1px, 0, 0); offset: 0.9; }
        }
        @keyframes fade-out {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        @keyframes fade-out-save-background {
            10% { background: rgba(184, 163, 239, 1); }
            90% { background: rgba(184, 163, 239, 0); }
        }
        `;
        
        window.parent.document.head.appendChild(styleTag);
    }
    
    let localHead = window.parent.document.head.querySelector('style[cls-local-style="true"]');
    if(!localHead) {
        let localStyleTag = document.createElement('style');
        localStyleTag.setAttribute('cls-local-style', 'true');
        localStyleTag.innerHTML = `
        /* CLS STYLES */
        .cls-blur-button {
            filter: blur(1px);
        }
        .cls-hue-rotate {
            filter: hue-rotate(90deg);
        }
        .cls-hue-rotate.cls-blur-button {
            filter: blur(1px) hue-rotate(90deg);
        }
        /* CLS ANIMATIONS */
        .cls-shake-button-on-hover:hover {
            animation: shake-button 1s ease-in-out;
        }
        @keyframes shake-button {
            10% { transform: translate3d(-1px, 0, 0); offset: 0.1; }
            20% { transform: translate3d(2px, 0, 0); offset: 0.2; }
            30% { transform: translate3d(-3px, 0, 0); offset: 0.3; }
            40% { transform: translate3d(3px, 0, 0); offset: 0.4; }
            50% { transform: translate3d(-3px, 0, 0); offset: 0.5; }
            60% { transform: translate3d(3px, 0, 0); offset: 0.6; }
            70% { transform: translate3d(-3px, 0, 0); offset: 0.7; }
            80% { transform: translate3d(2px, 0, 0); offset: 0.8; }
            90% { transform: translate3d(-1px, 0, 0); offset: 0.9; }
        }`;
        document.head.appendChild(localStyleTag);
    }
}

/**
 * Init the hook for editing the website.
 */
const CLS_InitApplication = function() {
    if(window.parent.document.body.classList.contains(cls_EditorConfig.BodyEditorClass)) {
        CLS_GetIFrame(true).addEventListener('click', function(event) {
            if(event && event.target) {
                // they have selected a button from the add block menu
                if(event.target.className.startsWith(cls_EditorConfig.AddBlockModalClass) &&
                   event.target.innerText.toLowerCase() == cls_ButtonTypeInfo.Type.toLowerCase()) {
                    cls_CurrentEditType = "button";
                    console.log("they have added a button: ", event);
                    observer.observe(event.target.ownerDocument, {childList: true, subtree: true})
                }
                // they clicked on a button that they are currently going to edit.
                if(event.target.classList) {
                    if(event.target.classList.contains(cls_ButtonTypeInfo.SelectorClass)) {
                        cls_currentId = event.target.id;
                        cls_CurrentEditType = "button";
                        observer.observe(window.parent.document, {childList: true, subtree: true}) 
                    }
                }
            }
        });
        window.parent.document.addEventListener('click', function(event) {
            if(event.target.attributes && event.target.attributes['data-test']) {
                if(event.target.dataset.test == 'frameToolbarEdit') {
                    console.log("this is the done button");
                    // TODO: can we make this better? This is pretty sloppy to me
                    setTimeout(() => {
                        CLS_CheckItemsHaveBeenRendered();
                    }, 1000);
                    
                }
                // console.log("event.target.dataset.test", event.target.dataset.test);
                // console.log("event.target: ", event.target);
                // console.log("event.target.attributes['data-test']: ", event.target.attributes['data-test']);
            }
        });
        if(window.parent.document.getElementsByClassName('cls-icon-container').length == 0) {
            cls_InsertedIcon = window.parent.document.createElement('div');
            cls_InsertedIcon.classList.add('cls-icon-container');
            cls_InsertedIcon.id = "cls-icon-button";
            cls_InsertedIcon.innerHTML = `<svg class="cls-icon" viewBox="0 0 500 500">
                                <style type="text/css">
                                    .st0{fill:#DAC8A5;}
                                    .st1{fill:#B3F3D6;}
                                    .st2{fill:#FF808E;}
                                    .st3{fill:none;stroke:#1A1A1A;stroke-width:15;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
                                    .st4{fill:#1A1A1A;}
                                    svg.cls-icon {
                                        animation: drop-icon 1s ease-in-out;
                                    }
                                    svg.cls-icon #dog-head {
                                        animation: drop-dog-head 1s ease-in-out .2s;
                                    }
                                    @keyframes drop-icon {
                                        10% { transform: translate3d(0, -4px, 0); offset: 0.1; }
                                        50% { transform: translate3d(0, 3px, 0); offset: 0.5; }
                                        90% { transform: translate3d(0, 0px, 0); offset: 0.9; }
                                    }
                                    @keyframes drop-dog-head {
                                        10% { transform: translate3d(0, -50px, 0); offset: 0.1; }
                                        50% { transform: translate3d(0, 10px, 0); offset: 0.5; }
                                        90% { transform: translate3d(0, 0px, 0); offset: 0.9; }
                                    }
                                </style>
                                <g id="colors">
                                    <path id="brown" class="st0" d="M196.7,301.3c-1.3-3.1-2.3-6.8-0.9-10.3c3-7.7,15.1-8.2,46.2-13.2c16.5-2.7,24.8-4,33.3-5.9
                                        c17.1-3.7,21.3-5.8,31.5-5.9c10.6-0.1,23.4-0.2,30.2,8.6c6.6,8.5,3.7,20.4,2.8,23.7c-22.8,56.8-45.5,113.6-68.3,170.5
                                        c-0.6,2.1-2.4,3.6-4.5,3.7c-2.2,0.2-4.4-1.1-5.3-3.2C240.1,413.3,218.4,357.3,196.7,301.3z"/>
                                    <path id="green" class="st1" d="M134.8,228c3.4,1.9,7.9,1.8,8.6,1.8c6.2-0.1,8.8-3.1,17-7c6.6-3.1,11.7-5.4,17.4-5.1
                                        c4.7,0.3,8.9,2.2,16.3,8.4c18.4,15.3,19.5,25.7,34.1,35c4.7,3,9.6,6.1,16.7,7.1c15.8,2.3,24.8-8.3,59-27.3
                                        c15.2-8.5,22.9-12.7,27.8-13.7c24.5-4.9,40.2,9.1,53.3-0.7c5.4-4.1,8.2-10.5,8.6-15.7c1.2-14-13.3-25-17.2-28
                                        c-20-15.2-35.4-6.9-74.5-13.9c-35.9-6.5-33.2-15.3-64.1-18.1c-29.3-2.7-51.1,3.6-64.3,7.5c-21.6,6.4-34.4,10.2-41.9,22.9
                                        C121.9,197.3,124.3,222.3,134.8,228z"/>
                                    <path id="pink" class="st2" d="M363.8,164.9c-2.3,3.1-7.6,1.7-35.2-4.3c-39.1-8.4-37.5-7.5-48.2-10.5c-24.3-6.7-36.1-10.9-39.4-12
                                        c-15.8-5.3-16.1-6.1-21.6-5.1c-11.1,2.2-34.6,10.5-55.2,12.9c-2.7,0.3-9,1-12.6-2.7c-3.4-3.5-3-9.2-2.5-13.5c1.8-14,3.6-27.5,14-42
                                        c16.1-22.5,44.2-35.2,71.3-34.7c5.6,0.1,26.3,0.7,45.7,14.1c13,9,21.2,20.8,23.1,23.6c9.6,14.3,7.7,20.5,16.8,28.7
                                        c9.3,8.3,14.3,4.7,25.5,12.9C358.5,142,368.1,159.2,363.8,164.9z"/>
                                </g>
                                <g id="ice-cream-cone">
                                    <path id="line_00000025445187987114481560000016981235040208530359_" class="st3" d="M126.4,188.6c-2.7,1.6-5.3,3.2-7.8,4.9
                                        c-7.2,5-20.4,14.6-21,28.6c-0.6,14.8,13.2,30.8,23.8,30.2c7.2-0.4,12.1-8.7,18.1-6.5c2.8,1,4.3,3.6,5.2,5.5
                                        c29.1,74,58.3,147.9,87.4,221.9c29.1-73.5,58.1-147,87.2-220.4c0.7-2,2.2-4.9,5.1-6.6c7.3-4.1,14.9,4.8,26.4,4
                                        c9.1-0.6,18.8-7.1,21.3-14.6c4.3-12.9-12.1-28.7-18.4-34.8c-0.9-0.9-1.8-1.7-2.7-2.5"/>
                                    <path id="line_00000058555992102661681380000004977723021547589544_" class="st3" d="M135.2,246c4.9-3.7,17.2-6.5,25.2-5.1
                                        c13.3,2.3,16,17.6,34.4,33.7c9.4,8.1,13.8,12.3,26,13c16.4,1,26.2-7.4,45.8-19.8c12.4-7.9,30.2-19,59.2-22"/>
                                    <path id="line" class="st3" d="M260.4,304.2c-15,41.2-30,82.5-45,123.7"/>
                                    <path id="line_00000039120003889200380530000002612577836300379025_" class="st3" d="M216.4,326.4c-6.6,17.2-13.2,34.4-19.8,51.6"
                                        />
                                </g>
                                <g id="dog-head">
                                    <path id="line_00000084517094410044340860000014971622026538034826_" class="st3" d="M129.3,218.9c0.1-35,0.2-70,0.4-105
                                        c0.1-1.1,0.2-2.7,0.5-4.6c4.1-30.8,29.5-66.2,68-76.4c30-7.9,55.2,2.8,63.7,6.6c6.3,2.8,19.5,8.8,31.5,22
                                        c21.8,24,23.1,53.5,23.1,63c9.9-0.1,19.9-0.1,29.8-0.2c12-0.1,24.1-0.1,36.1-0.2c-0.2,9.8-1.8,24.5-9.4,40.3
                                        c-13,27-35,39.4-41.8,43.2c-13,7.1-25,10-33,11.4c-18.1,0.9-34.1,1.5-47.6,1.8c-35.2,0.9-40.3-0.1-46.4-2.7
                                        c-10.1-4.3-14.7-9.9-25.4-9.8c-7.3,0.1-10.2,2.7-20.9,5.9C151.2,216.1,141.6,218.3,129.3,218.9z"/>
                                    <path id="line_00000101818341401196784310000010332173195145382310_" class="st3" d="M170.2,209.8c34.9-24.1,45.9-49,49.8-65.5
                                        c0.2-1,0.5-2.1,0.7-3.1c0.1-36.6,0.2-73.2,0.3-109.8"/>
                                    <path id="line_00000140011293791566196030000011815815675172366508_" class="st3" d="M371.2,159.8c-1.7-0.4-10.8-2.7-16.4-11.6
                                        c-6.2-9.9-3.2-20.1-2.7-21.6"/>
                                    
                                        <ellipse id="eye" transform="matrix(0.2298 -0.9732 0.9732 0.2298 96.922 350.9908)" class="st4" cx="270.2" cy="114.3" rx="16.7" ry="16.7"/>
                                </g>
                              </svg>`;
            cls_EditorNavSection = window.parent.document.querySelector("div[data-onboarding-step]");
            cls_EditorNavSection.parentElement.insertBefore(cls_InsertedIcon, cls_EditorNavSection);
        }
        else {
            cls_EditorNavSection = window.parent.document.querySelector("div[data-onboarding-step]");
            cls_InsertedIcon = cls_EditorNavSection.parentElement.getElementsByClassName('cls-icon-container')[0];
        }
        // clear all previously set items if any.
        CLS_SetItems(cls_itemsToSaveCacheKey, "[]");
        CLS_CheckItemsHaveBeenRendered();
    }
    else {
        console.error("the website is not editable");
    }
}

const CLS_CheckItemsHaveBeenRendered = function() {
    /**
     * @type {Array<{ElementId: selectedId, ElementClass: functionClass, ElementType: elementType, IsChecked: boolean}>}
     */
    let items = JSON.parse(localStorage.getItem(cls_currentSavedItemsCacheKey));
    console.log("Found Items: ", items);
    if(items) {
        for(let x = 0; x < items.length; x++) {
            let element = document.getElementById(items[x].ElementId);
            if(element && element.classList) {
            element.classList.toggle(items[x].ElementClass, true);
            }
        }
    }
}

//#endregion

//#region  GLOBALS
/**
 * The current id that we are editing on the DOM.
 * @type {string}
 */
var cls_currentId = ``;
const cls_itemsToSaveCacheKey = "cls_ItemsToSave";
const cls_currentSavedItemsCacheKey = "cls_CurrentSavedItems"; 
const cls_EditorConfig = {
    /**
     * The id of the <iframe> that contains the website we are editing.
     */
    IFrameId: 'sqs-site-frame',
    /**
     * The body class that is added to a website when it is in editor mode.
     */
    BodyEditorClass: 'squarespace-editable',
    /**
     * The modal editor class that we use to select the modal editor so we can add our tab to the selector content.
     */
    ModalEditorClass: 'css-roynbj',
    /**
     * The modal class for creating a new block item. This is so we add the editor if they don't click on the item after adding an item from the add block menu
     */
    AddBlockModalClass: 'block-selector',
    /**
     * The types of Addon's that we support.
     */
    AddonTypes: [
        {
            /**
             * The type that should be named the same as what is available in the "Add Block" window
             */
            Type: "button",
            /**
             * The class that we are targeting to add and remove our classes to.
             */
            SelectorClass: "sqs-block-button",
            /**
             * The query selector string used to get the modal editor tab list for this addon type
             */
            ModalEditorTabListQuerySelector: `div[role="tablist"]`,
            /**
             * The query selector string used to get the modal editor body for this addon type
             */
            ModalEditorBodyQuerySelector: `div[data-test="button-block-editor-form"]`,

            AddonFunctions: [
                {
                    FunctionGroupLabel: "Styles",
                    FunctionLabel: "Blur Button",
                    FunctionName: "ToggleClassWithToggleElement",
                    FunctionClass: "cls-blur-button"
                },
                {
                    FunctionGroupLabel: "Styles",
                    FunctionLabel: "Rotate Hue Of Button",
                    FunctionName: "ToggleClassWithToggleElement",
                    FunctionClass: "cls-hue-rotate"
                },
                {
                    FunctionGroupLabel: "Animations",
                    FunctionLabel: "Shake Button On Hover",
                    FunctionName: "ToggleClassWithToggleElement",
                    FunctionClass: "cls-shake-button-on-hover",
                }
            ]
        }
    ]
}; 

/**
 * @type {"button" | "text"}
 */
var cls_CurrentEditType = "";

/**
 * The info from the configuration for the button selection.
 */
const cls_ButtonTypeInfo = cls_EditorConfig.AddonTypes.find(x => x.Type.toLowerCase() == "button");

const observer = new MutationObserver(([mutation]) => {
    console.log("list of nodes added", mutation);
    
    if(mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((value) => {
            if(value && value.classList && value.classList.contains(cls_ButtonTypeInfo.SelectorClass)) {
                cls_currentId = value.id;
                // here we are just making sure 
                observer.observe(window.parent.document, {childList: true, subtree: true});
            }
        });
    }
    if(mutation.type == "childList") {
        mutation.target.childNodes.forEach((value) => {
            if(value && value.innerHTML && value.innerHTML.includes(cls_EditorConfig.ModalEditorClass)) {
                CLS_HandleEditorLookup(value);
            }
        });
    }
});

//#endregion

//#region CLS adjustment Functions

const CLS_Functions = {
    /**
     * Global class to toggle and handle updates to toggle classes by ids that exist in CSS
     *
     * @param {string} selectedId 
     * @param {string} functionClass 
     * @param {string} elementType 
     * @param {HTMLInputElement} toggleLabelElement 
     * @param {Event} event 
     */
    ToggleClassWithToggleElement: function(selectedId, functionClass, elementType, toggleLabelElement, event) {
        
        let element = document.getElementById(selectedId);
        element.classList.toggle(functionClass, event.currentTarget.checked);
        toggleLabelElement.classList.toggle('cls-sp-toggle-checked', event.currentTarget.checked);
        /**
         * @type {Array<{ElementId: string, FunctionClass: string, ElementType: string, IsChecked: boolean}>}
         */
        let currentItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
        if(currentItems) {
            let foundEntry = currentItems.findIndex(x => x.ElementId == selectedId && x.ElementClass == functionClass && x.ElementType == elementType);
            if(event.currentTarget.checked) {
                // the entry was not found in the list we need to add it.
                if(foundEntry == -1) {
                    currentItems.push({ElementId: selectedId, ElementClass: functionClass, ElementType: elementType, IsChecked: event.currentTarget.checked});
                    CLS_SetItems(cls_itemsToSaveCacheKey, JSON.stringify(currentItems));
                }
                return;
            }
            else {
                currentItems.splice(foundEntry, 1);
            }
        }
        else {
            if(event.currentTarget.checked) {
                currentItems = [];
                currentItems.push({ElementId: selectedId, ElementClass: functionClass, ElementType: elementType});
            }
            else {
                currentItems = []; 
            }
        }
        CLS_SetItems(cls_itemsToSaveCacheKey, JSON.stringify(currentItems));
    }
};

//#region CLS Functions



//#endregion

//#endregion

//#region UTILITY METHODS

/**
 * Handles if the save items to database button should be added or removed from the DOM
 */
const CLS_HandleSaveButtonAddRemove = function() {
    if(cls_InsertedIcon && cls_EditorNavSection) {
        let saveItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
        if(saveItems.length > 0) {
            if(cls_EditorNavSection.parentElement.getElementsByClassName('cls-save-button-container').length == 0) {
                cls_EditorNavSection.parentElement.insertBefore(CLS_GetSaveButton(), cls_InsertedIcon);
            }
        }
        else {
            if(cls_EditorNavSection.parentElement.getElementsByClassName('cls-save-button-container').length > 0) {
                let button = cls_EditorNavSection.parentElement.getElementsByClassName('cls-save-button-container')[0];
                button.classList.toggle('cls-fade-out', true);
                setTimeout(() => {
                    button.classList.toggle('cls-fade-out', false);
                    cls_EditorNavSection.parentElement.removeChild(button);
                }, 500);
            }
        }
    }
}

/**
 * Gets the save button to save items to the database
 * @returns 
 */
const CLS_GetSaveButton = function() {
    if(!cls_SaveToDbButton) {
        cls_SaveToDbButton = window.parent.document.createElement('div');
        cls_SaveToDbButton.classList.add(['cls-save-button-container']);

        let saveButtonBackground = window.parent.document.createElement('div');
        saveButtonBackground.classList.add(['cls-save-button-background']);

        let saveButton = window.parent.document.createElement('button');
        saveButton.classList.add(['cls-save-button']);
        saveButton.innerText = "Save";
        saveButton.onclick = function() {
            let saveItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
            if(!saveItems) {
                saveItems = [];
            }
            let currentItems = JSON.parse(localStorage.getItem(cls_currentSavedItemsCacheKey));
            if(!currentItems) {
                currentItems = [];
            }
            /**
             * @type {Array<{ElementId: string, FunctionClass: string, ElementType: string, IsChecked: boolean}>}
             */
            let mergedItems = [...currentItems, ...saveItems];
            let noDuplicates = mergedItems.filter((value, index) => {
                                                 const _value = JSON.stringify(value);
                                                 return index === mergedItems.findIndex(obj => {
                                                    return JSON.stringify(obj) === _value;
                                                 });
                                            });
            localStorage.setItem(cls_currentSavedItemsCacheKey, JSON.stringify(noDuplicates));
            console.log("Here is the new saved list", noDuplicates);
        }
        cls_SaveToDbButton.appendChild(saveButton);
        cls_SaveToDbButton.appendChild(saveButtonBackground);
    }
    return cls_SaveToDbButton;
    
}

/**
 * Gets the iFrame element.
 * @param {boolean} innerDocument if true returns inner-iFrame document. defaults to false.
 * @returns {HTMLIFrameElement | Document}
 */
const CLS_GetIFrame = function(innerDocument = false) {
    if(innerDocument) {
        /**
         * @type {HTMLIFrameElement}
         */
        var innerIframe = window.parent.document.getElementById(cls_EditorConfig.IFrameId);
        if(innerIframe) {
            return innerIframe.contentDocument || innerIframe.contentWindow.document;
        }
    }
    return window.parent.document.getElementById(cls_EditorConfig.IFrameId);
}

/**
 * Utility method to look up editors.
 * @param {Element} value 
 */
const CLS_HandleEditorLookup = function(value) {
    let elementList = value.getElementsByClassName(cls_EditorConfig.ModalEditorClass);
    if(elementList && elementList.length > 0) {
        if(elementList[0].classList[0].toLowerCase() == cls_EditorConfig.ModalEditorClass.toLowerCase()) {
            var editorModal = elementList[0];
            console.log("Here is our editor: ", editorModal);
            let tabList;
            let tabBody;
            if(cls_CurrentEditType == 'button') {
                tabList = editorModal.querySelector(cls_ButtonTypeInfo.ModalEditorTabListQuerySelector);
                tabBody = editorModal.querySelector(cls_ButtonTypeInfo.ModalEditorBodyQuerySelector);
            }
            if(tabList && tabBody) {
                console.log("here is our tab list", tabList);
                if(tabList.children.length > 0) {
                    CLS_CreateNewEditorTab(tabList, tabBody);
                }
            }
        }
        
    }
}

/**
 * Builds a tab element inside of the tab list and assigns each click action.
 * 
 * We also disconnect the observer once we have done this since it is no longer needed.
 * @param {Element} tabList 
 * @param {Element} tabBody
 */
const CLS_CreateNewEditorTab = function(tabList, tabBody) {
    if(tabList.innerHTML.includes("ColdLabs Editor")){
        return;
    }
    let newBody = window.parent.document.createElement("div");
    newBody.classList.add(['cl-item-list']);
    newBody.style = "display: none;";

    if(cls_CurrentEditType == 'button') {
        let distinctLabels = [...new Set(cls_ButtonTypeInfo.AddonFunctions.map(functionList => functionList.FunctionGroupLabel))];
        for(let x = 0; x < distinctLabels.length; x++) {
            newBody.appendChild(CLS_CreateLabel(distinctLabels[x]));
            let toggleList = cls_ButtonTypeInfo.AddonFunctions.filter(functionInfo => functionInfo.FunctionGroupLabel == distinctLabels[x]).sort((a,b) => a.FunctionLabel - b.FunctionLabel);
            for(let y = 0; y < toggleList.length; y++) {
                newBody.appendChild(CLS_CreateToggle(toggleList[y].FunctionLabel, toggleList[y].FunctionName, toggleList[y].FunctionClass));
            }
        }
    }
    
    let newTab = tabList.children[tabList.children.length - 1].cloneNode(true);
    newTab.firstChild.id = `tab_${tabList.children.length}`;
    newTab.firstChild.ariaLabel = "ColdLabs Editor";
    newTab.firstChild.ariaSelected = "false";
    newTab.firstChild.value = tabList.children.length;
    newTab.firstChild.firstChild.innerHTML = "ColdLabs Editor";
    newTab.firstChild.onclick = ((event) => {
        newTab.firstChild.ariaSelected = "true";
        newBody.style = "display: block;width: 100%;height: 100%;background: rgb(255, 255, 255);position: absolute;top: 0;left: 0; z-index: 9999;";

        var left = 0;
        for(var x = 0; x < tabList.children.length - 2; x++) {
            left += tabList.children[x].clientWidth + 16;
        }
        var width = newTab.clientWidth;
        tabList.lastElementChild.style = `left: ${left}px; width: ${width}px;`;
    });

    
    // tabList.insertBefore(newTab, tabList.lastChild);
    for(let x = 0; x < tabList.children.length; x++) {
        tabList.children[x].firstChild.onclick = ((event) => {
            // tabBody.classList.toggle("show-cl-overlay", false);
            // if(tabList.children[x].firstChild.id == newTab.firstChild.id) {
            //     return;
            // }
            newTab.firstChild.ariaSelected = "false";
            newBody.style = "display: none;";

            var left = 0;
            for(var y = 0; y < x; y++) {
                left += tabList.children[y].clientWidth + 16;
            }
            var width = tabList.children[x].clientWidth;
            tabList.lastElementChild.style = `left: ${left}px; width: ${width}px;`;
        });
    }
    tabBody.appendChild(newBody);
    tabList.appendChild(newTab);
    observer.disconnect();
}

/**
 * Creates a label name based on passed in values. We are just copying square space styles.
 * @param {string} labelName 
 * @returns 
 */
const CLS_CreateLabel = function(labelName) {
    let labelWrapper = window.parent.document.createElement("div");
    labelWrapper.setAttribute("data-field", "true");
    let label = window.parent.document.createElement("label");
    label.classList.add(['cls-sp-toggle-label']);
    label.innerHTML = labelName;
    labelWrapper.appendChild(label);
    return labelWrapper;
}

/**
 * Creates a toggle element based on square space styles.
 * And sets it's on change actions based on what it should do.
 * @param {string} toggleName 
 * @returns 
 */
const CLS_CreateToggle = function(toggleName, toggleFunction, toggleClassName) {
    var targetIdElement = document.getElementById(cls_currentId);
    var idIsChecked = targetIdElement.classList.contains(toggleClassName);
    // let event = new Event('pointerdown', {bubbles: true})
    // targetIdElement.dispatchEvent(event);
    // let event2 = new Event('mousemove', {bubbles: true});
    // targetIdElement.dispatchEvent(event2);
    
    // |
    var toggleOuterWrapper = window.parent.document.createElement("div");
    toggleOuterWrapper.classList.add(['cls-sp-toggle-outer-wrapper']);
    // |-|
    var toggleOuterContainer = window.parent.document.createElement("div");
    toggleOuterContainer.classList.add(['cls-sp-toggle-outer-container']);
    // |-|-|
    var toggleInnerContainer = window.parent.document.createElement('div');
    toggleInnerContainer.classList.add(['cls-sp-toggle-inner-container']);
    // |-|-|-|
    var toggleInnerLabelContainer = window.parent.document.createElement('div');
    toggleInnerLabelContainer.classList.add(['cls-sp-toggle-inner-label-container']);
    // |-|-|-|-|
    var toggleInnerLabel = window.parent.document.createElement('label');
    toggleInnerLabel.classList.add(['cls-sp-toggle-inner-label']);
    toggleInnerLabel.innerHTML = toggleName;
    // |-|-|-|
    var toggleContainer = window.parent.document.createElement('div');
    toggleContainer.classList.add(['cls-sp-toggle-container']);
    // |-|-|-|-|
    var toggleLabel = window.parent.document.createElement('label');
    toggleLabel.classList.add(['cls-sp-toggle']);
    toggleLabel.classList.toggle('cls-sp-toggle-checked', idIsChecked);
    // |-|-|-|-|-|
    var toggleInput = window.parent.document.createElement('input');
    toggleInput.classList.add(['cls-sp-toggle-input']);
    toggleInput.type = 'checkbox';
    toggleInput.height = 12;
    toggleInput.width = 12;
    toggleInput.checked = idIsChecked;
    toggleInput.onchange = CLS_Functions[toggleFunction].bind(this, cls_currentId, toggleClassName, cls_CurrentEditType, toggleLabel);
    // |-|
    var toggleUnderLine = window.parent.document.createElement('div');
    toggleUnderLine.classList.add(['cls-sp-toggle-under-line']);
    // |-|-|
    var toggleUnderLineInner = window.parent.document.createElement('div');
    toggleUnderLineInner.classList.add(['cls-sp-toggle-under-line-inner']);

    toggleInnerLabelContainer.appendChild(toggleInnerLabel);

    toggleLabel.appendChild(toggleInput);
    toggleContainer.appendChild(toggleLabel);

    toggleInnerContainer.appendChild(toggleInnerLabelContainer);
    toggleInnerContainer.appendChild(toggleContainer);

    toggleOuterContainer.appendChild(toggleInnerContainer);

    toggleUnderLine.appendChild(toggleUnderLineInner);

    toggleOuterWrapper.appendChild(toggleOuterContainer);
    toggleOuterWrapper.appendChild(toggleUnderLine);

    return toggleOuterWrapper;
}
//#endregion


var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        CLS_AppendStyles();
        CLS_InitApplication();
    }
}, 10);