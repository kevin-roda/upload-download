import { Component } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {

  urlApi: string = 'http://localhost:9000/api/upload';
  constructor(private http: HttpClient) { }
  public uploader: FileUploader = new FileUploader({
    url: this.urlApi,
    itemAlias: 'fieldName',
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


}
