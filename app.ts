import {BiLive} from './bilive/index'
import {SteamCN} from './steamcn/index'

const bilive = new BiLive()
const steamcn = new SteamCN()
bilive.Start()
steamcn.Start()