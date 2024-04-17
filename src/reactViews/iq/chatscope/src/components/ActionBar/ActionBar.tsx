import classNames from "classnames";
import { prefix } from "./../settings";
import { Button } from "./../Buttons/Button";
import "./ActionBar.scss";

export type IActionBarButton = {
  name: string;
  onclick: () => void;
};

export const ActionBar = ({ buttons, className = "", ...rest }) => {
  const cName = `${prefix}-actionbar`;
  return <div {...rest} className={classNames(cName, className)}>
    {buttons.map((button:IActionBarButton, index: number)=>{
        return <Button border onClick={button.onclick} key={index}>{button.name}</Button>;
    })}
  </div>;
};
