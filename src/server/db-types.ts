import type { db } from '#/db'

export type Db = typeof db
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]
/** Functions that must run inside a caller's transaction take a `Tx`. */
export type DbOrTx = Db | Tx
