import * as fs from "fs";
import { basename } from "path";
import question from "../core/question";

export enum TypeOfFile {
  Audio,
  Video
};

export interface IFile {
  readonly path: string;
  readonly name: string;
  readonly extension: string;
  newName: string;
};

export default class Renamer {
  private files: IFile[] = [];

  private insertFile = (path: string, nameWithExtension: string) => {
    const dotIndex = nameWithExtension.lastIndexOf('.');
    if (dotIndex == -1) return;
    const name = nameWithExtension.substr(0, dotIndex);
    const extension = nameWithExtension.substr(dotIndex + 1);
    this.files.push({
      path,
      name,
      newName: name,
      extension
    });
  }

  clear = () => {
    this.files = [];
  }

  load = (path: string, recursive: boolean = true) => {
    if (!fs.existsSync(path)) {
      console.warn("invalid path");
      return;
    }

    if (fs.lstatSync(path).isDirectory()) {
      const filesList = fs.readdirSync(path);
      filesList.forEach(file => {
        if (fs.lstatSync(`${path}/${file}`).isDirectory()) {
          if (recursive) {
            this.load(`${path}/${file}`);
          }
          return;
        }
        this.insertFile(path, file);
      });
    } else {
      this.insertFile(path, basename(path));
    }
  }

  changeLog = () => {
    this.files.forEach(file => {
      console.log(`"${file.name}" => "${file.newName}"`);
    });
  }

  save = async (hidePrompt: boolean = false) => {
    if (!hidePrompt) {
      console.log(`you are about to rename ${this.files.length}. This process cannot be undone.`);
      console.log("Please make sure you call changelog() to view changes");

      let answer = await question("Type y to commit these changes or anything else to skip: ");
      if (answer.length == 0)
        return;
      if (answer[0].toLowerCase() !== 'y')
        return;
    }
    this.files.forEach(file => {
      if (file.name === file.newName)
        return;

      fs.copyFileSync(
        `${file.path}/${file.name}.${file.extension}`,
        `${file.path}/${file.newName}.${file.extension}`
      );
      fs.unlinkSync(`${file.path}/${file.name}.${file.extension}`);
      file = {
        name: file.newName,
        newName: file.newName,
        extension: file.extension,
        path: file.path
      };
    });
  }

  parse = (callback: (file: IFile) => Promise<IFile>) => {
    this.files.forEach(async file => {
      file = await callback(file);
    });
  }
};