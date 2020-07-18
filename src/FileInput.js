import React from 'react';
import classes from './FileInput.css';
const { BlobServiceClient, BlobClient } = require("@azure/storage-blob");

// Update <placeholder> with your Blob service SAS URL string
const blobSasUrl = "";
const BlobEndpoint = ""

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobSasUrl);

// Create a unique name for the container by 
// appending the current time to the file name
const imageContainer = "images";
const grayContainer = "grayscale";
const cannyContainer = "canny";

// Get a container client from the BlobServiceClient
const containerClient = blobServiceClient.getContainerClient(imageContainer);
const containerClientGray = blobServiceClient.getContainerClient(grayContainer);
const containerClientCanny = blobServiceClient.getContainerClient(cannyContainer);

class FileInput extends React.Component {
    
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fileInput = React.createRef();
    }

    async componentDidMount() {
        const listBlobsResponse = await containerClient.listBlobFlatSegment();
        const grayBlobsResponse = await containerClientGray.listBlobFlatSegment();
        const cannyBlobsResponse = await containerClientCanny.listBlobFlatSegment();

        var para = document.createElement("P");
        para.innerHTML = "Images: " + listBlobsResponse.segment.blobItems.length +
            ", Grayscale: " + grayBlobsResponse.segment.blobItems.length +
            ", Canny: " + cannyBlobsResponse.segment.blobItems.length;
        document.getElementById("count").appendChild(para);

        for await (const blob of listBlobsResponse.segment.blobItems) {
            var blobClient = new BlobClient(BlobEndpoint, imageContainer, blob.name);
            var lease = blobClient.getBlobLeaseClient("test");
            blobClient = new BlobClient(BlobEndpoint, grayContainer, blob.name);
            var grayLease = blobClient.getBlobLeaseClient("test");
            blobClient = new BlobClient(BlobEndpoint, cannyContainer, blob.name);
            var cannyLease = blobClient.getBlobLeaseClient("test");

            var img = document.createElement("img");
            img.src = lease.url;
            img.title = blob.name;
            var src = document.getElementById("container");
            src.appendChild(img);

            var img = document.createElement("img");
            img.src = grayLease.url;
            img.title = blob.name;
            var src = document.getElementById("container");
            src.appendChild(img);

            var img = document.createElement("img");
            img.src = cannyLease.url;
            img.title = blob.name;
            var src = document.getElementById("container");
            src.appendChild(img);
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
                console.log(file);
                promises.push(blockBlobClient.uploadBrowserData(file, { blockSize: 4 * 1024 * 1024, concurrency: 20 }));
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
        return (
            <>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Upload file:
                        <input type="file" multiple ref={this.fileInput} />
                    </label>
                    <br />
                    <button className={classes.input} type="submit">Upload</button>
                </form>
                <label>
                    Blob count:
                    <div id="count" className={classes.gallery} />
                </label>
                <label>
                    Images:
                    <div id="container" className={classes.gallery} />
                </label>
            </>
        );
    }
}

export default FileInput;
