const fs = require('fs-extra');

const filePath = 'src/reactViews/app/types/sharedComponents.d.ts';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  // FIXME:Remove the tab-bar declaration declaration from the file content
  // Cause: It was failing the build due to typescript error
  const updatedContent = data.replace(`declare module "sharedComponents/components/tab-bar/tab-bar-menu" {
    import { TabBarMenuProps } from "sharedComponents/components/tab-bar/tab-bar-menu/tab-bar-menu.types";
    export function TabBarMenu<const T extends string>(props: TabBarMenuProps<T>): import("react").JSX.Element;
}`, '');

  fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
  });
});