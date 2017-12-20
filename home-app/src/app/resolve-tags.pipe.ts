import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';


@Pipe({
  name: 'resolveTags'
})
export class ResolveTagsPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(raw: string, args?: any): any {
        if (raw === null || raw.length === 0) { return; }

        const paragraphed: string = '<p>' + raw.replace(/\n/g, '</p><p>') + '</p>';
        let html: string;

        if (args) {
            const chunks: string[] = paragraphed.split('[');

            html = chunks[0];
            for (const chunk of chunks.slice(1)) {
                const parts: string[] = chunk.split(']');
                if (parts.length === 2) {
                    const cmd: string[] = parts[0].split('|');
                    const image: any = args[cmd[0]];
                    const alignment: string = (cmd.length > 1) ? cmd[1] : 'left';

                    html += '<img src="' + image.src + '" index="' + image.index + '" class="' + alignment + '">';
                    html += parts[1];
                } else {
                    console.log('WARNING: missing matching ]');
                }
            }
        } else {
            html = paragraphed;
        }

        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

}
