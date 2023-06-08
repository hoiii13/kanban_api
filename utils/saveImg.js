const fs = require('fs')
function saveImage(base64Image) {
    const matches = base64Image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/)
    if(matches && matches.length === 3) {
        const extension = matches[1]
        const imageData = Buffer.from(matches[2], 'base64')
        const fileName = `image-${Date.now()}.${extension}`;
        const filePath = `../public/images/${fileName}`;
        fs.writeFile(filePath, imageData, (error) => {
            if(error) {
                console.log(error);
            } else {
                console.log(`Image saved to ${filePath}`);
            }
        })

        return `http://192.168.56.1:8081/images/${fileName}`
    }
    return null
}