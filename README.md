# ultimate-renamer

__Example__

```ts
import { Renamer, TVDB } from "ultimate-renamer"

const main = async () => {
  //example
  const r = new Renamer();
  r.load(`/path/to/files`);
  r.parse(async file => {
    const pattern = /_(?<songNumber>[0-9]{2})_-_(?<title>[a-zA-Z\_]+)/g;
    const match = pattern.exec(file.name);
    if (match) {
      const songNumber: number = parseInt(match.groups['songNumber']);
      const title: string = match.groups['title'].replace('_', ' ');

      const tvdb = new TVDB();
      await tvdb.login('API_KEY', 'USER_KEY', 'USERNAME');
      const response = await tvdb.searchEpisodeList({
        name: "lucifer"
      });
      if (response) {
        //full list of episodes
      
        //update file name
        file.newName = `${songNumber} ${title}`;
      }
    }
    return file;
  });
  r.changeLog();
  await r.save();

  process.exit(0);
}

main();
```