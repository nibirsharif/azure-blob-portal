import React from 'react';
import classes from './FileInput.css';
const { BlobServiceClient, BlobClient } = require("@azure/storage-blob");
// Update <placeholder> with your Blob service SAS URL string

//BlobEndpoint=https://snibirkedastor.blob.core.windows.net/;SharedAccessSignature=sv=2019-10-10&ss=b&srt=sco&sp=rwdlacx&se=2020-07-04T10:14:43Z&st=2020-07-04T02:14:43Z&spr=https,http&sig=n1gmlM2vdBzbHgdB7Gv7HCAHFNHSkZAi2oEboswoFSI%3D
//https://snibirkedastor.blob.core.windows.net/?sv=2019-10-10&ss=b&srt=sco&sp=rwdlacx&se=2020-07-04T10:14:43Z&st=2020-07-04T02:14:43Z&spr=https,http&sig=n1gmlM2vdBzbHgdB7Gv7HCAHFNHSkZAi2oEboswoFSI%3D
const blobSasUrl = "https://snibirkedastor.blob.core.windows.net/?sv=2019-10-10&ss=bfqt&srt=sco&sp=rwdlacupx&se=2020-08-04T12:51:39Z&st=2020-07-04T04:51:39Z&spr=https,http&sig=KxiV6bHa%2BaLdOnVYVWaMGrc3BSzvfgrqNyVaGj5u4rE%3D";
const BlobEndpoint = "BlobEndpoint=https://snibirkedastor.blob.core.windows.net/;QueueEndpoint=https://snibirkedastor.queue.core.windows.net/;FileEndpoint=https://snibirkedastor.file.core.windows.net/;TableEndpoint=https://snibirkedastor.table.core.windows.net/;SharedAccessSignature=sv=2019-10-10&ss=bfqt&srt=sco&sp=rwdlacupx&se=2020-08-04T12:51:39Z&st=2020-07-04T04:51:39Z&spr=https,http&sig=KxiV6bHa%2BaLdOnVYVWaMGrc3BSzvfgrqNyVaGj5u4rE%3D"
// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobSasUrl);

// Create a unique name for the container by 
// appending the current time to the file name
const containerName = "images";
const grayContainer = "grayscale";
let images = [];
// Get a container client from the BlobServiceClient
const containerClient = blobServiceClient.getContainerClient(containerName);

class FileInput extends React.Component {
    
    constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.fileInput = React.createRef();
    }

    async componentDidMount() {
        let viewData;
        
        const listBlobsResponse = await containerClient.listBlobFlatSegment();
        //console.log("here..");
        //console.log(listBlobsResponse);
        let TYPED_ARRAY;
        for await (const blob of listBlobsResponse.segment.blobItems) {
            //console.log(`Blob: ${blob.name}`);
            var blobClient = new BlobClient(BlobEndpoint, containerName, blob.name);
            var lease = blobClient.getBlobLeaseClient("test");
            images.push(lease.url);
            //console.log(lease.url);

            var img = document.createElement("img");
            img.src = lease.url;
            //img.width = 150;
            //img.border = "2px solid #ffff";
            img.title = blob.name;
            var src = document.getElementById("x");
            src.appendChild(img);
        }
        var img = document.querySelector( "#photo" );
        //img.src = lease.url;
        //console.log(images)

        viewData = {
            title: 'Home',
            viewName: 'index',
            accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
            containerName: containerName
        };
    
        if (listBlobsResponse.segment.blobItems.length) {
            viewData.thumbnails = listBlobsResponse.segment.blobItems;
        }

        //console.log(viewData.thumbnails)
        
        const fileList = document.getElementById("file-list");
        fileList.size = 0;
        fileList.innerHTML = "";
        try {
            console.log("Retrieving file list...");
            let iter = containerClient.listBlobsFlat();
            let blobItem = await iter.next();
            while (!blobItem.done) {
                let i = 0;
                fileList.size += 1;
                fileList.innerHTML += `<option>${blobItem.value.name}</option>`;
                blobItem = await iter.next();
            }
            if (fileList.size > 0) {
                console.log("Done.");
            } else {
                console.log("The container does not contain any files.");
            }
        } catch (error) {
            console.log(error.message);
        }
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        try {
            console.log("Uploading files...");
            const promises = [];
            // const blockBlobClient = containerClient.getBlockBlobClient(this.fileInput.current.files[0].name);
            // promises.push(blockBlobClient.uploadBrowserData(this.fileInput.current.files[0]));
            for (const file of this.fileInput.current.files) {
                const blockBlobClient = containerClient.getBlockBlobClient(file.name);
                promises.push(blockBlobClient.uploadBrowserData(file));
            }
            await Promise.all(promises);
            console.log("Done...");
            alert("File upload completed.")
        }
        catch (error) {
            console.log(error.message);
        }
    }
  
    render() {
        console.log('render...')
        return (
            <>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Upload file:
                        <input type="file" multiple ref={this.fileInput} />
                    </label>
                    <br />
                    <button type="submit">Submit</button>
                    
                </form>
                <p><b>Blobs:</b></p>
                <select id="file-list" multiple style={{ width: 300, height: 300, color:"#4a54f1" }} />
                <br /><br />
                <p><b>Images:</b></p>
                {/* <img id="photo" style={{ width: 300 }} /> */}
                <div id="x" className={classes.gallery} />
            </>
        );
    }
}

export default FileInput;
