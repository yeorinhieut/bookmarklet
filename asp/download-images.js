(function() {
    var script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js";
    document.head.appendChild(script);
    script.onload = function() {
        var links = document.querySelectorAll("#album > div.col-12.col-md.border > div.mt-2 > div a[href^='/photo/']");
        var imageURLs = [];
        var promises = [];
        links.forEach(function(link) {
            var imageLink = link.getAttribute("href");
            promises.push(
                new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        fetch(imageLink, {
                            headers: {
                                "Referer": window.location.href
                            }
                        })
                        .then(response => response.text())
                        .then(function(html) {
                            var parser = new DOMParser();
                            var doc = parser.parseFromString(html, "text/html");
                            var image = doc.querySelector("#image img");
                            if (image) {
                                var imageUrl = image.getAttribute("src");
                                imageUrl = imageUrl.replace("http:", "https:");
                                imageURLs.push(imageUrl);
                                console.log("Received image: " + imageUrl);
                                resolve();
                            } else {
                                reject(new Error("Image not found"));
                            }
                        });
                    }, 500);
                })
            );
        });

        Promise.all(promises).then(function() {
            var zip = new JSZip();
            var imgFolder = zip.folder("images");
            var imageFetchPromises = [];
            imageURLs.forEach(function(imageUrl) {
                var filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                imageFetchPromises.push(
                    fetch(imageUrl, {
                        headers: {
                            "Referer": window.location.href
                        }
                    })
                    .then(response => response.blob())
                    .then(function(blob) {
                        imgFolder.file(filename, blob);
                    })
                );
            });

            Promise.all(imageFetchPromises).then(function() {
                zip.generateAsync({ type: "blob" }).then(function(content) {
                    var link = document.createElement("a");
                    link.download = "images.zip";
                    link.href = window.URL.createObjectURL(content);
                    link.click();
                });
            });
        });
    };
})();
