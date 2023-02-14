'use-strict'
//@ts-check
//#region Init Items

/**
 * @type {HTMLDivElement} 
 */
let cls_InsertedIcon;
 /**
  * @type {HTMLDivElement}
  */
let cls_SaveToDbButton;
 /**
  * @type {Element}
  */
let cls_EditorNavSection;
/**
 * @type {boolean}
 */
let cls_NavIsExpanded = false;


/**
 * 
 * @param {string} key 
 * @param {string} value 
 */
const CLS_SetItems = function (key, value) {
    localStorage.setItem(key, value);
    CLS_HandleSaveButtonAddRemove();
}

/**
 * Checks the local storage keys and sets the keys to empty if nothing is already set
 */
const CLS_ValidateLocalStorage = function () {
    let dbItems = localStorage.getItem(cls_currentSavedItemsCacheKey);
    let savedItems = localStorage.getItem(cls_itemsToSaveCacheKey);
    if(!dbItems) {
        localStorage.setItem(cls_currentSavedItemsCacheKey, "[]");
    }
    if(!savedItems) {
        localStorage.setItem(cls_itemsToSaveCacheKey, "[]");
    }
}

/**
 * Adds styles to the global and iframe DOMs
 */
const CLS_AppendStyles = async function () {
    const parentHead = window.parent.document.head.querySelector('style[cls-parent-styles="true"]');
    const parentMaterialHead = window.parent.document.head.querySelector('style[cls-material-parent-style="true"]');
    if (!parentHead) {
        let response = await CLS_MakeRequest(`${cls_apiUrl}/static-files/parent-styles.css`, 'GET', 'text');
        const styleTag = window.parent.document.createElement('style');
        styleTag.setAttribute('cls-parent-styles', 'true');
        styleTag.innerHTML = response;
        window.parent.document.head.appendChild(styleTag);
    }
    if(!parentMaterialHead) {
        const parentMaterialStyleTag = document.createElement('link');
        parentMaterialStyleTag.setAttribute('cls-material-parent-style', 'true');
        parentMaterialStyleTag.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');
        parentMaterialStyleTag.setAttribute('rel', 'stylesheet');
        window.parent.document.head.appendChild(parentMaterialStyleTag);
    }

    const localHead = window.parent.document.head.querySelector('style[cls-local-style="true"]');
    const localMaterialHead = window.parent.document.head.querySelector('style[cls-material-local-style="true"]');
    if (!localHead) {
        let response = await CLS_MakeRequest(`${cls_apiUrl}/static-files/main-styles.css`, 'GET', 'text');
        const localStyleTag = document.createElement('style');
        localStyleTag.setAttribute('cls-local-style', 'true');
        localStyleTag.innerHTML = response;
        document.head.appendChild(localStyleTag);
    }
    if(!localMaterialHead) {
        const localMaterialStyleTag = document.createElement('link');
        localMaterialStyleTag.setAttribute('cls-material-local-style', 'true');
        localMaterialStyleTag.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');
        localMaterialStyleTag.setAttribute('rel', 'stylesheet');
        document.head.appendChild(localMaterialStyleTag);
    }
}

/**
 * Init the hook for editing the website.
 */
const CLS_InitApplication = function () {
    if (window.parent.document.body.classList.contains(cls_EditorConfig.BodyEditorClass)) {
        CLS_AddIframeClickEvent();
        CLS_BuildEditorWindow();
        // CLS_AddParentWindowClickEvent();
        CLS_CheckAddIconToView();

        // clear all previously set items if any.
        CLS_SetItems(cls_itemsToSaveCacheKey, "[]");
        CLS_CheckItemsHaveBeenRendered();
    }
    else {
        CLS_CheckItemsHaveBeenRendered();
        console.error("the website is not editable");
    }
}

/**
 * Adds a click event to the parent window. 
 */
// I don't think we need this anymore?
// const CLS_AddParentWindowClickEvent = function () {
//     window.parent.document.addEventListener('click', function (event) {
//         if (event.target.attributes && event.target.attributes['data-test']) {
//             if (event.target.dataset.test == 'frameToolbarEdit') {
//                 // TODO: can we make this better? This is pretty sloppy to me
//                 setTimeout(() => {
//                     CLS_CheckItemsHaveBeenRendered();
//                 }, 1000);

//             }
//         }
//     });
// }

/**
 * Adds event listener to handle if a button/text/etc.. is clicked on the main document 
 * this is used to set the non-global tab and set what can be done to it.
 */
const CLS_AddIframeClickEvent = function () {
    CLS_GetIFrame(true).addEventListener('click', function (event) {
        if (event && event.target) {
            // they clicked on a element that they are currently going to edit.
            if(event.target.classList) {
                let foundType = cls_EditorConfig.AddonTypes.find(x => event.target.classList.contains(x.SelectorClass))
                if(foundType) {
                    cls_currentId = event.target.id;
                    cls_CurrentEditType = foundType.Type;
                    observer.observe(window.parent.document, { childList: true, subtree: true });
                    if(cls_NavIsExpanded) {
                        let navDynamicToggle = document.getElementById('dynamic-cls-nav-toggle');
                        navDynamicToggle.innerText = foundType.Type[0].toUpperCase() + foundType.Type.slice(1).toLowerCase();
                        // build window info.
                        CLS_BuildDynamicEditWindow(foundType);
                    }
                }
                
            }
        }
    });
}

/**
 * 
 * @param {{Type: string, SelectorClass: string, ModalEditorTabListQuerySelector: string, ModalEditorBodyQuerySelector: string, AddonFunctions: { FunctionGroupLabel: string, FunctionLabel: string, FunctionName: string, FunctionClass: string, FunctionViewType: string, }[];
}} foundType 
 */
const CLS_BuildDynamicEditWindow = function(foundType) {
    let navDynamicWindow = document.getElementById('cls-nav-dynamic-window');
    if(navDynamicWindow) {
        navDynamicWindow.innerHTML = "";
        const distinctLabels = [...new Set(foundType.AddonFunctions.map(functionList => functionList.FunctionGroupLabel).sort())];
        for (let distinctLabel of distinctLabels) {
            navDynamicWindow.appendChild(CLS_CreateLabel(distinctLabel));
            let viewFunctionList = foundType.AddonFunctions.filter(functionInfo => functionInfo.FunctionGroupLabel == distinctLabel).sort();
            for (let viewFunction of viewFunctionList) {
                if(viewFunction.FunctionViewType == "toggle") {
                    navDynamicWindow.appendChild(CLS_CreateToggle(viewFunction.FunctionLabel, viewFunction.FunctionName, viewFunction.FunctionClass, viewFunction.IsDisabled, cls_ButtonTypeInfo.Type));
                }
            }
        }
    }
};

/**
 * Checks if the icon exists on the DOM if it does then we set the value to be used globally later. otherwise we create it.
 */
const CLS_CheckAddIconToView = async function () {
    if (window.parent.document.getElementsByClassName('cls-icon-container').length == 0) {
        let response = await CLS_MakeRequest(`${cls_apiUrl}/static-files/icon.svg`, 'GET', 'text');
        cls_InsertedIcon = window.parent.document.createElement('div');
        cls_InsertedIcon.classList.add('cls-icon-container');
        cls_InsertedIcon.id = "cls-icon-button";
        cls_InsertedIcon.innerHTML = response;
        cls_EditorNavSection = window.parent.document.querySelector("div[data-onboarding-step]");
        cls_InsertedIcon.onclick = (event) => {
            if(window.parent.document.querySelector('[data-test="frameToolbarEdit"]')) {
                // We clicked the icon and nothing should happen because they aren't in edit mode
                event.preventDefault();
                return;
            }
            CLS_ToggleCLSEditor();
        };
        cls_EditorNavSection.parentElement.insertBefore(cls_InsertedIcon, cls_EditorNavSection);
    }
    else {
        cls_EditorNavSection = window.parent.document.querySelector("div[data-onboarding-step]");
        cls_InsertedIcon = window.parent.document.getElementById('cls-icon-button');
        cls_InsertedIcon.onclick = (event) => {
            if(window.parent.document.querySelector('[data-test="frameToolbarEdit"]')) {
                // We clicked the icon and nothing should happen because they aren't in edit mode
                event.preventDefault();
                return;
            }
            CLS_ToggleCLSEditor();
        };
    }
}

/**
 * toggles the editor open/closed and sets global variable to hold state for later.
 */
const CLS_ToggleCLSEditor = function() {
    let navWindow = window.document.getElementById('cls-side-nav');
    if(navWindow) {
        let isExpanded = navWindow.classList.contains('expanded');
        // handle UI change to move over edit window in css.
        let editorUiMount = window.parent.document.getElementById('page-section-editor-ui-mount');
        if(editorUiMount) {
            editorUiMount.classList.toggle('cls-nav-is-expanded', !isExpanded);
        }
        let logo = window.parent.document.getElementById('cls-icon');
        if(logo) {
            logo.classList.toggle('icon-open', !isExpanded);
        }
        cls_NavIsExpanded = !isExpanded;
        navWindow.classList.toggle('expanded', !isExpanded);
        document.body.classList.toggle('cls-nav-expanded', !isExpanded);

    }
    else {
        CLS_BuildEditorWindow(true);
    }
}

/**
 * Creates the slide out editor window 
 * @param {boolean} expandOnBuild 
 */
const CLS_BuildEditorWindow = function(expandOnBuild = false) {
    //check if it already exists. If it does then delete it.
    let navCheck = document.getElementById('cls-side-nav');
    if(navCheck) {
        navCheck.parentElement.removeChild(navCheck);
    }
    // create main nav
    const nav = document.createElement('div');
    nav.classList.add('cls-side-nav');
    nav.id = "cls-side-nav";

    // create toggle header
    const navToggleHeader = document.createElement('div');
    navToggleHeader.classList.add('cls-nav-toggle-header');
    navToggleHeader.id = 'cls-nav-toggle-header';

    // create global toggle button
    const navGlobalToggleButton = document.createElement('div');
    navGlobalToggleButton.classList.add('cls-nav-toggle-button', 'cls-toggle-active');
    navGlobalToggleButton.id = "global-cls-nav-toggle";
    navGlobalToggleButton.innerText = "Global";
    navGlobalToggleButton
    
    // create dynamic toggle button
    const navDynamicToggleButton = document.createElement('div');
    navDynamicToggleButton.classList.add('cls-nav-toggle-button');
    navDynamicToggleButton.id = "dynamic-cls-nav-toggle";

    // create global window.
    const navGlobalWindow = document.createElement('div');
    navGlobalWindow.classList.add('cls-nav-global-container');
    navGlobalWindow.id = "cls-nav-global-window";

    // add all labels and functions to the global tab
    for(let type of cls_EditorConfig.AddonTypes) {
        navGlobalWindow.appendChild(CLS_CreateLabel(type.Type, true));
        let distinctLabels = [...new Set(type.AddonFunctions.map(functionList => functionList.FunctionGroupLabel).sort())];
        for (let distinctLabel of distinctLabels) {
            navGlobalWindow.appendChild(CLS_CreateLabel(distinctLabel));
            let viewFunctionList = type.AddonFunctions.filter(functionInfo => functionInfo.FunctionGroupLabel == distinctLabel).sort();
            for (let viewFunction of viewFunctionList) {
                if(viewFunction.FunctionViewType == "toggle") {
                    navGlobalWindow.appendChild(CLS_CreateToggle(viewFunction.FunctionLabel, `Global${viewFunction.FunctionName}`, viewFunction.FunctionClass, viewFunction.IsDisabled, type.Type, true));
                }
            }
        }
    }

    // creates dynamic window
    const navDynamicWindow = document.createElement('div');
    navDynamicWindow.classList.add('cls-nav-global-container', 'cls-hide');
    navDynamicWindow.id = "cls-nav-dynamic-window";

    // creates hide and show for the dynamic toggle.
    // hides dynamic window and shows global window
    navGlobalToggleButton.onclick = () => {
        navGlobalToggleButton.classList.toggle('cls-toggle-active', true);
        navDynamicToggleButton.classList.toggle('cls-toggle-active', false);
        navGlobalWindow.classList.toggle('cls-hide', false);
        navDynamicWindow.classList.toggle('cls-hide', true);
    }

    // creates hide and show for the dynamic toggle
    // hides global window and shows dynamic window
    navDynamicToggleButton.onclick = () => {
        if(navDynamicToggleButton.innerText) {
            let foundType = cls_EditorConfig.AddonTypes.find(x => x.Type.toLowerCase() == navDynamicToggleButton.innerText.toLowerCase());
            if(foundType) {
                CLS_BuildDynamicEditWindow(foundType);
            }
            navGlobalToggleButton.classList.toggle('cls-toggle-active', false);
            navDynamicToggleButton.classList.toggle('cls-toggle-active', true);
            navGlobalWindow.classList.toggle('cls-hide', true);
            navDynamicWindow.classList.toggle('cls-hide', false);
        }
    }
    
    document.body.classList.add('cls-contains-nav');
    
    if(expandOnBuild) {
        nav.classList.toggle('expanded', true);
        document.body.classList.toggle('cls-nav-expanded', true);
    }

    // add toggle buttons to toggle header
    navToggleHeader.appendChild(navGlobalToggleButton);
    navToggleHeader.appendChild(navDynamicToggleButton);

    // add toggle header to nav
    nav.appendChild(navToggleHeader);

    // add global window to nav
    nav.appendChild(navGlobalWindow);
    // add dynamic window to nav
    nav.appendChild(navDynamicWindow);

    // add nav to document body
    document.body.appendChild(nav);
}

/**
 * Handles checking if the config items have been rendered on the page.
 */
const CLS_CheckItemsHaveBeenRendered = function () {
    /**
     * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
     */
    const items = JSON.parse(localStorage.getItem(cls_currentSavedItemsCacheKey));
    console.log("Found Items: ", items);
    if (items) {
        for (let item of items) {
            if(item.IsGlobal) {
                const foundType = cls_EditorConfig.AddonTypes.find(x => x.Type == item.ElementType);
                if(foundType) {
                    const elementList = document.getElementsByClassName(foundType.SelectorClass);
                    if(elementList) {
                        for(let element of elementList) {
                            element.classList.toggle(functionClass, true);
                            element.classList.toggle(`${functionClass}-global`, true);
                        }
                    }
                }
            }
            else {
                const element = document.getElementById(item.ElementId);
                if (element && element.classList) {
                    element.classList.toggle(item.ElementClass, true);
                }
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
let cls_currentId = ``;
const cls_itemsToSaveCacheKey = "cls_ItemsToSave";
const cls_currentSavedItemsCacheKey = "cls_CurrentSavedItems";
/**
 * @type {{IFrameId: string, BodyEditorClass: string, ModalEditorClass: string, AddBlockModalClass: string,AddonTypes:Array<{Type: string,SelectorClass: string,ModalEditorTabListQuerySelector: string,ModalEditorBodyQuerySelector: string,AddonFunctions:Array<{FunctionGroupLabel: string,FunctionLabel: string,FunctionName: string,FunctionClass: string,FunctionViewType: string,}>}>}}
 */
const cls_EditorConfig = JSON.parse(localStorage.getItem(cls_editorConfigKey));

/**
 * @type {"button" | "text"}
 */
let cls_CurrentEditType = "";
/**
 * @type {boolean}
 */
let deletingNode = false;

/**
 * The info from the configuration for the button selection.
 */
const cls_ButtonTypeInfo = cls_EditorConfig.AddonTypes.find(x => x.Type.toLowerCase() == "button");

/**
 * The info from the configuration for the button selection.
 */
 const cls_TextTypeInfo = cls_EditorConfig.AddonTypes.find(x => x.Type.toLowerCase() == "text");

const observer = new MutationObserver(([mutation]) => {

    // This is to observe that a block has been created.
    if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((value) => {
            CLS_HandleNodeTypeLookup(value);
            // we found the button that was added dynamically so now we 
            // are looking to find the edit button then we can disconnect.
        });
    }
    if (mutation.type == "childList") {
        mutation.target.childNodes.forEach((value) => {
            // this is the button they will click for editing.
            // this just helps us remove a mutation observer quicker.
            if (value && value.innerHTML && (value.innerHTML.includes('aria-label="Edit"') && value.innerHTML.includes('aria-label="Remove"'))) {
                CLS_HandleSPPopupButtons(value)
            }
            // this handles the editor modal and allows us to add our 
            if (value && value.innerHTML && value.innerHTML.includes(cls_EditorConfig.ModalEditorClass)) {
                CLS_HandleEditorLookup(value);
            }
            // this handles if a items is deleted and we have a value for it then we go ahead and delete it in the database.
            if(value && value.innerHTML && value.innerHTML.includes('data-test="confirm-btn"') && value.innerHTML.includes('data-test="cancel-btn"') && deletingNode) {
                CLS_HandleDeleteConfirmation(value);
            }
        });
    }
});

/**
 * If they are deleting a node then we check here to see if we need to delete settings for the given node.
 * @param {Element} value 
 */
const CLS_HandleDeleteConfirmation = function(value) {
    /**
     * @type {HTMLButtonElement}
     */
    const confirmButton = value.querySelector('button[data-test="confirm-btn"]');
    if (confirmButton) {
        console.log("we think this is the confirm button", confirmButton);
        confirmButton.onclick = function () {
            // TODO: we need to delete the value from the database here.
            /**
             * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
             */
            let currentSaveItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
            if (currentSaveItems) {
                currentSaveItems = currentSaveItems.filter(x => x.ElementId != cls_currentId);
                console.log("Current saved items after delete: ", currentSaveItems);
                CLS_SetItems(cls_itemsToSaveCacheKey, JSON.stringify(currentSaveItems));
            }
            /**
             * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
             */
             let currentDbItems = JSON.parse(localStorage.getItem(cls_currentSavedItemsCacheKey));
             if (currentDbItems) {
                 let removeItems = currentDbItems.filter(x => x.ElementId == cls_currentId);
                 console.log("These are the items we need to remove from the DB", removeItems);
                 currentDbItems = currentDbItems.filter(x => x.ElementId != cls_currentId)
                 console.log("Current db items after delete: ", currentDbItems);
                 CLS_SetItems(cls_currentSavedItemsCacheKey, JSON.stringify(currentDbItems));
             }
        }
    }
    const cancelButton = value.querySelector('button[data-test="cancel-btn"]');
    if (cancelButton) {
        console.log("we think this is the cancel button", cancelButton);
        cancelButton.onclick = function () {
            console.log("canceled");
        }
    }
    if(cancelButton && confirmButton) {
        deletingNode = false;
    }
}

/**
 * 
 * @param {Element} value 
 */
const CLS_HandleSPPopupButtons = function(value) {
    /**
     * @type {HTMLButtonElement}
     */
    const editButton = value.querySelector('button[aria-label="Edit"]');
    if (editButton) {
        console.log("we think this is the edit button", editButton);
        editButton.onclick = function () {
            observer.observe(window.parent.document, { childList: true, subtree: true });
        }
    }
    /**
     * @type {HTMLButtonElement}
     */
     const removeButton = value.querySelector('button[aria-label="Remove"]');
     if (removeButton) {
         console.log("we think this is the remove button", removeButton);
         removeButton.onclick = function () {
            deletingNode = true;
            observer.observe(window.parent.document, { childList: true, subtree: true });
         }
     }
     if(editButton && removeButton) {
        observer.disconnect();
     }
    
}

/**
 * Handles what type of button may have been created on the dom through the "add block editor"
 * @param {Element} value 
 */
const CLS_HandleNodeTypeLookup = function(value) {
    if (value && value.classList)  {
        // If it is of type button 
        if(value.classList.contains(cls_ButtonTypeInfo.SelectorClass)) {
            cls_currentId = value.id;
            cls_CurrentEditType = cls_ButtonTypeInfo.Type;
            return true;
            // here we are just making sure 
            //observer.observe(window.parent.document, { childList: true, subtree: true });
        }
        else if(value.classList.contains(cls_TextTypeInfo.SelectorClass)) {
            cls_currentId = value.id;
            cls_CurrentEditType = cls_TextTypeInfo.Type;
            return true;
            // here we are just making sure 
            //observer.observe(window.parent.document, { childList: true, subtree: true });
        }
    }
    return false;
}

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
    ToggleClassWithToggleElement: function (selectedId, functionClass, elementType, toggleLabelElement, event) {

        const element = document.getElementById(selectedId);
        element.classList.toggle(functionClass, event.currentTarget.checked);
        toggleLabelElement.classList.toggle('cls-sp-toggle-checked', event.currentTarget.checked);
        /**
         * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
         */
        let currentItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
        if (currentItems) {
            const foundEntry = currentItems.findIndex(x => x.ElementId == selectedId && x.ElementClass == functionClass && x.ElementType == elementType);
            if (foundEntry != -1) {
                currentItems.splice(foundEntry, 1);
            }
        }
        else {
            currentItems = [];
        }
        currentItems.push({ ElementId: selectedId, ElementClass: functionClass, ElementType: elementType, IsChecked: event.currentTarget.checked});
        CLS_SetItems(cls_itemsToSaveCacheKey, JSON.stringify(currentItems));
    },

    /**
     * Global class to toggle and handle updates to toggle GLOBAL classes by ids that exist in CSS
     *
     * @param {string} selectedId 
     * @param {string} functionClass 
     * @param {string} elementType 
     * @param {HTMLInputElement} toggleLabelElement 
     * @param {Event} event 
     */
     GlobalToggleClassWithToggleElement: function (selectedId, functionClass, elementType, toggleLabelElement, event) {

        const foundType = cls_EditorConfig.AddonTypes.find(x => x.Type == elementType);
        const elementList = document.getElementsByClassName(foundType.SelectorClass);
        for(let element of elementList) {
            element.classList.toggle(functionClass, event.currentTarget.checked);
            element.classList.toggle(`${functionClass}-global`, event.currentTarget.checked);
            toggleLabelElement.classList.toggle('cls-sp-toggle-checked', event.currentTarget.checked);
        }
        /**
         * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
         */
        let currentItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
        if (currentItems) {
            const foundEntry = currentItems.findIndex(x => x.IsGlobal == true && x.ElementClass == functionClass && x.ElementType == elementType);
            if (foundEntry != -1) {
                currentItems.splice(foundEntry, 1);
            }
        }
        else {
            currentItems = [];
        }
        currentItems.push({ ElementId: "", ElementClass: functionClass, ElementType: elementType, IsChecked: event.currentTarget.checked, IsGlobal: true});
        CLS_SetItems(cls_itemsToSaveCacheKey, JSON.stringify(currentItems));
    },

    /**
     * Global class to toggle and handle updates to toggle classes by ids that exist in CSS
     *
     * @param {string} selectedId 
     * @param {string} functionClass 
     * @param {string} elementType 
     * @param {HTMLInputElement} toggleLabelElement 
     * @param {Event} event 
     */
    ToggleClassWithToggleElementAndColorSelection: function (selectedId, functionClass, elementType, toggleLabelElement, event) {

        const element = document.getElementById(selectedId);
        toggleLabelElement.classList.toggle('cls-sp-toggle-checked', event.currentTarget.checked);
        
        if(event.currentTarget.checked) {
            // TODO: create color selection items here.
        }
        else {
            // TODO: remove color selection items here.
        }
        /**
         * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
         */
        let currentItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
        if (currentItems) {
            const foundEntry = currentItems.findIndex(x => x.ElementId == selectedId && x.ElementClass == functionClass && x.ElementType == elementType);
            if (foundEntry != -1) {
                currentItems.splice(foundEntry, 1);
            }
        }
        else {
            currentItems = [];
        }
        currentItems.push({ ElementId: selectedId, ElementClass: functionClass, ElementType: elementType, IsChecked: event.currentTarget.checked});
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
const CLS_HandleSaveButtonAddRemove = function () {
    if (cls_InsertedIcon && cls_EditorNavSection) {
        /**
         * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
         */
         const saveItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
        /**
         * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
         */
        const dbItems = JSON.parse(localStorage.getItem(cls_currentSavedItemsCacheKey));
        const request = CLS_BuildRequest(saveItems, dbItems);
        if (request.AddList.length > 0 || request.RemoveList.length > 0) {
            if (cls_EditorNavSection.parentElement.getElementsByClassName('cls-save-button-container').length == 0) {
                cls_EditorNavSection.parentElement.insertBefore(CLS_GetSaveButton(), cls_InsertedIcon);
            }
        }
        else {
            if (cls_EditorNavSection.parentElement.getElementsByClassName('cls-save-button-container').length > 0) {
                const button = cls_EditorNavSection.parentElement.getElementsByClassName('cls-save-button-container')[0];
                button.classList.toggle('cls-fade-out', true);
                setTimeout(() => {
                    if(button) {
                        button.classList.toggle('cls-fade-out', false);
                        cls_EditorNavSection.parentElement.removeChild(button);
                    }
                }, 500);
            }
        }
    }
}

/**
 * Gets the save button to save items to the database
 * @returns 
 */
const CLS_GetSaveButton = function () {
    if (!cls_SaveToDbButton) {
        cls_SaveToDbButton = window.parent.document.createElement('div');
        cls_SaveToDbButton.classList.add('cls-save-button-container');

        // const saveButtonBackground = window.parent.document.createElement('div');
        // saveButtonBackground.classList.add(['cls-save-button-background']);

        const saveButton = window.parent.document.createElement('button');
        saveButton.classList.add('cls-save-button');
        saveButton.innerText = "Save";
        saveButton.onclick = async function () {
            /**
             * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
             */
            let editedItems = JSON.parse(localStorage.getItem(cls_itemsToSaveCacheKey));
            if (!editedItems) {
                editedItems = [];
            }
            /**
             * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
             */
            let itemsInDb = JSON.parse(localStorage.getItem(cls_currentSavedItemsCacheKey));
            if (!itemsInDb) {
                itemsInDb = [];
            }
            // get request to send to server.
            const request = CLS_BuildRequest(editedItems, itemsInDb);
            const response = await CLS_MakeRequest(`${cls_apiUrl}/api/user/adjust-user-element-list`, 'POST', 'json', {}, request);
            if (response.StatusCode == "SUCCESS") {
                console.log("SUCCESS RESPONSE: ", response);
                itemsInDb = request.AddList.forEach(x => itemsInDb.push(x));
                itemsInDb = itemsInDb.filter(x => !request.RemoveList.some(y => x.ElementId == y.ElementId && x.ElementType == y.ElementType && x.ElementClass == y.ElementClass));
                localStorage.setItem(cls_currentSavedItemsCacheKey, JSON.stringify(itemsInDb));
                localStorage.setItem(cls_itemsToSaveCacheKey, "[]");
            }
            else {
                console.log("ERROR RESPONSE: ", response);
            }
            CLS_HandleSaveButtonAddRemove();
            console.log("Here is the new saved list", itemsInDb);
        }
        cls_SaveToDbButton.appendChild(saveButton);
        // cls_SaveToDbButton.appendChild(saveButtonBackground);
    }
    return cls_SaveToDbButton;

}

/**
 * 
 * @param {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean}>} editedItems 
 * @param {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean}>} itemsInDb 
 * @returns 
 */
const CLS_BuildRequest = function(editedItems, itemsInDb) {
    /**
     * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
     */
     const addList = [];
     /**
      * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
      */
     const removeList = [];
     for(let value of editedItems) {
        /**
         * @type {{ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean}}
         */
         const foundItem = itemsInDb.find(x => x.ElementId == value.ElementId && x.ElementType == value.ElementType && x.ElementClass == value.ElementClass);
         if(value.IsChecked && !foundItem) {
             addList.push(value);
         }
         else if(!value.IsChecked && foundItem) {
             removeList.push(value);
         }
     }
     const request = {
         AddList: addList,
         RemoveList: removeList
     };
     console.log("CLS_BuildRequest result: ", request);
     return request;
}

/**
 * Gets the iFrame element.
 * @param {boolean} innerDocument if true returns inner-iFrame document. defaults to false.
 * @returns {HTMLIFrameElement | Document}
 */
const CLS_GetIFrame = function (innerDocument = false) {
    if (innerDocument) {
        /**
         * @type {HTMLIFrameElement}
         */
        let innerIframe = window.parent.document.getElementById(cls_EditorConfig.IFrameId);
        if (innerIframe) {
            return innerIframe.contentDocument || innerIframe.contentWindow.document;
        }
    }
    return window.parent.document.getElementById(cls_EditorConfig.IFrameId);
}

/**
 * Utility method to look up editors.
 * @param {Element} value 
 */
const CLS_HandleEditorLookup = function (value) {
    const elementList = value.getElementsByClassName(cls_EditorConfig.ModalEditorClass);
    if (elementList && elementList.length > 0) {
        if (elementList[0].classList[0].toLowerCase() == cls_EditorConfig.ModalEditorClass.toLowerCase()) {
            const editorModal = elementList[0];
            let tabList;
            let tabBody;
            if (cls_CurrentEditType == cls_ButtonTypeInfo.Type) {
                tabList = editorModal.querySelector(cls_ButtonTypeInfo.ModalEditorTabListQuerySelector);
                tabBody = editorModal.querySelector(cls_ButtonTypeInfo.ModalEditorBodyQuerySelector);
            }
            if (cls_CurrentEditType == cls_TextTypeInfo.Type) {
                tabList = editorModal.querySelector(cls_TextTypeInfo.ModalEditorTabListQuerySelector);
                tabBody = editorModal.querySelector(cls_TextTypeInfo.ModalEditorBodyQuerySelector);
            }
            if (tabList && tabBody) {
                if (tabList.children.length > 0) {
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
const CLS_CreateNewEditorTab = function (tabList, tabBody) {
    if (tabList.innerHTML.includes("ColdLabs Editor")) {
        return;
    }
    const newBody = window.parent.document.createElement("div");
    newBody.classList.add('cls-item-list');
    newBody.style = "display: none;";

    if (cls_CurrentEditType == cls_ButtonTypeInfo.Type) {
        const distinctLabels = [...new Set(cls_ButtonTypeInfo.AddonFunctions.map(functionList => functionList.FunctionGroupLabel).sort())];
        for (let distinctLabel of distinctLabels) {
            newBody.appendChild(CLS_CreateLabel(distinctLabel));
            let viewFunctionList = cls_ButtonTypeInfo.AddonFunctions.filter(functionInfo => functionInfo.FunctionGroupLabel == distinctLabel).sort();
            for (let viewFunction of viewFunctionList) {
                if(viewFunction.FunctionViewType == "toggle") {
                    newBody.appendChild(CLS_CreateToggle(viewFunction.FunctionLabel, viewFunction.FunctionName, viewFunction.FunctionClass, viewFunction.IsDisabled, cls_ButtonTypeInfo.Type));
                }
            }
        }
    }
    if (cls_CurrentEditType == cls_TextTypeInfo.Type) {
        const distinctLabels = [...new Set(cls_TextTypeInfo.AddonFunctions.map(functionList => functionList.FunctionGroupLabel).sort())];
        for (let distinctLabel of distinctLabels) {
            newBody.appendChild(CLS_CreateLabel(distinctLabel));
            let viewFunctionList = cls_TextTypeInfo.AddonFunctions.filter(functionInfo => functionInfo.FunctionGroupLabel == distinctLabel).sort();
            for (let viewFunction of viewFunctionList) {
                if(viewFunction.FunctionViewType == "toggle") {
                    newBody.appendChild(CLS_CreateToggle(viewFunction.FunctionLabel, viewFunction.FunctionName, viewFunction.FunctionClass, viewFunction.IsDisabled, cls_TextTypeInfo.Type));
                }
            }
        }
    }

    const newTab = tabList.children[tabList.children.length - 1].cloneNode(true);
    newTab.firstChild.id = `tab_${tabList.children.length}`;
    newTab.firstChild.ariaLabel = "ColdLabs Editor";
    newTab.firstChild.ariaSelected = "false";
    newTab.firstChild.value = tabList.children.length;
    newTab.firstChild.firstChild.innerHTML = "ColdLabs Editor";
    newTab.firstChild.onclick = ((event) => {
        newTab.firstChild.ariaSelected = "true";
        newBody.style = "display: block;width: 100%;height: 100%;background: rgb(255, 255, 255);position: absolute;top: 0;left: 0;z-index: 9999;overflow: hidden auto;";

        let left = 0;
        for (let x = 0; x < tabList.children.length - 2; x++) {
            left += tabList.children[x].clientWidth + 16;
        }
        const width = newTab.clientWidth;
        tabList.lastElementChild.style = `left: ${left}px; width: ${width}px;`;
    });

    for (let x = 0; x < tabList.children.length; x++) {
        tabList.children[x].firstChild.onclick = ((event) => {
            newTab.firstChild.ariaSelected = "false";
            newBody.style = "display: none;";

            let left = 0;
            for (let y = 0; y < x; y++) {
                left += tabList.children[y].clientWidth + 16;
            }
            const width = tabList.children[x].clientWidth;
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
 * @returns {HTMLDivElement}
 */
const CLS_CreateLabel = function (labelName, largeLabel = false) {
    const labelWrapper = window.parent.document.createElement("div");
    labelWrapper.setAttribute("data-field", "true");
    const label = window.parent.document.createElement("label");
    label.classList.add('cls-sp-toggle-label');
    if(largeLabel) {
        label.classList.add('cls-sp-toggle-label-large');
    }
    label.innerHTML = labelName;
    labelWrapper.appendChild(label);
    return labelWrapper;
}

/**
 * Creates a toggle element based on square space styles.
 * And sets it's on change actions based on what it should do.
 * @param {string} toggleName 
 * @returns {HTMLDivElement}
 */
const CLS_CreateToggle = function (toggleName, toggleFunction, toggleClassName, isDisabled, editType, isGlobal = false) {

    const targetIdElement = document.getElementById(cls_currentId);
    // TODO: handle if it is a global to go ahead and have it checked. Probably through the element list.
    let isGloballyChecked = false;
    let idIsChecked = false; 
    if(targetIdElement) {
        isGloballyChecked = targetIdElement.classList.contains(`${toggleClassName}-global`);
        idIsChecked = targetIdElement.classList.contains(toggleClassName);
    }
    if(isGlobal) {
        /**
         * @type {Array<{Id: number, ElementId: string, ElementClass: string, ElementType: string, IsChecked: boolean, IsGlobal: boolean}>}
         */
        let dbItems = JSON.parse(localStorage.getItem(cls_currentSavedItemsCacheKey));
        let foundItem = dbItems.find(x => x.ElementClass == toggleClassName && x.IsGlobal == true);
        if(foundItem) {
            idIsChecked = true;
        }
    }

    // |
    const toggleOuterWrapper = window.parent.document.createElement("div");
    toggleOuterWrapper.classList.add('cls-sp-toggle-outer-wrapper');
    // |-|
    const toggleOuterContainer = window.parent.document.createElement("div");
    toggleOuterContainer.classList.add('cls-sp-toggle-outer-container');
    // |-|-|
    const toggleInnerContainer = window.parent.document.createElement('div');
    toggleInnerContainer.classList.add('cls-sp-toggle-inner-container');

    const toggleLockedIcon = window.parent.document.createElement('span');
    if(isDisabled) {
        toggleInnerContainer.setAttribute("disabled",  "");
        toggleLockedIcon.classList.add('material-icons');
        toggleLockedIcon.innerHTML = "lock";
        toggleLockedIcon.onclick = () => {
            window.open("https://coldllabs.co");
        }
    }
    const toggleGlobalIcon = window.parent.document.createElement('span');
    if(isGloballyChecked) {
        toggleInnerContainer.setAttribute("disabled",  "");
        toggleGlobalIcon.classList.add('material-icons');
        toggleGlobalIcon.innerHTML = "public";
    }
    // |-|-|-|
    const toggleInnerLabelContainer = window.parent.document.createElement('div');
    toggleInnerLabelContainer.classList.add('cls-sp-toggle-inner-label-container');
    // |-|-|-|-|
    const toggleInnerLabel = window.parent.document.createElement('label');
    toggleInnerLabel.classList.add('cls-sp-toggle-inner-label');
    toggleInnerLabel.innerHTML = toggleName;
    // |-|-|-|
    const toggleContainer = window.parent.document.createElement('div');
    toggleContainer.classList.add('cls-sp-toggle-container');
    
    // |-|-|-|-|
    const toggleLabel = window.parent.document.createElement('label');
    toggleLabel.classList.add('cls-sp-toggle');
    toggleLabel.classList.toggle('cls-sp-toggle-checked', idIsChecked);
    // |-|-|-|-|-|
    const toggleInput = window.parent.document.createElement('input');
    toggleInput.classList.add('cls-sp-toggle-input');
    toggleInput.type = 'checkbox';
    toggleInput.height = 12;
    toggleInput.width = 12;
    toggleInput.checked = idIsChecked;
    toggleInput.onchange = CLS_Functions[toggleFunction].bind(this, cls_currentId, toggleClassName, editType, toggleLabel);
    // |-|
    const toggleUnderLine = window.parent.document.createElement('div');
    toggleUnderLine.classList.add('cls-sp-toggle-under-line');
    // |-|-|
    const toggleUnderLineInner = window.parent.document.createElement('div');
    toggleUnderLineInner.classList.add('cls-sp-toggle-under-line-inner');

    toggleInnerLabelContainer.appendChild(toggleInnerLabel);

    toggleLabel.appendChild(toggleInput);
    toggleContainer.appendChild(toggleLabel);

    toggleInnerContainer.appendChild(toggleInnerLabelContainer);
    if(isDisabled) {
        toggleInnerContainer.appendChild(toggleLockedIcon);
    }
    if(isGloballyChecked) {
        toggleInnerContainer.appendChild(toggleGlobalIcon);
    }
    toggleInnerContainer.appendChild(toggleContainer);

    toggleOuterContainer.appendChild(toggleInnerContainer);

    toggleUnderLine.appendChild(toggleUnderLineInner);

    toggleOuterWrapper.appendChild(toggleOuterContainer);
    toggleOuterWrapper.appendChild(toggleUnderLine);

    return toggleOuterWrapper;
}
//#endregion


const readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        CLS_ValidateLocalStorage();
        CLS_AppendStyles();
        CLS_InitApplication();
    }
}, 10);