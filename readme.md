# Node JS : Upload et download avec node.js et angular

- [Node JS : Upload et download avec node.js et angular](#node-js--upload-et-download-avec-nodejs-et-angular)
- [L’upload](#lupload)
  - [Étape 1 : Le client](#étape-1--le-client)
    - [Dans notre composant d’upload (dans notre classe):](#dans-notre-composant-dupload-dans-notre-classe)
    - [Le code complet du composant  :](#le-code-complet-du-composant--)
    - [Côté html  :](#côté-html--)
  - [Étape 2 : **le serveur**](#étape-2--le-serveur)
    - [Multer](#multer)
    - [Dans le fichier coté serveur :](#dans-le-fichier-coté-serveur-)
    - [**Paramétrage du diskstorage de multer**](#paramétrage-du-diskstorage-de-multer)
    - [Exemple complet :](#exemple-complet-)
- [Le download](#le-download)
    - [La fonction de téléchargement](#la-fonction-de-téléchargement)
  - [Le bouton html :](#le-bouton-html-)
- [**Création d’un fichier depuis du HTML**](#création-dun-fichier-depuis-du-html)
  - [Le bouton et l’élément html :](#le-bouton-et-lélément-html-)
  - [Conclusion :](#conclusion-)


# L’upload

## Étape 1 : Le client

Tout d’abord, nous installons **[ng-file-upload](https://valor-software.com/ng2-file-upload/)** qui est une librairie facilitant l’upload avec angular. Permettant l’ajout de token et la gestion de multiples options liées à l’upload.

```jsx
npm install ng2-file-upload
```

On ajoute bien la librairie dans app.module.ts

```jsx
import { FileUploadModule } from 'ng2-file-upload';

...

imports: [
		...
    FileUploadModule,
		...
  ],
...
```

### Dans notre composant d’upload (dans notre classe):

On ajoute l’url de l’upload :

```tsx
urlApi : string = 'http://localhost:3000/api/upload';
```

On créer un nouvel objet de type file uploader :

```jsx
public uploader: FileUploader = new FileUploader({
    url: this.urlApi,
    itemAlias: 'FieldName',
  });
```

Ce dernier gérera toute la partie envoi de fichier. Il contient 2 attributs : 

**url** : permets de définir l’url de l’api

**itemAlias** : nom du champ qui sera récupéré par nodeJs. Vous pouvez mettre ce que vous voulez, mais il faudra que ce nom soit identique quand vous utiliserez la méthode **single de multer** (voir plus bas).

Ensuite, nous pouvons utiliser les hook générés par le fileUploader : 

```jsx
ngOnInit() {
    this.uploader.onAfterAddingFile = (fichier: any) => {
      console.log('fichier ajouté:', fichier);
    };
    this.uploader.onCompleteItem = (item: any, status: any) => {
      console.log('Fichier envoyé:', item);
    };
  }
```

**onAfterAddingFile** : Ce hook vous permet d’effectuer une action quand l’utilisateur ajoute un fichier dans l’input.

**onCompleteItem** : Ce hook vous permet d’effectuer une action quand l’utilisateur a envoyé le fichier.

### Le code complet du composant  :

```jsx
import { Component } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {

  urlApi: string = 'http://localhost:3000/api/upload';

  public uploader: FileUploader = new FileUploader({
    url: this.urlApi,
    itemAlias: 'FieldName',
  });
  ngOnInit() {
    this.uploader.onAfterAddingFile = (fichier: any) => {
      // si la requête n'utilise pas des identifiants
      fichier.withCredentials = false;
      console.log('Fichier ajouté:', fichier);
    };
    this.uploader.onCompleteItem = (item: any, status: any) => {
      console.log('Fichier envoyé:', item);
    };
  }

}
```

### Côté html  :

Tout simplement deux éléments, l’input de type file, qui permet d’ajouter le fichier:

```html
<input type="file" name="document" ng2FileSelect 
[uploader]="uploader" accept="*" />
```

L’attribut accept permet de choisir les types de fichiers que l’on accepte. 

Le bouton d’envoi qui va appeler la méthode **uploadAll** permettant d’envoyer le fichier.

```html
<button type="button" (click)="uploader.uploadAll()" 
[disabled]="!uploader.getNotUploadedItems().length">
	Upload
</button>
```

## Étape 2 : **le serveur**

```tsx
// Réglages de l'upload 
const dossierUpload = './uploads';
const nomFichier = 'nomFichier';
```

Pour cette partie, nous aurons besoin de deux librairies externes : 

```jsx
npm i express multer
```

### Multer

Multer est un middlewear permettant de gérer les uploads provenant de formulaires (multipart/form-data).

### Dans le fichier coté serveur :

On charge les librairies dont nous avons besoin :

```jsx
const express = require('express'),
    cors = require('cors'),
    multer = require('multer'),
    bodyParser = require('body-parser');
```

On créer deux constantes permettant de choisir notre dossier d’upload et, si besoin, un nom de fichier.

```jsx
// Réglages de l'upload 
const dossierUpload = './uploads';
const nomFichier = 'nomFichier';
```

### **Paramétrage du diskstorage de multer**

Cette partie permet simplement de configurer le dossier de destination et le nom que l’on donnera au fichier uploadé au travers de deux attributs : **destination** et **filename**.

```jsx
// configuration du storage
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dossierUpload);
    },
    filename: (req, file, cb) => {
        console.log(file);
        // soit on donne le nom du fichier original :
        cb(null, file.originalname)

        // soit on donne un nouveau nom (attention à l'extension) :
        //  cb(null, nomFichier + '.pdf')

				// si problème d'utf8 :
        // cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'))
    }
});

```

On demande ensuite à multer d’utiliser le storage que l’on vient de créer : 

```tsx
let upload = multer({
    storage: storage
});
```

Enfin quand nous recevons un post, nous utilisons la méthode **single** de notre objet upload en tant que premier callBack. Cette méthode permet d’accepter un seul fichier selon son fieldname (dans notre cas “document”.

Le second callBack permet simplement de gérer si le fichier est envoyé ou nous.

```jsx
// Quand nous reçevons un post sur /api/upload
app.post('/api/upload', upload.single('FieldName'), function (req, res) {
    if (!req.file) {
        console.log("Fichier non uploadé!");
        return res.send({
            success: false
        });
    } else {
        console.log('Fichier uploadé!');
        return res.send({
            success: true
        })
    }
});
```

### Exemple complet :

```tsx
const express = require('express'),
    cors = require('cors'),
    multer = require('multer'),
    bodyParser = require('body-parser');

// Réglages dexpress
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Réglages de l'upload 
const dossierUpload = './uploads';
const nomFichier = 'nomFichier';

// configuration du storage
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dossierUpload);
    },
    filename: (req, file, cb) => {
        console.log(file);
        // soit on donne le nom du fichier original :
        cb(null, file.originalname)

        // soit on donne un nouveau nom (attention à l'extension) :
        //  cb(null, nomFichier + '.pdf')

				// si problème d'utf8 :
        // cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'))
    }
});

let upload = multer({
    storage: storage
});

// Quand nous reçevons un post sur /api/upload
app.post('/api/upload', upload.single('FieldName'), function (req, res) {
    if (!req.file) {
        console.log("Fichier non uploadé!");
        return res.send({
            success: false
        });
    } else {
        console.log('Fichier uploadé!');
        return res.send({
            success: true
        })
    }
});

// On lance le serveur
const server = app.listen(3000)
```

# Le download

Tout d’abord avant de télécharger un fichier, il faut servir le dossier de downloads :

```tsx
app.use('/document', express.static(__dirname + '/uploads'));
```

### La fonction de téléchargement

Avec angular et httpClient nous créons une fonction qui nous permettra de télécharger un fichier sur un serveur distant :

```jsx
downloadFile(url: string): any {
		// on ajoute des headers (util si on souhaite sécuriser le download)
    const headers = new HttpHeaders();

		// on envoie une requête pour récupèrer notre fichier
    this.http.get(url, { headers, responseType: 'blob' as 'json' }).subscribe(
		// quand le téléchargement est terminé 
      (response: any) => {
				// on récupère le type de fichier reçus (jps,txt,etc..)
        let dataType = response.type;
				
				// on stock toutes les données de la requête dans un tableau
        let binaryData = [];
        binaryData.push(response);
        
				// on crée un élement qui nous permettra de stocké vituelement notre objet
				let downloadLink = document.createElement('a');
				
				// on créer un objet depuis les données de la requête puis on récupère son url
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
        downloadLink.setAttribute('download', 'nomfichier');
        downloadLink.setAttribute('target', '_blank');

        document.body.appendChild(downloadLink);

        downloadLink.click();
        downloadLink.remove();
      }
    )
  }
```

## Le bouton html :

Il ne nous reste plus qu’à créer un bouton en html et de lui ajouter la fonction downloadFile au clic sur ce dernier :

```jsx
<button (click)="downloadFile('urlDuFichier')">
	download
</button>
```

# **Création d’un fichier depuis du HTML**

Maintenant il faut créer une fonction qui nous permettra de récupérer le contenu d’une balise html et de la transformer en fichier .docx :

```jsx
print() {
    // on créer le header de notre futur document
    var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    // on créer le footer de notre futur document
    var footer = "</body></html>";

    // on récupère la div contenant notre html
    let content = document.querySelector(".document_container") as HTMLElement | null;

    // on ajoute à la suite dans une variable le header,le content et le footer
    var sourceHTML = header;
    if (content != null) {
      sourceHTML += content.innerHTML
    }
    sourceHTML += footer;

    // on créer puis on récupère l'url d'un fichier virtuel
    var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);

    // on le télécharge grâce à un élement créer virtuelement
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'document.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);

  }
```

## Le bouton et l’élément html :

Enfin, on créer un bouton en html et on lui ajoute la fonction print au clic :

```jsx
<button (click)="print()">Imprimer le document ci dessous :</button>
```

Exemple de div en html :

```
<div class="document_container">
        <h1>Test d'impression</h1>
        <p>
Lorem ipsum, dolor sit amet consectetur adipisicing elit. Et cumque adipisci sapiente asperiores impedit?
            Neque, assumenda corrupti? Culpa a repellat aliquid debitis voluptates saepe asperiores non eveniet dolores!
            Praesentium, quos?
				</p>
</div>
```

## Conclusion :

Dans ce cours nous avons appris à télécharger et envoyer des fichiers d’un client vers un serveur.
Et nous avons converti un élément html vers un fichier docx.
