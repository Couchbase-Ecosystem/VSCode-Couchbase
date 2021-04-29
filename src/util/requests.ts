import * as vscode from 'vscode';
import * as http from 'http';
import get from "axios";
import { IConnection } from '../model/IConnection';
import { ENDPOINTS } from './endpoints';
import { AxiosRequestConfig } from "axios";



export async function getDefaultPools(connection: IConnection) {

  let password = "password";
  if(connection.password){
    password = connection.password;
  }

  try {
    const options: AxiosRequestConfig = {
      baseURL: `${connection.url}`,
      auth: {
        username: connection.username,
        password: password
      },
      method: "get",
    };

    const data = await get(
      `${connection.url}${ENDPOINTS.GET_POOLS}`,
      options
    );
    console.log(data);
    return data;
  } catch (err) {
    throw new Error(err);
  }
}