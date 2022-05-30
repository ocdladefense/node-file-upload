/**@jsx vNode */






domReady(function() {
  const inputElement = document.getElementById("upload");
  inputElement.addEventListener("change", handleFiles, false);
});



function handleFiles() {
  const fileList = this.files; /* now you can work with the file list */
  const numFiles = fileList.length;
  console.log(fileList);
  for (let i = 0, count = fileList.length; i < count; i++) {
    let f = fileList[i];
    console.log([f.name, f.size, f.type].join(" | "));
    getPreview(f);
  } 
}


function getPreview(file) {
  const img = document.createElement("img");
  img.classList.add("obj");
  img.style = "width:200px; height:auto";
  img.file = file;
  preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.

  const reader = new FileReader();
  reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
  reader.readAsDataURL(file);
}


function sendFiles() {
  const imgs = document.querySelectorAll(".obj");
  
  // const formdata = new FormData(document.getElementById("contact-uploads"));

  for (let i = 0; i < imgs.length; i++) {
    new FileUpload(imgs[i], imgs[i].file);
  }


}

window.sendFiles = sendFiles;

const PERCENTAGE_START = 0;
const PERCENTAGE_COMPLETE = 100;
const UPLOAD_URL = "https://appdev.ocdla.org/file/upload";


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

  xhr.open("POST", UPLOAD_URL);
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
          sendFile(filesArray[i]);
      }
  }
}