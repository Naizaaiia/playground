var final;
  var str;
  var content;
  
	//Constants.
SEP_PADDING = 5
HANDLE_PADDING = 7
var yToolbars = new Array();  // Array of all toolbars.

// Initialize everything when the document is ready
var imgs;
var YInitialized = false;
function document.onreadystatechange() {
  if (YInitialized) return;
  YInitialized = true;
  var i, s, curr;
  // Find all the toolbars and initialize them.
  for (i=0; i<document.body.all.length; i++) {
    curr=document.body.all[i];
    if (curr.className == "yToolbar") {
      if (! InitTB(curr)) {
        alert("Toolbar: " + curr.id + " failed to initialize. Status: false");
      }
      yToolbars[yToolbars.length] = curr;
    }
  }

  //Lay out the page, set handler.
  DoLayout();
  window.onresize = DoLayout;
  Composition.document.open()
  Composition.document.write("<BODY MONOSPACE STYLE=\"font:10pt arial,sans-serif\"></body>");
  Composition.document.close()
  Composition.document.designMode="On"
  //setTimeout("Composition.focus()",0)

}

// Initialize a toolbar button
function InitBtn(btn) {
  btn.onmouseover = BtnMouseOver;
  btn.onmouseout = BtnMouseOut;
  btn.onmousedown = BtnMouseDown;
  btn.onmouseup = BtnMouseUp;
  btn.ondragstart = YCancelEvent;
  btn.onselectstart = YCancelEvent;
  btn.onselect = YCancelEvent;
  btn.YUSERONCLICK = btn.onclick;
  btn.onclick = YCancelEvent;
  btn.YINITIALIZED = true;
  return true;
}

//Initialize a toolbar. 
function InitTB(y) {
  // Set initial size of toolbar to that of the handle
  y.TBWidth = 0;
  // Populate the toolbar with its contents
  if (! PopulateTB(y)) return false;
  // Set the toolbar width and put in the handle
  y.style.posWidth = y.TBWidth;
  
  return true;
}


// Hander that simply cancels an event
function YCancelEvent() {
  event.returnValue=false;
  event.cancelBubble=true;
  return false;
}

// Toolbar button onmouseover handler
function BtnMouseOver() {
  if (event.srcElement.tagName != "IMG") return false;
  var image = event.srcElement;
  var element = image.parentElement;
  
  // Change button look based on current state of image.
  if (image.className == "Ico") element.className = "BtnMouseOverUp";
  else if (image.className == "IcoDown") element.className = "BtnMouseOverDown";

  event.cancelBubble = true;
}

// Toolbar button onmouseout handler
function BtnMouseOut() {
  if (event.srcElement.tagName != "IMG") {
    event.cancelBubble = true;
    return false;
  }

  var image = event.srcElement;
  var element = image.parentElement;
  yRaisedElement = null;
  
  element.className = "Btn";
  image.className = "Ico";
  event.cancelBubble = true;
}

// Toolbar button onmousedown handler
function BtnMouseDown() {
  
  if (event.srcElement.tagName != "IMG") {
    event.cancelBubble = true;
    event.returnValue=false;
    return false;
  }

  var image = event.srcElement;
  var element = image.parentElement;

  element.className = "BtnMouseOverDown";
  image.className = "IcoDown";

  event.cancelBubble = true;
  event.returnValue=false;
  return false;
}

// Toolbar button onmouseup handler
function BtnMouseUp() {
  if (event.srcElement.tagName != "IMG") {
    event.cancelBubble = true;
    return false;
  }

  var image = event.srcElement;
  var element = image.parentElement;

  if (element.YUSERONCLICK) eval(element.YUSERONCLICK + "anonymous()");
  element.className = "BtnMouseOverUp";
  image.className = "Ico";
  event.cancelBubble = true;
 
  return false;
}

// Populate a toolbar with the elements within it
function PopulateTB(y) {
  var i, elements, element;

  // Iterate through all the top-level elements in the toolbar
  elements = y.children;
  for (i=0; i<elements.length; i++) {
    element = elements[i];
    if (element.tagName == "SCRIPT" || element.tagName == "!") continue;
    
    switch (element.className) {
    case "Btn":
      if (element.YINITIALIZED == null) {
	if (! InitBtn(element)) {
	  alert("Problem initializing:" + element.id);
	  return false;
	}
      }
      
      element.style.posLeft = y.TBWidth;
      y.TBWidth += element.offsetWidth + 1;
      break;
      
    case "TBGen":
      element.style.posLeft = y.TBWidth;
      y.TBWidth += element.offsetWidth + 1;
      break;
      
    case "TBSep":
      element.style.posLeft = y.TBWidth + 2;
      y.TBWidth += SEP_PADDING;
      break;
      
    case "TBHandle":
      element.style.posLeft = 2;
      y.TBWidth += element.offsetWidth + HANDLE_PADDING;
      break;
      
    default:
      alert("Invalid class: " + element.className + " on Element: " + element.id + " <" + element.tagName + ">");
      return false;
    }
  }

  y.TBWidth += 1;
  return true;
}

function DebugObject(obj) {
  var msg = "";
  for (var i in TB) {
    ans=prompt(i+"="+TB[i]+"\n");
    if (! ans) break;
  }
}

// Lay out the docked toolbars
function LayoutTBs() {
  NumTBs = yToolbars.length;

  // If no toolbars we're outta here
  if (NumTBs == 0) return;

  //Get the total size of a TBline.
  var i;
  var ScrWid = 650;//(document.body.offsetWidth) - 6;
  var TotalLen = ScrWid;
  for (i = 0 ; i < NumTBs ; i++) {
    TB = yToolbars[i];
    if (TB.TBWidth > TotalLen) TotalLen = TB.TBWidth;
  }

  var PrevTB;
  var LastStart = 0;
  var RelTop = 0;
  var LastWid, CurrWid;

  //Set up the first toolbar.
  var TB = yToolbars[0];
  TB.style.posTop = 0;
  TB.style.posLeft = 0;

  //Lay out the other toolbars.
  var Start = TB.TBWidth;
  for (i = 1 ; i < yToolbars.length ; i++) {
    PrevTB = TB;
    TB = yToolbars[i];
    CurrWid = TB.TBWidth;

    if ((Start + CurrWid) > ScrWid) { 
      //TB needs to go on next line.
      Start = 0;
      LastWid = TotalLen - LastStart;
    } 
    else { 
      //Ok on this line.
      LastWid = PrevTB.TBWidth;
      //RelTop -= TB.style.posHeight;
      RelTop -= TB.offsetHeight;
    }
      
    //Set TB position and LastTB width.
    TB.style.posTop = RelTop;
    TB.style.posLeft = Start;
    PrevTB.style.width = LastWid;

    //Increment counters.
    LastStart = Start;
    Start += CurrWid;
  } 

  //Set width of last toolbar.
  TB.style.width = TotalLen - LastStart;
  
  //Move everything after the toolbars up the appropriate amount.
  i--;
  TB = yToolbars[i];
  var TBInd = TB.sourceIndex;
  var A = TB.document.all;
  var item;
  for (i in A) {
    item = A.item(i);
    if (! item) continue;
    if (! item.style) continue;
    if (item.sourceIndex <= TBInd) continue;
    if (item.style.position == "absolute") continue;
    item.style.posTop = RelTop;
  }
}

//Lays out the page.
function DoLayout() {
  LayoutTBs();
}

// Check if toolbar is being used when in text mode
function validateMode() {
  if (! bTextMode) return true;
  alert("Please uncheck the \"View HTML source\" checkbox to use the toolbars");
  Composition.focus();
  return false;
}
//Formats text in composition.
function format(what,opt) {
  if (!validateMode()) return;
    if (opt=="removeFormat") {
    what=opt;
    opt=null;
  }

  if (opt==null) Composition.document.execCommand(what);
  else Composition.document.execCommand(what,"",opt);
  
  pureText = false;
  Composition.focus();
}

//Switches between text and html mode.
function setMode(newMode) {
  bTextMode = newMode;
  var cont;
  if (bTextMode) {
    cleanHtml();
    cleanHtml();

    cont=Composition.document.body.innerHTML;
    Composition.document.body.innerText=cont;
  } else {
    cont=Composition.document.body.innerText;
    Composition.document.body.innerHTML=cont;
  }
  
  Composition.focus();
}

//Finds and returns an element.
function getEl(sTag,start) {
  while ((start!=null) && (start.tagName!=sTag)) start = start.parentElement;
  return start;
}

function createLink() {
  if (!validateMode()) return;
  
  var isA = getEl("A",Composition.document.selection.createRange().parentElement());
  var str=prompt("Enter link location (e.g. http://www.yahoo.com):", isA ? isA.href : "http:\/\/");
  
  if ((str!=null) && (str!="http://")) {
    if (Composition.document.selection.type=="None") {
      var sel=Composition.document.selection.createRange();
      sel.pasteHTML("<A HREF=\""+str+"\">"+str+"</A> ");
      sel.select();
    }
    else format("CreateLink",str);
  }
  else Composition.focus();
}

//Sets the text color.
function foreColor() {
  if (! validateMode()) return;
  var arr = showModalDialog("/AMS/Editor/frmColorPicker.aspx", "", "font-family:Verdana; font-size:12; dialogWidth:30em; dialogHeight:28em;status=no;scroll=no;help=no;");
  if((arr != null) && (arr != "#xxxxxx")) format('forecolor', arr);
  else Composition.focus();
}

//Sets the background color.
function backColor() {
  if (!validateMode()) return;
  var arr = showModalDialog("/AMS/Editor/frmColorPicker.aspx", "", "font-family:Verdana; font-size:12; dialogWidth:30em; dialogHeight:28em;status=no;scroll=no;help=no;");
  if ((arr != null) && (arr != "#xxxxxx")) format('backcolor', arr);
  else Composition.focus()
}



/* Function to */
function cleanHtml() {
  var fonts = Composition.document.body.all.tags("FONT");
  var curr;
  for (var i = fonts.length - 1; i >= 0; i--) {
    curr = fonts[i];
    if (curr.style.backgroundColor == "#ffffff") curr.outerHTML = curr.innerHTML;
  }
}
/* Function to */
function getPureHtml() {
  var str = "";
  var paras = Composition.document.body.all.tags("P");
  if (paras.length > 0) {
    for (var i=paras.length-1; i >= 0; i--) str = paras[i].innerHTML + "\n" + str;
  } else {
    str = Composition.document.body.innerHTML;
  }
  return str;
}
/* Function to Embed Objects */
function embedobj() {
  if (!validateMode()) return;
  //document.frm.hdnreturnObject.value 
  window.open("Editor/frmEmbed.aspx", "","width=500px,height=300px,toolbars=no,statusbars=yes,scrollbars=yes,resizable=true");

	//GenerateCode();
}
function GenerateCode()
{
Composition.document.body.innerHTML = Composition.document.body.innerHTML + document.frm.hdnfilename.value;

}

function InsertTable() {
var arr = showModalDialog("/AMS/Editor/frmTableGenerator.aspx", "", "font-family:Verdana; font-size:10; dialogWidth:70em; dialogHeight:45em");
if(arr != undefined)
  {
	str = arr;
	//str = "<img src =\"/AMS/images/cmlimg.gif \" >";
	Composition.document.body.innerHTML = Composition.document.body.innerHTML + str;
	//content = Composition.document.body.innerHTML + str;  
  }
}
/* Added by tej on 13/05/2002 */

function SetStylesheetEditorValues()
{
	Composition.document.body.innerHTML = document.frm.hidvar.value ;
	
}
function loadcontent()
{
	Composition.document.body.innerHTML = content ;
}

function GetScreenChanged()
{
	//alert(Composition.document.body.innerHTML);
	document.frm.hdnQText.value = Composition.document.body.innerHTML;
}

function SetScreenChanged()
{
	//alert(document.frm.hdnQText.value);
	if (document.frm.hdnQText.value != "" )
	{
		Composition.document.body.innerHTML = document.forms[0].hdnQText.value;
	}
	Composition.focus(); // added by tej on 11/07/2002
}