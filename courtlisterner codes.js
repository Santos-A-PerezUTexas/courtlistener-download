// First Suggested code BEGIN


// Placeholder for your OpenAI API key
const OPENAI_API_KEY = 'your_openai_api_key_here';

// Function to send text to ChatGPT
function sendTextToChatGPT(text) {
 const url = 'https://api.openai.com/v1/engines/davinci-codex/completions';
 const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
 });
 const body = JSON.stringify({
    prompt: text,
    max_tokens: 100,
 });

 fetch(url, { method: 'POST', headers, body })
    .then(response => response.json())
    .then(data => {
      console.log(data.choices[0].text);
      // Handle the response from ChatGPT here
    })
    .catch(error => console.error('Error:', error));
}

// Example usage
// Assuming `convertPdfToText` returns a Promise that resolves with the text content of the PDF
convertPdfToText(yourPdfBlob).then(text => {
 sendTextToChatGPT(text);
});

//Remember, this is a simplified example. In a real implementation, you'd need to handle errors, 
//manage API rate limits, and possibly deal with the asynchronous nature of fetching and 
//converting PDFs to text.

//First Suggested Code END



//convertPdfToText  BEGIN

function convertPdfToText(pdfUrl) {
 return new Promise((resolve, reject) => {
    pdfjsLib.getDocument(pdfUrl).promise.then(pdfDocument => {
      pdfDocument.getPage(1).then(page => {
        page.getTextContent().then(textContent => {
          let textItems = textContent.items;
          let finalString = "";

          for (let i = 0; i < textItems.length; i++) {
            let item = textItems[i];
            finalString += item.str + " ";
          }

          resolve(finalString);
        });
      });
    }).catch(error => {
      reject(error);
    });
 });
}

//convertPdfToText END

//convertPdfToText pdf.js SCRIPT BEGIN

<script src="https://mozilla.github.io/pdf.js/build/pdf.js"></script>
<script>
 pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
</script>



//But also This
//If you need to use PDF.js in the background script, you can directly include it in your manifest.json 
//file under the background section. This is because the background script runs in 
//a different scope from the web pages and does not directly interact with the DOM of the web pages.

"background": {
 "scripts": ["pdf.js", "background.js"],
 "persistent": false
 
//If you need to use PDF.js in the content script, which runs in the context of web pages and can 
//interact with the DOM, you have a couple of options:

//1. Download and Include PDF.js in Your Extension: Download the PDF.js library and include it 
//in your extension's directory. Then, specify it in the content_scripts section of your manifest.json file.

"content_scripts": [
 {
    "matches": ["<all_urls>"],
    "js": ["pdf.js", "content.js"]
 }
]


//2. Use chrome.tabs.executeScript: If you prefer not to include the library in your extension's package, 
//you can dynamically inject it into the page using chrome.tabs.executeScript. However, this method is more 
//complex and requires careful handling of permissions and content security policies.

chrome.tabs.executeScript(null, {
 file: "https://mozilla.github.io/pdf.js/build/pdf.js"
});


//convertPdfToText pdf.js SCRIPT END


//sendTextToChatGPT  BEGIN


//To create a function that sends text to ChatGPT, you'll need to use the OpenAI API. 
//This function will take the text you want to send to ChatGPT as input and then make a POST 
//request to the API endpoint. Here's how you can implement the sendTextToChatGPT function in 
//JavaScript, considering the information from the sources:



// Placeholder for your OpenAI API key
const OPENAI_API_KEY = 'your_openai_api_key_here';

// Function to send text to ChatGPT
function sendTextToChatGPT(text) {
 const url = 'https://api.openai.com/v1/engines/davinci-codex/completions';
 const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
 });
 const body = JSON.stringify({
    prompt: text,
    max_tokens: 100, // Adjust the number of tokens as needed
    n: 1, // Number of responses to generate
    stop: null, // Stop sequence for the response
    temperature: 0.5, // Controls the randomness of the output
 });

 fetch(url, { method: 'POST', headers, body })
    .then(response => response.json())
    .then(data => {
      console.log(data.choices[0].text);
      // Handle the response from ChatGPT here
    })
    .catch(error => console.error('Error:', error));
}

// Example usage
// Assuming `convertPdfToText` returns a Promise that resolves with the text content of the PDF
// convertPdfToText(yourPdfBlob).then(text => {
//   sendTextToChatGPT(text);
// });

//sendTextToChatGPT END


















//////////////////////////////////////////////////////////////////////////////////////////////


//FILE CONTENT.JS BEGIN

const rows = document.querySelectorAll('[id^="entry-"]');

//Test Comment Santos A. Perez

const getCourtListenerCaseName = () => {
  const caseName = document.querySelector("h1");
  if (caseName) {
    const text = caseName.textContent.trim().split("(");
    return text[0].trim();
  }
  return "Unknown case";
};

const getPacerCaseName = () => {
  const caseNameEl = document.querySelector("table tr:first-child td:nth-child(3)");
  if (caseNameEl && caseNameEl.textContent) {
    return caseNameEl.textContent.trim();
  } else {
    return "Download";
  }
};

const downloadAll = (folder, downloads) => {
  let _chunkIndex = 0;
  let _blobs = [];
  let mergedBlob;
  const port = chrome.runtime.connect({ name: "courtlistener-download" });

  port.postMessage({ folder, downloads });

  // Prepare for response
  port.onMessage.addListener(function (request) {
    if (request.blobString) {
      _chunkIndex++;

      let bytes = new Uint8Array(request.blobString.length);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = request.blobString.charCodeAt(i);
      }
      _blobs[_chunkIndex - 1] = new Blob([bytes], { type: request.mimeString });

      if (_chunkIndex === request.chunks) {
        for (let i = 0; i < _blobs.length; i++) {
          if (i === 0) {
            mergedBlob = new Blob([_blobs[i]], { type: request.mimeString });
          } else {
            mergedBlob = new Blob([mergedBlob, _blobs[i]], { type: request.mimeString });
          }
        }

        // Create download URL
        var url = URL.createObjectURL(mergedBlob);
        port.postMessage({ url, folder });
      }
    }
  });
};

const courtListener = () => {
  const caseName = getCourtListenerCaseName();
  for (let row of rows) {
    const docketEntry = row.id.split("-")[1];
    const recapDocuments = row.querySelectorAll(".recap-documents");

    // Don't need to add a button if there's <=1 PDF for the row
    if (row.querySelectorAll(".recap-documents:has(a.btn-primary)").length > 1) {
      // Add row with button to download all
      const newRow = document.createElement("div");
      newRow.classList.add("row", "recap-documents");

      // Make button wrappers
      const bigButtonHolder = document.createElement("div");
      const smallButtonHolder = document.createElement("div");
      bigButtonHolder.classList.add(
        "hidden-xs",
        "col-sm-4",
        "col-sm-offset-8",
        "col-md-3",
        "col-md-offset-9",
        "hidden-print"
      );
      smallButtonHolder.classList.add(
        "col-xs-3",
        "col-xs-offset-9",
        "hidden-sm",
        "hidden-md",
        "hiden-lg",
        "hidden-print"
      );

      // Make buttons
      const bigButton = document.createElement("button");
      bigButton.classList.add("btn", "btn-success", "btn-xs");
      bigButton.style.marginBottom = "8.5px";
      bigButton.title = "Download all PDFs";
      bigButton.innerText = "Download all PDFs";

      const smallButton = document.createElement("button");
      smallButton.classList.add("btn", "btn-success", "btn-xs");
      smallButton.style.marginBottom = "8.5px";
      smallButton.title = "Download all PDFs";
      const icon = document.createElement("i");
      icon.classList.add("fa", "fa-file-zip-o");
      smallButton.append(icon);

      // On click, download all PDFs
      for (let button of [bigButton, smallButton]) {
        button.addEventListener("click", () => {
          const downloads = [];
          for (let documentRow of recapDocuments) {
            const cols = documentRow.querySelectorAll(":scope > div");

            // Get link element and extract name
            const linkEl = cols[0].querySelector("a");
            // If there's a link, we can do the download.
            // Otherwise, the document isn't on CourtListener
            if (linkEl) {
              const linkText = linkEl.textContent.trim();
              const description = cols[1].textContent.trim();
              // Get direct download link (link href is an embedded PDF)
              const directLink = cols[3].querySelector("a.btn-primary").href;
              downloads.push({
                url: directLink,
                filename: `${linkText} - ${description}.pdf`,
              });
            }
          }
          if (downloads.length) {
            const folder = `${caseName} ${docketEntry}`;
            downloadAll(folder, downloads);
          }
        });
      }

      bigButtonHolder.append(bigButton);
      smallButtonHolder.append(smallButton);
      newRow.append(bigButtonHolder, smallButtonHolder);
      recapDocuments[recapDocuments.length - 1].after(newRow);
    }
  }
};

const pacer = () => {
  const recapLinks = document.querySelectorAll(".recap-inline");
  const caseName = getPacerCaseName();

  if (recapLinks.length > 1) {
    const button = document.createElement("button");
    button.innerText = "Download all PDFs from CourtListener";

    // On click, download all PDFs
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const downloads = [];
      const rowsWithLink = document.querySelectorAll("table tr:has(a.recap-inline)");
      for (let i = 0; i < rowsWithLink.length; i++) {
        const documentRow = rowsWithLink[i];
        const cols = documentRow.querySelectorAll("td");

        // Get document name
        let filename;
        if (i === 0) {
          // The first document is the main document and doesn't have a name
          filename = "Main";
        } else {
          filename = cols[2].textContent.trim();
        }
        if (filename === "") {
          filename = `Document ${i + 1}`;
        }

        const directLink = documentRow.querySelector("a.recap-inline").href;
        downloads.push({
          url: directLink,
          filename: `${filename}.pdf`,
        });
      }
      if (downloads.length) {
        downloadAll(caseName, downloads);
      }
    });

    document.querySelector("table tr:last-child td:first-child").append(button);
  }
};

if (location.hostname.includes("courtlistener.com")) {
  courtListener();
} else if (location.hostname.includes("uscourts.gov")) {
  setTimeout(() => {
    pacer();
  }, 1000);
}

//FILE CONTENT.JS END 




//FILE BACKGROUND.JS BEGIN

importScripts("./lib/jszip.min.js");

const CHUNK_SIZE = 1024 * 256; // 256KB

function transmitFileInChunks(blob, port) {
  // https://stackoverflow.com/questions/25668998/how-to-pass-a-blob-from-a-chrome-extension-to-a-chrome-app
  let start = 0;
  let end = CHUNK_SIZE;
  const remainder = blob.size % CHUNK_SIZE;
  let numChunks = Math.floor(blob.size / CHUNK_SIZE);
  if (remainder > 0) {
    numChunks += 1;
  }
  let chunkIndex = 0;

  const reader = new FileReader();
  reader.onload = function () {
    const message = {
      blobString: reader.result,
      mimeString: "application/zip",
      chunks: numChunks,
    };
    port.postMessage(message);

    processChunk();
  };
  reader.onerror = function (error) {
    console.error(error);
  };
  processChunk();

  function processChunk() {
    chunkIndex++;

    if (chunkIndex > numChunks) {
      // Done
      return;
    }

    if (chunkIndex == numChunks && remainder != 0) {
      end = start + remainder;
    }

    const blobChunk = blob.slice(start, end);

    start = end;
    end = end + CHUNK_SIZE;

    reader.readAsBinaryString(blobChunk);
  }
}

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === "courtlistener-download");
  port.onMessage.addListener((request) => {
    if (request.downloads) {
      const { folder, downloads } = request;
      const zipFolder = new JSZip().folder(folder);
      const promises = [];

      // Asynchronously download each file, rename, and zip in a folder
      for (const download of downloads) {
        promises.push(
          fetch(download.url)
            .then((resp) => {
              if (resp.status === 200 || resp.status === 0) {
                return Promise.resolve(resp.arrayBuffer());
              } else {
                return Promise.reject(new Error(response.statusText));
              }
            })
            .then((contents) => zipFolder.file(download.filename, contents))
            .catch((error) => {
              console.error(error);
            })
        );
      }

      // Return full zip once downloads are done
      Promise.all(promises)
        .then(() => zipFolder.generateAsync({ type: "blob" }))
        .then((zipped) => {
          transmitFileInChunks(zipped, port);
        });
    } else if (request.url) {
      chrome.downloads
        .download({
          url: request.url,
          filename: `${request.folder}.zip`,
        })
        .then(() => {
          port.disconnect();
        });
    }
  });
});


//FILE BACKGROUND.JS END 