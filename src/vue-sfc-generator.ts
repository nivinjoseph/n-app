import "@nivinjoseph/n-ext";
import * as Fs from "fs";

// @ts-ignore
// tslint:disable-next-line: no-default-export
export default function (content: string, map: any, meta: any)
{
    // const options = getOptions(this);

    // validateOptions(schema, options, 'Example Loader');

    // Apply some transformations to the source...

    // return `export default ${JSON.stringify(source)}`;

    // console.log("vue compiler start");
    // console.log("context: ", this.context);
    
    const dirPath = this.context as string;
    const filePath = this.resourcePath as string;
    
    // if (!dirPath.contains("/client/") || !dirPath.contains("/src/components"))
    //     return null;
    
    let fileName = filePath.replace(dirPath + "/", "");
    
    let scriptFileName = "";
    let templateFileName = "";
    let styleFileName = "";
    
    let script = "";
    let template = "";
    let style = "";
    
    
    if (fileName.endsWith(".js"))
    {
        scriptFileName = fileName;
        templateFileName = fileName.replace("-view-model.js", "-view.html");
        styleFileName = fileName.replace("-view-model.js", "-view.scss");    
        
        script = content;
        template = Fs.readFileSync(dirPath + "/" + templateFileName, "utf8");
        style = Fs.readFileSync(dirPath + "/" + styleFileName, "utf8");
    }
    else if (fileName.endsWith(".html"))
    {
        scriptFileName = fileName.replace("-view.html", "-view-model.js");
        templateFileName = fileName;
        styleFileName = fileName.replace("-view.html", "-view.scss");  
        
        script = Fs.readFileSync(dirPath + "/" + scriptFileName, "utf8");
        template = content;
        style = Fs.readFileSync(dirPath + "/" + styleFileName, "utf8");
    }
    else if (fileName.endsWith(".scss"))
    {
        scriptFileName = fileName.replace("-view.scss", "-view-model.js");
        templateFileName = fileName.replace("-view.scss", "-view.html");
        styleFileName = fileName;
        
        script = Fs.readFileSync(dirPath + "/" + scriptFileName, "utf8");
        template = Fs.readFileSync(dirPath + "/" + templateFileName, "utf8");
        style = content;
        // console.log(styleFileName, content);
    }
    else
    {
        throw new Error(`Unknown file type '${fileName}'`);
    }
    
    
    const sfc = `
        <template>
            ${template}
        </template>
        
        <script>
            ${script}
        </script>
        
        <style lang="scss">
            ${style}
        </style>
    `;
    
    // console.log("dirPath: ", dirPath);
    // console.log("filePath: ", filePath);
    // console.log("fileName", fileName);
    
    // console.log(typeof content, content);
    // console.log(typeof map, map);
    // console.log(typeof meta, meta);
    
    // console.log(sfc);
    
    // console.log("vue compiler end");

    return sfc;
}