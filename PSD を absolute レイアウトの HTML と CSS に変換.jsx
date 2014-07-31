//--------------------------------------------------------------------------
// convert PSD to HTML & CSS (absolute layout)
// Nobuhiro Takahashi
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// Global Setting
//--------------------------------------------------------------------------
var document,
    result,
    baseURL,
    baseDir,
    currentFolder;
    
const LIMIT = 200;
var count = 0;
var offsetMargin = 0;

//--------------------------------------------------------------------------
// User Setting
//--------------------------------------------------------------------------

var useFolder = false;
var TYPE_JPEG = "JPEG";
var TYPE_PNG = "PNG";
var saveFileFlag = true;
var saveFileType = TYPE_PNG;
var pngBit = 24;
var jpegQuality = 100;

var structureObj = [];

//--------------------------------------------------------------------------
// Utilities
//--------------------------------------------------------------------------
// filename without extension
function getNameRemovedExtendType(doc) {
	var nameParts = String(doc.name).split(".");
	var name = nameParts.splice(0, nameParts.length-1).join(".");
	return name;
}
// string validation
function getValidName(name){
	name = name.replace(/\/$/,"");
	return name.replace(/[\/\:\;\.\,\@\"\'\\]/g,"_");
}

// log
function report(){
	alert( result.join("\n") );
}

// toString
function toStringObj( obj ) {
	switch( typeof(obj) ) {
		case "object":
			var result = [];
			for( var i in obj ) {
				result.push( i + " : "+ toStringObj(obj[i]) );
			}
			return "{\n"+ result.join(",\n") + "\n}";
		break;
		default:
			return  '"' + String(obj) +'"';
		break;
	}
}

// make folder
function createFolder( folderName ) {
	currentFolder += getValidName(folderName)+"/";

	if( !useFolder ) return true;
	_createFolder(baseURL+currentFolder);
}

function _createFolder(url) {
	var folder = new Folder(url);
	
	if( folder.exists ) {
		return false;
	}
	else {
		folder.create();
		return true;
	}
}

// layer visiblity
function setVisible(obj, bool){
	var i=0, l;
	switch( obj.typename ) {
		//case "LayerSets":
		case "Layers":
			for( l=obj.length; i<l; ++i ) {
				setVisible(obj[i],bool);
			}
		break;
		case "LayerSet":
			obj.visible = bool;
			for( l=obj.layers.length; i<l; ++i ) {
				setVisible(obj.layers[i], bool);
			}
		break;
		default:
			obj.visible = bool;
			if( bool ) displayParent( obj );
		break;
	}
}

// check parent
function displayParent(obj){
	if(obj.parent){
		obj.parent.visible = true;
		displayParent( obj.parent );
	}
}

// check is layerset
function isLayerSet(obj){
	return Boolean(obj.typename == "LayerSet");
}

// save file to png
function savePNG(path, name, bit) {
	var exp = new ExportOptionsSaveForWeb();
	exp.format = SaveDocumentType.PNG;
	exp.interlaced　= false;

	if(bit == 8) {
		exp.PNG8 = true;
	}
	else {
		exp.PNG8 = false;
	}

	fileObj = new File(  getFileName( path, name, "png") );
	activeDocument.exportDocument(fileObj, ExportType.SAVEFORWEB, exp);
	
	return fileObj.name;
}

// save file to jpg
function saveJPEG(path, name, quality){
	var exp = new ExportOptionsSaveForWeb();
	exp.format = SaveDocumentType.JPEG;
	exp.interlaced　= false;
	exp.optimized= false;
	exp.quality = quality;
    
	fileObj = new File( getFileName(path, name, "jpg"));
	
	activeDocument.exportDocument(fileObj, ExportType.SAVEFORWEB, exp);
	
	return fileObj.name;
}

// check extract file 
function getFileName( path, name, ext, doubleCheck ) {
	if( useFolder ) {
		path = baseURL + path;
	}
	else {
		name = getValidName(path+name);
		path = baseURL + baseDir;
	}

	var filename = [ path, name ].join("/");
	var count = 0;
	var newFileName = "";

	newFileName = filename + "." + ext
	
	if( !doubleCheck ) return newFileName;
	
	var file = new File(newFileName);
	while(file.exists != false){
		count +=1;
		newFileName = filename + count + "." + ext
		file = new File(newFileName);
	}
	return newFileName;
}
//--------------------------------------------------------------------------
// Main
//--------------------------------------------------------------------------
function main() {
    preferences.rulerUnits = Units.PIXELS;
    
    document = activeDocument;
    result = [];
    baseURL = String(File(document.path).fsName).replace(/\\/g, "/") + "/";
    baseDir = "";
    currentFolder = "";
    
    displayDialog();
}

function displayDialog() {
    try {
        var win = new Window("dialog", "PSD を absolute レイアウトの HTML と CSS に変換");
        win.alignChildren = "left";
        
		  var typePanel = win.add("panel", undefined, "保存形式");
		  typePanel.orientation = "row";
		  
		  var typeGroup = typePanel.add("group");
		  typeGroup.orientation = "column";
		  typeGroup.alignChildren = "left";
//		  var pngGroup = typeGroup.add("group");
//		  var jpgGroup = typeGroup.add("group");
		  var radio0 = typeGroup.add("radiobutton", undefined, "PNG");
//		  var bitText = pngGroup.add("edittext", undefined, "24");
//		  bitText.preferredSize.width = 80;
		  var radio1 = typeGroup.add("radiobutton", undefined, "JPEG");
//		  var qualityText = jpgGroup.add("edittext", undefined, "100");
//		  qualityText.preferredSize.width = 80;
          radio0.value = true;
          
          var bitText = typePanel.add("edittext", undefined, "24");
          bitText.preferredSize.width = 80;
          var qualityText = typePanel.add("edittext", undefined, "100");
          qualityText.preferredSize.width = 80;
          
          
		  var buttons = win.add("group");
		  buttons.orientation = "row";
		  buttons.alignment = "center";
		  
		  var okBtn = buttons.add("button");
		  okBtn.text = "決定";
		  okBtn.properties = {name: "ok"};
 
		  var cancelBtn = buttons.add("button");
		  cancelBtn.text = "キャンセル";
		  cancelBtn.properties = {name: "cancel"};
		  okBtn.onClick = function() 
		  {
			  win.close();
              if (radio0.value) {
                //pngBit = parseInt(bitText.text)
                saveFileType = TYPE_PNG;
              } else {
                //jpegQuality = parseInt(qualityText.text)
                saveFileType = TYPE_JPEG;
              }
            start();
		  }
		  cancelBtn.onClick = function()
		  {
			  win.close();
		  }
		  
		  
		  win.center();
		  var ret = win.show();
    }catch(e)
	  {
		  alert(e);
	  }
}

function start() {
    setVisible(document.layers, false);
    
    if ( !useFolder ) {
        baseDir = getNameRemovedExtendType(document) + "/";
        _createFolder(baseURL + baseDir);
    }
    outputLayers(document.layers, null);
    
    structureObj.reverse();
    printStructure(structureObj);
    
    setVisible(document.layers, true);
//    result.push("complete");
//    report();
}

//--------------------------------------------------------------------------
// Process Layerlists
//--------------------------------------------------------------------------
function outputLayers(layers, folder) {
    if (!!folder) createFolder(folder);
    for (var i = 0, l=layers.length; i < l; i++)
    {
        var layer = layers[i];
        if (layer.typename == "LayerSet" ) {
            var tmp = currentFolder;
            outputLayers(layer.layers, layer.name);
            currentFolder = tmp;
        } else if (layer.kind == "LayerKind.TEXT") {
            if (count++>LIMIT) return;
            //$.writeln(layer);
            readLayerText(layer);
        } else {
            if (count++>LIMIT) return;
            clippingLayer(layer);
        }
    }
}

//--------------------------------------------------------------------------
// Process Layers
//--------------------------------------------------------------------------
function readLayerText(obj) {
    setVisible(obj, true);
    
    //$.writeln(obj.name);
    var boundsObj = obj.bounds;
    x1 = parseInt(boundsObj[0])-offsetMargin;
    y1 = parseInt(boundsObj[1])-offsetMargin;
    x2 = parseInt(boundsObj[2])+offsetMargin;
    y2 = parseInt(boundsObj[3])+offsetMargin;
    
    var width = x2 - x1;
    var height = y2 - y1;

    var text = obj.name;
    structureObj.push( { type:"text", text:text, width: width, height: height, position: [ Math.max(x1,0), Math.max(y1,0) ] }  );
    
	setVisible(obj, false);
}

function clippingLayer(obj) {
    //ready
    //setVisible(document.layers, false);
    setVisible(obj, true);

    //get layer bounds
    var boundsObj = obj.bounds;
    x1 = parseInt(boundsObj[0])-offsetMargin;
    y1 = parseInt(boundsObj[1])-offsetMargin;
    x2 = parseInt(boundsObj[2])+offsetMargin;
    y2 = parseInt(boundsObj[3])+offsetMargin;

    //select bounds
    selectReg = [[x1,y1],[x2,y1],[x2,y2],[x1,y2]];
    activeDocument.selection.select(selectReg);

    try {
        //concat selection
        activeDocument.selection.copy(true);

        //deselect
        activeDocument.selection.deselect();

        //new document
        var width = x2 - x1;
        var height = y2 - y1;
        var resolution = 72;
        var name = getValidName(obj.name);
        var mode = NewDocumentMode.RGB;
        var initialFill = DocumentFill.TRANSPARENT;

        preferences.rulerUnits = Units.PIXELS;
        newDocument = documents.add(width, height, resolution, name, mode, initialFill);

        //paste image
        newDocument.paste();

        //get new layer bounds 
        var newBoundsObj = newDocument.activeLayer.bounds;
        nx1 = parseInt(newBoundsObj[0])-offsetMargin;
        ny1 = parseInt(newBoundsObj[1])-offsetMargin;
        nx2 = parseInt(newBoundsObj[2])+offsetMargin;
        ny2 = parseInt(newBoundsObj[3])+offsetMargin;

        //trimming
        if((nx2 - nx1) != (x2 - x1) || (ny2 - ny1) != (y2 - y1)){
            newDocument.crop(newBoundsObj);
        }

        //export new file
        //*
        if(saveFileFlag == true){
            switch(saveFileType){
                case TYPE_PNG:
                     var fname = savePNG( currentFolder, name, pngBit );
                break;
                case TYPE_JPEG:
                    var fname = saveJPEG( currentFolder, name, jpegQuality );
                break;
            }
            structureObj.push( { type:"image", filename:escape(fname), width: width, height: height, position: [ Math.max(x1,0), Math.max(y1,0) ] }  );
        }

        newDocument.close( SaveOptions.DONOTSAVECHANGES );
	}
	catch(e){
		//no selection
		result.push( obj.name+": "+e.message);
	}
	finally{
		//back previous document
		activeDocument = document;
		setVisible(obj, false);
	}
}

// create html & css
function printStructure( obj ){
	var result = toStringObj( obj );
	if( result == null || result == undefined ) {
		alert("non result");
		return;
	}
	
	var outputPath = baseURL+ baseDir;
	var filePath     = outputPath;
	
    if(File.fs == "Windows" ) {
        filePath.replace(/([A-Za-z]+)\:(.*)/,"file:///" +RegExp.$1+"|"+RegExp.$2 );
        filePath = "file:///" +RegExp.$1+"|"+RegExp.$2;
    }
    else {
        //dir.replace(/([A-Za-z]+)\:(.*)/,"file:///" +RegExp.$1+"|"+RegExp.$2 );
        filePath = "file://Macintosh HD" + filePath;
    }

    var htmlFile = new File( outputPath + getNameRemovedExtendType(document) + ".html");
	htmlFile.open("w");
	htmlFile.encoding = "utf-8";
    
    var cssFileName = getNameRemovedExtendType(document) + ".css";
    var cssFile = new File( outputPath + cssFileName);
	cssFile.open("w");
	cssFile.encoding = "utf-8";
    var css = [];
    var html = [
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
'<html>',
'	<head>',
'		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />',
'		<title></title>',
'		<link rel="stylesheet" charset="utf-8" href="' + cssFileName + '" media="all" />',
'	</head>',
'	<body>'];
    
    css.push('.artlayer { position: absolute; overflow: hidden; }');
    css.push('.text { position: absolute; }');
    for (var i=0,l=obj.length;i<l;i++)
    {
        if (obj[i].type == "image")
        {
            html.push('		<div id="image' + i + '" class="artlayer"></div>');
            css.push('#image' + i + ' { left:' + parseInt( obj[i].position[0] ) +'px; top: ' + parseInt( obj[i].position[1] ) +'px; width: ' + obj[i].width + 'px; height: ' + obj[i].height + 'px; background-image: url("' + unescape(obj[i].filename) + '"); }');
        }
        else
        {
            html.push('		<div id="text' + i + '" class="text">' + obj[i].text +'</div>');
            css.push('#text' + i + ' { left:' + parseInt( obj[i].position[0] ) +'px; top: ' + parseInt( obj[i].position[1] ) +'px; width: ' + obj[i].width + 'px; height: ' + obj[i].height + 'px; }');
        }
    }
    
    html.push('	</body>');
    html.push('</html>');
    htmlFile.write(html.join("\n"));
    htmlFile.close();
    cssFile.write(css.join("\n"));
    cssFile.close();
    
}

main();