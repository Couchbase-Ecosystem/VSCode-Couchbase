import * as vscode from 'vscode';
import * as http from 'http';
import axios from 'axios';
import { IConnection } from '../model/IConnection';
import { ENDPOINTS } from './endpoints';



export async function getDefaultPools(connection:IConnection): Promise<any>{
    const options = {
        hostname: connection.url,
        port: connection.port,
        path: ENDPOINTS.GET_POOLS,
        auth: `${connection.username}:${connection.password}`,
        method: 'GET'
    };

    const axiosOptions = {
      url: `http://${connection.url}:${connection.port}${ENDPOINTS.GET_POOLS}`,
      auth: `${connection.username}:${connection.password}`,
  };
    const url = `${connection.url}:${connection.port}${ENDPOINTS.GET_POOLS}`;
    console.log(url);

    axios.get(url, {auth: {
      username: connection.username,
      password: connection.password ? connection.password: 'password'
    }}).then(function (response) {
      // handle success
      console.log("t");
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });

}