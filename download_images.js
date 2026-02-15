const https = require('https');
const fs = require('fs');
const path = require('path');

const downloads = [
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Okra_Abelmoschus_esculentus.jpg/640px-Okra_Abelmoschus_esculentus.jpg',
        dest: 'src/assets/products_images/ladyfinger.jpg'
    },
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/640px-Tomato_je.jpg',
        dest: 'src/assets/products_images/tomatoseeds.jpg'
    }
];

downloads.forEach(item => {
    const file = fs.createWriteStream(path.join(__dirname, item.dest));
    https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => console.log('Downloaded: ' + item.dest));
        });
    }).on('error', function (err) {
        fs.unlink(item.dest);
        console.error('Error downloading ' + item.url + ': ' + err.message);
    });
});
