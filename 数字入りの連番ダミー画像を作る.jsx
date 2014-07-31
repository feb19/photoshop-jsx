﻿ //-------------------------------------------------------------------------- // const //-------------------------------------------------------------------------- const FONT_SIZE = 48; const FILL_ALPHA = 20; //-------------------------------------------------------------------------- // var //-------------------------------------------------------------------------- var _width; var _height; var _saveDirectry; var _count; var _prefix; //-------------------------------------------------------------------------- //  function //-------------------------------------------------------------------------- //スタート function start() {	  //数値をピクセル値で指定	  preferences.rulerUnits = Units.PIXELS;	  	  displayDialog(); } //ダイアログの表示 function displayDialog() {	  try	  {		  //////////////////////////////////////////////////		  //ウィンドウを作る		  //////////////////////////////////////////////////		  var win = new Window("dialog", "ダミー画像を作る");		  win.alignChildren = "left";		  		  //////////////////////////////////////////////////		  //画像のサイズ設定		  //////////////////////////////////////////////////			  var sizePanel = win.add("panel", undefined, "画像のサイズ");		  sizePanel.orientation = "row";		  		  var widthGroup = sizePanel.add("group");		  widthGroup.orientation = "column";		  widthGroup.alignChildren = "left";		  widthGroup.add("statictext", undefined, "幅");		  		  var widthText = widthGroup.add("edittext", undefined, "100");		  widthText.preferredSize.width = 80;		  		  var markGroup = sizePanel.add("group");		  markGroup.orientation = "column";		  markGroup.alignChildren = "center";		  markGroup.add("statictext", undefined, "");		  markGroup.add("statictext", undefined, "×");		  		  var heightGroup = sizePanel.add("group");		  heightGroup.orientation = "column";		  heightGroup.alignChildren = "left";		  heightGroup.add("statictext", undefined, "高さ");		  var heightText = heightGroup.add("edittext", undefined, "100");		  heightText.preferredSize.width = 80; 		  var etcGroup = win.add("group");		  etcGroup.orientation = "row";		  //////////////////////////////////////////////////		  //個数		  //////////////////////////////////////////////////		  var countGroup = etcGroup.add("group");		  countGroup.orientation = "row";		  countGroup.alignChildren = "left";		  countGroup.add("statictext", undefined, "個数 ： ");		  var countText = countGroup.add("edittext", undefined, "10");		  countText.preferredSize.width = 40;		  		  //////////////////////////////////////////////////		  //接頭語		  //////////////////////////////////////////////////		  var prefixGroup = etcGroup.add("group");		  prefixGroup.orientation = "row";		  prefixGroup.alignChildren = "left";		  prefixGroup.add("statictext", undefined, "　　　　　接頭語 ： ");		  var prefixText = prefixGroup.add("edittext", undefined, "dammy");		  prefixText.preferredSize.width = 80; 		  //////////////////////////////////////////////////		  //テキストフィールドのバリデート		  //////////////////////////////////////////////////		  widthText.onChange = heightText.onChange = countText.onChange = function()		  {			  var data = this.text;			  if(!isInt(data))			  {				  alert("正の整数を指定して下さい。");				  return;			  }		  }		  //////////////////////////////////////////////////		  //フォルダ選択		  //////////////////////////////////////////////////		  var saveFilePanel = win.add("panel", undefined, undefined);		  saveFilePanel.alignChildren = "left";		  saveFilePanel.add("statictext", undefined, "保存フォルダ");		  var selectFolderPanel = saveFilePanel.add("group");		  selectFolderPanel.alignChildren = "left";		  var selectFolderText = selectFolderPanel.add("edittext", undefined, "");		  selectFolderText.preferredSize.width = 180;		  var selectFolderButton = selectFolderPanel.add("button",undefined, "参照");		  selectFolderButton.onClick = function()		  {			  var selectFolder = Folder.selectDialog( "フォルダを選択してください", selectFolderText.text );			  if ( selectFolder != null ) 			  {				  selectFolderText.text = selectFolder.fsName.toString();			  }		  }	  		  //////////////////////////////////////////////////		  //決定・キャンセルボタン		  //////////////////////////////////////////////////		  var buttons = win.add("group");		  buttons.orientation = "row";		  buttons.alignment = "center";		  		  var okBtn = buttons.add("button");		  okBtn.text = "決定";		  okBtn.properties = {name: "ok"}; 		  var cancelBtn = buttons.add("button");		  cancelBtn.text = "キャンセル";		  cancelBtn.properties = {name: "cancel"};		  okBtn.onClick = function() 		  {						  if(selectFolderText.text=="")			  {				  alert ("フォルダが選択されていません。")				  return;			  }		  			  win.close();			  			  _width = parseInt(widthText.text);			  _height = parseInt(heightText.text);			  _saveDirectry = selectFolderText.text;			  _count = parseInt(countText.text);			  _prefix = prefixText.text;			  _execute();		  }		  cancelBtn.onClick = function()		  {			  win.close();		  }		  		  		  win.center();		  var ret = win.show();			  	  }catch(e)	  {		  alert(e);	  } }  function _execute() {	  //新規ファイルの作成（幅, 高さ）	  var doc = app.documents.add( _width, _height );	  RGBColor = new SolidColor();	  RGBColor.red = 100;	  RGBColor.green = 100;	  RGBColor.blue = 100;	  doc.selection.selectAll();	  doc.selection.fill(RGBColor,ColorBlendMode.NORMAL, FILL_ALPHA, false);	  doc.selection.deselect(); 	  //新規レイヤーを追加	  var newTextLayer = doc.artLayers.add();	  //レイヤーの種類をテキストレイヤーに	  newTextLayer.kind = LayerKind.TEXT;	  //テキストレイヤーの設定	  newTextLayer.textItem.font = "Impact";	  newTextLayer.textItem.size = FONT_SIZE;	  newTextLayer.textItem.justification = Justification.CENTER;	  newTextLayer.textItem.position = [_width/2, (_height+FONT_SIZE)/2];	  	  for ( var i = 0; i < _count; i++ )	  {		  newTextLayer.textItem.contents = i;		  var name = (i<10) ? "0"+i : i;		  saveJPEG(_saveDirectry+"\\", _prefix + name, 100);	  } 	  doc = null;	  newTextLayer = null; 	  activeDocument.close(SaveOptions.DONOTSAVECHANGES); }  function saveJPEG(path, name, quality) {	  var exp = new ExportOptionsSaveForWeb();	  exp.format = SaveDocumentType.JPEG;	  exp.interlaced　= false;	  exp.optimized= false;	  exp.quality = quality; 	  var fileObj = new File(getFileName(path + name, "jpg"));	  	  activeDocument.exportDocument(fileObj, ExportType.SAVEFORWEB, exp); } function getFileName(filename, ext) {	  var count = 0;	  var newFileName = ""; 	  newFileName = filename + "." + ext	  var file = new File(newFileName);	  	  while(file.exists != false){		  count +=1;		  newFileName = filename + count + "." + ext		  file = new File(newFileName);	  }	  return newFileName; } function isInt(value) {	  var result = true;	  var num = Number(value);	  if(isNaN(num) || num <= 0 || num % 1 != 0)	  {		  result = false;	  }	  return result; } //-------------------------------------------------------------------------- //  run //-------------------------------------------------------------------------- start();