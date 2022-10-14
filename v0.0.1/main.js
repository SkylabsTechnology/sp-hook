// GLOBALS
var cls_currentId = "";

// utils
var getIFrame = function(innerDocument = false) {
    if(innerDocument) {
        var innerIframe = window.parent.document.getElementById('sqs-site-frame');
        if(innerIframe) {
            return innerIframe.contentDocument || innerIframe.contentWindow.document;
        }
    }
    return window.parent.document.getElementById('sqs-site-frame');
}
const observer = new MutationObserver(([mutation]) => {
    console.log("list of nodes added", mutation);
    
    if(mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((value) => {
            if(value && value.classList && value.classList.contains("sqs-block-button")) {
                console.log("we found the button we are going to edit", value);
                console.log("this is it's id:", value.id);
                cls_currentId = value.id;
                observer.observe(window.parent.document, {childList: true, subtree: true});
            }
            // if(value && value.classList && value.classList.contains("fs-unmask")) {
            //     console.log("we found the edit modal. now we need to listen for the edit click", value);
            // }
            // if(value && value.classList && value.classList.contains("css-roynbj")) {
            //     console.log("we found the editor, now we can add content to the content boi", value);
            // }
        });
    }
    if(mutation.type == "childList") {
        mutation.target.childNodes.forEach((value) => {
            if(value && value.innerHTML && value.innerHTML.includes("css-roynbj")) {
                HandleEditorLookup(value);
            }
        });
    }
});

/**
 * 
 * @param {Element} value 
 */
function HandleEditorLookup(value) {
    let elementList = value.getElementsByClassName("css-roynbj");
    if(elementList && elementList.length > 0) {
        if(elementList[0].classList[0] == "css-roynbj") {
            var editorModal = elementList[0];
            console.log("Here is our editor: ", editorModal);
            let tabList = editorModal.querySelector('div[role="tablist"]');
            let tabBody = editorModal.querySelector('div[data-test="button-block-editor-form"]');
            if(tabList) {
                console.log("here is our tab list", tabList);
                if(tabList.children.length > 0) {
                    CreateNewEditorTab(tabList, tabBody);
                }
            }
        }
        
    }
}
/**
 * 
 * @param {Element} tabList 
 * @param {Element} tabBody
 */
function CreateNewEditorTab(tabList, tabBody) {
    if(tabList.innerHTML.includes("ColdLabs Editor")){
        return;
    }
    let newBody = window.parent.document.createElement("div");
    newBody.classList.add(['cl-item-list']);
    newBody.style = "display: none;";
    let animationsLabel = CreateLabel("Animiations");
    let shakeButtonToggle = CreateToggle("Blur Button");
    let shakeButtonToggle2 = CreateToggle("Blur Button 2");
    newBody.appendChild(animationsLabel);
    newBody.appendChild(shakeButtonToggle);
    newBody.appendChild(shakeButtonToggle2);
    
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

function CreateLabel(labelName) {
    let labelWrapper = window.parent.document.createElement("div");
    labelWrapper.setAttribute("data-field", "true");
    let label = window.parent.document.createElement("label");
    label.style = `color: rgb(110, 110, 110);display: block;margin-top: 33px;overflow: hidden;padding-left: 22px;padding-right: 22px;margin-left: 0px;box-sizing: border-box;text-rendering: optimizelegibility;-webkit-font-smoothing: antialiased;font-weight: 500;font-family: Clarkson, "Helvetica Neue", Helvetica, Arial, sans-serif;text-transform: uppercase;font-size: 9.75px;letter-spacing: 0.75px;line-height: 16px;text-overflow: ellipsis;`;
    label.innerHTML = labelName;
    labelWrapper.appendChild(label);
    return labelWrapper;
}

function CreateToggle(toggleName) {
    var targetId = document.getElementById(cls_currentId);
    var idIsChecked = targetId.style.filter == 'blur(2px)' ? true : false;
    var toggleUnChecked = `background-color: rgb(110, 110, 110);
                           border-radius: 8px;
                           box-sizing: border-box;
                           height: 16px;
                           position: relative;
                           width: 28px;
                           display: flex;
                           cursor: pointer;
                           transition: background-color 300ms cubic-bezier(0.32, 0.94, 0.6, 1) 0s;
                           -webkit-box-align: center;
                           align-items: center;
                           justify-content: flex-start;`;
    var toggleChecked = `background-color: rgb(142, 70, 163);
                         border-radius: 8px;
                         box-sizing: border-box;
                         height: 16px;
                         position: relative;
                         width: 28px;
                         display: flex;
                         cursor: pointer;
                         transition: background-color 300ms cubic-bezier(0.32, 0.94, 0.6, 1) 0s;
                         -webkit-box-align: center;
                         align-items: center;
                         justify-content: flex-end;`;
    // |
    var toggleOuterWrapper = window.parent.document.createElement("div");
    toggleOuterWrapper.style = `margin-left: 22px;
                                margin-right: 22px;
                                box-sizing: border-box;`;
    // |-|
    var toggleOuterContainer = window.parent.document.createElement("div");
    toggleOuterContainer.style = `display: block;
                                  min-height: 44px;
                                  padding-top: 11px;
                                  padding-bottom: 11px;
                                  box-sizing: border-box;
                                  cursor: inherit;
                                  hyphens: auto;`;
    // |-|-|
    var toggleInnerContainer = window.parent.document.createElement('div');
    toggleInnerContainer.style = `box-sizing: border-box;
                                  display: flex;
                                  -webkit-box-align: center;
                                  align-items: center;
                                  flex-direction: row;
                                  -webkit-box-pack: justify;
                                  justify-content: space-between;`;
    // |-|-|-|
    var toggleInnerLabelContainer = window.parent.document.createElement('div');
    toggleInnerLabelContainer.style = `margin-right: 11px;
                                       width: 342px;
                                       box-sizing: border-box;
                                       display: flex;
                                       -webkit-box-align: center;
                                       align-items: center;`;
    // |-|-|-|-|
    var toggleInnerLabel = window.parent.document.createElement('label');
    toggleInnerLabel.style = `margin: 0px;
                              box-sizing: border-box;
                              text-rendering: optimizelegibility;
                              -webkit-font-smoothing: antialiased;
                              color: rgb(14, 14, 14);
                              font-weight: 400;
                              font-family: Clarkson, "Helvetica Neue", Helvetica, Arial, sans-serif;
                              font-size: 14px;
                              line-height: 22px;`;
    toggleInnerLabel.innerHTML = toggleName;
    // |-|-|-|
    var toggleContainer = window.parent.document.createElement('div');
    toggleContainer.style = `margin-left: 11px;
                             box-sizing: border-box;
                             display: flex;
                             -webkit-box-align: center;
                             align-items: center;
                             -webkit-box-pack: end;
                             justify-content: flex-end;`;
    // |-|-|-|-|
    var toggleLabel = window.parent.document.createElement('label');
    toggleLabel.style = idIsChecked == true ? toggleChecked : toggleUnChecked;
    // |-|-|-|-|-|
    var toggleInput = window.parent.document.createElement('input');
    toggleInput.style = `background-color: rgb(255, 255, 255);
                         border-radius: 50%;
                         box-sizing: border-box;
                         height: 12px;
                         margin: 2px;
                         width: 12px;
                         appearance: none;
                         cursor: pointer;
                         outline: none;
                         transition: all 300ms cubic-bezier(0.32, 0.94, 0.6, 1) 0s;`;
    toggleInput.type = 'checkbox';
    toggleInput.height = 12;
    toggleInput.width = 12;
    toggleInput.checked = idIsChecked;
    toggleInput.onchange = (event) => {
        // document.getElementById(cls_currentId).classList.toggle("cls-shake-button-animation", event.currentTarget.checked);
        if(event.currentTarget.checked) {
            document.getElementById(cls_currentId).style = `filter: blur(2px)`;
            toggleLabel.style = toggleChecked;
        }
        else {
            document.getElementById(cls_currentId).style = ``;
            toggleLabel.style = toggleUnChecked;
        }
    };
    // |-|
    var toggleUnderLine = window.parent.document.createElement('div');
    toggleUnderLine.style = `background-color: rgb(231, 231, 231);
                             height: 1px;
                             width: 100%;
                             box-sizing: border-box;`;
    // |-|-|
    var toggleUnderLineInner = window.parent.document.createElement('div');
    toggleUnderLineInner.style = `background-color: rgb(14, 14, 14);
                                  height: 1px;
                                  width: 0%;
                                  box-sizing: border-box;
                                  transition: all 0.3s cubic-bezier(0.32, 0.94, 0.6, 1) 0s;`;

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

// initial check when people are adding elements.
if(window.parent.document.body.classList.contains("squarespace-editable")) {
    getIFrame(true).addEventListener('click', function(event) {
        if(event && event.srcElement) {
            if(event.srcElement.className.startsWith('block-selector') &&
               event.srcElement.innerHTML == "Button") {
                console.log("they have added a button: ", event);
                observer.observe(event.srcElement.ownerDocument, {childList: true, subtree: true})
            }
            if(event.srcElement.classList) {
                if(event.srcElement.classList.contains("sqs-block-button")) {
                    console.log("we clicked the outer button", event);
                    console.log("this is the id: ", event.srcElement.id);
                    cls_currentId = event.srcElement.id;
                    observer.observe(window.parent.document, {childList: true, subtree: true}) 
                }
                else if(event.srcElement.classList.contains("sqs-block-button-container")) {
                    console.log("we clicked a button", event);
                    console.log("this is the id: ", event.srcElement.id);
                    cls_currentId = event.srcElement.id;
                    observer.observe(window.parent.document, {childList: true, subtree: true})
                }
            }
        }
    });
}
else {
    console.error("the website is not editable");
}