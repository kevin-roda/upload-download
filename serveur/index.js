const express = require('express'),
    cors = require('cors'),
    multer = require('multer'),
    sharp = require('sharp'),
    bodyParser = require('body-parser');

// Réglages dexpress
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use('/documents', express.static(__dirname + '/uploads'));

// Réglages de l'upload 
const dossierUpload = './uploads';
const nomFichier = 'nomFichier';

// configuration du storage
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dossierUpload);
    },
    filename: (req, file, cb) => {

        // soit on donne le nom du fichier original :
        // cb(null, file.originalname)

        // si problème d'utf8 :
        cb(null, Buffer.from(file.originalname, 'latin1').toString(
            'utf8'))

        // soit on donne un nouveau nom (attention à l'extension) :
        //  cb(null, nomFichier + '.pdf')
    }
});

let upload = multer({
    storage: storage
});

// Quand nous reçevons un post sur /api/upload
app.post('/api/upload', upload.single('fieldName'), function (req, res) {
    if (!req.file) {
        console.log("Fichier non uploadé!");
        return res.send({
            success: false
        });
    } else {
        console.log('fichier uploadé');
        // sharp(req.file.path).resize(200, 200).toFile('uploads/' + 'thumbnails-' + req.file.originalname, (err, resizeImage) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(resizeImage);
        //     }
        // });
        return res.send({
            success: true
        })
    }
});

// On lance le serveur
const server = app.listen(9000)