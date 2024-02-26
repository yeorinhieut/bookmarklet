var script1 = document.createElement("script");
script1.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js";
document.head.appendChild(script1);


script1.onload = script2.onload = function() {
    var images = document.querySelectorAll("#album > div.col-12.col-md.border > div.mt-2 > div .photo-thumb img");
    var imageURLs = [];
    images.forEach(function(image) {
        imageURLs.push(image.src);
    });

    var zip = new JSZip();
    var imgFolder = zip.folder("images");

    var promises = [];
    imageURLs.forEach(function(url) {
        var filename = url.substring(url.lastIndexOf("/") + 1);
        promises.push(
            fetch(url)
            .then(response => response.blob())
            .then(function(blob) {
                imgFolder.file(filename, blob);
            })
        );
    });

    Promise.all(promises).then(function() {
        zip.generateAsync({ type: "blob" }).then(function(content) {
            var link = document.createElement("a");
            link.download = "images.zip";
            link.href = window.URL.createObjectURL(content);
            link.click();
        });
    });
};
