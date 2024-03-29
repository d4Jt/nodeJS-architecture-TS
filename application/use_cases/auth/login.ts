'use strict';

import { Api401Error } from '../../../frameworks/webserver/middlewares/error.response';
import { filterData } from '../../../frameworks/webserver/utils';

/**
 * 1 - check email
 * 2 - match password
 * 3 - create AT & RT and save
 * 4 - generate tokens
 * 5 - get data return login
 */
export default async function login(payload, shopDb, keyTokenDb, authService) {
   const { email, password } = payload;

   const foundShop = await shopDb.findShop(email);
   if (!foundShop) throw new Api401Error('Password or email not match');

   const isMatch = await authService.comparePassword(
      password,
      foundShop.password
   );
   if (!isMatch) throw new Api401Error('Password or email not match');

   const { privateKey, publicKey } = authService.generateKeyPair();
   const { _id: userId } = foundShop;
   const tokens = await authService.createTokenPair(
      { userId, email },
      publicKey,
      privateKey
   );

   await keyTokenDb.createKeyToken({
      refreshToken: tokens.refreshToken,
      userId,
      publicKey,
      privateKey,
   });
   return {
      shop: filterData({ data: foundShop, fields: ['_id', 'email', 'name'] }),
      tokens,
   };
}
