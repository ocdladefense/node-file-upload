/**@jsx vNode */
// ../../.bin/babel src.js --out-file upload.js
import {View,vNode} from "/node_modules/@ocdladefense/view/view.js";

window.FileUploadService = FileUploadService;

const PERCENTAGE_START = 0;
const PERCENTAGE_COMPLETE = 100;
const UPLOAD_URL = "https://appdev.ocdla.org/file/upload";

let preview = null;

domReady(function() {
  const inputElement = document.getElementById("upload");
  inputElement.addEventListener("change", handleFiles, false);
  preview = document.getElementById("preview");
});



const FileUploadService = (function() {

  let endpoint = null;


  function sendFiles() {
    if(null == endpoint) {
      throw new Error("HTTP_ERROR: File upload endpoint cannot be empty.")
    }
    const imgs = document.querySelectorAll(".obj");

    for (let i = 0; i < imgs.length; i++) {
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


})();









const Preview = (function() {


  const DEFAULT_THUMBNAIL = "/node_modules/@ocdladefense/node-file-upload/assets/images/generic-file.png";

  function render() {
    return (
      <div class="file-upload-preview">
        <div class="image-preview">
          <img src={this.src} class="obj" style="width:200px; height:auto" />
        </div>
        <div class="file-name">
          {this.filename}
        </div>
        <div class="file-upload-meter">
          <canvas></canvas>
        </div>
      </div>
    )
  }


  function update(e) {
    this.src = e.target.result;
    let newNode = View.createElement(this.render());
    this.root.parentNode.replaceChild(newNode, this.root);
  }



  function setRoot(node) {
    this.root = node;
  }

  let prototype = {
    render: render,
    setRoot: setRoot,
    update: update
  };


  let construct = function(props){
    this.props = props;
    this.src = null;
    this.root = null;
    let file = props.file;

    let type = (file.type && file.type.split("/")[0]) || "unknown";
  
    if(!["image","img"].includes(type)) {
      this.src = DEFAULT_THUMBNAIL;
      return;
    }
  
    const reader = new FileReader();
    reader.onload = update.bind(this);
    reader.readAsDataURL(file);
  };

  construct.prototype = prototype;

  return construct;
})();




function handleFiles() {
  const fileList = this.files; /* now you can work with the file list */
  const numFiles = fileList.length;
  console.log(fileList);
  for (let i = 0, count = fileList.length; i < count; i++) {
    let f = fileList[i];
    console.log([f.name, f.size, f.type].join(" | "));
    let node = <Preview file={f} />;
    console.log(node);
    preview.appendChild(View.createElement(node));
  } 
}

function updateMeter(e) {
  if(e.lengthComputable) {
    let percentage = Math.round((e.loaded * 100) / e.total);
    this.meter.update(percentage);
  }
}

function removeMeter(e) {
  this.meter.update(PERCENTAGE_COMPLETE);
  let canvas = this.meter.ctx.canvas;
  canvas.parentNode.removeChild(canvas);
}



function FileUpload(img, file) {
  console.log(file);
  const reader = new FileReader();
  const xhr = new XMLHttpRequest();
  this.meter = createThrobber(img);
  console.log(file);
  xhr.upload.addEventListener("progress", updateMeter.bind(this), false);
  xhr.upload.addEventListener("load", removeMeter.bind(this), false);

  xhr.open("POST", FileUploadService.getEndpoint());
  xhr.setRequestHeader("Content-Disposition", 'attachment; filename="'+file.name+'"');
  xhr.setRequestHeader("Content-Type", file.type);

  reader.onload = function(evt) {
    xhr.send(evt.target.result);
  };
  reader.readAsArrayBuffer(file);
}



function createThrobber(img) {
  const throbberWidth = 64;
  const throbberHeight = 6;
  const throbber = document.createElement('canvas');
  throbber.classList.add('upload-progress');
  throbber.setAttribute('width', throbberWidth);
  throbber.setAttribute('height', throbberHeight);
  img.parentNode.appendChild(throbber);
  throbber.ctx = throbber.getContext('2d');
  throbber.ctx.fillStyle = 'orange';

  throbber.update = function(percent) {
    throbber.ctx.fillRect(0, 0, throbberWidth * percent / 100, throbberHeight);
    if (percent === 100) {
      throbber.ctx.fillStyle = 'green';
    }
  };

  throbber.update(PERCENTAGE_START);
  return throbber;
}


function createDropZone() {
  const dropzone = document.getElementById("dropzone");
  dropzone.ondragover = dropzone.ondragenter = function(event) {
      event.stopPropagation();
      event.preventDefault();
  }

  dropzone.ondrop = function(event) {
      event.stopPropagation();
      event.preventDefault();

      const filesArray = event.dataTransfer.files;
      for (let i=0; i<filesArray.length; i++) {
          FileUploadService.sendFiles(filesArray[i]);
      }
  }
}

export default FileUploadService;