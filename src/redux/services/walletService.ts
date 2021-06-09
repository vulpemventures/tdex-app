import type { GetResult } from '@capacitor/storage';
import { Storage } from '@capacitor/storage';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { Mnemonic } from 'ldk';

import { defaultProvider } from '../config';

export const axiosProviderObject = axios.create({
  baseURL: defaultProvider.endpoint,
});

export const getAssetsRequest = (
  path: string,
  explorerUrlValue: string,
  options?: any,
): Promise<AxiosResponse> => {
  return axios.create({ baseURL: explorerUrlValue }).request({
    method: 'get',
    url: path,
    params: options?.params,
  });
};

export const getAddress = async (): Promise<GetResult> => {
  return Storage.get({ key: 'address' });
};

export const waitForRestore = async (identity: Mnemonic): Promise<boolean> => {
  return identity.isRestored;
};

export const signTx = async (identity: any, unsignedTx: any): Promise<any> => {
  return identity.signPset(unsignedTx);
};

export async function broadcastTx(
  hex: string,
  explorerUrlValue: string,
): Promise<string> {
  try {
    const response = await axios.post(`${explorerUrlValue}/tx`, hex);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
