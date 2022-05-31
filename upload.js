/**@jsx vNode */
// ../../.bin/babel src.js --out-file upload.js
import { View, vNode } from "/node_modules/@ocdladefense/view/view.js";
window.FileUploadService = FileUploadService;
var PERCENTAGE_START = 0;
var PERCENTAGE_COMPLETE = 100;
var UPLOAD_URL = "https://appdev.ocdla.org/file/upload";
var preview = null;
domReady(function () {
  var inputElement = document.getElementById("upload");
  inputElement.addEventListener("change", handleFiles, false);
  preview = document.getElementById("preview");
});

var FileUploadService = function () {
  var endpoint = null;

  function sendFiles() {
    if (null == endpoint) {
      throw new Error("HTTP_ERROR: File upload endpoint cannot be empty.");
    }

    var imgs = document.querySelectorAll(".obj");

    for (var i = 0; i < imgs.length; i++) {
      new FileUpload(imgs[i], imgs[i].file);
    }
  }

  function setEndpoint(endpoint) {
    endpoint = endpoint;
  }

  function getEndpoint() {
    return endpoint;
  }

  return {
    upload: sendFiles,
    setEndpoint: setEndpoint
  };
}();

var Preview = function () {
  var DEFAULT_THUMBNAIL = "/node_modules/@ocdladefense/node-file-upload/assets/images/generic-file.png";

  function render() {
    return vNode("div", {
      "class": "file-upload-preview"
    }, vNode("div", {
      "class": "image-preview"
    }, vNode("img", {
      src: this.src,
      "class": "obj",
      style: "width:200px; height:auto"
    })), vNode("div", {
      "class": "file-name"
    }, this.filename), vNode("div", {
      "class": "file-upload-meter"
    }, vNode("canvas", null)));
  }

  function update(e) {
    this.src = e.target.result;
    var newNode = View.createElement(this.render());
    this.root.parentNode.replaceChild(newNode, this.root);
  }

  function setRoot(node) {
    this.root = node;
  }

  var prototype = {
    render: render,
    setRoot: setRoot,
    update: update
  };

  var construct = function construct(props) {
    this.props = props;
    this.src = null;
    this.root = null;
    var file = props.file;
    var type = file.type && file.type.split("/")[0] || "unknown";

    if (!["image", "img"].includes(type)) {
      this.src = DEFAULT_THUMBNAIL;
      return;
    }

    var reader = new FileReader();
    reader.onload = update.bind(this);
    reader.readAsDataURL(file);
  };

  construct.prototype = prototype;
  return construct;
}();

function handleFiles() {
  var fileList = this.files;
  /* now you can work with the file list */

  var numFiles = fileList.length;
  console.log(fileList);

  for (var i = 0, count = fileList.length; i < count; i++) {
    var f = fileList[i];
    console.log([f.name, f.size, f.type].join(" | "));
    var node = vNode(Preview, {
      file: f
    });
    console.log(node);
    preview.appendChild(View.createElement(node));
  }
}

function updateMeter(e) {
  if (e.lengthComputable) {
    var percentage = Math.round(e.loaded * 100 / e.total);
    this.meter.update(percentage);
  }
}

function removeMeter(e) {
  this.meter.update(PERCENTAGE_COMPLETE);
  var canvas = this.meter.ctx.canvas;
  canvas.parentNode.removeChild(canvas);
}

function FileUpload(img, file) {
  console.log(file);
  var reader = new FileReader();
  var xhr = new XMLHttpRequest();
  this.meter = createThrobber(img);
  console.log(file);
  xhr.upload.addEventListener("progress", updateMeter.bind(this), false);
  xhr.upload.addEventListener("load", removeMeter.bind(this), false);
  xhr.open("POST", FileUploadService.getEndpoint());
  xhr.setRequestHeader("Content-Disposition", 'attachment; filename="' + file.name + '"');
  xhr.setRequestHeader("Content-Type", file.type);

  reader.onload = function (evt) {
    xhr.send(evt.target.result);
  };

  reader.readAsArrayBuffer(file);
}

function createThrobber(img) {
  var throbberWidth = 64;
  var throbberHeight = 6;
  var throbber = document.createElement('canvas');
  throbber.classList.add('upload-progress');
  throbber.setAttribute('width', throbberWidth);
  throbber.setAttribute('height', throbberHeight);
  img.parentNode.appendChild(throbber);
  throbber.ctx = throbber.getContext('2d');
  throbber.ctx.fillStyle = 'orange';

  throbber.update = function (percent) {
    throbber.ctx.fillRect(0, 0, throbberWidth * percent / 100, throbberHeight);

    if (percent === 100) {
      throbber.ctx.fillStyle = 'green';
    }
  };

  throbber.update(PERCENTAGE_START);
  return throbber;
}

function createDropZone() {
  var dropzone = document.getElementById("dropzone");

  dropzone.ondragover = dropzone.ondragenter = function (event) {
    event.stopPropagation();
    event.preventDefault();
  };

  dropzone.ondrop = function (event) {
    event.stopPropagation();
    event.preventDefault();
    var filesArray = event.dataTransfer.files;

    for (var i = 0; i < filesArray.length; i++) {
      FileUploadService.sendFiles(filesArray[i]);
    }
  };
}

export default FileUploadService;
